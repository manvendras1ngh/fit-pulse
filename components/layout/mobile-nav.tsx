"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, TrendingUp, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/workout", label: "Workout", icon: Dumbbell },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-fp-border bg-fp-bg-page px-6 md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive
                ? "font-semibold text-fp-accent"
                : "text-fp-text-tertiary"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
