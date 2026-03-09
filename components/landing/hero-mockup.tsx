"use client";

import { useState, useEffect } from "react";
import { MOTIVATIONAL_MESSAGES } from "@/lib/constants";

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function HeroMockup() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const volume = useCountUp(2840);
  const days = useCountUp(54);
  const bestSet = useCountUp(120);

  return (
    <div className="mt-16 w-full max-w-md rounded-4xl border border-fp-border bg-fp-bg-card p-4 shadow-[0_0_60px_0_rgba(196,248,42,0.08)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-space-mono text-[11px] font-semibold text-fp-accent">
            &ldquo;{MOTIVATIONAL_MESSAGES[quoteIndex]}&rdquo;
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-fp-bg-elevated p-3 text-center">
            <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
              {volume.toLocaleString()}
            </p>
            <p className="text-[10px] text-fp-text-tertiary">kg/WEEK</p>
          </div>
          <div className="rounded-xl bg-fp-bg-elevated p-3 text-center">
            <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
              {days}
            </p>
            <p className="text-[10px] text-fp-text-tertiary">TOTAL DAYS</p>
          </div>
          <div className="rounded-xl bg-fp-bg-elevated p-3 text-center">
            <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
              {bestSet}
            </p>
            <p className="text-[10px] text-fp-text-tertiary">BEST SET</p>
          </div>
        </div>
      </div>
    </div>
  );
}
