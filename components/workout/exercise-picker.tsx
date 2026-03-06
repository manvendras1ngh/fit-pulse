"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { createCustomExercise } from "@/lib/actions/exercises";
import { toast } from "sonner";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  excludeIds?: string[];
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "legs", "core", "full_body", "cardio",
];

export function ExercisePicker({
  open,
  onClose,
  onSelect,
  excludeIds = [],
}: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [excludedMatches, setExcludedMatches] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("chest");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const createFormRef = useRef<HTMLDivElement>(null);

  const fetchExercises = useCallback(
    async (query: string) => {
      const supabase = createClient();
      let q = supabase
        .from("exercises")
        .select("*")
        .eq("is_deleted", false)
        .order("name");

      if (query) {
        q = q.ilike("name", `%${query}%`);
      }

      const { data } = await q.limit(30);
      const all = (data ?? []) as Exercise[];
      setExercises(all.filter((e) => !excludeIds.includes(e.id)));
      setExcludedMatches(all.filter((e) => excludeIds.includes(e.id)));
    },
    [excludeIds],
  );

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("exercises")
      .select("*")
      .eq("is_deleted", false)
      .order("name")
      .limit(30)
      .then(({ data }) => {
        const all = (data ?? []) as Exercise[];
        setExercises(all.filter((e) => !excludeIds.includes(e.id)));
        setExcludedMatches(all.filter((e) => excludeIds.includes(e.id)));
      });
  }, [open, excludeIds]);

  // Scroll create form into view when it opens
  useEffect(() => {
    if (showCreate && createFormRef.current) {
      createFormRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [showCreate]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchExercises(value), 250);
  };

  const handleCreate = async (name: string, muscle: MuscleGroup | null) => {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const result = await createCustomExercise(name.trim(), muscle);
      if (result.success && result.data) {
        onSelect(result.data as Exercise);
        toast.success("Exercise created");
        setShowCreate(false);
        setNewName("");
        setSearch("");
        onClose();
      } else {
        toast.error("Failed to create exercise");
      }
    } catch {
      toast.error("Failed to create exercise");
    } finally {
      setCreating(false);
    }
  };

  // Check if search text has an exact match in existing exercises
  const searchLower = search.trim().toLowerCase();
  const hasExactMatch = searchLower !== "" && (
    exercises.some((ex) => ex.name.toLowerCase() === searchLower) ||
    excludedMatches.some((ex) => ex.name.toLowerCase() === searchLower)
  );

  // Group by muscle group
  const grouped = exercises.reduce(
    (acc, ex) => {
      const group = ex.muscle_group ?? "other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(ex);
      return acc;
    },
    {} as Record<string, Exercise[]>,
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="flex h-[80vh] flex-col rounded-t-2xl border-fp-border bg-fp-bg-page pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-space-grotesk text-lg text-fp-text-primary">
            Add Exercise
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-2 px-4">
          <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search exercises..."
            className="h-10 w-full rounded-xl bg-fp-bg-elevated pl-10 pr-8 text-sm text-fp-text-primary outline-none placeholder:text-fp-text-tertiary focus:ring-1 focus:ring-fp-accent"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                fetchExercises("");
              }}
              className="absolute right-7 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-fp-text-tertiary" />
            </button>
          )}
        </div>

        {/* Inline create from search — shown when search has text and no exact match */}
        {search.trim() && !hasExactMatch && (
          <button
            onClick={() => handleCreate(search, null)}
            disabled={creating}
            className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-fp-bg-elevated px-3 py-2 text-left text-sm text-fp-accent hover:bg-fp-bg-card disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>+</span>
            )}
            Create &ldquo;{search.trim()}&rdquo; as custom exercise
          </button>
        )}

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {Object.keys(grouped).length === 0 && excludedMatches.length === 0 && search.trim() && (
            <p className="py-8 text-center text-sm text-fp-text-tertiary">
              No exercises found
            </p>
          )}
          {Object.keys(grouped).length === 0 && excludedMatches.length > 0 && search.trim() && (
            <p className="py-8 text-center text-sm text-fp-text-tertiary">
              Already in workout
            </p>
          )}
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group} className="mb-4">
              <p className="mb-2 font-space-mono text-[11px] font-medium uppercase tracking-wider text-fp-text-tertiary">
                {group}
              </p>
              {exs.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelect(ex);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-fp-bg-elevated"
                >
                  <span className="text-sm text-fp-text-primary">
                    {ex.name}
                  </span>
                  {ex.user_id && (
                    <span className="text-[10px] text-fp-text-tertiary">
                      Custom
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* Create Custom (fallback at bottom) */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 w-full rounded-lg border border-dashed border-fp-border-muted px-3 py-2.5 text-sm text-fp-text-secondary hover:bg-fp-bg-elevated"
            >
              + Create custom exercise
            </button>
          ) : (
            <div
              ref={createFormRef}
              className="mt-2 flex flex-col gap-3 rounded-xl border border-fp-border bg-fp-bg-card p-4"
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Exercise name"
                className="h-10 w-full rounded-lg bg-fp-bg-elevated px-3 text-sm text-fp-text-primary outline-none focus:ring-1 focus:ring-fp-accent"
                autoFocus
              />
              <select
                value={newMuscle}
                onChange={(e) =>
                  setNewMuscle(e.target.value as MuscleGroup)
                }
                className="h-10 w-full rounded-lg bg-fp-bg-elevated px-3 text-sm text-fp-text-primary outline-none"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg.replace("_", " ")}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                  className="flex-1 rounded-lg border border-fp-border py-2 text-sm text-fp-text-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreate(newName, newMuscle)}
                  disabled={creating}
                  className="flex-1 rounded-lg bg-fp-accent py-2 text-sm font-semibold text-fp-text-on-accent disabled:opacity-60"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
