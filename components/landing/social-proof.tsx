const stats = [
  { value: "500K+", label: "Active Users" },
  { value: "10M+", label: "Sets Logged" },
  { value: "4.0", label: "App Rating" },
];

export function SocialProof() {
  return (
    <section className="border-y border-fp-border px-6 py-12">
      <div className="mx-auto flex max-w-4xl items-center justify-around">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8">
            {i > 0 && (
              <div className="h-8 w-px bg-fp-border md:h-12" />
            )}
            <div className="text-center">
              <p className="font-space-grotesk text-3xl font-bold text-fp-text-primary md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-fp-text-tertiary">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
