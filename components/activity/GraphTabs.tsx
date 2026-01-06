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

    const tabs = [
        { id: "overview" as TabType, label: "Overview", icon: "📊", available: true },
        { id: "elevation" as TabType, label: "Elevation", icon: "⛰️", available: hasElevation },
        { id: "heartrate" as TabType, label: "Heart Rate", icon: "❤️", available: hasHeartRate },
        { id: "pace" as TabType, label: "Pace", icon: "⚡", available: hasPace },
        { id: "cadence" as TabType, label: "Cadence", icon: "👟", available: hasCadence },
    ].filter(tab => tab.available);

    return (
        <div className="glass rounded-2xl p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📈</span>
                Performance Graphs
            </h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-smooth
              ${activeTab === tab.id
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }
            `}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Graph Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-fade-in">
                        {hasElevation && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>⛰️</span> Elevation Profile
                                </h3>
                                <ElevationGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasHeartRate && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>❤️</span> Heart Rate
                                </h3>
                                <HeartRateGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasPace && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>⚡</span> Pace
                                </h3>
                                <PaceGraph streams={streams} activity={activity} />
                            </div>
                        )}
                        {hasCadence && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>👟</span> Cadence
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
