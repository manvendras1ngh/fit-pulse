"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fp-bg-page">
      <h2 className="font-space-grotesk text-2xl font-bold text-fp-text-primary">
        Something went wrong
      </h2>
      <p className="text-sm text-fp-text-secondary">
        An unexpected error occurred.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-fp-accent px-6 py-2.5 font-semibold text-fp-text-on-accent transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
