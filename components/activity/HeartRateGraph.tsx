"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface HeartRateGraphProps {
    streams: any;
    activity: any;
}

export function HeartRateGraph({ streams, activity }: HeartRateGraphProps) {
    if (!streams?.heartrate?.data || !streams?.time?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">❤️</div>
                    <p>No heart rate data available</p>
                </div>
            </div>
        );
    }

    // Prepare data
    const data = streams.heartrate.data.map((hr: number, index: number) => ({
        time: (streams.time.data[index] / 60).toFixed(1), // Convert to minutes
        heartrate: hr,
    }));

    // Calculate average and max HR
    const avgHR = Math.round(
        streams.heartrate.data.reduce((a: number, b: number) => a + b, 0) / streams.heartrate.data.length
    );
    const maxHR = Math.max(...streams.heartrate.data);

    // HR Zones (assuming max HR of 190 for visualization)
    const estimatedMaxHR = activity.max_heartrate || maxHR || 190;
    const zones = [
        { name: "Zone 1", min: 0, max: estimatedMaxHR * 0.6, color: "#9ca3af" },
        { name: "Zone 2", min: estimatedMaxHR * 0.6, max: estimatedMaxHR * 0.7, color: "#60a5fa" },
        { name: "Zone 3", min: estimatedMaxHR * 0.7, max: estimatedMaxHR * 0.8, color: "#34d399" },
        { name: "Zone 4", min: estimatedMaxHR * 0.8, max: estimatedMaxHR * 0.9, color: "#fb923c" },
        { name: "Zone 5", min: estimatedMaxHR * 0.9, max: estimatedMaxHR, color: "#ef4444" },
    ];

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const hr = payload[0].value;
            const zone = zones.find(z => hr >= z.min && hr <= z.max);

            return (
                <div className="glass rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">
                        {payload[0].payload.time} min
                    </p>
                    <p className="text-sm text-gray-600">
                        HR: <span className="font-bold text-red-600">{hr} bpm</span>
                    </p>
                    {zone && (
                        <p className="text-xs text-gray-500 mt-1">{zone.name}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Average: <span className="font-bold text-gray-900">{avgHR} bpm</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-700"></div>
                    <span className="text-gray-600">Max: <span className="font-bold text-gray-900">{maxHR} bpm</span></span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        label={{ value: "Time (min)", position: "insideBottom", offset: -5, fill: "#374151" }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        label={{ value: "Heart Rate (bpm)", angle: -90, position: "insideLeft", fill: "#374151" }}
                        domain={[0, estimatedMaxHR + 10]}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Average HR line */}
                    <ReferenceLine
                        y={avgHR}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: `Avg: ${avgHR}`, fill: "#ef4444", fontSize: 12 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="heartrate"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* HR Zones Legend */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs">
                {zones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }}></div>
                        <span className="text-gray-600">{zone.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
