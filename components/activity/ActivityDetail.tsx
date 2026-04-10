"use client";

import { useEffect, useState } from "react";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { MetricsGrid } from "./MetricsGrid";
import { GraphTabs } from "./GraphTabs";
import { SplitsTable } from "./SplitsTable";
import { RouteMap } from "./RouteMap";
import { ShareBottomSheet } from "@/components/ShareActivity";
import { useShareSheet } from "@/hooks/useShareSheet";

interface ActivityDetailProps {
  activity: any;
}

function SlashDivider() {
  return (
    <div className="relative h-8 my-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-40"
        style={{
          background: "linear-gradient(90deg, #FF5500 0%, #E91E8C 50%, #8B2FC9 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 100%)",
        }} />
    </div>
  );
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const [detailedData, setDetailedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, activeActivity, openShareSheet, closeShareSheet } = useShareSheet();

  useEffect(() => { fetchDetailedActivity(); }, [activity._id]);

  const fetchDetailedActivity = async () => {
    const activityId = activity.stravaId || activity.id;
    
    if (!activityId) {
      console.error("No valid Strava ID found in activity object:", activity);
      setError("Activity identity could not be verified. Please try again from the dashboard.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/strava/activity/${activityId}`);
      if (!response.ok) throw new Error("Failed to fetch activity details from Strava");
      const data = await response.json();
      setDetailedData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load activity details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-neon-orange/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-neon-orange rounded-full animate-spin" />
            <div className="absolute inset-4 border border-neon-magenta/40 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
          </div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest animate-pulse">
            LOADING ACTIVITY DATA...
          </div>
        </div>
      </div>
    );
  }

  if (error || !detailedData) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
        <div className="border border-red-alert/50 bg-cyber-card p-8 max-w-md w-full text-center"
          style={{ boxShadow: "0 0 40px rgba(255,23,68,0.2)" }}>
          <div className="font-bebas text-5xl text-red-alert mb-4">DATA CORRUPTED</div>
          <p className="font-mono text-sm text-white/60 mb-6">{error || "Activity not found"}</p>
          <a href="/dashboard"
            className="font-mono text-sm text-black px-6 py-3 inline-block"
            style={{ background: "#FF5500" }}>
            ← BACK TO DASHBOARD
          </a>
        </div>
      </div>
    );
  }

  const { activity: det, streams } = detailedData;

  return (
    <div className="min-h-screen bg-cyber-black relative">
      <div className="scanlines pointer-events-none fixed inset-0 z-0 opacity-25" />

      {/* Header */}
      <ActivityDetailHeader activity={det} />

      <SlashDivider />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-0">

        {/* Metrics */}
        <div className="py-6">
          <MetricsGrid activity={det} streams={streams} />
        </div>

        <SlashDivider />

        {/* Route map */}
        {streams?.latlng?.data && streams.latlng.data.length > 0 && (
          <>
            <div className="py-6">
              <div className="hud-label mb-4">// ROUTE MAP</div>
              <div style={{ border: "1px solid rgba(255,85,0,0.25)", overflow: "hidden" }}>
                <RouteMap latlng={streams.latlng.data} activityType={det.type} />
              </div>
            </div>
            <SlashDivider />
          </>
        )}

        {/* Graphs */}
        <div className="py-6">
          <div className="hud-label mb-4">// PERFORMANCE GRAPHS</div>
          <GraphTabs activity={det} streams={streams} />
        </div>

        {/* Splits */}
        {det.splits_metric && det.splits_metric.length > 0 &&
          !["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(det.type) && (
          <>
            <SlashDivider />
            <div className="py-6">
              <SplitsTable splits={det.splits_metric} />
            </div>
          </>
        )}

        <SlashDivider />

        {/* Action bar — SHARE + Back */}
        <div className="py-6 space-y-4">
          <button
            onClick={() => openShareSheet(activity)}
            className="font-bebas tracking-widest flex items-center justify-center gap-3 w-full py-4 text-lg transition-all"
            style={{
              background: "#FF5500",
              color: "#000",
              letterSpacing: "0.1em",
              boxShadow: "0 0 30px rgba(255,85,0,0.3)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(255,85,0,0.6)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(255,85,0,0.3)";
            }}
          >
            ⧉ SHARE ACTIVITY
          </button>

          <div className="text-center">
            <a href="/dashboard"
              className="inline-flex items-center gap-3 font-mono text-sm text-white/60 hover:text-neon-orange transition-colors px-6 py-3"
              style={{ border: "1px solid rgba(255,85,0,0.3)" }}>
              <span>←</span> BACK TO ACTIVITIES
            </a>
          </div>
        </div>
      </div>

      <ShareBottomSheet 
        isOpen={isOpen} 
        activity={activeActivity} 
        onClose={closeShareSheet} 
      />
    </div>
  );
}
