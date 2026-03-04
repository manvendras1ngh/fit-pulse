import type { Level } from "@/lib/utils/level";

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="rounded-full bg-fp-accent px-2.5 py-0.5 font-manrope text-[11px] font-semibold text-fp-text-on-accent">
      {level}
    </span>
  );
}
