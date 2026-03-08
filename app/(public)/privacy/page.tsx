import type { Metadata } from "next";
import { ShieldCheck, Mail } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

function Divider() {
  return <hr className="border-fp-border" />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-space-grotesk text-[22px] font-bold tracking-tight text-fp-text-primary md:text-[28px] md:tracking-[-0.3px]">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-manrope text-base leading-relaxed text-fp-text-secondary">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5 pl-6">
      {items.map((item) => (
        <p
          key={item}
          className="font-manrope text-base leading-relaxed text-fp-text-secondary"
        >
          &bull; {item}
        </p>
      ))}
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-space-grotesk text-base font-semibold text-fp-accent">
      {children}
    </p>
  );
}

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "FitPulse privacy policy — what data we collect, how we use it, and how to request deletion.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-fp-bg-page pt-16">
        <div className="flex flex-col gap-9 px-6 pb-16 pt-12 md:gap-12 md:px-[120px] md:pb-[100px] md:pt-20">
          {/* Title */}
          <div className="flex flex-col gap-4">
            <div className="flex w-fit items-center gap-1.5 rounded-full border border-fp-border px-4 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-fp-accent" />
              <span className="font-space-mono text-[11px] font-medium tracking-[2px] text-fp-accent">
                PRIVACY POLICY
              </span>
            </div>
            <h1 className="font-space-grotesk text-[32px] font-extrabold leading-[1.1] tracking-tight text-fp-text-primary md:text-5xl md:tracking-[-0.5px]">
              FitPulse — Privacy Policy
            </h1>
            <p className="font-manrope text-base text-fp-text-tertiary">
              Last updated: March 2026
            </p>
          </div>

          {/* What We Collect */}
          <div className="flex flex-col gap-5">
            <SectionTitle>What We Collect</SectionTitle>
            <Body>
              When you sign in with Google, we receive and store:
            </Body>
            <BulletList
              items={[
                "Your name",
                "Your email address",
                "Your profile picture",
              ]}
            />
            <Body>As you use the app, we store:</Body>
            <BulletList
              items={[
                "Workout logs (dates, exercises, sets, reps, weight)",
                "Workout plans you create",
                "Your preferred weight unit (kg or lbs)",
              ]}
            />
            <Highlight>That&apos;s it. Nothing more.</Highlight>
          </div>

          <Divider />

          {/* How We Use Your Data */}
          <div className="flex flex-col gap-5">
            <SectionTitle>How We Use Your Data</SectionTitle>
            <Body>
              Your data is used solely to power the app — showing your workouts,
              tracking your progress, and saving your plans. We do not use your
              data for advertising, profiling, or any purpose beyond making
              FitPulse work for you.
            </Body>
          </div>

          <Divider />

          {/* Third-Party Services */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Third-Party Services</SectionTitle>
            <div className="flex flex-col gap-4 pl-6">
              <p className="font-manrope text-base leading-relaxed text-fp-text-secondary">
                &bull; Google OAuth — Used only for sign-in. We do not access
                your Google contacts, calendar, or any other Google data.
              </p>
              <p className="font-manrope text-base leading-relaxed text-fp-text-secondary">
                &bull; Supabase — Our database and authentication provider. Your
                data is stored securely on Supabase&apos;s infrastructure with
                row-level security, meaning only you can access your own data.
              </p>
            </div>
            <p className="font-manrope text-base leading-relaxed text-fp-text-secondary">
              &bull; Vercel Analytics &amp; Speed Insights — Used for anonymous
              performance monitoring (page load times, web vitals). No personal
              data is collected, and no cookies are used by these services.
            </p>
            <Highlight>
              We do not use tracking pixels or advertising networks.
            </Highlight>
          </div>

          <Divider />

          {/* Data Security */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Data Security</SectionTitle>
            <Body>
              All data is transmitted over HTTPS. Database access is enforced
              through row-level security policies — each user can only read and
              modify their own data. System-provided exercises (like &ldquo;Bench
              Press&rdquo;) are shared and read-only.
            </Body>
          </div>

          <Divider />

          {/* Data Retention & Deletion */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Data Retention &amp; Deletion</SectionTitle>
            <Body>
              Your data is retained as long as your account exists. If you&apos;d
              like your data deleted, contact us at hello@manavsingh.in and
              we&apos;ll remove everything associated with your account.
            </Body>
          </div>

          <Divider />

          {/* Cookies */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Cookies</SectionTitle>
            <Body>
              We use cookies strictly for authentication session management. No
              tracking cookies, no third-party cookies.
            </Body>
          </div>

          <Divider />

          {/* Changes to This Policy */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Changes to This Policy</SectionTitle>
            <Body>
              If we make changes, we&apos;ll update the date at the top of this
              page. For significant changes, we&apos;ll notify you within the
              app.
            </Body>
          </div>

          <Divider />

          {/* Contact */}
          <div className="flex flex-col gap-5">
            <SectionTitle>Contact</SectionTitle>
            <Body>
              For any privacy-related questions or data deletion requests:
            </Body>
            <a
              href="mailto:hello@manavsingh.in"
              className="flex items-center gap-2 font-manrope text-base font-semibold text-fp-accent"
            >
              <Mail className="h-[18px] w-[18px]" />
              hello@manavsingh.in
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
