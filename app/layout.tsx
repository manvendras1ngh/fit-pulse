import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const BASE_URL = "https://fit-pulse-six.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FitPulse - Free Workout Tracker | Log Exercises, Track Progress",
    template: "%s | FitPulse",
  },
  description:
    "FitPulse is a free workout tracker built by Manav Singh. Log exercises, plan splits, and track your gym progress — no ads, no distractions.",
  keywords: [
    "FitPulse",
    "workout tracker",
    "exercise tracker",
    "track exercises",
    "gym tracker",
    "workout log",
    "fitness app",
    "Manav Singh",
    "Manvendra Singh",
  ],
  authors: [{ name: "Manav Singh", url: "https://dev.manavsingh.in" }],
  creator: "Manav Singh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "FitPulse",
    title: "FitPulse — Free Workout Tracker | Log Exercises, Track Progress",
    description:
      "FitPulse is a free workout tracker built by Manav Singh. Log exercises, plan splits, and track your gym progress — no ads, no distractions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitPulse — Free Workout Tracker | Log Exercises, Track Progress",
    description:
      "FitPulse is a free workout tracker built by Manav Singh. Log exercises, plan splits, and track your gym progress — no ads, no distractions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "GPe8_hhik0C-6k6JLP9wuy-c1FfuipjMN7BUbKUayJE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{let z=Intl.DateTimeFormat().resolvedOptions().timeZone;if(z&&!document.cookie.includes("tz="))document.cookie="tz="+z+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${spaceMono.variable} font-manrope antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--fp-bg-card)",
              border: "1px solid var(--fp-border)",
              color: "var(--fp-text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
