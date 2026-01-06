"use client";

import { useEffect, useState } from "react";
import { CoreSummary } from "./CoreSummary";
import { ActivityTypeBreakdown } from "./ActivityTypeBreakdown";
import { MonthlyGraphs } from "./MonthlyGraphs";
import { BestPerformances } from "./BestPerformances";
import { WeeklyInsights } from "./WeeklyInsights";
import { TimeOfDayChart } from "./TimeOfDayChart";
import { LocationInsights } from "./LocationInsights";
import { FunFacts } from "./FunFacts";

interface YearEndSummaryProps {
  year: number;
}

export function YearEndSummary({ year }: YearEndSummaryProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [year]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/statistics?year=${year}`);
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{year} Year in Review</h1>
        <p className="text-gray-600">Your complete activity summary</p>
      </div>

      {/* Core Summary */}
      <CoreSummary summary={data.coreSummary} />

      {/* Fun Facts */}
      {data.funFacts && data.funFacts.length > 0 && (
        <FunFacts facts={data.funFacts} />
      )}

      {/* Activity Type Breakdown */}
      {data.activityBreakdown && data.activityBreakdown.length > 0 && (
        <ActivityTypeBreakdown breakdown={data.activityBreakdown} />
      )}

      {/* Monthly Graphs */}
      {data.monthlyStats && data.monthlyStats.length > 0 && (
        <MonthlyGraphs monthlyStats={data.monthlyStats} />
      )}

      {/* Best Performances */}
      <BestPerformances performances={data.bestPerformances} />

      {/* Weekly Insights */}
      <WeeklyInsights insights={data.weeklyInsights} />

      {/* Time of Day */}
      {data.timeOfDay && (
        <TimeOfDayChart stats={data.timeOfDay} />
      )}

      {/* Location Insights */}
      {data.locationInsights && (
        <LocationInsights insights={data.locationInsights} />
      )}
    </div>
  );
}

