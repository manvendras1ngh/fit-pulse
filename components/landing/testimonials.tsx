const testimonials = [
  {
    name: "Sarah K.",
    role: "Powerlifter",
    text: "Finally an app that doesn't get in the way. I can log my entire workout in under a minute.",
  },
  {
    name: "Mike R.",
    role: "Gym Regular",
    text: "The progress charts are incredible. Watching my 1RM climb week by week keeps me motivated.",
  },
  {
    name: "Alex T.",
    role: "CrossFit Athlete",
    text: "Simple, fast, and actually useful. The plan feature saves me so much time at the gym.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-space-mono text-xs font-medium uppercase tracking-[2px] text-fp-accent">
          Loved by lifters
        </p>
        <h2 className="mt-4 text-center font-space-grotesk text-3xl font-bold text-fp-text-primary md:text-4xl">
          What our users say
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-fp-border bg-fp-bg-card p-6"
            >
              <p className="mb-4 text-sm leading-relaxed text-fp-text-secondary">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-fp-text-primary">
                  {t.name}
                </p>
                <p className="text-xs text-fp-text-tertiary">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
