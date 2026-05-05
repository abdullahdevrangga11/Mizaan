"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll. Mounted once at the providers level so every route
 * inherits it without additional setup.
 *
 * Respects `prefers-reduced-motion: reduce` — disables Lenis entirely when
 * the user has motion preferences set.
 */
interface Props {
  children: ReactNode;
}

export function SmoothScroll({ children }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      // Defaults tuned for editorial pacing — fast enough to feel responsive,
      // soft enough to land cleanly. Ease curve mirrors paper.design's feel.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
