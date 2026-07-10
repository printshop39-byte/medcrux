"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * App-wide smooth scrolling via Lenis. Renders nothing.
 * - Respects prefers-reduced-motion (keeps native scroll then).
 * - smoothWheel only: touch devices keep native scrolling so mobile stays crisp.
 * - Lenis 1.x drives native scroll (no transform), so the sticky header and the
 *   fixed bottom nav keep working.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // no smoothTouch — native mobile scroll feels better and avoids jank
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
