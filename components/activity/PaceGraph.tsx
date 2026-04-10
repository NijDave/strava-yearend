"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PaceGraphProps {
    streams: any;
    activity: any;
}

export function PaceGraph({ streams, activity }: PaceGraphProps) {
    if (!streams?.velocity_smooth?.data || !streams?.distance?.data) {
        return (
            <div className="h-[300px] flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
                <div className="text-center">
                    <div className="text-4xl mb-4 opacity-30">📊</div>
                    <p>No pace data available</p>
                </div>
            </div>
        );
    }

    const isRide = ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type);

    const metersPerSecondToMinPerKm = (mps: number) => {
        if (mps === 0) return 0;
        return 1000 / (mps * 60); // minutes per km
    };

    const metersPerSecondToKmh = (mps: number) => {
        return mps * 3.6; // km/h
    };

    const formatPace = (minPerKm: number) => {
        const minutes = Math.floor(minPerKm);
        const seconds = Math.round((minPerKm - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const formatSpeed = (kmh: number) => {
        return `${kmh.toFixed(1)}`;
    };

    // Prepare data
    const data = streams.velocity_smooth.data.map((speed: number, index: number) => {
        const pace = metersPerSecondToMinPerKm(speed);
        const kmh = metersPerSecondToKmh(speed);
        
        return {
            distance: (streams.distance.data[index] / 1000).toFixed(2), // km
            pace: pace > 0 && pace < 20 ? pace : null,
            speed: kmh > 0 && kmh < 120 ? kmh : null,
            displayValue: isRide 
                ? (kmh > 0 && kmh < 120 ? formatSpeed(kmh) : "N/A")
                : (pace > 0 && pace < 20 ? formatPace(pace) : "N/A"),
        };
    }).filter((d: any) => isRide ? d.speed !== null : d.pace !== null);

    const avgValue = isRide 
        ? metersPerSecondToKmh(activity.average_speed || 0)
        : metersPerSecondToMinPerKm(activity.average_speed || 0);

    const bestValue = isRide
        ? Math.max(...data.map((d: any) => d.speed))
        : Math.min(...data.map((d: any) => d.pace));

    const unit = isRide ? "km/h" : "/km";
    const metricName = isRide ? "Speed" : "Pace";
    const accentColor = isRide ? "#00F5FF" : "#8B2FC9";

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/10 p-3 shadow-2xl backdrop-blur-md">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        {payload[0].payload.distance} km
                    </p>
                    <p className="font-bebas text-xl tracking-wider" style={{ color: accentColor }}>
                        {metricName.toUpperCase()}: {payload[0].payload.displayValue} <span className="text-xs text-white/50">{unit}</span>
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
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Average {metricName}</span>
                    <span className="font-bebas text-2xl" style={{ color: accentColor }}>
                        {isRide ? formatSpeed(avgValue) : formatPace(avgValue)} <span className="text-xs opacity-50">{unit}</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Best {metricName}</span>
                    <span className="font-bebas text-2xl text-white">
                        {isRide ? formatSpeed(bestValue) : formatPace(bestValue)} <span className="text-xs opacity-50">{unit}</span>
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
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
                        reversed={!isRide}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: accentColor, strokeWidth: 1 }} />

                    <ReferenceLine
                        y={avgValue}
                        stroke={accentColor}
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        opacity={0.3}
                        label={{ value: `AVG: ${isRide ? formatSpeed(avgValue) : formatPace(avgValue)}`, fill: accentColor, fontSize: 9, fontFamily: 'monospace', position: 'insideBottomRight', offset: 10 }}
                    />

                    <Area
                        type="monotone"
                        dataKey={isRide ? "speed" : "pace"}
                        stroke={accentColor}
                        strokeWidth={2}
                        fill="url(#paceGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: accentColor, stroke: '#000', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
