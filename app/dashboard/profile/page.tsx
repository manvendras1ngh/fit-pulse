import { ProfileClient } from "@/components/profile/profile-client";
import { getProfile } from "@/lib/queries/profile";
import { getBestLifts, getWorkoutCount } from "@/lib/queries/progress";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const [profile, bestLifts, workoutCount] = await Promise.all([
    getProfile(),
    getBestLifts(3),
    getWorkoutCount(),
  ]);

  if (!profile) redirect("/login");

  return (
    <ProfileClient
      profile={profile}
      bestLifts={bestLifts}
      workoutCount={workoutCount}
    />
  );
}
