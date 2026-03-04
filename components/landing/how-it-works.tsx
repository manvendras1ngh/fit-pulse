const steps = [
  {
    number: "01",
    title: "Set your plan",
    description:
      "Create a weekly split in minutes. Assign exercises to each training day.",
  },
  {
    number: "02",
    title: "Track weights",
    description:
      "Log your sets during the workout. Number pad, auto-save, zero friction.",
  },
  {
    number: "03",
    title: "See progress",
    description:
      "Watch your volume and 1RM climb over time. Beautiful charts, real insights.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-fp-bg-card px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-space-grotesk text-3xl font-bold text-fp-text-primary md:text-4xl">
          Three steps to your
          <br />
          best shape yet.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <span className="font-space-mono text-[32px] font-bold text-fp-accent">
                {step.number}
              </span>
              <h3 className="font-space-grotesk text-xl font-bold text-fp-text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-fp-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
