"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Flame } from "lucide-react";
import { useUnit } from "@/lib/contexts/unit-context";
import type { WorkoutSet } from "@/lib/types";

interface SetRowProps {
  set: WorkoutSet;
  onUpdateWeight: (weight: number) => void;
  onUpdateReps: (reps: number) => void;
  onToggleWarmup: () => void;
  onDelete: () => void;
  hasError?: boolean;
}

export function SetRow({
  set,
  onUpdateWeight,
  onUpdateReps,
  onToggleWarmup,
  onDelete,
  hasError,
}: SetRowProps) {
  const { unitLabel, toDisplayWeight, toStorageWeight } = useUnit();
  const displayWeight = set.weight ? toDisplayWeight(set.weight) : 0;
  const [weightText, setWeightText] = useState(displayWeight ? String(displayWeight) : "");
  const isFocused = useRef(false);

  // Sync from props only when not focused (external updates)
  useEffect(() => {
    if (!isFocused.current) {
      setWeightText(displayWeight ? String(displayWeight) : "");
    }
  }, [displayWeight]);

  return (
    <div
      className={`flex items-center gap-2 ${hasError ? "rounded-lg ring-1 ring-red-500/50" : ""}`}
    >
      {/* Set number */}
      <span className="w-6 text-center font-space-mono text-[13px] font-medium text-fp-text-tertiary">
        {set.set_number}
      </span>

      {/* Weight input */}
      <input
        type="text"
        inputMode="decimal"
        value={weightText}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => {
          isFocused.current = false;
          // Clean up trailing dot on blur
          setWeightText(displayWeight ? String(displayWeight) : "");
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          // Prevent multiple dots
          const parts = raw.split(".");
          const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
          setWeightText(sanitized);
          if (sanitized === "" || sanitized === ".") {
            onUpdateWeight(0);
            return;
          }
          const val = parseFloat(sanitized);
          if (!isNaN(val) && val >= 0 && val <= 9999) {
            onUpdateWeight(toStorageWeight(val));
          }
        }}
        className="h-9 w-[72px] rounded-lg bg-fp-bg-elevated text-center font-manrope text-sm text-fp-text-primary outline-none focus:ring-1 focus:ring-fp-accent"
        placeholder="0"
      />

      {/* unit label */}
      <span className="font-manrope text-xs text-fp-text-tertiary">{unitLabel}</span>

      {/* Separator */}
      <span className="font-manrope text-sm text-fp-border-muted">&times;</span>

      {/* Reps input */}
      <input
        type="text"
        inputMode="numeric"
        value={set.reps || ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          if (raw === "") {
            onUpdateReps(0);
            return;
          }
          const val = parseInt(raw);
          if (!isNaN(val) && val >= 0 && val <= 999) {
            onUpdateReps(val);
          }
        }}
        className="h-9 w-14 rounded-lg bg-fp-bg-elevated text-center font-manrope text-sm text-fp-text-primary outline-none focus:ring-1 focus:ring-fp-accent"
        placeholder="0"
      />

      {/* Warmup toggle */}
      <button
        onClick={onToggleWarmup}
        className={`flex h-7 w-7 items-center justify-center rounded-md ${
          set.is_warmup ? "bg-[#3F2D00]" : "bg-transparent"
        }`}
        title="Warmup set"
      >
        <Flame
          className={`h-3.5 w-3.5 ${
            set.is_warmup ? "text-fp-accent" : "text-fp-border-muted"
          }`}
        />
      </button>

      {/* Delete */}
      <button onClick={onDelete} className="p-1" title="Delete set">
        <Trash2 className="h-3.5 w-3.5 text-fp-border-muted hover:text-red-400" />
      </button>
    </div>
  );
}
