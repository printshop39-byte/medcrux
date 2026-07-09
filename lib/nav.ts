export interface NavItem {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean; // show in bottom nav on mobile
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", mobile: true },
  { href: "/study-plan", label: "Study Plan", icon: "🗓️", mobile: true },
  { href: "/topics", label: "Topics", icon: "📚", mobile: true },
  { href: "/search", label: "Search", icon: "🔎" },
  { href: "/revision", label: "Revision", icon: "⏱️" },
  { href: "/flashcards", label: "Flashcards", icon: "🃏", mobile: true },
  { href: "/exam", label: "Exam", icon: "📝", mobile: true },
  { href: "/ai-tutor", label: "AI Tutor", icon: "🤖", mobile: true },
  { href: "/bookmarks", label: "Bookmarks", icon: "🔖" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];
