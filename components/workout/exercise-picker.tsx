"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { createCustomExercise } from "@/lib/actions/exercises";
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
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("chest");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

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
      setExercises(
        (data ?? []).filter(
          (e: Exercise) => !excludeIds.includes(e.id),
        ) as Exercise[],
      );
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
        setExercises(
          (data ?? []).filter(
            (e: Exercise) => !excludeIds.includes(e.id),
          ) as Exercise[],
        );
      });
  }, [open, excludeIds]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchExercises(value), 250);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createCustomExercise(newName.trim(), newMuscle);
    if (result.success && result.data) {
      onSelect(result.data as Exercise);
      setShowCreate(false);
      setNewName("");
    }
  };

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
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl border-fp-border bg-fp-bg-page">
        <SheetHeader className="pb-2">
          <SheetTitle className="font-space-grotesk text-lg text-fp-text-primary">
            Add Exercise
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-text-tertiary" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-fp-text-tertiary" />
            </button>
          )}
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto">
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

          {/* Create Custom */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 w-full rounded-lg border border-dashed border-fp-border-muted px-3 py-2.5 text-sm text-fp-text-secondary hover:bg-fp-bg-elevated"
            >
              + Create custom exercise
            </button>
          ) : (
            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-fp-border bg-fp-bg-card p-4">
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
                  className="flex-1 rounded-lg border border-fp-border py-2 text-sm text-fp-text-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 rounded-lg bg-fp-accent py-2 text-sm font-semibold text-fp-text-on-accent"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
