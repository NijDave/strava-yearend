"use client";

import { WeeklyInsights as WeeklyInsightsType } from "@/lib/statistics";

interface WeeklyInsightsProps {
  insights: WeeklyInsightsType;
}

export function WeeklyInsights({ insights }: WeeklyInsightsProps) {
  const cards = [
    {
      label: "AVG PER WEEK",
      value: insights.averagePerWeek.toFixed(1),
      suffix: " acts",
      color: "#FF5500",
      glow: "rgba(255,85,0,0.5)",
      icon: "📈",
    },
    {
      label: "LONGEST STREAK",
      value: insights.longestStreak.toString(),
      suffix: " days",
      color: "#E91E8C",
      glow: "rgba(233,30,140,0.5)",
      icon: "🔥",
      isStreak: true,
    },
    insights.mostCommonDay
      ? {
          label: "PEAK DAY",
          value: insights.mostCommonDay.day,
          suffix: "",
          subValue: `${insights.mostCommonDay.count} activities`,
          color: "#8B2FC9",
          glow: "rgba(139,47,201,0.5)",
          icon: "📅",
        }
      : null,
    insights.mostCommonTime
      ? {
          label: "PEAK TIME",
          value: insights.mostCommonTime.period,
          suffix: "",
          subValue: `${insights.mostCommonTime.count} activities`,
          color: "#00F5FF",
          glow: "rgba(0,245,255,0.5)",
          icon: "⏰",
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    suffix: string;
    color: string;
    glow: string;
    icon: string;
    isStreak?: boolean;
    subValue?: string;
  }>;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">WEEKLY & CONSISTENCY</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="relative p-4 sm:p-5 group overflow-hidden transition-all duration-300"
            style={{
              background: "#0a0a0a",
              border: `2px solid ${card.color}40`,
              boxShadow: `0 0 0 0 ${card.glow}`,
              transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = `0 0 20px ${card.glow}, inset 0 0 20px ${card.glow.replace("0.5", "0.05")}`;
              el.style.borderColor = card.color;
              el.style.background = `${card.color}08`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = `0 0 0 0 ${card.glow}`;
              el.style.borderColor = `${card.color}40`;
              el.style.background = "#0a0a0a";
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: card.color }} />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: card.color }} />

            <div className="hud-label mb-2">{card.label}</div>

            {/* Main value */}
            <div
              className="font-bebas leading-none capitalize"
              style={{
                fontSize: "clamp(1.8rem, 6vw, 3rem)",
                color: card.color,
                textShadow: `0 0 20px ${card.glow}`,
              }}
            >
              {/* Animated flame for streak */}
              {card.isStreak && (
                <span
                  className="inline-block mr-1"
                  style={{
                    animation: "flameDance 0.8s ease-in-out infinite",
                    transformOrigin: "bottom center",
                    filter: `drop-shadow(0 0 8px rgba(255,85,0,0.9))`,
                    fontSize: "clamp(1.2rem, 4vw, 2rem)",
                  }}
                >
                  🔥
                </span>
              )}
              {card.value}
              {card.suffix && <span className="text-lg ml-1 opacity-70">{card.suffix}</span>}
            </div>

            {/* Sub value */}
            {card.subValue && (
              <div className="font-mono text-xs text-white/40 mt-1">{card.subValue}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
