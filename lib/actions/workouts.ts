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
  const { error: insertError } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    workout_date: workoutDate,
    plan_id: planId ?? null,
    day_name: dayName ?? null,
    started_at: new Date().toISOString(),
  });

  // Only ignore unique constraint violations (row already exists)
  if (insertError && insertError.code !== "23505") {
    console.error("startWorkout insert error:", insertError.message);
    return { success: false, error: "Something went wrong" };
  }

  const { data: log, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_date", workoutDate)
    .single();

  if (error) console.error("startWorkout error:", error.message);
  if (error || !log) return { success: false, error: "Something went wrong" };

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

  if (!Number.isFinite(weight) || weight < 0)
    return { success: false, error: "Invalid weight" };
  if (!Number.isInteger(reps) || reps <= 0)
    return { success: false, error: "Invalid reps" };
  if (!Number.isInteger(setNumber) || setNumber <= 0)
    return { success: false, error: "Invalid set number" };

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

  if (error) {
    console.error("addSet error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

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

  if (updates.weight !== undefined && (!Number.isFinite(updates.weight) || updates.weight < 0))
    return { success: false, error: "Invalid weight" };
  if (updates.reps !== undefined && (!Number.isInteger(updates.reps) || updates.reps <= 0))
    return { success: false, error: "Invalid reps" };

  const { error } = await supabase
    .from("workout_sets")
    .update(updates)
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateSet error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

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

  if (error) {
    console.error("deleteSet error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

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

  if (error) {
    console.error("completeWorkout error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

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

  if (error) {
    console.error("updateWorkoutLog error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/workout");
  return { success: true };
}

export async function getExerciseHistory(
  exerciseId: string,
): Promise<HistoricalSet[]> {
  return getLastSessionSets(exerciseId);
}
