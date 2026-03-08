"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Dumbbell, ClipboardList, TrendingUp, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/workout", label: "Workout", icon: Dumbbell },
  { href: "/dashboard/plan", label: "Plan", icon: ClipboardList },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-fp-border bg-fp-bg-page p-4 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Activity className="h-6 w-6 text-fp-accent" />
        <span className="font-space-grotesk text-lg font-bold text-fp-text-primary">
          FitPulse
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-fp-bg-elevated text-fp-accent"
                  : "text-fp-text-secondary hover:bg-fp-bg-elevated hover:text-fp-text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
