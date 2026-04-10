"use client";

import { useEffect, useRef, useState } from "react";
import { CoreSummary } from "./CoreSummary";
import { ActivityTypeBreakdown } from "./ActivityTypeBreakdown";
import { MonthlyGraphs } from "./MonthlyGraphs";
import { BestPerformances } from "./BestPerformances";
import { WeeklyInsights } from "./WeeklyInsights";
import { TimeOfDayChart } from "./TimeOfDayChart";
import { LocationInsights } from "./LocationInsights";
import { FunFacts } from "./FunFacts";

interface YearEndSummaryProps {
  year: number;
}

/** Diagonal slash divider between sections */
function SlashDivider() {
  return (
    <div className="relative h-10 my-2 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(90deg, #FF5500 0%, #E91E8C 50%, #8B2FC9 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 100%)",
        }}
      />
    </div>
  );
}

/** Glitch heading — animated section title */
function GlitchHeading({ year }: { year: number }) {
  return (
    <div className="text-center mb-10 relative py-4">
      {/* Background scan line effect */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute left-0 right-0 h-0.5 bg-neon-orange/60"
          style={{ animation: "scanSweep 3s linear infinite" }}
        />
      </div>

      <div className="hud-label mb-3 text-neon-orange/60">//  MISSION DEBRIEF  //</div>

      {/* Hero glitch heading */}
      <div className="relative inline-block">
        <h1
          className="font-bebas text-gradient-hero relative"
          style={{
            fontSize: "clamp(2.8rem, 12vw, 7rem)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            animation: "glitch 5s linear infinite",
          }}
        >
          {year} YEAR IN REVIEW
        </h1>
        {/* Glitch overlay layers */}
        <span
          className="font-bebas absolute inset-0 pointer-events-none"
          style={{
            fontSize: "clamp(2.8rem, 12vw, 7rem)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#E91E8C",
            opacity: 0,
            animation: "glitchLayer 5s linear infinite",
            animationDelay: "0.1s",
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        >
          {year} YEAR IN REVIEW
        </span>
        <span
          className="font-bebas absolute inset-0 pointer-events-none"
          style={{
            fontSize: "clamp(2.8rem, 12vw, 7rem)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#00F5FF",
            opacity: 0,
            animation: "glitchLayer 5s linear infinite",
            animationDelay: "0.2s",
            transform: "translate(-4px, 0)",
            mixBlendMode: "screen",
          }}
          aria-hidden="true"
        >
          {year} YEAR IN REVIEW
        </span>
      </div>

      <p className="font-mono text-xs text-white/40 tracking-widest uppercase mt-4">
        YOUR COMPLETE PERFORMANCE ANALYSIS
      </p>
    </div>
  );
}

/** Scroll-reveal wrapper using IntersectionObserver */
function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function YearEndSummary({ year }: YearEndSummaryProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [year]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/statistics?year=${year}`);
      if (!response.ok) throw new Error("Failed to fetch statistics");
      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-neon-orange/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-neon-orange rounded-full animate-spin" />
          <div className="absolute inset-4 border border-neon-magenta/40 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <div className="font-mono text-xs text-white/40 tracking-widest uppercase">
          ANALYZING {year} PERFORMANCE DATA...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-red-alert/50 bg-cyber-card p-6 text-center">
        <div className="font-bebas text-3xl text-red-alert mb-2">DATA CORRUPTED</div>
        <p className="font-mono text-sm text-white/60">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-16">
      {/* Glitch hero heading */}
      <GlitchHeading year={year} />

      {/* Core Stats */}
      <RevealSection delay={0}>
        <CoreSummary summary={data.coreSummary} />
      </RevealSection>

      <SlashDivider />

      {/* Fun Facts */}
      {data.funFacts && data.funFacts.length > 0 && (
        <RevealSection delay={100}>
          <FunFacts facts={data.funFacts} stats={data} />
        </RevealSection>
      )}

      <SlashDivider />

      {/* Activity Breakdown */}
      {data.activityBreakdown && data.activityBreakdown.length > 0 && (
        <RevealSection delay={100}>
          <ActivityTypeBreakdown breakdown={data.activityBreakdown} />
        </RevealSection>
      )}

      <SlashDivider />

      {/* Monthly Graphs */}
      {data.monthlyStats && data.monthlyStats.length > 0 && (
        <RevealSection delay={100}>
          <MonthlyGraphs monthlyStats={data.monthlyStats} />
        </RevealSection>
      )}

      <SlashDivider />

      {/* Best Performances */}
      <RevealSection delay={100}>
        <BestPerformances performances={data.bestPerformances} />
      </RevealSection>

      <SlashDivider />

      {/* Weekly Insights */}
      <RevealSection delay={100}>
        <WeeklyInsights insights={data.weeklyInsights} />
      </RevealSection>

      <SlashDivider />

      {/* Time of Day */}
      {data.timeOfDay && (
        <RevealSection delay={100}>
          <TimeOfDayChart stats={data.timeOfDay} />
        </RevealSection>
      )}

      {/* Location Insights */}
      {data.gpsActivities && data.gpsActivities.length > 0 && (
        <>
          <SlashDivider />
          <RevealSection delay={100}>
            <LocationInsights gpsActivities={data.gpsActivities} year={year} />
          </RevealSection>
        </>
      )}
    </div>
  );
}
