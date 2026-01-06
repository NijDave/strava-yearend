"use client";

import { formatDistance, formatDuration } from "@/lib/utils";
import { CoreSummary as CoreSummaryType } from "@/lib/statistics";

interface CoreSummaryProps {
  summary: CoreSummaryType;
}

export function CoreSummary({ summary }: CoreSummaryProps) {
  const stats = [
    {
      label: "Total Activities",
      value: summary.totalActivities.toLocaleString(),
      icon: "🏃",
    },
    {
      label: "Total Distance",
      value: formatDistance(summary.totalDistance),
      icon: "📍",
    },
    {
      label: "Total Time",
      value: formatDuration(summary.totalTime),
      icon: "⏱️",
    },
    {
      label: "Elevation Gain",
      value: `${Math.round(summary.totalElevation)}m`,
      icon: "⛰️",
    },
    {
      label: "Active Days",
      value: summary.activeDays.toString(),
      icon: "📅",
    },
    {
      label: "Avg per Week",
      value: `${summary.averagePerWeek.activities.toFixed(1)} activities`,
      icon: "📊",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl p-6 md:p-8 text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Year in Numbers</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-white/80">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-white/80">Avg Distance/Week: </span>
            <span className="font-semibold">{formatDistance(summary.averagePerWeek.distance)}</span>
          </div>
          <div>
            <span className="text-white/80">Avg Time/Week: </span>
            <span className="font-semibold">{formatDuration(summary.averagePerWeek.time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

