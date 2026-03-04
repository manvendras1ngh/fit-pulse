import Image from "next/image";
import { User } from "lucide-react";
import { LevelBadge } from "@/components/dashboard/level-badge";
import type { Level } from "@/lib/utils/level";

interface ProfileHeaderProps {
  name: string | null;
  avatarUrl: string | null;
  level: Level;
  createdAt: string;
}

export function ProfileHeader({
  name,
  avatarUrl,
  level,
  createdAt,
}: ProfileHeaderProps) {
  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? "Profile"}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fp-bg-elevated">
          <User className="h-10 w-10 text-fp-text-tertiary" />
        </div>
      )}
      <div className="text-center">
        <p className="font-space-grotesk text-lg font-bold text-fp-text-primary">
          {name ?? "User"}
        </p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <LevelBadge level={level} />
        </div>
        <p className="mt-1 text-[13px] text-fp-text-tertiary">
          Member since {memberSince}
        </p>
      </div>
    </div>
  );
}
