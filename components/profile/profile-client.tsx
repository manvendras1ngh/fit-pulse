"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { ProfileHeader } from "./profile-header";
import { BestLifts } from "./best-lifts";
import { UnitToggle } from "./unit-toggle";
import { createClient } from "@/lib/supabase/client";
import { computeLevel } from "@/lib/utils/level";
import { toast } from "sonner";
import type { Profile, BestLift, UnitPreference } from "@/lib/types";

interface ProfileClientProps {
  profile: Profile;
  bestLifts: BestLift[];
  workoutCount: number;
}

export function ProfileClient({
  profile,
  bestLifts,
  workoutCount,
}: ProfileClientProps) {
  const router = useRouter();
  const [unit, setUnit] = useState<UnitPreference>(profile.preferred_unit);
  const [signingOut, setSigningOut] = useState(false);

  const level = computeLevel(workoutCount, false, false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      setSigningOut(false);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      <h1 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
        Profile
      </h1>

      <ProfileHeader
        name={profile.name}
        avatarUrl={profile.avatar_url}
        level={level}
        createdAt={profile.created_at}
      />

      {/* Best Lifts */}
      <div className="flex flex-col gap-3">
        <p className="font-space-grotesk text-base font-bold text-fp-text-primary">
          Best Lifts
        </p>
        <BestLifts lifts={bestLifts} />
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-3">
        <p className="font-space-grotesk text-base font-bold text-fp-text-primary">
          Settings
        </p>
        <div className="flex items-center justify-between rounded-xl border border-fp-border bg-fp-bg-card px-4 py-3">
          <span className="text-sm text-fp-text-primary">Weight Unit</span>
          <UnitToggle currentUnit={unit} onToggle={setUnit} />
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-fp-border-muted text-[15px] font-semibold text-red-400 transition-colors hover:bg-fp-bg-card disabled:opacity-50"
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {signingOut ? "Signing Out..." : "Sign Out"}
      </button>
    </div>
  );
}
