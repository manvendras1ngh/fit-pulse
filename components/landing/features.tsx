import { Dumbbell, BarChart3, CalendarDays } from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Smart Tracking",
    description:
      "Log sets, reps, and weight in seconds. Number pad inputs and auto-save make it effortless.",
  },
  {
    icon: CalendarDays,
    title: "Auto Scheduling",
    description:
      "Create weekly splits. Your dashboard shows today's workout and pre-loads exercises automatically.",
  },
  {
    icon: BarChart3,
    title: "Lift Analytics",
    description:
      "Track volume trends and estimated 1RM over time. See your progress with beautiful charts.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-space-grotesk text-3xl font-bold text-fp-text-primary md:text-4xl">
          Everything you need.
          <br />
          <span className="text-fp-text-secondary">Nothing you don&apos;t.</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-fp-border bg-fp-bg-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-fp-bg-elevated">
                <f.icon className="h-6 w-6 text-fp-accent" />
              </div>
              <h3 className="mb-2 font-space-grotesk text-lg font-bold text-fp-text-primary">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-fp-text-secondary">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
