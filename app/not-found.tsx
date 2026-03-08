import Link from "next/link";
import { Activity } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fp-bg-page px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Activity className="h-12 w-12 text-fp-accent" />
        <div className="flex flex-col gap-2">
          <h1 className="font-space-grotesk text-[48px] font-extrabold leading-none tracking-tight text-fp-text-primary">
            404
          </h1>
          <p className="font-manrope text-base text-fp-text-secondary">
            This page doesn&apos;t exist
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg bg-fp-accent px-6 py-2.5 font-manrope text-sm font-semibold text-fp-bg-page transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
