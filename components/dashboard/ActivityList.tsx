"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { YearEndSummary } from "./YearEndSummary";
import { YearComparison } from "./YearComparison";
import { formatDistance, formatDuration } from "@/lib/utils";
import { ActivityData } from "@/types";

interface ActivityListProps {
  userId: string;
}

export interface YearStats {
  year: number;
  activities: ActivityData[];
  totalDistance: number;
  totalTime: number;
  activityCount: number;
}

export function ActivityList({ userId }: ActivityListProps) {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [yearStats, setYearStats] = useState<YearStats[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "summary" | "compare">("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/strava/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data.activities || []);
      processActivities(data.activities || []);
    } catch (err: any) {
      setError(err.message || "Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  const processActivities = (activitiesList: ActivityData[]) => {
    const groupedByYear: Record<number, ActivityData[]> = {};

    activitiesList.forEach((activity) => {
      const startDate =
        typeof activity.startDate === "string"
          ? new Date(activity.startDate)
          : activity.startDate;
      const year = new Date(startDate).getFullYear();
      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }
      groupedByYear[year].push(activity);
    });

    const stats: YearStats[] = Object.keys(groupedByYear)
      .map((yearStr) => {
        const year = parseInt(yearStr);
        const yearActivities = groupedByYear[year];
        const totalDistance = yearActivities.reduce(
          (sum, a) => sum + a.distance,
          0
        );
        const totalTime = yearActivities.reduce(
          (sum, a) => sum + a.movingTime,
          0
        );

        return {
          year,
          activities: yearActivities.sort((a, b) => {
            const dateA =
              typeof a.startDate === "string"
                ? new Date(a.startDate)
                : a.startDate;
            const dateB =
              typeof b.startDate === "string"
                ? new Date(b.startDate)
                : b.startDate;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          }),
          totalDistance,
          totalTime,
          activityCount: yearActivities.length,
        };
      })
      .sort((a, b) => b.year - a.year);

    setYearStats(stats);
    if (stats.length > 0 && selectedYear === null) {
      setSelectedYear(stats[0].year);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const response = await fetch("/api/strava/activities", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sync activities");
      }

      // Refresh activities after sync
      await fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to sync activities");
    } finally {
      setIsSyncing(false);
    }
  };

  const currentYearStats = yearStats.find((s) => s.year === selectedYear);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchActivities}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 mb-4">No activities found.</p>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSyncing ? "Syncing..." : "Sync Activities"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Activities</h2>
          <p className="text-gray-600 mt-1">
            {activities.length} total activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("summary")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "summary"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              📊 Summary
            </button>
            <button
              onClick={() => setViewMode("compare")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "compare"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              📈 Compare
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              📋 List
            </button>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Syncing...
              </span>
            ) : (
              "Sync Activities"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Year Selector - Always show */}
      {yearStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Year
          </label>
          <div className="flex flex-wrap gap-2">
            {yearStats.map((stat) => (
              <button
                key={stat.year}
                onClick={() => setSelectedYear(stat.year)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedYear === stat.year
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {stat.year} ({stat.activityCount})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Content */}
      {viewMode === "summary" && selectedYear && (
        <YearEndSummary year={selectedYear} />
      )}

      {viewMode === "compare" && yearStats.length >= 2 && (
        <YearComparison yearStats={yearStats} />
      )}

      {viewMode === "list" && (
        <>
          {/* Year Statistics */}
          {currentYearStats && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">{currentYearStats.year} Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90">Activities</p>
                  <p className="text-2xl font-bold">{currentYearStats.activityCount}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Distance</p>
                  <p className="text-2xl font-bold">
                    {formatDistance(currentYearStats.totalDistance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Time</p>
                  <p className="text-2xl font-bold">
                    {formatDuration(currentYearStats.totalTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Avg per Activity</p>
                  <p className="text-2xl font-bold">
                    {formatDistance(
                      currentYearStats.totalDistance / currentYearStats.activityCount
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Activities Grid */}
          {currentYearStats && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentYearStats.year} Activities ({currentYearStats.activityCount})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentYearStats.activities.map((activity) => (
                  <ActivityCard key={activity._id} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

