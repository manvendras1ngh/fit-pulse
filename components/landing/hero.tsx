import Link from "next/link";
import { HeroMockup } from "./hero-mockup";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center px-6 pb-20 pt-32 text-center md:pt-40">
      {/* Badge */}
      <div className="mb-6 rounded-full border border-fp-border px-4 py-1.5 text-xs text-fp-text-secondary">
        Track smarter, lift heavier
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl font-space-grotesk text-[42px] font-bold leading-[1.05] tracking-[-1px] text-fp-text-primary md:text-[72px]">
        Your workouts, <span className="text-fp-accent">perfected.</span>
      </h1>

      {/* Subline */}
      <p className="mt-6 max-w-xl font-manrope text-base text-fp-text-secondary md:text-xl">
        Effortlessly track, plan, and optimize your gym sessions. Built for
        lifters who take progress seriously.
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

      {/* App Mockup — client island for animations */}
      <HeroMockup />
    </section>
  );
}
