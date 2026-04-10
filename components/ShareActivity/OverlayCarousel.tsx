"use client";

import { useEffect, useRef, useState } from "react";
import { OverlayVariant } from "./OverlayCard";
import { generateOverlayCanvas } from "@/utils/canvasOverlay";

interface OverlayCarouselProps {
  activity: any;
  onVariantChange: (variant: OverlayVariant) => void;
}

const variants: OverlayVariant[] = ["transparent", "dark", "neon", "light"];

// ── Sub-component for individual canvas previews ──────────────────────────
function CanvasPreview({ activity, variant, isActive }: { activity: any; variant: OverlayVariant; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function renderPreview() {
      if (!canvasRef.current) return;
      
      const sourceCanvas = await generateOverlayCanvas(activity, variant);
      const previewCanvas = canvasRef.current;
      const ctx = previewCanvas.getContext("2d");
      if (!ctx) return;

      // Match dimensions
      previewCanvas.width = 390;
      previewCanvas.height = 580;
      
      // Clear and draw at scale
      ctx.clearRect(0, 0, 390, 580);
      ctx.drawImage(sourceCanvas, 0, 0, 390, 580);
    }
    renderPreview();
  }, [activity, variant]);

  return (
    <div 
      className={`relative w-full aspect-[390/580] transition-all duration-300 rounded-xl overflow-hidden ${isActive ? "scale-100 opacity-100 shadow-[0_20px_40px_rgba(0,0,0,0.5)]" : "scale-90 opacity-40"}`}
    >
      {/* Checkered background (visible on transparent areas) */}
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
      
      {/* Live Canvas */}
      <canvas 
        ref={canvasRef} 
        className="relative z-10 w-full h-full block"
      />

      {/* Border overlay */}
      <div className="absolute inset-0 z-20 border border-white/10 pointer-events-none rounded-xl" />
    </div>
  );
}

// ── Main Carousel ──────────────────────────────────────────────────────────
export function OverlayCarousel({ activity, onVariantChange }: OverlayCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Notify parent of initial variant
    onVariantChange(variants[activeIndex]);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    // itemWidth = width of container * 0.8
    const itemWidth = scrollRef.current.offsetWidth * 0.8;
    const newIndex = Math.round(scrollLeft / itemWidth);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < variants.length) {
      setActiveIndex(newIndex);
      onVariantChange(variants[newIndex]);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Visible Carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-4 px-[10%]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {variants.map((v, i) => (
          <div 
            key={v} 
            className="flex-shrink-0 snap-center px-4 w-[85%] max-w-[280px]"
          >
            <CanvasPreview 
              activity={activity} 
              variant={v} 
              isActive={activeIndex === i} 
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2 pb-4">
        {variants.map((_, i) => (
          <div 
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? "bg-neon-orange w-4" : "bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
