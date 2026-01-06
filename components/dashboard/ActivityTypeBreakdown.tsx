"use client";

import { formatDistance } from "@/lib/utils";
import { ActivityTypeBreakdown as ActivityTypeBreakdownType } from "@/lib/statistics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ActivityTypeBreakdownProps {
  breakdown: ActivityTypeBreakdownType[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

export function ActivityTypeBreakdown({ breakdown }: ActivityTypeBreakdownProps) {
  const chartData = breakdown.map((item) => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage.toFixed(1),
    icon: item.icon,
  }));

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Types</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{item.type}</div>
                  <div className="text-sm text-gray-600">
                    {item.count} activities • {formatDistance(item.distance)}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

