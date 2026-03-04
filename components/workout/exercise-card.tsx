"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SetRow } from "./set-row";
import { AddSetButton } from "./add-set-button";
import { updateExerciseMuscleGroup } from "@/lib/actions/exercises";
import { toast } from "sonner";
import type { Exercise, WorkoutSet, MuscleGroup } from "@/lib/types";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "legs", "core", "full_body", "cardio",
];

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  errorSetIds: Set<string>;
  onAddSet: () => void;
  onUpdateWeight: (setId: string, weight: number) => void;
  onUpdateReps: (setId: string, reps: number) => void;
  onToggleWarmup: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onRemoveExercise: () => void;
  onExerciseUpdate?: (exercise: Exercise) => void;
}

export function ExerciseCard({
  exercise,
  sets,
  errorSetIds,
  onAddSet,
  onUpdateWeight,
  onUpdateReps,
  onToggleWarmup,
  onDeleteSet,
  onRemoveExercise,
  onExerciseUpdate,
}: ExerciseCardProps) {
  const [editingGroup, setEditingGroup] = useState(false);
  const isCustom = !!exercise.user_id;

  const handleMuscleGroupChange = async (value: string) => {
    const newGroup = value === "" ? null : (value as MuscleGroup);
    setEditingGroup(false);

    // Optimistic update
    onExerciseUpdate?.({ ...exercise, muscle_group: newGroup });

    const result = await updateExerciseMuscleGroup(exercise.id, newGroup);
    if (!result.success) {
      toast.error("Failed to update muscle group");
      onExerciseUpdate?.(exercise); // revert
    }
  };

  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-space-grotesk text-base font-semibold text-fp-text-primary">
            {exercise.name}
          </span>
          <div className="flex items-center gap-2">
            {editingGroup ? (
              <select
                autoFocus
                defaultValue={exercise.muscle_group ?? ""}
                onChange={(e) => handleMuscleGroupChange(e.target.value)}
                onBlur={() => setEditingGroup(false)}
                className="rounded-full bg-fp-bg-elevated px-2 py-0.5 font-space-mono text-[11px] text-fp-text-tertiary outline-none"
              >
                <option value="">none</option>
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg.replace("_", " ")}
                  </option>
                ))}
              </select>
            ) : isCustom && !exercise.muscle_group ? (
              <button
                onClick={() => setEditingGroup(true)}
                className="rounded-full px-2 py-0.5 font-space-mono text-[11px] text-fp-text-tertiary/50 hover:text-fp-text-tertiary"
              >
                set group
              </button>
            ) : exercise.muscle_group ? (
              <button
                onClick={isCustom ? () => setEditingGroup(true) : undefined}
                className={`rounded-full bg-fp-bg-elevated px-2 py-0.5 font-space-mono text-[11px] text-fp-text-tertiary ${isCustom ? "cursor-pointer hover:bg-fp-accent/10" : "cursor-default"}`}
              >
                {exercise.muscle_group}
              </button>
            ) : null}
            <button
              onClick={onRemoveExercise}
              className="rounded-md p-1 text-fp-text-tertiary hover:bg-fp-bg-elevated hover:text-fp-text-secondary"
              aria-label="Remove exercise"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sets */}
        <div className="flex flex-col gap-2">
          {sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              hasError={errorSetIds.has(set.id)}
              onUpdateWeight={(w) => onUpdateWeight(set.id, w)}
              onUpdateReps={(r) => onUpdateReps(set.id, r)}
              onToggleWarmup={() => onToggleWarmup(set.id)}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))}
        </div>

        {/* Add Set */}
        <AddSetButton onAdd={onAddSet} />
      </div>
    </div>
  );
}
