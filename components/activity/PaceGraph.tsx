"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PaceGraphProps {
    streams: any;
    activity: any;
}

export function PaceGraph({ streams, activity }: PaceGraphProps) {
    if (!streams?.velocity_smooth?.data || !streams?.distance?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <p>No pace data available</p>
                </div>
            </div>
        );
    }

    // Helper to convert m/s to min/km
    const metersPerSecondToMinPerKm = (mps: number) => {
        if (mps === 0) return 0;
        return 1000 / (mps * 60); // minutes per km
    };

    // Helper to format pace
    const formatPace = (minPerKm: number) => {
        const minutes = Math.floor(minPerKm);
        const seconds = Math.round((minPerKm - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Prepare data
    const data = streams.velocity_smooth.data.map((speed: number, index: number) => {
        const pace = metersPerSecondToMinPerKm(speed);
        return {
            distance: (streams.distance.data[index] / 1000).toFixed(2), // km
            pace: pace > 0 && pace < 20 ? pace : null, // Filter out unrealistic paces
            paceDisplay: pace > 0 && pace < 20 ? formatPace(pace) : "N/A",
        };
    }).filter((d: any) => d.pace !== null);

    // Calculate average pace
    const avgPace = metersPerSecondToMinPerKm(activity.average_speed);
    const bestPace = Math.min(...data.map((d: any) => d.pace));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">
                        {payload[0].payload.distance} km
                    </p>
                    <p className="text-sm text-gray-600">
                        Pace: <span className="font-bold text-indigo-600">{payload[0].payload.paceDisplay} /km</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-gray-600">Average: <span className="font-bold text-gray-900">{formatPace(avgPace)} /km</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Best: <span className="font-bold text-gray-900">{formatPace(bestPace)} /km</span></span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
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
                        label={{ value: "Pace (min/km)", angle: -90, position: "insideLeft", fill: "#374151" }}
                        reversed={true} // Faster pace (lower number) at top
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Average pace line */}
                    <ReferenceLine
                        y={avgPace}
                        stroke="#6366f1"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: `Avg: ${formatPace(avgPace)}`, fill: "#6366f1", fontSize: 12 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="pace"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 text-xs text-gray-500 italic">
                * Lower values indicate faster pace
            </div>
        </div>
    );
}
