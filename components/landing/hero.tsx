"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOTIVATIONAL_MESSAGES } from "@/components/dashboard/today-summary";

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function Hero() {
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
    <section className="relative flex flex-col items-center px-6 pb-20 pt-32 text-center md:pt-40">
      {/* Badge */}
      <div className="mb-6 rounded-full border border-fp-border px-4 py-1.5 text-xs text-fp-text-secondary">
        Track smarter, lift heavier
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl font-space-grotesk text-[42px] font-bold leading-[1.05] tracking-[-1px] text-fp-text-primary md:text-[72px]">
        Your workouts,{" "}
        <span className="text-fp-accent">perfected.</span>
      </h1>

      {/* Subline */}
      <p className="mt-6 max-w-xl font-manrope text-base text-fp-text-secondary md:text-xl">
        Effortlessly track, plan, and optimize your gym sessions. Built
        for lifters who take progress seriously.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-full bg-fp-accent px-8 py-3 font-manrope text-[15px] font-bold text-fp-text-on-accent transition-opacity hover:opacity-90"
        >
          Start Free
        </Link>
        <a
          href="#features"
          className="rounded-full border border-fp-border px-8 py-3 font-manrope text-[15px] font-medium text-fp-text-secondary transition-colors hover:border-fp-text-tertiary hover:text-fp-text-primary"
        >
          Learn More
        </a>
      </div>

      {/* App Mockup */}
      <div className="mt-16 w-full max-w-md rounded-[20px] border border-fp-border bg-fp-bg-card p-4 shadow-[0_0_60px_0_rgba(196,248,42,0.08)]">
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
    </section>
  );
}
