import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  WorkoutPlan,
  WorkoutPlanDay,
  PlanDayExercise,
  Exercise,
  PlanWithDays,
} from "@/lib/types";

interface AuthContext {
  supabase: SupabaseClient;
  userId: string;
}

export async function getActivePlan(ctx?: AuthContext): Promise<WorkoutPlan | null> {
  const supabase = ctx?.supabase ?? await createClient();
  const userId = ctx?.userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  return data;
}

export async function getPlanWithDays(
  planId: string,
): Promise<PlanWithDays | null> {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return null;

  const { data: days } = await supabase
    .from("workout_plan_days")
    .select("*, plan_day_exercises(*, exercise:exercises(*))")
    .eq("plan_id", planId)
    .order("day_of_week");

  const daysWithExercises = (days ?? []).map((day) => {
    const exercises = (day.plan_day_exercises ?? []).map((pe: Record<string, unknown>) => ({
      ...pe,
      exercise: pe.exercise as unknown as Exercise,
    })) as (PlanDayExercise & { exercise: Exercise })[];

    const { plan_day_exercises: _unused, ...dayData } = day;
    return { ...dayData, exercises };
  });

  return { ...plan, days: daysWithExercises };
}

export async function getTodayPlanDay(
  dayOfWeek: number,
  ctx?: AuthContext,
): Promise<(WorkoutPlanDay & { exercises: (PlanDayExercise & { exercise: Exercise })[] }) | null> {
  const activePlan = await getActivePlan(ctx);
  if (!activePlan) return null;

  const supabase = ctx?.supabase ?? await createClient();

  // Single query with nested select — no waterfall
  const { data: day } = await supabase
    .from("workout_plan_days")
    .select("*, plan_day_exercises(*, exercise:exercises(*))")
    .eq("plan_id", activePlan.id)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!day) return null;

  const exercises = (day.plan_day_exercises ?? []).map((pe: Record<string, unknown>) => ({
    ...pe,
    exercise: pe.exercise as unknown as Exercise,
  })) as (PlanDayExercise & { exercise: Exercise })[];

  const { plan_day_exercises: _unused, ...dayData } = day;
  return { ...dayData, exercises };
}

export async function getAllPlans(): Promise<WorkoutPlan[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
