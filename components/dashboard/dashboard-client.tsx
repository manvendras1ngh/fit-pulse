"use client";

import { useEffect, useState } from "react";
import { TodaySummary } from "./today-summary";
import { WeeklySummary } from "./weekly-summary";
import { LevelBadge } from "./level-badge";
import { computeLevel } from "@/lib/utils/level";
import { getWorkoutDate, getTodayDayOfWeek } from "@/lib/utils/workout-date";
import type {
  Profile,
  WorkoutLog,
  Exercise,
  PlanDayExercise,
  WorkoutPlan,
  WorkoutPlanDay,
  WeeklySummary as WeeklySummaryType,
} from "@/lib/types";

interface DashboardClientProps {
  profile: Profile;
  fetchData: (
    workoutDate: string,
    dayOfWeek: number,
  ) => Promise<{
    todayWorkout: WorkoutLog | null;
    todayPlanDay:
      | (WorkoutPlanDay & {
          exercises: (PlanDayExercise & { exercise: Exercise })[];
        })
      | null;
    activePlan: WorkoutPlan | null;
    recentWorkouts: WorkoutLog[];
    weeklySummary: WeeklySummaryType;
    workoutCount: number;
  }>;
}

export function DashboardClient({
  profile,
  fetchData,
}: DashboardClientProps) {
  const [data, setData] = useState<{
    todayWorkout: WorkoutLog | null;
    todayPlanDay:
      | (WorkoutPlanDay & {
          exercises: (PlanDayExercise & { exercise: Exercise })[];
        })
      | null;
    activePlan: WorkoutPlan | null;
    recentWorkouts: WorkoutLog[];
    weeklySummary: WeeklySummaryType;
    workoutCount: number;
  } | null>(null);

  useEffect(() => {
    const workoutDate = getWorkoutDate();
    const dayOfWeek = getTodayDayOfWeek();
    fetchData(workoutDate, dayOfWeek).then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = computeLevel(
    data?.workoutCount ?? 0,
    false,
    false,
  );

  const firstName = profile.name?.split(" ")[0] ?? "there";

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

      {/* Today's Workout Card */}
      <TodaySummary
        todayPlanDay={data?.todayPlanDay ?? null}
        todayWorkout={data?.todayWorkout ?? null}
        planId={data?.activePlan?.id}
      />

      {/* Weekly Summary */}
      <WeeklySummary
        recentWorkouts={data?.recentWorkouts ?? []}
        workoutsThisWeek={data?.weeklySummary.workoutsThisWeek ?? 0}
      />
    </div>
  );
}
