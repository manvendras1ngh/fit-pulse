import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SocialProof } from "@/components/landing/social-proof";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (hasSession) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-fp-bg-page">
      <LandingHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
