"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistance } from "@/lib/utils";
import { ActivityTypeBreakdown as ActivityTypeBreakdownType } from "@/lib/statistics";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ActivityTypeBreakdownProps {
  breakdown: ActivityTypeBreakdownType[];
}

const NEON_COLORS = [
  { stroke: "#FF5500", glow: "rgba(255,85,0,0.7)",   label: "#FF5500" },
  { stroke: "#E91E8C", glow: "rgba(233,30,140,0.7)", label: "#E91E8C" },
  { stroke: "#8B2FC9", glow: "rgba(139,47,201,0.7)", label: "#8B2FC9" },
  { stroke: "#00F5FF", glow: "rgba(0,245,255,0.7)",  label: "#00F5FF" },
  { stroke: "#AAFF00", glow: "rgba(170,255,0,0.7)",  label: "#AAFF00" },
  { stroke: "#FF00AA", glow: "rgba(255,0,170,0.7)",  label: "#FF00AA" },
  { stroke: "#FFD700", glow: "rgba(255,215,0,0.7)",  label: "#FFD700" },
];

interface DonutProps {
  breakdown: ActivityTypeBreakdownType[];
  isMobile: boolean;
}

function NeonDonut({ breakdown, isMobile }: DonutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tappedIdx, setTappedIdx] = useState<number | null>(null);

  const size = isMobile ? 220 : 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size / 2) - 16;
  const innerR = outerR * 0.55;
  const strokeW = 28;

  const total = breakdown.reduce((s, b) => s + b.count, 0);
  let cumulativeAngle = -90; // Start from top

  const segments = breakdown.map((item, index) => {
    const percentage = item.count / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(toRad(startAngle));
    const y1 = cy + outerR * Math.sin(toRad(startAngle));
    const x2 = cx + outerR * Math.cos(toRad(endAngle));
    const y2 = cy + outerR * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    const color = NEON_COLORS[index % NEON_COLORS.length];

    return { item, startAngle, endAngle, percentage, x1, y1, x2, y2, largeArc, color, index };
  });

  const dominantType = breakdown[0]?.type || "";
  const dominantIcon = breakdown[0]?.icon || "🏃";

  const isActive = (idx: number) => hoveredIdx === idx || tappedIdx === idx;

  const handleTap = (idx: number) => {
    setTappedIdx(tappedIdx === idx ? null : idx);
  };

  // Build arc path
  const arcPath = (seg: typeof segments[0], expand = 0) => {
    const R = outerR + expand;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + R * Math.cos(toRad(seg.startAngle));
    const y1 = cy + R * Math.sin(toRad(seg.startAngle));
    const x2 = cx + R * Math.cos(toRad(seg.endAngle));
    const y2 = cy + R * Math.sin(toRad(seg.endAngle));
    const iR = (innerR - expand * 0.3);
    const ix1 = cx + iR * Math.cos(toRad(seg.endAngle));
    const iy1 = cy + iR * Math.sin(toRad(seg.endAngle));
    const ix2 = cx + iR * Math.cos(toRad(seg.startAngle));
    const iy2 = cy + iR * Math.sin(toRad(seg.startAngle));
    const lArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${lArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${iR} ${iR} 0 ${lArc} 0 ${ix2} ${iy2} Z`;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: `${size}px`, overflow: "visible" }}
      aria-label="Activity type breakdown donut chart"
      role="img"
    >
      <defs>
        {segments.map((seg, i) => (
          <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={seg.color.stroke} floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
        <filter id="center-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Segments */}
      {segments.map((seg) => {
        const active = isActive(seg.index);
        return (
          <path
            key={seg.index}
            d={arcPath(seg, active ? 8 : 0)}
            fill={seg.color.stroke}
            opacity={hoveredIdx !== null && !active ? 0.3 : 0.9}
            filter={active ? `url(#glow-${seg.index})` : undefined}
            style={{
              cursor: "pointer",
              transition: "opacity 0.2s, filter 0.2s",
              animation: active ? "segmentPulse 1s ease-in-out infinite" : undefined,
            }}
            onMouseEnter={() => setHoveredIdx(seg.index)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => handleTap(seg.index)}
          />
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={innerR - 6} fill="#000" />
      <circle cx={cx} cy={cy} r={innerR - 6} fill="none" stroke="rgba(255,85,0,0.3)" strokeWidth="1" />

      {/* Center text */}
      {hoveredIdx !== null || tappedIdx !== null ? (
        <>
          {/* Show hovered segment info */}
          {(() => {
            const idx = hoveredIdx ?? tappedIdx ?? 0;
            const seg = segments[idx];
            return (
              <>
                <text x={cx} y={cy - 10} textAnchor="middle" fill={seg.color.stroke}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 16 : 22 }}>
                  {seg.item.icon} {seg.item.type}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="#fff"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 30 }}>
                  {seg.item.percentage.toFixed(1)}%
                </text>
                <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(255,255,255,0.5)"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
                  {seg.item.count} activities
                </text>
              </>
            );
          })()}
        </>
      ) : (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fill: "rgba(255,255,255,0.5)" }}>
            TOP SPORT
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fill="#FF5500"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isMobile ? 20 : 26,
              filter: "drop-shadow(0 0 8px rgba(255,85,0,0.8))",
            }}>
            {dominantIcon} {dominantType}
          </text>
        </>
      )}
    </svg>
  );
}

/** Animated progress bar legend item */
function LegendItem({
  item,
  color,
  index,
}: {
  item: ActivityTypeBreakdownType;
  color: (typeof NEON_COLORS)[0];
  index: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={barRef} className="space-y-1.5" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke, boxShadow: `0 0 6px ${color.glow}` }} />
          <span className="font-mono text-xs text-white/70">{item.icon} {item.type}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span style={{ color: color.stroke }}>{item.count}×</span>
          <span className="text-white/40">{item.percentage.toFixed(1)}%</span>
        </div>
      </div>
      {/* Animated progress bar */}
      <div className="h-1.5 bg-black/60" style={{ border: `1px solid ${color.stroke}30` }}>
        <div
          className="h-full"
          style={{
            backgroundColor: color.stroke,
            boxShadow: `0 0 6px ${color.glow}`,
            width: animate ? `${item.percentage}%` : "0%",
            transition: `width 1s cubic-bezier(0.34, 1.1, 0.64, 1) ${index * 100}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function ActivityTypeBreakdown({ breakdown }: ActivityTypeBreakdownProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">ACTIVITY BREAKDOWN</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      <div className="cyber-card p-4 sm:p-6">
        {/* Mobile: stack donut above legend. Desktop: side by side */}
        <div className={`gap-6 sm:gap-8 ${isMobile ? "flex flex-col items-center" : "grid md:grid-cols-2 items-center"}`}>
          {/* Neon donut */}
          <div className={`${isMobile ? "w-full max-w-[240px]" : ""} flex justify-center`}>
            <NeonDonut breakdown={breakdown} isMobile={isMobile} />
          </div>

          {/* HUD legend */}
          <div className="w-full space-y-3">
            <div className="hud-label mb-4">// MISSION BREAKDOWN</div>
            {breakdown.map((item, index) => (
              <LegendItem
                key={item.type}
                item={item}
                color={NEON_COLORS[index % NEON_COLORS.length]}
                index={index}
              />
            ))}

            {/* Total */}
            <div className="pt-3 mt-3 border-t border-neon-orange/20 flex justify-between">
              <span className="hud-label">TOTAL ACTIVITIES</span>
              <span className="font-bebas text-xl text-neon-orange">
                {breakdown.reduce((s, b) => s + b.count, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
