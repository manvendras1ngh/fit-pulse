"use client";

import { StartWorkoutButton } from "./start-workout-button";
import type {
  Exercise,
  PlanDayExercise,
  WorkoutLogWithSets,
  WorkoutPlanDay,
} from "@/lib/types";

export { MOTIVATIONAL_MESSAGES } from "@/lib/constants";

interface TodaySummaryProps {
  todayPlanDay:
    | (WorkoutPlanDay & {
        exercises: (PlanDayExercise & { exercise: Exercise })[];
      })
    | null;
  todayWorkout: WorkoutLogWithSets | null;
  planId?: string;
}

export function TodaySummary({
  todayPlanDay,
  todayWorkout,
  planId,
}: TodaySummaryProps) {
  const hasExistingWorkout = !!todayWorkout;

  return (
    <>
      {todayPlanDay ? (
        <div className="rounded-2xl border border-fp-border bg-fp-bg-card p-5">
          <div className="flex flex-col gap-4">
            <p className="font-space-mono text-[13px] font-semibold tracking-[1px] text-fp-accent">
              {todayPlanDay.name.toUpperCase()}
            </p>
            <div className="flex flex-col gap-1.5">
              {todayPlanDay.exercises.slice(0, 5).map((pe) => (
                <p
                  key={pe.id}
                  className="font-manrope text-[15px] text-fp-text-secondary"
                >
                  {pe.exercise.name}
                </p>
              ))}
              {todayPlanDay.exercises.length > 5 && (
                <p className="font-manrope text-[13px] font-medium text-fp-text-tertiary">
                  +{todayPlanDay.exercises.length - 5} more
                </p>
              )}
            </div>
            <StartWorkoutButton
              hasExistingWorkout={hasExistingWorkout}
              planId={planId}
              dayName={todayPlanDay.name}
              planDayId={todayPlanDay.id}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-fp-border bg-fp-bg-card p-5">
          <div className="flex flex-col gap-4">
            <p className="font-manrope text-[15px] text-fp-text-secondary">
              Ready to lift?
            </p>
            <StartWorkoutButton hasExistingWorkout={hasExistingWorkout} />
          </div>
        </div>
      )}
    </>
  );
}
