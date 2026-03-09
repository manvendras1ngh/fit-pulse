"use client";

import { TodaySummary } from "./today-summary";
import { MOTIVATIONAL_MESSAGES } from "@/lib/constants";
import { WeeklySummary } from "./weekly-summary";
import { LevelBadge } from "./level-badge";
import { computeLevel } from "@/lib/utils/level";
import { useUnit } from "@/lib/contexts/unit-context";
import type {
  Profile,
  WorkoutLogWithSets,
  WorkoutLog,
  Exercise,
  PlanDayExercise,
  WorkoutPlan,
  WorkoutPlanDay,
  WeeklySummary as WeeklySummaryType,
} from "@/lib/types";

interface DashboardClientProps {
  profile: Profile;
  todayWorkout: WorkoutLogWithSets | null;
  todayPlanDay:
    | (WorkoutPlanDay & {
        exercises: (PlanDayExercise & { exercise: Exercise })[];
      })
    | null;
  activePlan: WorkoutPlan | null;
  recentWorkouts: WorkoutLog[];
  weeklySummary: WeeklySummaryType;
  workoutCount: number;
}

export function DashboardClient({
  profile,
  todayWorkout,
  todayPlanDay,
  activePlan,
  recentWorkouts,
  weeklySummary,
  workoutCount,
}: DashboardClientProps) {
  const { toDisplayWeight, unitLabel } = useUnit();

  const level = computeLevel(workoutCount, false, false);
  const firstName = profile.name?.split(" ")[0] ?? "there";

  const todayVolume = todayWorkout
    ? todayWorkout.exercises.reduce(
        (sum, e) =>
          sum +
          e.sets.reduce(
            (s, set) => s + Number(set.reps) * Number(set.weight),
            0,
          ),
        0,
      )
    : null;

  const bestSetWeight = todayWorkout
    ? todayWorkout.exercises.reduce(
        (max, e) =>
          Math.max(
            max,
            ...e.sets.map((set) => Number(set.weight)),
          ),
        0,
      )
    : null;

  const quote = MOTIVATIONAL_MESSAGES[new Date().getDay()];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
          Today
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-fp-text-secondary">
            Hey, {firstName}
          </span>
          <LevelBadge level={level} />
        </div>
      </div>

      {/* Stats Container */}
      <div className="rounded-2xl border border-fp-border bg-fp-bg-card p-5">
        <p className="mb-3 font-space-mono text-[13px] text-fp-accent">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-fp-bg-elevated p-3">
            <p className="font-space-grotesk text-lg font-bold text-fp-text-primary">
              {todayVolume !== null && todayVolume > 0
                ? toDisplayWeight(todayVolume).toLocaleString()
                : "\u2014"}
            </p>
            <p className="font-space-mono text-[11px] tracking-[0.5px] text-fp-text-tertiary">
              VOLUME ({unitLabel})
            </p>
          </div>
          <div className="rounded-xl bg-fp-bg-elevated p-3">
            <p className="font-space-grotesk text-lg font-bold text-fp-text-primary">
              {workoutCount}
            </p>
            <p className="font-space-mono text-[11px] tracking-[0.5px] text-fp-text-tertiary">
              TOTAL DAYS
            </p>
          </div>
          <div className="rounded-xl bg-fp-bg-elevated p-3">
            <p className="font-space-grotesk text-lg font-bold text-fp-text-primary">
              {bestSetWeight !== null && bestSetWeight > 0
                ? `${toDisplayWeight(bestSetWeight)} ${unitLabel}`
                : "\u2014"}
            </p>
            <p className="font-space-mono text-[11px] tracking-[0.5px] text-fp-text-tertiary">
              BEST SET
            </p>
          </div>
        </div>
      </div>

      {/* Today's Workout Card */}
      <TodaySummary
        todayPlanDay={todayPlanDay}
        todayWorkout={todayWorkout}
        planId={activePlan?.id}
      />

      {/* Weekly Summary */}
      <WeeklySummary
        recentWorkouts={recentWorkouts}
        workoutsThisWeek={weeklySummary.workoutsThisWeek}
      />
    </div>
  );
}
