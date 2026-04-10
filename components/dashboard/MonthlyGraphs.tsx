"use client";

import { useEffect, useRef, useState } from "react";
import { MonthlyStats } from "@/lib/statistics";
import { useIsMobile } from "@/hooks/useIsMobile";

interface MonthlyGraphsProps {
  monthlyStats: MonthlyStats[];
}

// ── NEON BAR CHART ──
interface BarChartProps {
  data: { month: string; value: number }[];
  color: string;
  isMobile: boolean;
  animate: boolean;
}

function NeonBarChart({ data, color, isMobile, animate }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const BAR_W = isMobile ? 16 : 22;
  const GAP = isMobile ? 6 : 10;
  const CHART_H = isMobile ? 120 : 160;
  const SIDE_W = isMobile ? 0 : 6;
  const TOP_H = isMobile ? 0 : 5;
  const totalW = data.length * (BAR_W + GAP) - GAP;
  const svgW = totalW + 32;
  const [tooltip, setTooltip] = useState<{ x: number; val: number; month: string } | null>(null);

  return (
    <div className="relative" role="img" aria-label="Activities per month bar chart">
      <svg viewBox={`0 0 ${svgW} ${CHART_H + 30}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
        <defs>
          <filter id="bar-glow-ff5500">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.6" result="c" />
            <feComposite in="c" in2="blur" operator="in" result="s" />
            <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* LED dot grid */}
        {Array.from({ length: isMobile ? 5 : 8 }).map((_, row) =>
          Array.from({ length: data.length }).map((_, col) => (
            <circle key={`${row}-${col}`}
              cx={16 + col * (BAR_W + GAP) + BAR_W / 2}
              cy={10 + (row / (isMobile ? 4 : 7)) * CHART_H}
              r="1" fill={color} opacity="0.12" />
          ))
        )}

        {data.map((d, i) => {
          const barH = Math.max(((d.value / maxVal) * CHART_H) - TOP_H, 4);
          const x = 16 + i * (BAR_W + GAP);
          const y = CHART_H - barH;
          return (
            <g key={i}>
              <rect x={x} y={animate ? (isMobile ? y : y + TOP_H) : CHART_H}
                width={isMobile ? BAR_W : BAR_W - SIDE_W}
                height={animate ? barH : 0} fill={color} opacity={0.85}
                filter="url(#bar-glow-ff5500)" rx={isMobile ? 1 : 0}
                style={{ transition: animate ? `y 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms, height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms` : undefined, cursor: "pointer" }}
                onMouseEnter={() => setTooltip({ x: x + BAR_W / 2, val: d.value, month: d.month })}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => setTooltip(tooltip?.month === d.month ? null : { x: x + BAR_W / 2, val: d.value, month: d.month })}
              />
              {!isMobile && animate && (
                <>
                  <polygon points={`${x},${y + TOP_H} ${x + SIDE_W},${y} ${x + BAR_W},${y} ${x + BAR_W - SIDE_W},${y + TOP_H}`} fill={`${color}dd`} opacity={0.9} />
                  <polygon points={`${x + BAR_W - SIDE_W},${y + TOP_H} ${x + BAR_W},${y} ${x + BAR_W},${CHART_H} ${x + BAR_W - SIDE_W},${CHART_H}`} fill={color} opacity={0.45} />
                </>
              )}
              <text x={x + BAR_W / 2} y={CHART_H + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? 7 : 9 }}>
                {d.month.slice(0, 3)}
              </text>
            </g>
          );
        })}

        {tooltip && (
          <g>
            <rect x={Math.min(tooltip.x - 24, svgW - 56)} y={20} width={52} height={28}
              fill="#000" stroke={color} strokeWidth="1" />
            <text x={Math.min(tooltip.x - 24, svgW - 56) + 26} y={32}
              textAnchor="middle" fill={color} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: "bold" }}>
              {tooltip.month.slice(0, 3)}
            </text>
            <text x={Math.min(tooltip.x - 24, svgW - 56) + 26} y={44}
              textAnchor="middle" fill="#fff" style={{ fontFamily: "'Space Mono', monospace", fontSize: 9 }}>
              {tooltip.val}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ── NEON LINE CHART WITH CROSSHAIR — used for both Distance and Time ──
interface CrosshairLineChartProps {
  data: { month: string; value: number; unit: string }[];
  animate: boolean;
  isMobile: boolean;
  color?: string;
}

function CrosshairLineChart({ data, animate, isMobile, color = "#FF5500" }: CrosshairLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const CHART_H = isMobile ? 130 : 170;
  const PT_GAP = isMobile ? 22 : 34;
  const PAD = 16;
  const svgW = data.length * PT_GAP + PAD * 2;
  const [crosshair, setCrosshair] = useState<{
    x: number; y: number; val: number; month: string; unit: string;
  } | null>(null);

  const points = data.map((d, i) => ({
    x: PAD + i * PT_GAP,
    y: CHART_H - (d.value / maxVal) * CHART_H * 0.9 - 8,
    val: d.value,
    month: d.month,
    unit: d.unit,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M ${points[0]?.x},${CHART_H} ` +
    points.map(p => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1]?.x},${CHART_H} Z`;

  const updateCrosshair = (clientX: number) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const scaleX = svgW / rect.width;
    const svgX = (clientX - rect.left) * scaleX;
    let nearest = points[0];
    let minDist = Infinity;
    points.forEach(p => { const d = Math.abs(p.x - svgX); if (d < minDist) { minDist = d; nearest = p; } });
    setCrosshair({ x: nearest.x, y: nearest.y, val: nearest.val, month: nearest.month, unit: nearest.unit });
  };

  const tooltipX = crosshair ? Math.max(4, Math.min(crosshair.x - 29, svgW - 66)) : 0;
  const tooltipY = crosshair ? Math.max(4, crosshair.y - 44) : 0;

  const filterId = `glow-${color.replace("#", "")}`;
  const gradId = `area-grad-${color.replace("#", "")}`;

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${CHART_H + 30}`} width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible", cursor: "crosshair" }}
        onMouseMove={e => !isMobile && updateCrosshair(e.clientX)}
        onMouseLeave={() => setCrosshair(null)}
        onTouchMove={e => { e.preventDefault(); if (e.touches[0]) updateCrosshair(e.touches[0].clientX); }}
        onTouchEnd={() => setCrosshair(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {animate && <path d={areaPath} fill={`url(#${gradId})`} />}
        {animate && (
          <polyline points={polyline} fill="none" stroke={color}
            strokeWidth={isMobile ? 2 : 3} strokeLinejoin="round" strokeLinecap="round"
            filter={`url(#${filterId})`} />
        )}
        {animate && points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
            <circle cx={p.x} cy={p.y} r="3" fill={color}
              style={{ filter: `drop-shadow(0 0 4px ${color}cc)`, cursor: "pointer" }} />
          </g>
        ))}

        {points.map((p, i) => (
          <text key={i} x={p.x} y={CHART_H + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? 7 : 9 }}>
            {p.month.slice(0, 3)}
          </text>
        ))}

        {crosshair && animate && (
          <>
            <line x1={crosshair.x} y1={0} x2={crosshair.x} y2={CHART_H}
              stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={crosshair.x} cy={crosshair.y} r="8"
              fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <circle cx={crosshair.x} cy={crosshair.y} r="4" fill="white"
              style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}99)` }} />
            <g>
              <rect x={tooltipX} y={tooltipY} width={62} height={34}
                fill="rgba(0,0,0,0.88)" stroke={color} strokeWidth="1" />
              <text x={tooltipX + 31} y={tooltipY + 13} textAnchor="middle" fill={color}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: "bold" }}>
                {crosshair.month.slice(0, 3)}
              </text>
              <text x={tooltipX + 31} y={tooltipY + 27} textAnchor="middle" fill="#fff"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
                {crosshair.val}{crosshair.unit}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

export function MonthlyGraphs({ monthlyStats }: MonthlyGraphsProps) {
  const isMobile = useIsMobile();
  const [animate, setAnimate] = useState(false);
  const [lineTab, setLineTab] = useState<"distance" | "time">("distance");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const chartData = monthlyStats.map(stat => ({
    month: stat.monthName,
    activities: stat.activities,
    distanceKm: Math.round(stat.distance / 1000),
    hours: Math.round(stat.time / 3600),
  }));

  const lineData = lineTab === "distance"
    ? chartData.map(d => ({ month: d.month, value: d.distanceKm, unit: "km" }))
    : chartData.map(d => ({ month: d.month, value: d.hours, unit: "h" }));

  return (
    <div ref={sectionRef} className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">MONTHLY TRENDS</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      <div className="cyber-card p-4 sm:p-6 space-y-8">

        {/* Activities bar chart */}
        <div>
          <div className="hud-label mb-4">// ACTIVITIES PER MONTH</div>
          <NeonBarChart
            data={chartData.map(d => ({ month: d.month, value: d.activities }))}
            color="#FF5500" isMobile={isMobile} animate={animate} />
        </div>

        <div className="border-t border-neon-orange/15" />

        {/* Distance / Time — single tabbed line chart */}
        <div>
          {/* Tab toggle */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-0 bg-black/60 border border-neon-orange/20 p-0.5">
              {(["distance", "time"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setLineTab(tab)}
                  className="font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 transition-all"
                  style={{
                    background: lineTab === tab ? "#FF5500" : "transparent",
                    color: lineTab === tab ? "#000" : "rgba(255,255,255,0.4)",
                    fontWeight: lineTab === tab ? "bold" : "normal",
                  }}
                >
                  {tab === "distance" ? "DISTANCE (KM)" : "TIME (HRS)"}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              {isMobile ? "Tap to inspect" : "Hover to inspect"}
            </p>
          </div>

          <CrosshairLineChart
            data={lineData}
            animate={animate}
            isMobile={isMobile}
            color={lineTab === "distance" ? "#FF5500" : "#E91E8C"}
          />
        </div>
      </div>
    </div>
  );
}
