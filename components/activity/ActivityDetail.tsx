"use client";

import { useEffect, useState } from "react";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { MetricsGrid } from "./MetricsGrid";
import { GraphTabs } from "./GraphTabs";
import { SplitsTable } from "./SplitsTable";
import { RouteMap } from "./RouteMap";

interface ActivityDetailProps {
  activity: any;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const [detailedData, setDetailedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetailedActivity();
  }, [activity._id]);

  const fetchDetailedActivity = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/strava/activity/${activity.stravaId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity details");
      }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error || !detailedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Activity not found"}</p>
          <a
            href="/dashboard"
            className="btn-primary inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const { activity: detailedActivity, streams } = detailedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <ActivityDetailHeader activity={detailedActivity} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metrics Grid */}
        <div className="animate-slide-up">
          <MetricsGrid activity={detailedActivity} streams={streams} />
        </div>

        {/* Route Map */}
        {streams?.latlng?.data && streams.latlng.data.length > 0 && (
          <div className="animate-slide-up stagger-1">
            <RouteMap
              latlng={streams.latlng.data}
              activityType={detailedActivity.type}
            />
          </div>
        )}

        {/* Graphs */}
        <div className="animate-slide-up stagger-2">
          <GraphTabs activity={detailedActivity} streams={streams} />
        </div>

        {/* Splits Table */}
        {detailedActivity.splits_metric && detailedActivity.splits_metric.length > 0 && (
          <div className="animate-slide-up stagger-3">
            <SplitsTable splits={detailedActivity.splits_metric} />
          </div>
        )}

        {/* Back Button */}
        <div className="text-center pt-8 animate-fade-in">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-smooth hover-lift font-semibold text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
