"use client";

import { WeeklyInsights as WeeklyInsightsType } from "@/lib/statistics";

interface WeeklyInsightsProps {
  insights: WeeklyInsightsType;
}

export function WeeklyInsights({ insights }: WeeklyInsightsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Weekly & Consistency</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-sm text-gray-600 mb-1">Average Activities per Week</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.averagePerWeek.toFixed(1)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.longestStreak} days
          </div>
        </div>

        {insights.mostCommonDay && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm text-gray-600 mb-1">Most Common Workout Day</div>
            <div className="text-2xl font-bold text-gray-900">
              {insights.mostCommonDay.day}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {insights.mostCommonDay.count} activities
            </div>
          </div>
        )}

        {insights.mostCommonTime && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm text-gray-600 mb-1">Most Common Workout Time</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {insights.mostCommonTime.period}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {insights.mostCommonTime.count} activities
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

