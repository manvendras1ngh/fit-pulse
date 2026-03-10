import { createClient } from "@/lib/supabase/server";
import { getTodayWorkout, getRecentWorkouts, getWeeklySummary } from "./workouts";
import { getTodayPlanDay, getActivePlan } from "./plans";
import { getWorkoutCount } from "./progress";
import type {
  Profile,
  WorkoutLogWithSets,
  WorkoutLog,
  WorkoutPlan,
  WorkoutPlanDay,
  PlanDayExercise,
  Exercise,
  WeeklySummary,
} from "@/lib/types";

export interface DashboardData {
  profile: Profile;
  todayWorkout: WorkoutLogWithSets | null;
  todayPlanDay:
    | (WorkoutPlanDay & {
        exercises: (PlanDayExercise & { exercise: Exercise })[];
      })
    | null;
  activePlan: WorkoutPlan | null;
  recentWorkouts: WorkoutLog[];
  weeklySummary: WeeklySummary;
  workoutCount: number;
}

/**
 * Fetch all dashboard data with a single Supabase client.
 * User ID is passed from middleware — zero auth calls here.
 */
export async function getDashboardData(
  userId: string,
  workoutDate: string,
  dayOfWeek: number,
  weekStart: string,
  weekEnd: string,
): Promise<DashboardData | null> {
  const supabase = await createClient();
  const ctx = { supabase, userId };

  // Fetch profile + all dashboard queries in parallel with shared auth context
  const [profile, todayWorkout, todayPlanDay, activePlan, recentWorkouts, weeklySummary, workoutCount] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
        .then((r) => r.data as Profile | null),
      getTodayWorkout(workoutDate, ctx),
      getTodayPlanDay(dayOfWeek, ctx),
      getActivePlan(ctx),
      getRecentWorkouts(7, ctx),
      getWeeklySummary(weekStart, weekEnd, ctx),
      getWorkoutCount(ctx),
    ]);

  if (!profile) return null;

  return {
    profile,
    todayWorkout,
    todayPlanDay,
    activePlan,
    recentWorkouts,
    weeklySummary,
    workoutCount,
  };
}
