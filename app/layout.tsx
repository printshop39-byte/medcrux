import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeInit } from "@/components/ThemeInit";

// Runs before paint to set the theme class (no flash of the wrong theme).
const themeScript = `(function(){try{var t=localStorage.getItem('pharmaos.theme');t=t?JSON.parse(t):'system';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.setAttribute('data-theme',d?'dark':'light');}catch(x){}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeInit />
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
