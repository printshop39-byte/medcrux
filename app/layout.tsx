import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "PharmaOS — MBBS Pharmacology Study App",
  description: "Exam-focused pharmacology revision app for MBBS students.",
  applicationName: "PharmaOS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PharmaOS", statusBarStyle: "default" },
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
