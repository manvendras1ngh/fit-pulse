"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-fp-border/50 bg-fp-bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 py-3">
          <Activity className="h-6 w-6 text-fp-accent" />
          <span className="font-space-grotesk text-[22px] font-bold text-fp-text-primary">
            FitPulse
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="py-3 font-manrope text-[15px] font-medium text-fp-text-secondary transition-colors hover:text-fp-text-primary"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="py-3 font-manrope text-[15px] font-medium text-fp-text-secondary transition-colors hover:text-fp-text-primary"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="py-3 font-manrope text-[15px] font-medium text-fp-text-secondary transition-colors hover:text-fp-text-primary"
          >
            Testimonials
          </a>
          <Link
            href="/login"
            className="rounded-full bg-fp-accent px-5 py-2.5 font-manrope text-sm font-semibold text-fp-text-on-accent transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-fp-text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] border-fp-border bg-fp-bg-page"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="mt-8 flex flex-col gap-2">
              <a
                href="#features"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-[15px] font-medium text-fp-text-secondary transition-colors hover:bg-fp-bg-card hover:text-fp-text-primary"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-[15px] font-medium text-fp-text-secondary transition-colors hover:bg-fp-bg-card hover:text-fp-text-primary"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-[15px] font-medium text-fp-text-secondary transition-colors hover:bg-fp-bg-card hover:text-fp-text-primary"
              >
                Testimonials
              </a>
              <div className="mt-4 px-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-fp-accent font-manrope text-sm font-semibold text-fp-text-on-accent"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
