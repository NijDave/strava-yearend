"use client";

import { useState } from "react";
import { ElevationGraph } from "./ElevationGraph";
import { HeartRateGraph } from "./HeartRateGraph";
import { PaceGraph } from "./PaceGraph";
import { CadenceGraph } from "./CadenceGraph";

interface GraphTabsProps {
    activity: any;
    streams: any;
}

type TabType = "elevation" | "heartrate" | "pace" | "cadence" | "overview";

export function GraphTabs({ activity, streams }: GraphTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    const hasElevation = streams?.altitude?.data && streams.altitude.data.length > 0;
    const hasHeartRate = streams?.heartrate?.data && streams.heartrate.data.length > 0;
    const hasPace = streams?.velocity_smooth?.data && streams.velocity_smooth.data.length > 0;
    const hasCadence = streams?.cadence?.data && streams.cadence.data.length > 0;

    const isRide = ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity?.type);
    const paceLabel = isRide ? "Speed" : "Pace";

    const tabs = [
        { id: "overview" as TabType, label: "Overview", icon: "📊", available: true },
        { id: "elevation" as TabType, label: "Elevation", icon: "⛰️", available: hasElevation },
        { id: "heartrate" as TabType, label: "Heart Rate", icon: "❤️", available: hasHeartRate },
        { id: "pace" as TabType, label: paceLabel, icon: "", available: hasPace }, // Removed icon
        { id: "cadence" as TabType, label: "Cadence", icon: "👟", available: hasCadence },
    ].filter(tab => tab.available);

    const accentColor = "#FF5500";

    return (
        <div className="rounded-2xl p-0 sm:p-6 animate-scale-in">
            <h2 className="text-2xl font-bebas tracking-[0.2em] mb-8 flex items-center gap-3" style={{ color: accentColor }}>
                <span className="text-3xl text-white opacity-40">📈</span>
                PERFORMANCE GRAPHS
            </h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-6 py-2.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] transition-all
                          ${activeTab === tab.id
                                ? "bg-neon-orange text-black border border-neon-orange"
                                : "bg-white/[0.03] text-white/50 border border-white/5 hover:bg-white/[0.08]"
                            }
                        `}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Graph Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="space-y-12 animate-fade-in">
                        {hasElevation && (
                            <div>
                                <h3 className="font-bebas text-lg tracking-widest mb-6 flex items-center gap-3" style={{ color: accentColor }}>
                                    <span className="opacity-40">⛰️</span> ELEVATION PROFILE
                                </h3>
                                <ElevationGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasHeartRate && (
                            <div>
                                <h3 className="font-bebas text-lg tracking-widest mb-6 flex items-center gap-3" style={{ color: accentColor }}>
                                    <span className="opacity-40">❤️</span> HEART RATE
                                </h3>
                                <HeartRateGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasPace && (
                            <div>
                                <h3 className="font-bebas text-lg tracking-widest mb-6 flex items-center gap-3" style={{ color: accentColor }}>
                                    <span className="opacity-40"></span> {paceLabel.toUpperCase()}
                                </h3>
                                <PaceGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasCadence && (
                            <div>
                                <h3 className="font-bebas text-lg tracking-widest mb-6 flex items-center gap-3" style={{ color: accentColor }}>
                                    <span className="opacity-40">👟</span> CADENCE
                                </h3>
                                <CadenceGraph streams={streams} activity={activity} />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "elevation" && hasElevation && (
                    <div className="animate-fade-in">
                        <ElevationGraph streams={streams} activity={activity} />
                    </div>
                )}

                {activeTab === "heartrate" && hasHeartRate && (
                    <div className="animate-fade-in">
                        <HeartRateGraph streams={streams} activity={activity} />
                    </div>
                )}

                {activeTab === "pace" && hasPace && (
                    <div className="animate-fade-in">
                        <PaceGraph streams={streams} activity={activity} />
                    </div>
                )}

                {activeTab === "cadence" && hasCadence && (
                    <div className="animate-fade-in">
                        <CadenceGraph streams={streams} activity={activity} />
                    </div>
                )}
            </div>
        </div>
    );
}
