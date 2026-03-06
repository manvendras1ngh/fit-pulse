"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getLastSessionSets, type HistoricalSet } from "@/lib/queries/workouts";

export async function startWorkout(
  workoutDate: string,
  planId?: string,
  dayName?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Fetch-or-create: INSERT ON CONFLICT DO NOTHING then SELECT
  await supabase.from("workout_logs").insert({
    user_id: user.id,
    workout_date: workoutDate,
    plan_id: planId ?? null,
    day_name: dayName ?? null,
    started_at: new Date().toISOString(),
  });

  const { data: log, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_date", workoutDate)
    .single();

  if (error || !log) return { success: false, error: error?.message ?? "Failed to create workout" };

  revalidatePath("/dashboard");
  return { success: true, data: log };
}

export async function addSet(
  workoutLogId: string,
  exerciseId: string,
  setNumber: number,
  weight: number,
  reps: number,
  isWarmup: boolean = false,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      workout_log_id: workoutLogId,
      user_id: user.id,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight,
      reps,
      is_warmup: isWarmup,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true, data };
}

export async function updateSet(
  setId: string,
  updates: {
    weight?: number;
    reps?: number;
    is_warmup?: boolean;
    is_completed?: boolean;
  },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_sets")
    .update(updates)
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true };
}

export async function deleteSet(setId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_sets")
    .delete()
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true };
}

export async function completeWorkout(workoutLogId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_logs")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", workoutLogId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateWorkoutLog(
  workoutLogId: string,
  updates: {
    plan_id?: string | null;
    day_name?: string | null;
  },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_logs")
    .update(updates)
    .eq("id", workoutLogId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true };
}

export async function getExerciseHistory(
  exerciseId: string,
): Promise<HistoricalSet[]> {
  return getLastSessionSets(exerciseId);
}
