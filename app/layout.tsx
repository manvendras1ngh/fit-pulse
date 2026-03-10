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
    default: "FitPulse — Log fast. Lift heavier.",
    template: "%s | FitPulse",
  },
  description:
    "Track your gym workouts, plan your splits, and watch your progress over time.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "FitPulse",
    title: "FitPulse — Log fast. Lift heavier.",
    description:
      "Track your gym workouts, plan your splits, and watch your progress over time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitPulse — Log fast. Lift heavier.",
    description:
      "Track your gym workouts, plan your splits, and watch your progress over time.",
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
