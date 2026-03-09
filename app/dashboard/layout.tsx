import { redirect } from "next/navigation";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_unit, name")
    .eq("id", user.id)
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
