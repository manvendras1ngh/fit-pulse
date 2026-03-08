"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MuscleGroup, ExerciseType } from "@/lib/types";

export async function createCustomExercise(
  name: string,
  muscleGroup: MuscleGroup | null,
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

  if (error) {
    console.error("createCustomExercise error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

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

  if (error) {
    console.error("softDeleteExercise error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/workout");
  return { success: true };
}

export async function updateExerciseMuscleGroup(
  exerciseId: string,
  muscleGroup: MuscleGroup | null,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("exercises")
    .update({ muscle_group: muscleGroup })
    .eq("id", exerciseId)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateExerciseMuscleGroup error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/workout");
  return { success: true };
}
