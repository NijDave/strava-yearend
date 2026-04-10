"use client";

import { useRef } from "react";
import { formatDistance, formatDuration } from "@/lib/utils";
import { CoreSummary as CoreSummaryType } from "@/lib/statistics";
import { useCountUp } from "@/hooks/useCountUp";

interface CoreSummaryProps {
  summary: CoreSummaryType;
}

interface StatCardProps {
  label: string;
  rawValue: number;
  formattedValue: string;
  suffix?: string;
  index: number;
  isNumeric?: boolean;
}

/** Extract leading number for count-up, fallback to 0 */
function extractNumber(value: string): number {
  const match = value.match(/^[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
}

function StatCard({ label, rawValue, formattedValue, suffix, index }: StatCardProps) {
  const { ref, displayValue } = useCountUp({
    target: rawValue,
    duration: 1400,
    delay: index * 80,
    triggerOnView: true,
  });

  return (
    <div
      className="reticle cyber-card scanlines p-4 sm:p-5 group transition-all duration-300"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Corner accents — additional inner corners */}
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-neon-orange/60" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-neon-orange/60" />

      <div className="relative z-10">
        <div className="hud-label mb-2">{label}</div>

        {/* Count-up number */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="font-bebas text-neon-orange leading-none group-hover:text-white transition-colors"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            textShadow: "0 0 20px rgba(255,85,0,0.6)",
          }}
        >
          {displayValue}{suffix}
        </div>
      </div>
    </div>
  );
}

export function CoreSummary({ summary }: CoreSummaryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const distanceKm = Math.round(summary.totalDistance / 1000);
  const totalHours = Math.round(summary.totalTime / 3600);
  const elevationM = Math.round(summary.totalElevation);

  const stats = [
    { label: "TOTAL ACTIVITIES", rawValue: summary.totalActivities, formattedValue: summary.totalActivities.toLocaleString() },
    { label: "DISTANCE (KM)", rawValue: distanceKm, formattedValue: `${distanceKm}km` },
    { label: "TOTAL HOURS", rawValue: totalHours, formattedValue: `${totalHours}h` },
    { label: "ELEVATION (M)", rawValue: elevationM, formattedValue: `${elevationM}m` },
    { label: "ACTIVE DAYS", rawValue: summary.activeDays, formattedValue: summary.activeDays.toString() },
    { label: "AVG PER WEEK", rawValue: Math.round(summary.averagePerWeek.activities * 10) / 10, formattedValue: `${summary.averagePerWeek.activities.toFixed(1)}` },
  ];

  return (
    <div ref={sectionRef} className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">YOUR YEAR IN NUMBERS</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      {/* Stat cards grid — hex pattern background */}
      <div
        className="hex-pattern p-4 sm:p-6"
        style={{ border: "1px solid rgba(255,85,0,0.15)" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              rawValue={stat.rawValue}
              formattedValue={stat.formattedValue}
              index={index}
              isNumeric
            />
          ))}
        </div>

        {/* Secondary metrics row */}
        <div className="mt-4 pt-4 border-t border-neon-orange/15 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex justify-between items-center font-mono text-sm">
            <span className="text-white/40 text-xs uppercase tracking-wider">Avg Distance/Week</span>
            <span className="text-neon-orange font-bold">{formatDistance(summary.averagePerWeek.distance)}</span>
          </div>
          <div className="flex justify-between items-center font-mono text-sm">
            <span className="text-white/40 text-xs uppercase tracking-wider">Avg Time/Week</span>
            <span className="text-neon-orange font-bold">{formatDuration(summary.averagePerWeek.time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
