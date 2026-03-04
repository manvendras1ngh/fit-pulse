import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-fp-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-fp-accent" />
          <span className="font-space-grotesk text-lg font-bold text-fp-text-primary">
            FitPulse
          </span>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-fp-text-primary">Product</p>
            <a href="/#features" className="py-1 text-fp-text-secondary hover:text-fp-text-primary">
              Features
            </a>
            <a href="/#how-it-works" className="py-1 text-fp-text-secondary hover:text-fp-text-primary">
              How It Works
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-fp-text-primary">Company</p>
            <Link href="/about" className="py-1 text-fp-text-secondary hover:text-fp-text-primary">About</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-fp-text-primary">Legal</p>
            <Link href="/privacy" className="py-1 text-fp-text-secondary hover:text-fp-text-primary">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-fp-border pt-6">
        <p className="text-xs text-fp-text-tertiary">
          &copy; {new Date().getFullYear()} FitPulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
