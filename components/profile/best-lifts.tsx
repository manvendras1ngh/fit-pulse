"use client";

import { Dumbbell } from "lucide-react";
import { useUnit } from "@/lib/contexts/unit-context";
import type { BestLift } from "@/lib/types";

export function BestLifts({ lifts }: { lifts: BestLift[] }) {
  const { unitLabel, toDisplayWeight } = useUnit();

  if (lifts.length === 0) {
    return (
      <div className="rounded-xl border border-fp-border bg-fp-bg-card p-6 text-center">
        <p className="text-sm text-fp-text-tertiary">
          Log some workouts to see your best lifts
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {lifts.map((lift) => (
        <div
          key={lift.exercise.id}
          className="flex flex-col items-center gap-2 rounded-xl border border-fp-border bg-fp-bg-card p-4"
        >
          <Dumbbell className="h-5 w-5 text-fp-accent" />
          <div className="text-center">
            <p className="font-space-grotesk text-[28px] font-bold text-fp-text-primary">
              {Math.round(toDisplayWeight(lift.estimated1RM))}
            </p>
            <p className="text-xs text-fp-text-tertiary">{unitLabel}</p>
            <p className="mt-1 text-xs text-fp-text-tertiary">
              {lift.exercise.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
