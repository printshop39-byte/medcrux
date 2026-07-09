import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "MedCrux — MBBS Exam Revision App",
  description: "Short notes, MCQs, viva, flashcards and study plans for MBBS students.",
  applicationName: "MedCrux",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MedCrux", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#256a66",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
