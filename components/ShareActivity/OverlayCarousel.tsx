"use client";

import { useEffect, useRef, useState } from "react";
import { OverlayVariant } from "./OverlayCard";
import { generateOverlayCanvas } from "@/utils/canvasOverlay";

interface OverlayCarouselProps {
  activity: any;
  onVariantChange: (variant: OverlayVariant) => void;
}

const variants: OverlayVariant[] = ["transparent", "dark", "neon", "light", "stats-only"];

// ── Canvas preview for each slide ─────────────────────────────────────────
function CanvasPreview({ activity, variant }: { activity: any; variant: OverlayVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!canvasRef.current) return;
      const source = await generateOverlayCanvas(activity, variant);
      if (cancelled || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      canvasRef.current.width = 390;
      canvasRef.current.height = 640;
      ctx.clearRect(0, 0, 390, 640);
      ctx.drawImage(source, 0, 0, 390, 640);
    }
    render();
    return () => { cancelled = true; };
  }, [activity, variant]);

  return (
    <div className="relative w-full aspect-[390/640] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      {/* Checkered bg for transparent areas */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "#1a1a1a",
          backgroundImage: `
            linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
          `,
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      />
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />
      <div className="absolute inset-0 z-20 border border-white/10 pointer-events-none rounded-xl" />
    </div>
  );
}

// ── Main Carousel ──────────────────────────────────────────────────────────
export function OverlayCarousel({ activity, onVariantChange }: OverlayCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Notify parent on mount and on change
  useEffect(() => {
    onVariantChange(variants[index]);
  }, [index]);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(variants.length - 1, i));
    setIndex(clamped);
  };

  // Touch handlers for swipe detection
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 5) isDragging.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  // Mouse drag handlers for desktop
  const mouseStartX = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => { mouseStartX.current = e.clientX; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? index + 1 : index - 1);
    mouseStartX.current = null;
  };

  return (
    <div className="relative w-full flex flex-col items-center gap-4 select-none">
      {/* Slide window */}
      <div
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {/* Track — slides laid out in a row, shifted by transform */}
        <div
          className="flex transition-transform duration-350 ease-in-out will-change-transform"
          style={{ transform: `translateX(calc(-${index * 100}% - ${index * 24}px))` }}
        >
          {variants.map((v, i) => (
            <div
              key={v}
              className="flex-shrink-0 w-full px-8 transition-all duration-300"
              style={{ opacity: i === index ? 1 : 0.35, transform: i === index ? "scale(1)" : "scale(0.92)" }}
            >
              <CanvasPreview activity={activity} variant={v} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators — tappable */}
      <div className="flex items-center gap-2 pb-2">
        {variants.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "bg-orange-500 w-5 h-2"
                : "bg-white/25 w-2 h-2 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}: ${variants[i]}`}
          />
        ))}
      </div>

      {/* Prev / Next arrow buttons */}
      <div className="flex items-center gap-4 pb-2">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-90"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <span className="text-white/40 text-xs font-mono tabular-nums">
          {index + 1} / {variants.length}
        </span>
        <button
          onClick={() => goTo(index + 1)}
          disabled={index === variants.length - 1}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-90"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </div>
  );
}
