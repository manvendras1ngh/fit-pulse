"use client";

import { ChevronDown } from "lucide-react";
import type { Exercise } from "@/lib/types";

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ExerciseSelector({
  exercises,
  selectedId,
  onSelect,
}: ExerciseSelectorProps) {
  const selected = exercises.find((e) => e.id === selectedId);

  return (
    <div className="relative">
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-fp-border bg-fp-bg-card px-4 pr-10 text-sm text-fp-text-primary outline-none focus:ring-1 focus:ring-fp-accent"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-text-tertiary" />
      {selected && (
        <span className="sr-only">{selected.name}</span>
      )}
    </div>
  );
}
