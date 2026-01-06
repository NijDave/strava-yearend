"use client";

import { TimeOfDayStats } from "@/lib/statistics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TimeOfDayChartProps {
  stats: TimeOfDayStats;
}

const COLORS = {
  morning: "#FBBF24",
  afternoon: "#10B981",
  evening: "#3B82F6",
  night: "#6366F1",
};

export function TimeOfDayChart({ stats }: TimeOfDayChartProps) {
  const data = [
    { name: "Morning (5am-12pm)", value: stats.morning, color: COLORS.morning },
    { name: "Afternoon (12pm-5pm)", value: stats.afternoon, color: COLORS.afternoon },
    { name: "Evening (5pm-9pm)", value: stats.evening, color: COLORS.evening },
    { name: "Night (9pm-5am)", value: stats.night, color: COLORS.night },
  ].filter((item) => item.value > 0);

  const total = stats.morning + stats.afternoon + stats.evening + stats.night;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">⏰ Time of Day Analysis</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-4">
          {data.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="font-bold text-gray-900">
                    {item.value} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

