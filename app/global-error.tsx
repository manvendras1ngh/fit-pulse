"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A]">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-sm text-[#A1A1AA]">
          A critical error occurred.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-[#C4F82A] px-6 py-2.5 font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
