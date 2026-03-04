import { StartWorkoutButton } from "./start-workout-button";
import type { Exercise, PlanDayExercise, WorkoutLog, WorkoutPlanDay } from "@/lib/types";

interface TodaySummaryProps {
  todayPlanDay:
    | (WorkoutPlanDay & {
        exercises: (PlanDayExercise & { exercise: Exercise })[];
      })
    | null;
  todayWorkout: WorkoutLog | null;
  planId?: string;
}

export function TodaySummary({
  todayPlanDay,
  todayWorkout,
  planId,
}: TodaySummaryProps) {
  const hasExistingWorkout = !!todayWorkout;

  // Has plan + plan day today
  if (todayPlanDay) {
    const maxVisible = 5;
    const exercises = todayPlanDay.exercises;
    const visible = exercises.slice(0, maxVisible);
    const remaining = exercises.length - maxVisible;

    return (
      <div className="rounded-2xl border border-fp-border bg-fp-bg-card p-5">
        <div className="flex flex-col gap-4">
          <p className="font-space-mono text-[13px] font-semibold tracking-[1px] text-fp-accent">
            {todayPlanDay.name.toUpperCase()}
          </p>
          <div className="flex flex-col gap-1.5">
            {visible.map((pe) => (
              <p
                key={pe.id}
                className="font-manrope text-[15px] text-fp-text-secondary"
              >
                {pe.exercise.name}
              </p>
            ))}
            {remaining > 0 && (
              <p className="font-manrope text-[13px] font-medium text-fp-text-tertiary">
                +{remaining} more
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
    );
  }

  // No plan or rest day
  return (
    <div className="rounded-2xl border border-fp-border bg-fp-bg-card p-5">
      <div className="flex flex-col gap-4">
        <p className="font-manrope text-[15px] text-fp-text-secondary">
          Ready to lift?
        </p>
        <StartWorkoutButton hasExistingWorkout={hasExistingWorkout} />
      </div>
    </div>
  );
}
