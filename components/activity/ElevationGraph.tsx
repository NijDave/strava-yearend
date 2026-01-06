"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ElevationGraphProps {
    streams: any;
    activity: any;
}

export function ElevationGraph({ streams, activity }: ElevationGraphProps) {
    if (!streams?.altitude?.data || !streams?.distance?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">⛰️</div>
                    <p>No elevation data available</p>
                </div>
            </div>
        );
    }

    // Prepare data
    const data = streams.altitude.data.map((elevation: number, index: number) => ({
        distance: (streams.distance.data[index] / 1000).toFixed(2), // Convert to km
        elevation: Math.round(elevation),
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">
                        {payload[0].payload.distance} km
                    </p>
                    <p className="text-sm text-gray-600">
                        Elevation: <span className="font-bold text-green-600">{payload[0].value} m</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="distance"
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        label={{ value: "Distance (km)", position: "insideBottom", offset: -5, fill: "#374151" }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        label={{ value: "Elevation (m)", angle: -90, position: "insideLeft", fill: "#374151" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#059669"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#elevationGradient)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
