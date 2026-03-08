"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface PlanDayInput {
  dayOfWeek: number;
  name: string;
  exerciseIds: string[];
}

export async function createPlan(name: string, days: PlanDayInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Deactivate any existing active plan
  const { error: deactivateError } = await supabase
    .from("workout_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (deactivateError) {
    console.error("createPlan deactivate error:", deactivateError.message);
    return { success: false, error: "Something went wrong" };
  }

  // Create the new plan
  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({ user_id: user.id, name, is_active: true })
    .select()
    .single();

  if (planError) console.error("createPlan error:", planError.message);
  if (planError || !plan) return { success: false, error: "Something went wrong" };

  // Create days and their exercises
  const failedDays: string[] = [];
  for (const day of days) {
    const { data: planDay, error: dayError } = await supabase
      .from("workout_plan_days")
      .insert({
        plan_id: plan.id,
        day_of_week: day.dayOfWeek,
        name: day.name,
      })
      .select()
      .single();

    if (dayError || !planDay) {
      if (dayError) console.error(`createPlan day insert error (${day.name}):`, dayError.message);
      failedDays.push(day.name);
      continue;
    }

    if (day.exerciseIds.length > 0) {
      const exerciseRows = day.exerciseIds.map((exerciseId, i) => ({
        plan_day_id: planDay.id,
        exercise_id: exerciseId,
        position: i + 1,
      }));

      await supabase.from("plan_day_exercises").insert(exerciseRows);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/plan");

  if (failedDays.length > 0) {
    return { success: true, data: plan, warning: `Some days could not be added: ${failedDays.join(", ")}` };
  }

  return { success: true, data: plan };
}

export async function updatePlan(
  planId: string,
  name: string,
  days: PlanDayInput[],
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Update plan name and verify ownership
  const { data: updated, error: updateError } = await supabase
    .from("workout_plans")
    .update({ name })
    .eq("id", planId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError || !updated) return { success: false, error: "Plan not found" };

  // Delete existing days (cascades to plan_day_exercises)
  await supabase
    .from("workout_plan_days")
    .delete()
    .eq("plan_id", planId);

  // Re-create days
  for (const day of days) {
    const { data: planDay } = await supabase
      .from("workout_plan_days")
      .insert({
        plan_id: planId,
        day_of_week: day.dayOfWeek,
        name: day.name,
      })
      .select()
      .single();

    if (!planDay) continue;

    if (day.exerciseIds.length > 0) {
      const exerciseRows = day.exerciseIds.map((exerciseId, i) => ({
        plan_day_id: planDay.id,
        exercise_id: exerciseId,
        position: i + 1,
      }));

      await supabase.from("plan_day_exercises").insert(exerciseRows);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/plan");
  return { success: true };
}

export async function deletePlan(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    console.error("deletePlan error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/plan");
  return { success: true };
}

export async function setActivePlan(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Save the current active plan ID before deactivating
  const { data: currentActive } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const previousActivePlanId = currentActive?.id ?? null;

  // Deactivate all plans
  await supabase
    .from("workout_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Activate the selected plan
  const { error } = await supabase
    .from("workout_plans")
    .update({ is_active: true })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    console.error("setActivePlan error:", error.message);
    // Attempt to reactivate the old plan
    if (previousActivePlanId) {
      const { error: reactivateError } = await supabase
        .from("workout_plans")
        .update({ is_active: true })
        .eq("id", previousActivePlanId)
        .eq("user_id", user.id);

      if (reactivateError) {
        console.error("setActivePlan reactivation failed:", reactivateError.message);
      }
    }
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/plan");
  return { success: true };
}

export async function addExerciseToPlanDay(
  planDayId: string,
  exerciseId: string,
  position: number,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("plan_day_exercises")
    .insert({
      plan_day_id: planDayId,
      exercise_id: exerciseId,
      position,
    })
    .select()
    .single();

  if (error) {
    console.error("addExerciseToPlanDay error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/plan");
  return { success: true, data };
}

export async function removeExerciseFromPlanDay(planDayExerciseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("plan_day_exercises")
    .delete()
    .eq("id", planDayExerciseId);

  if (error) {
    console.error("removeExerciseFromPlanDay error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/plan");
  return { success: true };
}
