"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { DayEditor } from "./day-editor";
import { createPlan, updatePlan, deletePlan, setActivePlan } from "@/lib/actions/plans";
import { toast } from "sonner";
import type { Exercise, WorkoutPlan, PlanWithDays } from "@/lib/types";

interface DayState {
  name: string;
  exercises: Exercise[];
}

interface PlanPageClientProps {
  plans: WorkoutPlan[];
  editingPlan: PlanWithDays | null;
}

export function PlanPageClient({ plans, editingPlan }: PlanPageClientProps) {
  const router = useRouter();

  const initialDays = (): DayState[] => {
    if (editingPlan) {
      return Array.from({ length: 7 }, (_, i) => {
        const day = editingPlan.days.find((d) => d.day_of_week === i);
        return {
          name: day?.name ?? "",
          exercises: day?.exercises.map((pe) => pe.exercise) ?? [],
        };
      });
    }
    return Array.from({ length: 7 }, () => ({ name: "", exercises: [] }));
  };

  const [planName, setPlanName] = useState(editingPlan?.name ?? "");
  const [days, setDays] = useState<DayState[]>(initialDays);
  const [saving, setSaving] = useState(false);

  const updateDay = useCallback(
    (dayOfWeek: number, updates: Partial<DayState>) => {
      setDays((prev) =>
        prev.map((d, i) => (i === dayOfWeek ? { ...d, ...updates } : d)),
      );
    },
    [],
  );

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }

    const namedDays = days
      .map((d, i) => ({ dayOfWeek: i, name: d.name, exerciseIds: d.exercises.map((e) => e.id) }))
      .filter((d) => d.name.trim().length > 0);

    if (namedDays.length === 0) {
      toast.error("Add at least one training day");
      return;
    }

    const emptyDays = namedDays.filter((d) => d.exerciseIds.length === 0);
    if (emptyDays.length > 0) {
      toast.error("Add exercises to all training days");
      return;
    }

    const activeDays = namedDays;

    setSaving(true);

    const result = editingPlan
      ? await updatePlan(editingPlan.id, planName.trim(), activeDays)
      : await createPlan(planName.trim(), activeDays);

    setSaving(false);

    if (result.success) {
      toast.success(editingPlan ? "Plan updated" : "Plan created");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to save plan");
    }
  };

  const handleDelete = async (planId: string) => {
    const result = await deletePlan(planId);
    if (result.success) {
      toast.success("Plan deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete plan");
    }
  };

  const handleSetActive = async (planId: string) => {
    const result = await setActivePlan(planId);
    if (result.success) {
      toast.success("Plan activated");
      router.refresh();
    } else {
      toast.error("Failed to activate plan");
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
          Workout Plan
        </h1>
        <p className="mt-0.5 text-sm text-fp-text-tertiary">
          Create your weekly schedule
        </p>
      </div>

      {/* Plan Name */}
      <input
        type="text"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        placeholder="Plan name (e.g. Push / Pull / Legs)"
        className="h-12 w-full rounded-xl border border-fp-border bg-fp-bg-card px-4 text-sm text-fp-text-primary outline-none placeholder:text-fp-text-tertiary focus:ring-1 focus:ring-fp-accent"
      />

      {/* Day Editors */}
      <div className="flex flex-col gap-2">
        {days.map((day, i) => (
          <DayEditor
            key={i}
            dayOfWeek={i}
            name={day.name}
            exercises={day.exercises}
            onNameChange={(name) => updateDay(i, { name })}
            onAddExercise={(exercise) =>
              updateDay(i, { exercises: [...day.exercises, exercise] })
            }
            onRemoveExercise={(index) =>
              updateDay(i, {
                exercises: day.exercises.filter((_, j) => j !== index),
              })
            }
            onMoveExercise={(from, to) => {
              const newExercises = [...day.exercises];
              const [moved] = newExercises.splice(from, 1);
              newExercises.splice(to, 0, moved);
              updateDay(i, { exercises: newExercises });
            }}
          />
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-fp-accent font-manrope text-[15px] font-bold text-fp-text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Check className="h-5 w-5" />
        {saving ? "Saving..." : "Save Plan"}
      </button>

      {/* Existing Plans */}
      {plans.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="font-space-mono text-[11px] font-medium uppercase tracking-wider text-fp-text-tertiary">
            Your Plans
          </p>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-xl border border-fp-border bg-fp-bg-card px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-fp-text-primary">
                  {plan.name}
                </span>
                {plan.is_active && (
                  <span className="rounded-full bg-fp-accent/20 px-2 py-0.5 text-[10px] font-semibold text-fp-accent">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!plan.is_active && (
                  <button
                    onClick={() => handleSetActive(plan.id)}
                    className="text-xs text-fp-accent hover:opacity-80"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-xs text-red-400 hover:opacity-80"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
