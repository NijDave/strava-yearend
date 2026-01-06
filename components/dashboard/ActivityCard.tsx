"use client";

import { formatDistance, formatDuration, formatDate } from "@/lib/utils";
import { ActivityData } from "@/types";
import Link from "next/link";

interface ActivityCardProps {
  activity: ActivityData;
  index?: number;
}

const activityTypeIcons: Record<string, string> = {
  Run: "🏃",
  Ride: "🚴",
  Walk: "🚶",
  Hike: "🥾",
  Swim: "🏊",
  Workout: "💪",
  default: "🏃",
};

const activityTypeColors: Record<string, string> = {
  Run: "from-orange-500 to-red-500",
  Ride: "from-blue-500 to-cyan-500",
  Walk: "from-green-500 to-emerald-500",
  Hike: "from-amber-500 to-yellow-500",
  Swim: "from-blue-600 to-indigo-600",
  Workout: "from-purple-500 to-pink-500",
  default: "from-gray-500 to-gray-700",
};

export function ActivityCard({ activity, index = 0 }: ActivityCardProps) {
  const icon = activityTypeIcons[activity.type] || activityTypeIcons.default;
  const gradient = activityTypeColors[activity.type] || activityTypeColors.default;
  const staggerClass = index < 6 ? `stagger-${Math.min(index, 5)}` : "";

  return (
    <Link href={`/activity/${activity._id}`}>
      <div className={`
        glass rounded-xl p-6 hover-lift transition-smooth cursor-pointer
        border border-white/20 shadow-md hover:shadow-xl
        animate-scale-in ${staggerClass}
        group
      `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}
              flex items-center justify-center shadow-lg
              group-hover:scale-110 transition-transform
            `}>
              <span className="text-2xl">{icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {activity.name}
              </h3>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {activity.type}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</p>
            <p className="text-lg font-bold text-gray-900">
              {formatDistance(activity.distance)}
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time</p>
            <p className="text-lg font-bold text-gray-900">
              {formatDuration(activity.movingTime)}
            </p>
          </div>
          {activity.totalElevationGain ? (
            <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Elevation</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(activity.totalElevationGain)}m
              </p>
            </div>
          ) : (
            <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type) ? "Speed" : "Pace"}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {activity.movingTime > 0 && activity.distance > 0
                  ? ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type)
                    ? `${((activity.distance / activity.movingTime) * 3.6).toFixed(1)} km/h`
                    : activity.type === "Swim"
                      ? (() => {
                        const secondsPer100m = (activity.movingTime / activity.distance) * 100;
                        const mins = Math.floor(secondsPer100m / 60);
                        const secs = Math.floor(secondsPer100m % 60);
                        return `${mins}:${secs.toString().padStart(2, '0')} /100m`;
                      })()
                      : (() => {
                        const secondsPerKm = (activity.movingTime / activity.distance) * 1000;
                        const mins = Math.floor(secondsPerKm / 60);
                        const secs = Math.floor(secondsPerKm % 60);
                        return `${mins}:${secs.toString().padStart(2, '0')} /km`;
                      })()
                  : "N/A"
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              {formatDate(
                typeof activity.startDate === "string"
                  ? new Date(activity.startDate)
                  : activity.startDate
              )}
            </span>
          </div>

          {activity.location?.city && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{activity.location.city}</span>
            </div>
          )}
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
