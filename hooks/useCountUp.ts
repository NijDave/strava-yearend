"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Target number to count up to */
  target: number;
  /** Duration of animation in ms */
  duration?: number;
  /** Delay before starting (ms) */
  delay?: number;
  /** Start counting only when element is in viewport */
  triggerOnView?: boolean;
  /** Number of decimal places */
  decimals?: number;
}

/**
 * useCountUp — animates a number from 0 to target value.
 * Supports IntersectionObserver-based triggering so the animation
 * fires when the element scrolls into view (great for stat cards).
 *
 * Usage:
 *   const { ref, displayValue, hasStarted } = useCountUp({ target: 730, duration: 1200 });
 *   return <span ref={ref}>{displayValue}</span>
 */
export function useCountUp({
  target,
  duration = 1200,
  delay = 0,
  triggerOnView = true,
  decimals = 0,
}: UseCountUpOptions) {
  const ref = useRef<HTMLElement | null>(null);
  const [displayValue, setDisplayValue] = useState("0");
  const [hasStarted, setHasStarted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const startAnimation = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setHasStarted(true);

    const startTime = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime - delay;
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;

      setDisplayValue(
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString()
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(
          decimals > 0
            ? target.toFixed(decimals)
            : target.toLocaleString()
        );
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!triggerOnView) {
      startAnimation();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target]);

  return { ref, displayValue, hasStarted };
}
