"use client";

import { formatDistance, formatDuration } from "@/lib/utils";
import { MonthlyStats } from "@/lib/statistics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface MonthlyGraphsProps {
  monthlyStats: MonthlyStats[];
}

export function MonthlyGraphs({ monthlyStats }: MonthlyGraphsProps) {
  const chartData = monthlyStats.map((stat) => ({
    month: stat.monthName,
    activities: stat.activities,
    distance: Math.round(stat.distance / 1000), // Convert to km
    time: Math.round(stat.time / 3600), // Convert to hours
    elevation: Math.round(stat.elevation),
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Trends</h3>
      
      <div className="space-y-8">
        {/* Activities Count */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Activities per Month</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activities" fill="#3B82F6" name="Activities" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distance */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Distance per Month (km)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="distance" stroke="#10B981" strokeWidth={2} name="Distance (km)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Time per Month (hours)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#F59E0B" name="Time (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

