import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-fp-bg-card px-6 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="font-space-grotesk text-4xl font-bold text-fp-text-primary md:text-[52px] md:leading-[1.05]">
          Ready to level up?
        </h2>
        <p className="mt-4 text-base text-fp-text-secondary">
          Join thousands of lifters tracking their way to PRs.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-full bg-fp-accent px-10 py-4 font-manrope text-[15px] font-bold text-fp-text-on-accent shadow-[0_0_24px_0_rgba(196,248,42,0.15)] transition-opacity hover:opacity-90"
        >
          Get Started — It&apos;s Free
        </Link>
      </div>
    </section>
  );
}
