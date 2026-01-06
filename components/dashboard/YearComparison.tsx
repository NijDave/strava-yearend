"use client";

import { formatDistance, formatDuration } from "@/lib/utils";
import { YearStats } from "./ActivityList";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface YearComparisonProps {
  yearStats: YearStats[];
}

export function YearComparison({ yearStats }: YearComparisonProps) {
  // Get the two most recent years
  const yearsToCompare = yearStats.slice(0, 2).reverse();

  if (yearsToCompare.length < 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600">Need at least 2 years of data to compare</p>
      </div>
    );
  }

  const [year1, year2] = yearsToCompare;

  const comparisonData = [
    {
      metric: "Activities",
      [year1.year]: year1.activityCount,
      [year2.year]: year2.activityCount,
    },
    {
      metric: "Distance (km)",
      [year1.year]: Math.round(year1.totalDistance / 1000),
      [year2.year]: Math.round(year2.totalDistance / 1000),
    },
    {
      metric: "Time (hours)",
      [year1.year]: Math.round(year1.totalTime / 3600),
      [year2.year]: Math.round(year2.totalTime / 3600),
    },
  ];

  const improvements = [
    {
      label: "Activities",
      year1: year1.activityCount,
      year2: year2.activityCount,
      change: year2.activityCount - year1.activityCount,
      percent: ((year2.activityCount - year1.activityCount) / year1.activityCount) * 100,
    },
    {
      label: "Distance",
      year1: year1.totalDistance,
      year2: year2.totalDistance,
      change: year2.totalDistance - year1.totalDistance,
      percent: ((year2.totalDistance - year1.totalDistance) / year1.totalDistance) * 100,
    },
    {
      label: "Time",
      year1: year1.totalTime,
      year2: year2.totalTime,
      change: year2.totalTime - year1.totalTime,
      percent: ((year2.totalTime - year1.totalTime) / year1.totalTime) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl p-6 md:p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Year-to-Year Comparison</h2>
        <p className="text-white/80">
          {year1.year} vs {year2.year}
        </p>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Side-by-Side Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={year1.year.toString()} fill="#3B82F6" />
            <Bar dataKey={year2.year.toString()} fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Improvements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Changes from {year1.year} to {year2.year}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {improvements.map((imp) => {
            const isPositive = imp.change > 0;
            return (
              <div
                key={imp.label}
                className={`p-5 rounded-lg border-2 ${
                  isPositive
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="text-sm text-gray-600 mb-2">{imp.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${isPositive ? "text-green-700" : "text-red-700"}`}>
                    {isPositive ? "+" : ""}
                    {imp.label === "Distance"
                      ? formatDistance(imp.change)
                      : imp.label === "Time"
                      ? formatDuration(imp.change)
                      : imp.change}
                  </span>
                  <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    ({isPositive ? "+" : ""}
                    {imp.percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {year1.year}:{" "}
                  {imp.label === "Distance"
                    ? formatDistance(imp.year1)
                    : imp.label === "Time"
                    ? formatDuration(imp.year1)
                    : imp.year1}{" "}
                  → {year2.year}:{" "}
                  {imp.label === "Distance"
                    ? formatDistance(imp.year2)
                    : imp.label === "Time"
                    ? formatDuration(imp.year2)
                    : imp.year2}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

