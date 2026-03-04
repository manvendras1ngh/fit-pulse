"use client";

import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import type { UnitPreference } from "@/lib/types";

interface UnitToggleProps {
  currentUnit: UnitPreference;
  onToggle: (unit: UnitPreference) => void;
}

export function UnitToggle({ currentUnit, onToggle }: UnitToggleProps) {
  const handleToggle = async (unit: UnitPreference) => {
    onToggle(unit);
    const result = await updateProfile({ preferred_unit: unit });
    if (!result.success) {
      onToggle(currentUnit);
      toast.error("Failed to update unit preference");
    }
  };

  return (
    <div className="flex h-8 items-center rounded-full bg-fp-bg-elevated p-0.5">
      <button
        onClick={() => handleToggle("kg")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          currentUnit === "kg"
            ? "bg-fp-accent text-fp-text-on-accent"
            : "text-fp-text-tertiary"
        }`}
      >
        kg
      </button>
      <button
        onClick={() => handleToggle("lbs")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          currentUnit === "lbs"
            ? "bg-fp-accent text-fp-text-on-accent"
            : "text-fp-text-tertiary"
        }`}
      >
        lbs
      </button>
    </div>
  );
}
