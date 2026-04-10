"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ElevationGraphProps {
    streams: any;
    activity: any;
}

export function ElevationGraph({ streams, activity }: ElevationGraphProps) {
    if (!streams?.altitude?.data || !streams?.distance?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
                <div className="text-center">
                    <div className="text-4xl mb-4 opacity-30">⛰️</div>
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

    const accentColor = "#10b981";

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/10 p-3 shadow-2xl backdrop-blur-md">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        {payload[0].payload.distance} km
                    </p>
                    <p className="font-bebas text-xl text-green-400 tracking-wider">
                        ELEVATION: {payload[0].value} <span className="text-xs text-white/50">m</span>
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
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.6} />
                            <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(255,255,255,0.05)" 
                        vertical={false} 
                    />
                    <XAxis
                        dataKey="distance"
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: "DISTANCE (km)", position: "insideBottom", offset: -10, fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace", tracking: "2px" }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: accentColor, strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke={accentColor}
                        strokeWidth={2}
                        fill="url(#elevationGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: accentColor, stroke: '#000', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
