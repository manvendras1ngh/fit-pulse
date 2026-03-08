import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";

export async function getExercises(): Promise<Exercise[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("is_deleted", false)
    .order("name");

  return data ?? [];
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("is_deleted", false)
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(20);

  return data ?? [];
}
