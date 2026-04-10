"use client";

import { useEffect, useRef, useState } from "react";

interface FunFactsProps {
  facts: string[];      // pre-computed fallback facts
  stats?: any;          // full statistics object for Groq
}

const ICONS = ["⚡", "🔥", "💀", "🚨", "⛽", "🏆", "💥"];

function FactCard({ fact, index, icon }: { fact: string; index: number; icon: string }) {
  return (
    <div
      className="flex-shrink-0 relative overflow-hidden"
      style={{
        width: "clamp(260px, 80vw, 320px)",
        border: "1.5px solid #FF1744",
        background: "#0a0000",
        animation: `alertFlicker ${2 + (index % 3) * 0.5}s ease-in-out infinite`,
        animationDelay: `${index * 200}ms`,
      }}
    >
      {/* Top warning tape */}
      <div className="h-3 w-full"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, #FF1744 0px, #FF1744 6px, #000 6px, #000 12px)", opacity: 0.6 }} />

      <div className="p-4">
        <div className="flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,85,0,0.9))" }}>{icon}</span>
          <p className="font-mono text-sm text-white/85 leading-relaxed">{fact}</p>
        </div>
      </div>

      {/* Bottom warning tape */}
      <div className="h-3 w-full"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, #FF1744 0px, #FF1744 6px, #000 6px, #000 12px)", opacity: 0.6 }} />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex-shrink-0 rounded-none"
          style={{ width: "clamp(260px, 80vw, 320px)", height: "120px", background: "#111", border: "1px solid rgba(255,23,68,0.3)", animation: `pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 200}ms` }}>
          <div className="h-3" style={{ background: "rgba(255,23,68,0.2)" }} />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-white/10 rounded" style={{ width: "80%" }} />
            <div className="h-3 bg-white/10 rounded" style={{ width: "60%" }} />
            <div className="h-3 bg-white/10 rounded" style={{ width: "70%" }} />
          </div>
          <div className="h-3" style={{ background: "rgba(255,23,68,0.2)" }} />
        </div>
      ))}
    </div>
  );
}

export function FunFacts({ facts: fallbackFacts, stats }: FunFactsProps) {
  const [aiFacts, setAiFacts] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayFacts = aiFacts || fallbackFacts;
  if (!stats && fallbackFacts.length === 0) return null;

  const buildStatsPayload = () => ({
    year: stats?.year,
    totalActivities: stats?.coreSummary?.totalActivities,
    totalDistance: stats?.coreSummary?.totalDistance,
    totalTime: stats?.coreSummary?.totalTime,
    totalElevation: stats?.coreSummary?.totalElevation,
    activeDays: stats?.coreSummary?.activeDays,
    avgPerWeek: stats?.weeklyInsights?.averagePerWeek,
    longestStreak: stats?.weeklyInsights?.longestStreak,
    mostActiveMonth: stats?.bestPerformances?.mostActiveMonth
      ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][stats.bestPerformances.mostActiveMonth.month]
      : null,
    activityBreakdown: stats?.activityBreakdown?.slice(0, 5),
    fastestPaceStr: (() => {
      const fp = stats?.bestPerformances?.fastestPace;
      if (!fp) return null;
      const pace = fp.movingTime / (fp.distance / 1000);
      return `${Math.floor(pace / 60)}:${Math.floor(pace % 60).toString().padStart(2, "0")} /km`;
    })(),
    highestElevation: stats?.bestPerformances?.highestElevation?.totalElevationGain,
  });

  const fetchGroqFacts = async (regen = false) => {
    if (!stats) return;
    setIsLoading(true);
    if (regen) setAiFacts(null);
    try {
      const res = await fetch("/api/groq/fun-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: buildStatsPayload() }),
      });
      const data = await res.json();
      if (data.facts && data.facts.length > 0) {
        setAiFacts(data.facts);
      }
    } catch (e) {
      // Silently fall back to computed facts
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  // Auto-fetch on mount if stats available
  useEffect(() => {
    if (stats && !hasLoaded) {
      fetchGroqFacts();
    }
  }, [stats]);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-red-alert/60 to-transparent" />
        <div className="font-bebas text-xl text-red-alert tracking-widest">INTEL REPORT</div>
        <div className="h-px flex-1 bg-gradient-to-l from-red-alert/60 to-transparent" />
      </div>

      {/* Emergency broadcast container */}
      <div className="relative overflow-hidden" style={{ border: "2px solid #FF1744", background: "#0a0000" }}>

        {/* Top tape bar */}
        <div className="h-6 w-full"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, #FF1744 0px, #FF1744 8px, #000 8px, #000 16px)", opacity: 0.7 }} />

        {/* Alert header */}
        <div className="px-4 py-2 flex items-center gap-3"
          style={{ background: "rgba(255,23,68,0.15)", borderBottom: "1px solid rgba(255,23,68,0.4)" }}>
          <span className="text-red-alert font-bebas text-2xl tracking-widest">⚠ FUN FACTS</span>
          <span className="font-mono text-xs text-red-alert/60 uppercase tracking-widest">// CLASSIFIED INTELLIGENCE</span>
          <div className="ml-auto flex items-center gap-2">
            {isLoading ? (
              <span className="font-mono text-[10px] text-red-alert/60 uppercase animate-pulse">GENERATING...</span>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-alert"
                  style={{ animation: "pulseRing 1.2s ease-out infinite" }} />
                <span className="font-mono text-[10px] text-red-alert/80">LIVE</span>
              </>
            )}
            {aiFacts && (
              <span className="font-mono text-[10px] text-neon-orange/60 ml-2 flex items-center gap-1">
                <span>🤖</span> AI
              </span>
            )}
          </div>
        </div>

        {/* Horizontal scrollable carousel */}
        <div className="p-4">
          {isLoading && !aiFacts ? (
            <Skeleton />
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#FF1744 #000" }}
            >
              {displayFacts.map((fact, index) => (
                <FactCard
                  key={`${fact.slice(0, 20)}-${index}`}
                  fact={fact}
                  index={index}
                  icon={ICONS[index % ICONS.length]}
                />
              ))}
            </div>
          )}

          {/* Scroll hint on mobile */}
          {displayFacts.length > 1 && (
            <p className="font-mono text-[10px] text-white/25 mt-2 uppercase tracking-widest text-center">
              ← scroll for more facts →
            </p>
          )}
        </div>

        {/* Regenerate button */}
        {stats && hasLoaded && (
          <div className="px-4 pb-4 flex justify-end">
            <button
              onClick={() => fetchGroqFacts(true)}
              disabled={isLoading}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 transition-all disabled:opacity-40"
              style={{
                border: "1px solid rgba(255,23,68,0.5)",
                color: "#FF1744",
                background: "transparent",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,23,68,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {isLoading ? "⟳ GENERATING..." : "⟳ GENERATE NEW ANGLE"}
            </button>
          </div>
        )}

        {/* Bottom tape */}
        <div className="h-6 w-full"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, #FF1744 0px, #FF1744 8px, #000 8px, #000 16px)", opacity: 0.7 }} />
      </div>
    </div>
  );
}
