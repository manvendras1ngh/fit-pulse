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
    .update(updates)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
