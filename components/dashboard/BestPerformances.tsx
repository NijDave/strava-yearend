"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistance, formatDuration, formatDate } from "@/lib/utils";
import { BestPerformances as BestPerformancesType } from "@/lib/statistics";
import { useCountUp } from "@/hooks/useCountUp";
import { useIsMobile } from "@/hooks/useIsMobile";

interface BestPerformancesProps {
  performances: BestPerformancesType;
}

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface PerfCard {
  title: string;
  value: string;
  numericValue: number;
  suffix?: string;
  subtitle: string;
  icon: string;
  gradient: string;
  gradientAngle: number;
  activityId?: string;
  isWanted?: boolean;
}

/** Parallax tilt card — disabled on touch devices */
function TiltCard({
  card,
  isMobile,
  children,
}: {
  card: PerfCard;
  isMobile: boolean;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

/** Individual performance card */
function PerfCard({
  card,
  index,
  isMobile,
}: {
  card: PerfCard;
  index: number;
  isMobile: boolean;
}) {
  // Count up for numeric value
  const { ref: numRef, displayValue } = useCountUp({
    target: card.numericValue,
    duration: 1300,
    delay: index * 100,
    triggerOnView: true,
    decimals: card.suffix?.includes(".") ? 1 : 0,
  });

  const CardInner = (
    <div
      className="relative overflow-hidden h-full min-h-[180px] sm:min-h-[200px] group cursor-pointer"
      style={{
        background: `linear-gradient(${card.gradientAngle}deg, ${card.gradient})`,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Speed-line diagonal stripes background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 12px)",
        }}
      />

      {/* WANTED poster perforated edge for special card */}
      {card.isWanted && (
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{
            backgroundImage: "radial-gradient(circle at 6px 0, transparent 4px, rgba(0,0,0,0.6) 4px)",
            backgroundSize: "12px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />
      )}
      {card.isWanted && (
        <div
          className="absolute inset-x-0 bottom-0 h-2"
          style={{
            backgroundImage: "radial-gradient(circle at 6px 100%, transparent 4px, rgba(0,0,0,0.6) 4px)",
            backgroundSize: "12px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />
      )}

      <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full justify-between">
        {/* Top row: label */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">{card.title}</div>
          {card.isWanted && (
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1 border border-white/20 inline-block px-2 py-0.5">
              ★ WANTED ★
            </div>
          )}
        </div>

        {/* Main number — huge Bebas Neue */}
        <div
          ref={numRef as React.RefObject<HTMLDivElement>}
          className="font-bebas text-white leading-none"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {typeof card.numericValue === "number" && card.numericValue > 0
            ? displayValue + (card.suffix || "")
            : card.value}
        </div>

        {/* Subtitle */}
        <div className="mt-2">
          <div className="font-mono text-xs text-white/70 truncate">{card.subtitle}</div>
          {card.activityId && (
            <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-white/40">
              <span>VIEW ACTIVITY</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TiltCard card={card} isMobile={isMobile}>
      {card.activityId ? (
        <Link href={`/activity/${card.activityId}`} className="block h-full">
          {CardInner}
        </Link>
      ) : (
        CardInner
      )}
    </TiltCard>
  );
}

export function BestPerformances({ performances }: BestPerformancesProps) {
  const isMobile = useIsMobile();
  const cards: PerfCard[] = [];

  if (performances.longestActivity) {
    const km = performances.longestActivity.distance / 1000;
    cards.push({
      title: "Longest Activity",
      value: formatDistance(performances.longestActivity.distance),
      numericValue: Math.round(km * 10) / 10,
      suffix: "km",
      subtitle: performances.longestActivity.name,
      icon: "🏆",
      gradient: "#FF5500, #CC3300",
      gradientAngle: 135,
      activityId: performances.longestActivity._id,
    });
  }

  if (performances.longestRun) {
    const km = performances.longestRun.distance / 1000;
    cards.push({
      title: "Longest Run",
      value: formatDistance(performances.longestRun.distance),
      numericValue: Math.round(km * 10) / 10,
      suffix: "km",
      subtitle: performances.longestRun.name,
      icon: "🏃",
      gradient: "#E91E8C, #8B2FC9",
      gradientAngle: 150,
      activityId: performances.longestRun._id,
    });
  }

  if (performances.longestRide) {
    const km = performances.longestRide.distance / 1000;
    cards.push({
      title: "Longest Ride",
      value: formatDistance(performances.longestRide.distance),
      numericValue: Math.round(km * 10) / 10,
      suffix: "km",
      subtitle: performances.longestRide.name,
      icon: "🚴",
      gradient: "#8B2FC9, #00F5FF",
      gradientAngle: 120,
      activityId: performances.longestRide._id,
    });
  }

  if (performances.highestElevation) {
    const elev = Math.round(performances.highestElevation.totalElevationGain || 0);
    cards.push({
      title: "Highest Elevation",
      value: `${elev}m`,
      numericValue: elev,
      suffix: "m",
      subtitle: performances.highestElevation.name,
      icon: "⛰️",
      gradient: "#333, #666",
      gradientAngle: 160,
      activityId: performances.highestElevation._id,
    });
  }

  if (performances.fastestPace) {
    const pace = performances.fastestPace.movingTime / (performances.fastestPace.distance / 1000);
    const minutes = Math.floor(pace / 60);
    const seconds = Math.floor(pace % 60);
    cards.push({
      title: "Fastest Pace",
      value: `${minutes}:${seconds.toString().padStart(2, "0")} /km`,
      numericValue: minutes,
      suffix: `'${seconds.toString().padStart(2,"0")}`,
      subtitle: performances.fastestPace.name,
      icon: "⚡",
      gradient: "#FF5500, #E91E8C",
      gradientAngle: 45,
      activityId: performances.fastestPace._id,
    });
  }

  if (performances.mostActiveMonth) {
    cards.push({
      title: "Most Active Month",
      value: monthNames[performances.mostActiveMonth.month],
      numericValue: 0, // non-numeric
      subtitle: `${performances.mostActiveMonth.count} activities`,
      icon: "📅",
      gradient: "#1a0a40, #E91E8C",
      gradientAngle: 135,
    });
  }

  if (performances.mostActiveDay) {
    const date = new Date(performances.mostActiveDay.date);
    cards.push({
      title: "Most Active Day",
      value: formatDate(date),
      numericValue: 0,
      subtitle: `${performances.mostActiveDay.count} activities`,
      icon: "🔥",
      gradient: "#1a0500, #FF5500",
      gradientAngle: 170,
      isWanted: true,
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">BEST PERFORMANCES</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      {/* Stack on mobile, grid on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <PerfCard key={index} card={card} index={index} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}
