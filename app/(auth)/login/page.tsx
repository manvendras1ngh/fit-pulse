"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();

  // Redirect authenticated users to dashboard (no middleware needed)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-fp-bg-page px-6">
      <Link
        href="/"
        className="absolute left-5 top-6 flex h-9 w-9 items-center justify-center rounded-xl border border-fp-border bg-fp-bg-card text-fp-text-secondary transition-colors hover:text-fp-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div className="flex flex-1 w-full max-w-[340px] flex-col items-center justify-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fp-border bg-fp-bg-card">
            <Activity className="h-8 w-8 text-fp-accent" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="font-space-grotesk text-[28px] font-bold text-fp-text-primary">
              FitPulse
            </h1>
            <p className="text-sm text-fp-text-tertiary">
              Log fast. Lift heavier.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            Authentication failed. Please try again.
          </div>
        )}

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleLogin}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-fp-border bg-fp-bg-card font-semibold text-fp-text-primary transition-colors hover:bg-fp-bg-elevated"
        >
          <span className="text-lg font-bold text-fp-accent">G</span>
          <span className="text-[15px]">Continue with Google</span>
        </button>
      </div>

      {/* Terms */}
      <p className="pb-10 pt-8 text-center text-xs text-fp-text-tertiary">
        By continuing, you agree to our{" "}
        <span className="text-fp-text-secondary">Terms of Service</span> &{" "}
        <span className="text-fp-text-secondary">Privacy Policy</span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-fp-bg-page" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
