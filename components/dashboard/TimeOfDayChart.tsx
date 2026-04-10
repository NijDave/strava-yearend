"use client";

import { useEffect, useRef, useState } from "react";
import { TimeOfDayStats } from "@/lib/statistics";
import { useIsMobile } from "@/hooks/useIsMobile";

interface TimeOfDayChartProps {
  stats: TimeOfDayStats;
}

const TOD_SEGMENTS = [
  { key: "morning" as const,   label: "MORNING",   range: "05:00 – 12:00", color: "#FF5500", glow: "rgba(255,85,0,0.8)" },
  { key: "afternoon" as const, label: "AFTERNOON", range: "12:00 – 17:00", color: "#FFD700", glow: "rgba(255,215,0,0.8)" },
  { key: "evening" as const,   label: "EVENING",   range: "17:00 – 21:00", color: "#E91E8C", glow: "rgba(233,30,140,0.8)" },
  { key: "night" as const,     label: "NIGHT",     range: "21:00 – 05:00", color: "#8B2FC9", glow: "rgba(139,47,201,0.8)" },
];

// Identical donut rendering to ActivityTypeBreakdown
function arcPath(
  cx: number, cy: number, outerR: number, innerR: number,
  startDeg: number, endDeg: number, expand = 0
): string {
  const R = outerR + expand;
  const iR = innerR - expand * 0.3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + R * Math.cos(toRad(startDeg));
  const y1 = cy + R * Math.sin(toRad(startDeg));
  const x2 = cx + R * Math.cos(toRad(endDeg));
  const y2 = cy + R * Math.sin(toRad(endDeg));
  const ix1 = cx + iR * Math.cos(toRad(endDeg));
  const iy1 = cy + iR * Math.sin(toRad(endDeg));
  const ix2 = cx + iR * Math.cos(toRad(startDeg));
  const iy2 = cy + iR * Math.sin(toRad(startDeg));
  const lArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${lArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${iR} ${iR} 0 ${lArc} 0 ${ix2} ${iy2} Z`;
}

interface AnimatedBarProps {
  color: string;
  glow: string;
  pct: number;
  label: string;
  range: string;
  count: number;
  isDominant: boolean;
  index: number;
}

function AnimatedBar({ color, glow, pct, label, range, count, isDominant, index }: AnimatedBarProps) {
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
    <div ref={barRef} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${glow}` }} />
          <span className="font-mono text-xs text-white/70">{label}</span>
          <span className="font-mono text-[10px] text-white/30">{range}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span style={{ color, fontWeight: isDominant ? "bold" : "normal" }}>{count} acts</span>
          <span className="text-white/40">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-black/60" style={{ border: `1px solid ${color}30` }}>
        <div
          className="h-full"
          style={{
            width: animate ? `${pct}%` : "0%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${glow}`,
            transition: `width 1s cubic-bezier(0.34, 1.1, 0.64, 1) ${index * 100}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function TimeOfDayChart({ stats }: TimeOfDayChartProps) {
  const isMobile = useIsMobile();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tappedIdx, setTappedIdx] = useState<number | null>(null);

  const values = {
    morning: stats.morning || 0,
    afternoon: stats.afternoon || 0,
    evening: stats.evening || 0,
    night: stats.night || 0,
  };
  const total = Object.values(values).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const size = isMobile ? 220 : 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 16;
  const innerR = outerR * 0.55;

  // Build segments from -90° (top) clockwise
  let cumulative = -90;
  const segments = TOD_SEGMENTS.map((slot, index) => {
    const count = values[slot.key];
    const pct = count / total;
    const angle = pct * 360;
    const startDeg = cumulative;
    const endDeg = cumulative + angle;
    cumulative = endDeg;
    return { ...slot, count, pct, startDeg, endDeg, index };
  }).filter(s => s.count > 0);

  const dominantSegment = segments.reduce((a, b) => (b.count > a.count ? b : a), segments[0]);
  const isActive = (idx: number) => hoveredIdx === idx || tappedIdx === idx;

  const handleTap = (idx: number) => {
    if (!isMobile) return;
    setTappedIdx(tappedIdx === idx ? null : idx);
  };

  const activeIdx = hoveredIdx ?? tappedIdx;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">TIME OF DAY ANALYSIS</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      <div className="cyber-card p-4 sm:p-6">
        <div className={`gap-6 sm:gap-8 ${isMobile ? "flex flex-col items-center" : "grid md:grid-cols-2 items-center"}`}>

          {/* Neon donut — identical pattern to ActivityTypeBreakdown */}
          <div className={`${isMobile ? "w-full max-w-[240px]" : ""} flex justify-center`}>
            <svg
              viewBox={`0 0 ${size} ${size}`}
              width="100%"
              style={{ maxWidth: `${size}px`, overflow: "visible" }}
              role="img"
              aria-label="Time of day workout distribution donut chart"
            >
              <defs>
                {segments.map((seg) => (
                  <filter key={seg.key} id={`tod-glow-${seg.key}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feFlood floodColor={seg.color} floodOpacity="0.8" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
              </defs>

              {segments.map((seg) => {
                const active = isActive(seg.index);
                return (
                  <path
                    key={seg.key}
                    d={arcPath(cx, cy, outerR, innerR, seg.startDeg, seg.endDeg, active ? 8 : 0)}
                    fill={seg.color}
                    opacity={hoveredIdx !== null && !active ? 0.3 : 0.9}
                    filter={active ? `url(#tod-glow-${seg.key})` : undefined}
                    style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    onMouseEnter={() => !isMobile && setHoveredIdx(seg.index)}
                    onMouseLeave={() => !isMobile && setHoveredIdx(null)}
                    onClick={() => handleTap(seg.index)}
                  />
                );
              })}

              {/* Center hole */}
              <circle cx={cx} cy={cy} r={innerR - 6} fill="#000" />
              <circle cx={cx} cy={cy} r={innerR - 6} fill="none" stroke="rgba(255,85,0,0.3)" strokeWidth="1" />

              {/* Center text */}
              {activeIdx !== null && segments[activeIdx] ? (
                <>
                  <text x={cx} y={cy - 10} textAnchor="middle" fill={segments[activeIdx].color}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 14 : 18 }}>
                    {segments[activeIdx].label}
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" fill="#fff"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 30 }}>
                    {segments[activeIdx].pct.toFixed(1)}%
                  </text>
                  <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(255,255,255,0.5)"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
                    {segments[activeIdx].count} activities
                  </text>
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 8} textAnchor="middle"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fill: "rgba(255,255,255,0.4)" }}>
                    PEAK TIME
                  </text>
                  <text x={cx} y={cy + 16} textAnchor="middle" fill={dominantSegment.color}
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: isMobile ? 18 : 24,
                      filter: `drop-shadow(0 0 8px ${dominantSegment.glow})`,
                    }}>
                    {dominantSegment.label}
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* HUD legend — same animated progress bar pattern */}
          <div className="w-full space-y-3">
            <div className="hud-label mb-4">// WORKOUT SCHEDULE</div>
            {segments.map((seg, i) => (
              <AnimatedBar
                key={seg.key}
                color={seg.color}
                glow={seg.glow}
                pct={seg.pct * 100}
                label={seg.label}
                range={seg.range}
                count={seg.count}
                isDominant={seg.key === dominantSegment.key}
                index={i}
              />
            ))}

            <div className="pt-3 mt-3 border-t border-neon-orange/20 flex justify-between">
              <span className="hud-label">TOTAL ACTIVITIES</span>
              <span className="font-bebas text-xl text-neon-orange">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
