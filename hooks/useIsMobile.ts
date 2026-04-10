"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * useIsMobile — returns true when viewport width < 768px.
 * Includes a resize listener so it stays accurate on orientation change.
 *
 * Used by:
 * - ParticleCanvas  →  fewer particles on mobile
 * - BestPerformances → disable parallax tilt on touch devices
 * - ActivityTypeBreakdown → tap-to-activate vs hover on donut chart
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();

    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
