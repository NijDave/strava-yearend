"use client";

import Link from "next/link";
import { formatDistance, formatDuration, formatDate } from "@/lib/utils";
import { BestPerformances as BestPerformancesType } from "@/lib/statistics";
import { ActivityData } from "@/types";

interface BestPerformancesProps {
  performances: BestPerformancesType;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BestPerformances({ performances }: BestPerformancesProps) {
  const cards = [];

  if (performances.longestActivity) {
    cards.push({
      title: "Longest Activity",
      value: formatDistance(performances.longestActivity.distance),
      subtitle: performances.longestActivity.name,
      icon: "🏆",
      color: "from-yellow-500 to-orange-500",
      activityId: performances.longestActivity._id,
    });
  }

  if (performances.longestRun) {
    cards.push({
      title: "Longest Run",
      value: formatDistance(performances.longestRun.distance),
      subtitle: performances.longestRun.name,
      icon: "🏃",
      color: "from-blue-500 to-cyan-500",
      activityId: performances.longestRun._id,
    });
  }

  if (performances.longestRide) {
    cards.push({
      title: "Longest Ride",
      value: formatDistance(performances.longestRide.distance),
      subtitle: performances.longestRide.name,
      icon: "🚴",
      color: "from-green-500 to-emerald-500",
      activityId: performances.longestRide._id,
    });
  }

  if (performances.highestElevation) {
    cards.push({
      title: "Highest Elevation",
      value: `${Math.round(performances.highestElevation.totalElevationGain || 0)}m`,
      subtitle: performances.highestElevation.name,
      icon: "⛰️",
      color: "from-gray-600 to-gray-800",
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
      subtitle: performances.fastestPace.name,
      icon: "⚡",
      color: "from-purple-500 to-pink-500",
      activityId: performances.fastestPace._id,
    });
  }

  if (performances.mostActiveMonth) {
    cards.push({
      title: "Most Active Month",
      value: monthNames[performances.mostActiveMonth.month],
      subtitle: `${performances.mostActiveMonth.count} activities`,
      icon: "📅",
      color: "from-indigo-500 to-blue-500",
      // No activity ID for month stats
    });
  }

  if (performances.mostActiveDay) {
    const date = new Date(performances.mostActiveDay.date);
    cards.push({
      title: "Most Active Day",
      value: formatDate(date),
      subtitle: `${performances.mostActiveDay.count} activities`,
      icon: "🔥",
      color: "from-red-500 to-orange-500",
      // No activity ID for day stats
    });
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-3xl">🏆</span>
        Best Performances
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const CardContent = (
            <div
              className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg transition-smooth ${card.activityId ? "hover-lift cursor-pointer hover:shadow-2xl" : ""
                }`}
            >
              <div className="text-4xl mb-3 animate-float">{card.icon}</div>
              <div className="text-sm font-medium text-white/90 mb-2 uppercase tracking-wide">{card.title}</div>
              <div className="text-3xl font-bold mb-3">{card.value}</div>
              <div className="text-sm text-white/80 truncate">{card.subtitle}</div>
              {card.activityId && (
                <div className="mt-3 text-xs text-white/70 flex items-center gap-1">
                  <span>Click to view</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );

          return card.activityId ? (
            <Link key={index} href={`/activity/${card.activityId}`}>
              {CardContent}
            </Link>
          ) : (
            <div key={index}>{CardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
