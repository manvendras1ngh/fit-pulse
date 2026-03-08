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
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FitPulse — Log fast. Lift heavier.",
  description:
    "Track your gym workouts, plan your splits, and watch your progress over time.",
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
              background: "#18181B",
              border: "1px solid #27272A",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  );
}
