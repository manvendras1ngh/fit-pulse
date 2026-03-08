"use client";

import { AlertTriangle } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-fp-accent" />
      <h2 className="font-space-grotesk text-xl font-semibold text-fp-text-primary">
        Something went wrong
      </h2>
      <p className="max-w-sm text-sm text-fp-text-secondary">
        We couldn&apos;t load your profile. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-fp-accent px-5 py-2 text-sm font-medium text-fp-text-on-accent transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
