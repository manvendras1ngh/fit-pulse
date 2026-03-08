"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, ChevronLeft } from "lucide-react";
import { useUnit } from "@/lib/contexts/unit-context";
import type { WorkoutSet } from "@/lib/types";

interface SetRowProps {
  set: WorkoutSet;
  isLocked: boolean;
  onUpdateWeight: (weight: number) => void;
  onUpdateReps: (reps: number) => void;
  onToggleWarmup: () => void;
  onDelete: () => void;
  hasError?: boolean;
}

export function SetRow({
  set,
  isLocked,
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

  // Swipe state
  const touchStartX = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const isSwiping = useRef(false);
  const [nudging, setNudging] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Sync from props only when not focused (external updates)
  useEffect(() => {
    if (!isFocused.current) {
      setWeightText(displayWeight ? String(displayWeight) : "");
    }
  }, [displayWeight]);


  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isLocked) return;
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  }, [isLocked]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isLocked) return;
    const deltaX = touchStartX.current - e.touches[0].clientX;
    if (deltaX > 10) {
      isSwiping.current = true;
      setSwipeX(Math.min(deltaX, 80));
    } else {
      setSwipeX(0);
    }
  }, [isLocked]);

  const handleTouchEnd = useCallback(() => {
    if (isLocked) return;
    if (swipeX > 60) {
      onDelete();
    }
    setSwipeX(0);
    setTimeout(() => { isSwiping.current = false; }, 50);
  }, [isLocked, swipeX, onDelete]);

  // Nudge animation — teaches user to swipe on touch screens
  const handleNudge = useCallback(() => {
    if (nudging || isLocked) return;
    setNudging(true);
    setSwipeX(40);
    setTimeout(() => {
      setSwipeX(0);
      setTimeout(() => setNudging(false), 200);
    }, 300);
  }, [nudging, isLocked]);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (isLocked) {
        e.target.blur();
        return;
      }
      isFocused.current = true;
      e.target.select();
    },
    [isLocked],
  );

  return (
    <div ref={rowRef} className="group relative overflow-hidden rounded-lg">
      {/* Delete zone behind — only visible during swipe */}
      {!isLocked && (
        <div
          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 transition-opacity"
          style={{ opacity: swipeX > 0 ? 1 : 0 }}
        >
          <Trash2 className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Sliding content */}
      <div
        className={`relative flex w-full items-center gap-2 md:gap-2.5 bg-fp-bg-card transition-transform duration-150 ease-out ${
          hasError ? "ring-1 ring-red-500/50" : ""
        }`}
        style={{
          transform: !isLocked && swipeX > 0 ? `translateX(-${swipeX}px)` : undefined,
          transitionDuration: nudging ? "200ms" : (!isLocked && swipeX > 0 ? "0ms" : "150ms"),
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Set number badge */}
        <div className="flex h-[22px] w-[22px] md:h-6 md:w-6 shrink-0 items-center justify-center rounded-full bg-fp-bg-elevated">
          <span className="font-space-mono text-[11px] font-medium text-fp-text-tertiary">
            {set.set_number}
          </span>
        </div>

        {/* Weight input */}
        <input
          type="text"
          inputMode="decimal"
          value={weightText}
          readOnly={isLocked}
          tabIndex={isLocked ? -1 : undefined}
          onFocus={handleInputFocus}
          onBlur={() => {
            isFocused.current = false;
            setWeightText(displayWeight ? String(displayWeight) : "");
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            const parts = raw.split(".");
            const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
            if (sanitized !== "" && sanitized !== "." && parseFloat(sanitized) > 9999) return;
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
          className={`h-9 w-[72px] md:h-[38px] md:w-20 rounded-lg bg-fp-bg-elevated text-center font-space-mono text-sm outline-none ${
            isLocked
              ? "text-fp-text-tertiary cursor-default"
              : "text-fp-text-primary focus:ring-1 focus:ring-inset focus:ring-fp-accent"
          }`}
          placeholder={unitLabel}
        />

        {/* unit label */}
        <span className="font-manrope text-xs text-fp-text-tertiary">{unitLabel}</span>

        {/* Separator */}
        <span className="font-manrope text-sm text-fp-text-tertiary">&times;</span>

        {/* Reps input */}
        <input
          type="text"
          inputMode="numeric"
          value={set.reps || ""}
          readOnly={isLocked}
          tabIndex={isLocked ? -1 : undefined}
          onFocus={handleInputFocus}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            if (raw === "") {
              onUpdateReps(0);
              return;
            }
            if (parseInt(raw) > 999) return;
            const val = parseInt(raw);
            if (!isNaN(val) && val >= 0 && val <= 999) {
              onUpdateReps(val);
            }
          }}
          className={`h-9 w-14 md:h-[38px] md:w-16 rounded-lg bg-fp-bg-elevated text-center font-space-mono text-sm outline-none ${
            isLocked
              ? "text-fp-text-tertiary cursor-default"
              : "text-fp-text-primary focus:ring-1 focus:ring-inset focus:ring-fp-accent"
          }`}
          placeholder="reps"
        />

        {/* Warmup toggle */}
        <button
          onClick={onToggleWarmup}
          disabled={isLocked}
          className={`flex h-7 w-7 md:h-[30px] md:w-[30px] shrink-0 items-center justify-center rounded-sm ${
            set.is_warmup ? "bg-[#3F2D00]" : "bg-transparent"
          } ${isLocked ? "opacity-50" : ""}`}
          title="Warmup set"
        >
          <span className={`font-space-mono text-[11px] font-bold ${
            set.is_warmup ? "text-amber-500" : "text-fp-text-tertiary"
          }`}>
            W
          </span>
        </button>

        {/* Delete hint — swipe indicator on mobile, click on desktop */}
        {!isLocked && (
          <>
            <div onClick={handleNudge} className="flex shrink-0 items-center gap-0.5 md:hidden">
              <ChevronLeft className="h-3.5 w-3.5 text-red-800 opacity-80" />
              <Trash2 className="h-3.5 w-3.5 text-red-800 opacity-80" />
            </div>
            <button
              onClick={onDelete}
              className="hidden shrink-0 items-center justify-center md:flex"
              title="Delete set"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-800 opacity-80" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
