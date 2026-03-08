"use client";

import { useRef } from "react";
import { X, Lock, LockOpen, ChevronDown } from "lucide-react";
import { SetRow } from "./set-row";
import { AddSetButton } from "./add-set-button";
import { updateExerciseMuscleGroup } from "@/lib/actions/exercises";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Exercise, WorkoutSet, MuscleGroup } from "@/lib/types";
import { MUSCLE_GROUPS } from "@/lib/constants";

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  errorSetIds: Set<string>;
  isLocked: boolean;
  onAddSet: () => void;
  onUpdateWeight: (setId: string, weight: number) => void;
  onUpdateReps: (setId: string, reps: number) => void;
  onToggleWarmup: (setId: string) => void;
  onLockExercise: () => void;
  onDeleteSet: (setId: string) => void;
  onRemoveExercise: () => void;
  onExerciseUpdate?: (exercise: Exercise) => void;
}

export function ExerciseCard({
  exercise,
  sets,
  errorSetIds,
  isLocked,
  onAddSet,
  onUpdateWeight,
  onUpdateReps,
  onToggleWarmup,
  onLockExercise,
  onDeleteSet,
  onRemoveExercise,
  onExerciseUpdate,
}: ExerciseCardProps) {
  const isCustom = !!exercise.user_id;

  const setsContainerRef = useRef<HTMLDivElement>(null);

  const handleAddSetWithFocus = () => {
    const prevCount =
      setsContainerRef.current?.querySelectorAll<HTMLInputElement>(
        'input[inputmode="decimal"]',
      ).length ?? 0;
    onAddSet();
    let attempts = 0;
    const checkAndFocus = () => {
      if (++attempts > 60) return;
      const inputs =
        setsContainerRef.current?.querySelectorAll<HTMLInputElement>(
          'input[inputmode="decimal"]',
        );
      if (inputs && inputs.length > prevCount) {
        inputs[inputs.length - 1].focus();
      } else {
        requestAnimationFrame(checkAndFocus);
      }
    };
    requestAnimationFrame(checkAndFocus);
  };

  const handleMuscleGroupChange = async (value: string) => {
    const newGroup = value === "" ? null : (value as MuscleGroup);

    // Optimistic update
    onExerciseUpdate?.({ ...exercise, muscle_group: newGroup });

    const result = await updateExerciseMuscleGroup(exercise.id, newGroup);
    if (!result.success) {
      toast.error("Failed to update muscle group");
      onExerciseUpdate?.(exercise); // revert
    }
  };

  const LockIcon = isLocked ? Lock : LockOpen;

  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-space-grotesk text-base md:text-lg font-semibold text-fp-text-primary">
            {exercise.name}
          </span>
          <div className="flex items-center gap-5">
            {isCustom ? (
              <div className="relative flex min-w-25 items-center">
                <select
                  value={exercise.muscle_group ?? ""}
                  onChange={(e) => handleMuscleGroupChange(e.target.value)}
                  className="w-0 min-w-full cursor-pointer appearance-none rounded-md bg-[#27272A] py-1.5 pl-3.5 pr-7.5 font-space-mono text-[11px] text-[#71717A] outline-none"
                >
                  <option value="">set group</option>
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>
                      {mg.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#52525B]" />
              </div>
            ) : exercise.muscle_group ? (
              <span className="inline-flex min-w-25 items-center rounded-md bg-[#27272A] px-3.5 py-1.5 font-space-mono text-[11px] text-[#71717A]">
                {exercise.muscle_group}
              </span>
            ) : null}

            {/* Lock toggle */}
            <button
              onClick={onLockExercise}
              disabled={sets.length === 0}
              className="flex items-center justify-center disabled:opacity-30"
              title={isLocked ? "Unlock exercise" : "Lock exercise"}
            >
              <LockIcon
                className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
                  isLocked ? "text-green-400" : "text-fp-border-muted"
                }`}
              />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center justify-center rounded-md text-fp-text-tertiary hover:bg-fp-bg-elevated hover:text-fp-text-secondary"
                  aria-label="Remove exercise"
                >
                  <X className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Exercise?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all sets for {exercise.name} from
                    today&apos;s workout.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemoveExercise}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Sets */}
        <div ref={setsContainerRef} className="flex flex-col gap-3">
          {sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              isLocked={isLocked}
              hasError={errorSetIds.has(set.id)}
              onUpdateWeight={(w) => onUpdateWeight(set.id, w)}
              onUpdateReps={(r) => onUpdateReps(set.id, r)}
              onToggleWarmup={() => onToggleWarmup(set.id)}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))}
        </div>

        {/* Add Set */}
        {!isLocked && <AddSetButton onAdd={handleAddSetWithFocus} />}
      </div>
    </div>
  );
}
