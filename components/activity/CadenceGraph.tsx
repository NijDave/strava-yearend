"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface CadenceGraphProps {
    streams: any;
    activity: any;
}

export function CadenceGraph({ streams, activity }: CadenceGraphProps) {
    if (!streams?.cadence?.data || !streams?.time?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">👟</div>
                    <p>No cadence data available</p>
                </div>
            </div>
        );
    }

    // Prepare data (filter out zero values)
    const data = streams.cadence.data.map((cadence: number, index: number) => ({
        time: (streams.time.data[index] / 60).toFixed(1), // Convert to minutes
        cadence: cadence > 0 ? cadence : null,
    })).filter((d: any) => d.cadence !== null);

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="text-4xl mb-2">👟</div>
                    <p>No cadence data available</p>
                </div>
            </div>
        );
    }

    // Calculate average cadence
    const avgCadence = Math.round(
        data.reduce((sum: number, d: any) => sum + d.cadence, 0) / data.length
    );
    const maxCadence = Math.max(...data.map((d: any) => d.cadence));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">
                        {payload[0].payload.time} min
                    </p>
                    <p className="text-sm text-gray-600">
                        Cadence: <span className="font-bold text-teal-600">{payload[0].value} spm</span>
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
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-gray-600">Average: <span className="font-bold text-gray-900">{avgCadence} spm</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-gray-600">Max: <span className="font-bold text-gray-900">{maxCadence} spm</span></span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="cadenceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
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
                        label={{ value: "Cadence (spm)", angle: -90, position: "insideLeft", fill: "#374151" }}
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Average cadence line */}
                    <ReferenceLine
                        y={avgCadence}
                        stroke="#14b8a6"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: `Avg: ${avgCadence}`, fill: "#14b8a6", fontSize: 12 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="cadence"
                        stroke="#0d9488"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 text-xs text-gray-500">
                <p>* spm = steps per minute (for running) or rpm = revolutions per minute (for cycling)</p>
            </div>
        </div>
    );
}
