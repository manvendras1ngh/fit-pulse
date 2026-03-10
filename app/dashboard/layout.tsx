import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavSidebar } from "@/components/layout/nav-sidebar";
import { UnitProvider } from "@/lib/contexts/unit-context";
import type { UnitPreference } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // User ID passed from middleware via request header — no auth call needed
  const headerStore = await headers();
  const userId = headerStore.get("x-user-id");

  if (!userId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_unit")
    .eq("id", userId)
    .single();

  const preferredUnit: UnitPreference = profile?.preferred_unit ?? "kg";

  return (
    <UnitProvider unit={preferredUnit}>
      <div className="flex min-h-screen bg-fp-bg-page">
        <NavSidebar />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <MobileNav />
      </div>
    </UnitProvider>
  );
}
