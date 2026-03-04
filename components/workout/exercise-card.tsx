"use client";

import { SetRow } from "./set-row";
import { AddSetButton } from "./add-set-button";
import type { Exercise, WorkoutSet } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  errorSetIds: Set<string>;
  onAddSet: () => void;
  onUpdateWeight: (setId: string, weight: number) => void;
  onUpdateReps: (setId: string, reps: number) => void;
  onToggleWarmup: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
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
}: ExerciseCardProps) {
  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-space-grotesk text-base font-semibold text-fp-text-primary">
            {exercise.name}
          </span>
          {exercise.muscle_group && (
            <span className="rounded-full bg-fp-bg-elevated px-2 py-0.5 font-space-mono text-[11px] text-fp-text-tertiary">
              {exercise.muscle_group}
            </span>
          )}
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
