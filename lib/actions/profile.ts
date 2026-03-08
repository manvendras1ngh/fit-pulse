"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UnitPreference } from "@/lib/types";

export async function updateProfile(updates: {
  name?: string;
  preferred_unit?: UnitPreference;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ name: updates.name, preferred_unit: updates.preferred_unit })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile error:", error.message);
    return { success: false, error: "Something went wrong" };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
