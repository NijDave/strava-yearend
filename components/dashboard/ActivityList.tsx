"use client";

import { useEffect, useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { YearEndSummary } from "./YearEndSummary";
import { ShareBottomSheet } from "@/components/ShareActivity";
import { useShareSheet } from "@/hooks/useShareSheet";

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
  const [viewMode, setViewMode] = useState<"list" | "summary">("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, activeActivity, openShareSheet, closeShareSheet } = useShareSheet();

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/strava/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
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
      const year = new Date(activity.startDate).getFullYear();
      if (!groupedByYear[year]) groupedByYear[year] = [];
      groupedByYear[year].push(activity);
    });

    const stats: YearStats[] = Object.keys(groupedByYear)
      .map((yearStr) => {
        const year = parseInt(yearStr);
        const yearActivities = groupedByYear[year];
        return {
          year,
          activities: yearActivities.sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          ),
          totalDistance: yearActivities.reduce((s, a) => s + a.distance, 0),
          totalTime: yearActivities.reduce((s, a) => s + a.movingTime, 0),
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
      const response = await fetch("/api/strava/activities", { method: "POST" });
      if (!response.ok) throw new Error("Failed to sync activities");
      await fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to sync activities");
    } finally {
      setIsSyncing(false);
    }
  };

  const currentYearStats = yearStats.find((s) => s.year === selectedYear);

  // ── LOADING STATE ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-neon-orange/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-neon-orange rounded-full animate-spin" />
        </div>
        <div className="font-mono text-xs text-white/40 tracking-widest uppercase animate-pulse">
          LOADING MISSION DATA...
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error && activities.length === 0) {
    return (
      <div className="border border-red-alert/60 bg-cyber-card p-6 text-center"
        style={{ boxShadow: "0 0 20px rgba(255,23,68,0.2)" }}>
        <div className="font-bebas text-3xl text-red-alert mb-2">TRANSMISSION ERROR</div>
        <p className="font-mono text-sm text-white/60 mb-4">{error}</p>
        <button onClick={fetchActivities}
          className="btn-brutal px-6 py-2 text-xs" style={{ borderColor: "#FF1744" }}>
          RETRY
        </button>
      </div>
    );
  }

  // ── EMPTY STATE ──
  if (activities.length === 0) {
    return (
      <div className="border border-neon-orange/40 bg-cyber-card p-8 text-center">
        <div className="font-bebas text-4xl text-neon-orange mb-2">NO DATA FOUND</div>
        <p className="font-mono text-sm text-white/50 mb-6">Sync your Strava activities to begin</p>
        <button onClick={handleSync} disabled={isSyncing} className="btn-brutal px-8 py-3 text-sm disabled:opacity-40">
          {isSyncing ? "SYNCING..." : "SYNC ACTIVITIES"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="hud-label mb-1">// MISSION CONTROL</div>
          <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
            YOUR <span className="text-neon-orange">{activities.length}</span> ACTIVITIES
          </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {/* View mode tabs */}
          <div className="flex gap-1 bg-black/60 border border-neon-orange/20 p-1 w-full sm:w-auto">
            {(["summary", "list"] as const).map((mode) => (
              <button
                key={mode}
                id={`view-tab-${mode}`}
                onClick={() => setViewMode(mode)}
                className={`flex-1 px-6 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                  viewMode === mode
                    ? "bg-neon-orange text-black font-bold"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode === "summary" ? "📊 SUMMARY" : "📋 LIST"}
              </button>
            ))}
          </div>

          {/* Sync button */}
          <button
            id="sync-activities-btn"
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-brutal px-5 py-2.5 text-xs w-full sm:w-auto disabled:opacity-40"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                SYNCING
              </span>
            ) : "⟳ SYNC"}
          </button>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="border border-red-alert/60 bg-red-alert/10 p-3 font-mono text-xs text-red-alert animate-alert-flicker">
          ⚠ {error}
        </div>
      )}

      {/* ── YEAR SELECTOR ── */}
      {yearStats.length > 0 && (
        <div className="bg-cyber-card border border-neon-orange/20 p-4">
          <div className="hud-label mb-3">// SELECT YEAR</div>
          {/* Horizontal scroll for many years — hidden scrollbar */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {yearStats.map((stat) => (
              <button
                key={stat.year}
                id={`year-tab-${stat.year}`}
                onClick={() => setSelectedYear(stat.year)}
                className={`circuit-tab flex-shrink-0 ${selectedYear === stat.year ? "active" : ""}`}
              >
                {stat.year}
                <span className="ml-1.5 text-[10px] opacity-60">({stat.activityCount})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW CONTENT ── */}
      {viewMode === "summary" && selectedYear && (
        <YearEndSummary year={selectedYear} />
      )}



      {viewMode === "list" && (
        <>
          {currentYearStats && (
            <div className="border border-neon-orange/30 bg-cyber-card p-6"
              style={{ borderLeft: "3px solid #FF5500" }}>
              <div className="font-bebas text-2xl text-neon-orange mb-4 tracking-wide">
                {currentYearStats.year} MISSION SUMMARY
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "ACTIVITIES", value: currentYearStats.activityCount.toString() },
                  { label: "DISTANCE", value: formatDistance(currentYearStats.totalDistance) },
                  { label: "TOTAL TIME", value: formatDuration(currentYearStats.totalTime) },
                  { label: "AVG DISTANCE", value: formatDistance(currentYearStats.totalDistance / currentYearStats.activityCount) },
                ].map((item) => (
                  <div key={item.label} className="reticle p-4 border border-neon-orange/20">
                    <div className="hud-label mb-1">{item.label}</div>
                    <div className="font-bebas text-2xl text-neon-orange">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentYearStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentYearStats.activities.map((activity) => (
                <ActivityCard 
                  key={activity._id} 
                  activity={activity} 
                  onShare={() => openShareSheet(activity)} 
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Centralized Share Sheet */}
      <ShareBottomSheet 
        isOpen={isOpen} 
        activity={activeActivity} 
        onClose={closeShareSheet} 
      />
    </div>
  );
}
