import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "MedCrux — MBBS Exam Revision App",
  description: "Short notes, MCQs, viva, flashcards and study plans for MBBS students.",
  applicationName: "MedCrux",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MedCrux", statusBarStyle: "default" },
  // Explicit icon links so browsers use these instead of falling back to a
  // missing /favicon.ico. The crisp SVG is preferred; favicon.ico is the legacy
  // fallback (both live in /public).
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
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
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
