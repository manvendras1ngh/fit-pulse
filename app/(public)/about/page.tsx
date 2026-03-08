import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Heart,
  Dumbbell,
  Calendar,
  TrendingUp,
  Scale,
  ShieldOff,
  Trophy,
  User,
  Mail,
  Globe,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

const features = [
  {
    icon: Dumbbell,
    title: "Log Workouts",
    desc: "Track sets, reps, and weight for every exercise. Simple and fast.",
  },
  {
    icon: Calendar,
    title: "Weekly Plans",
    desc: "Create and manage workout plans that fit your weekly schedule.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Volume trends, estimated 1RM, and best lifts — all at a glance.",
  },
  {
    icon: Scale,
    title: "kg or lbs",
    desc: "Works in your preferred unit. Switch anytime.",
  },
  {
    icon: ShieldOff,
    title: "No Noise",
    desc: "No ads. No tracking. No social feeds. Just your workouts.",
  },
  {
    icon: Trophy,
    title: "Best Lifts",
    desc: "See your personal records at a glance. Stay motivated.",
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "FitPulse is a simple, distraction-free workout tracker. No ads, no social feeds — just your workouts.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-fp-bg-page pt-16">
        {/* Hero */}
        <section className="px-6 pb-10 pt-12 md:px-[120px] md:pb-[60px] md:pt-20">
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex w-fit items-center gap-1.5 rounded-full border border-fp-border px-4 py-1.5">
              <Heart className="h-3.5 w-3.5 text-fp-accent" />
              <span className="font-space-mono text-[11px] font-medium tracking-[2px] text-fp-accent">
                ABOUT FITPULSE
              </span>
            </div>
            <h1 className="font-space-grotesk text-4xl font-extrabold leading-[1.1] tracking-tight text-fp-text-primary md:text-[52px] md:tracking-[-0.5px]">
              Your workouts,
              <br />
              simplified.
            </h1>
            <p className="max-w-2xl font-manrope text-[15px] leading-relaxed text-fp-text-secondary md:text-lg md:leading-[1.7]">
              FitPulse started with a simple thing in mind — to come out of the
              notes app and simply track workouts without any distraction. No
              social feeds, no upsells, no complexity. Just open the app, log
              your sets, and get back to lifting.
            </p>
          </div>
        </section>

        {/* Quote */}
        <section className="bg-fp-bg-card px-6 py-9 md:px-[120px] md:py-12">
          <p className="max-w-2xl font-space-grotesk text-lg font-semibold leading-relaxed text-fp-text-primary md:text-[22px] md:leading-[1.6]">
            &ldquo;I was tired of gym apps that tried to do everything. I
            didn&apos;t need AI coaches, community features, or meal planners. I
            needed a clean place to write down what I lifted today and see how
            I&apos;m doing over time. So I built one.&rdquo;
          </p>
          <p className="mt-4 font-manrope text-sm font-semibold text-fp-accent">
            — Manav Singh, Creator
          </p>
        </section>

        {/* Features */}
        <section className="px-6 py-12 md:px-[120px] md:py-20">
          <h2 className="font-space-grotesk text-[28px] font-extrabold tracking-tight text-fp-text-primary md:text-4xl md:tracking-[-0.3px]">
            What FitPulse Does
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-fp-border bg-fp-bg-card p-7"
              >
                <div className="flex flex-col gap-4">
                  <f.icon className="h-6 w-6 text-fp-accent" />
                  <h3 className="font-space-grotesk text-lg font-bold text-fp-text-primary">
                    {f.title}
                  </h3>
                  <p className="font-manrope text-[15px] leading-relaxed text-fp-text-secondary">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Built By */}
        <section className="bg-fp-bg-card px-6 py-12 md:px-[120px] md:py-20">
          <h2 className="font-space-grotesk text-[28px] font-extrabold tracking-tight text-fp-text-primary md:text-4xl md:tracking-[-0.3px]">
            Built By
          </h2>
          <div className="mt-6 flex items-center gap-6 md:mt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fp-bg-elevated">
              <User className="h-7 w-7 text-fp-accent" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
                Manav Singh
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="mailto:hello@manavsingh.in"
                  className="flex items-center gap-2 font-manrope text-[15px] font-medium text-fp-accent"
                >
                  <Mail className="h-4 w-4" />
                  hello@manavsingh.in
                </a>
                <a
                  href="https://dev.manavsingh.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-manrope text-[15px] font-medium text-fp-accent"
                >
                  <Globe className="h-4 w-4" />
                  dev.manavsingh.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
