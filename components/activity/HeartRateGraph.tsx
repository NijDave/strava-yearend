"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface HeartRateGraphProps {
    streams: any;
    activity: any;
}

export function HeartRateGraph({ streams, activity }: HeartRateGraphProps) {
    if (!streams?.heartrate?.data || !streams?.time?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
                <div className="text-center">
                    <div className="text-4xl mb-4 opacity-30">❤️</div>
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

    const avgHR = Math.round(
        streams.heartrate.data.reduce((a: number, b: number) => a + b, 0) / streams.heartrate.data.length
    );
    const maxHR = Math.max(...streams.heartrate.data);
    const estimatedMaxHR = activity.max_heartrate || maxHR || 190;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const hr = payload[0].value;

            return (
                <div className="bg-black/90 border border-white/10 p-3 shadow-2xl backdrop-blur-md">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        {payload[0].payload.time} min
                    </p>
                    <p className="font-bebas text-xl text-neon-orange tracking-wider">
                        HR: {hr} <span className="text-xs text-white/50">bpm</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Average</span>
                    <span className="font-bebas text-2xl text-neon-orange">{avgHR} <span className="text-xs opacity-50">bpm</span></span>
                </div>
                <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Maximum</span>
                    <span className="font-bebas text-2xl text-white">{maxHR} <span className="text-xs opacity-50">bpm</span></span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5500" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#FF5500" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(255,255,255,0.05)" 
                        vertical={false} 
                    />
                    <XAxis
                        dataKey="time"
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: "DISTANCE (min)", position: "insideBottom", offset: -10, fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace", tracking: "2px" }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.1)"
                        tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        domain={[activity.min_heartrate || 'dataMin - 10', estimatedMaxHR + 10]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF5500', strokeWidth: 1 }} />

                    {/* Average HR line */}
                    <ReferenceLine
                        y={avgHR}
                        stroke="rgba(255,85,0,0.3)"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        label={{ value: `AVG HR: ${avgHR}`, fill: "#FF5500", fontSize: 9, fontFamily: 'monospace', position: 'insideBottomRight', offset: 10 }}
                    />

                    <Area
                        type="monotone"
                        dataKey="heartrate"
                        stroke="#FF5500"
                        strokeWidth={2}
                        fill="url(#hrGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#FF5500', stroke: '#000', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
