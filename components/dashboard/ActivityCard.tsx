"use client";

import { formatDistance, formatDuration, formatDate } from "@/lib/utils";
import { ActivityData } from "@/types";
import Link from "next/link";

interface ActivityCardProps {
  activity: ActivityData;
  index?: number;
  onShare: () => void;
}

const activityTypeIcons: Record<string, string> = {
  Run: "🏃", Ride: "🚴", Walk: "🚶", Hike: "🥾",
  Swim: "🏊", Workout: "💪", default: "🏃",
};

const activityTypeColors: Record<string, string> = {
  Run: "#FF5500", Ride: "#00F5FF", Walk: "#AAFF00",
  Hike: "#FFD700", Swim: "#8B2FC9", Workout: "#E91E8C", default: "#FF5500",
};

export function ActivityCard({ activity, index = 0, onShare }: ActivityCardProps) {
  const icon = activityTypeIcons[activity.type] || activityTypeIcons.default;
  const color = activityTypeColors[activity.type] || activityTypeColors.default;

  const getPaceOrSpeed = () => {
    if (activity.movingTime <= 0 || activity.distance <= 0) return null;
    const noPace = ["Badminton", "Tennis", "Squash", "TableTennis", "Workout", "WeightTraining", "Yoga", "Crossfit"];
    if (noPace.includes(activity.type)) return null;
    if (["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type)) {
      return `${((activity.distance / activity.movingTime) * 3.6).toFixed(1)} km/h`;
    }
    if (activity.type === "Swim") {
      const s = (activity.movingTime / activity.distance) * 100;
      return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")} /100m`;
    }
    const s = (activity.movingTime / activity.distance) * 1000;
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")} /km`;
  };

  const thirdStat = (() => {
    if (activity.totalElevationGain) return { label: "ELEV", value: `${Math.round(activity.totalElevationGain)}m` };
    const ps = getPaceOrSpeed();
    if (ps) return { label: ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type) ? "SPEED" : "PACE", value: ps };
    return { label: "TYPE", value: activity.type };
  })();

  return (
    <div className="relative">
      <Link href={`/activity/${activity._id}`}>
        <div
          className="relative p-5 cursor-pointer group transition-all duration-300"
          style={{
            background: "#080808",
            border: `1px solid ${color}35`,
            animationDelay: `${index * 60}ms`,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = color;
            el.style.boxShadow = `0 0 25px ${color}18, inset 0 0 20px ${color}06`;
            el.style.background = `${color}06`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = `${color}35`;
            el.style.boxShadow = "none";
            el.style.background = "#080808";
          }}
        >
          {/* Reticle corners */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l" style={{ borderColor: color }} />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r" style={{ borderColor: color }} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{icon}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-mono text-sm text-white truncate group-hover:text-neon-orange transition-colors">
                {activity.name}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                {activity.type}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "DIST", value: formatDistance(activity.distance) },
              { label: "TIME", value: formatDuration(activity.movingTime) },
              { label: thirdStat.label, value: thirdStat.value },
            ].map(stat => (
              <div key={stat.label} className="p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="font-mono text-[9px] text-white/35 uppercase tracking-widest mb-0.5">{stat.label}</div>
                <div className="font-mono text-xs text-white/80 truncate">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Footer — date + location + copy button */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[10px] text-white/35">
                {formatDate(typeof activity.startDate === "string" ? new Date(activity.startDate) : activity.startDate)}
              </span>
              {activity.location?.city && (
                <span className="font-mono text-[10px] text-white/30 flex items-center gap-1 hidden sm:flex">
                  <span style={{ color }}>📍</span> {activity.location.city}
                </span>
              )}
            </div>

            {/* "⧉ Share" button */}
            <div onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
              <button
                onClick={onShare}
                className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5 transition-all text-neon-orange"
                style={{
                  border: "1px solid rgba(255,85,0,0.4)",
                  background: "rgba(0,0,0,0.7)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,85,0,0.1)";
                  el.style.borderColor = "rgba(255,85,0,0.8)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(0,0,0,0.7)";
                  el.style.borderColor = "rgba(255,85,0,0.4)";
                }}
              >
                ⧉ Share
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
