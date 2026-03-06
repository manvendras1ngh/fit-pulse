"use client";

import { useRef, useCallback } from "react";

interface AddSetButtonProps {
  onAdd: () => void;
}

export function AddSetButton({ onAdd }: AddSetButtonProps) {
  const lastClick = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClick.current < 300) return;
    lastClick.current = now;
    onAdd();
  }, [onAdd]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center py-1 font-manrope text-[13px] font-semibold text-fp-accent hover:opacity-80 md:h-9 md:rounded-lg md:border md:border-fp-accent"
    >
      + Add Set
    </button>
  );
}
