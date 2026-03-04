"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MuscleGroup, ExerciseType } from "@/lib/types";

export async function createCustomExercise(
  name: string,
  muscleGroup: MuscleGroup,
  type: ExerciseType = "strength",
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name,
      muscle_group: muscleGroup,
      type,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true, data };
}

export async function softDeleteExercise(exerciseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("exercises")
    .update({ is_deleted: true })
    .eq("id", exerciseId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/workout");
  return { success: true };
}
