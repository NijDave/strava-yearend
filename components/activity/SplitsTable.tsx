"use client";

interface SplitsTableProps {
    splits: any[];
}

export function SplitsTable({ splits }: SplitsTableProps) {
    if (!splits || splits.length === 0) {
        return null;
    }

    // Helper to format pace
    const formatPace = (metersPerSecond: number) => {
        if (!metersPerSecond || metersPerSecond === 0) return "N/A";
        const secondsPerKm = 1000 / metersPerSecond;
        const minutes = Math.floor(secondsPerKm / 60);
        const seconds = Math.floor(secondsPerKm % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Helper to format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Find fastest split
    const fastestSplitIndex = splits.reduce((fastestIdx, split, idx) => {
        if (!splits[fastestIdx].average_speed || split.average_speed > splits[fastestIdx].average_speed) {
            return idx;
        }
        return fastestIdx;
    }, 0);

    return (
        <div className="glass rounded-2xl p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Split Times
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Split</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Distance</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Time</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Pace</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Elevation</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg HR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {splits.map((split, index) => {
                            const isFastest = index === fastestSplitIndex;
                            return (
                                <tr
                                    key={index}
                                    className={`
                    border-b border-gray-100 transition-smooth hover:bg-gray-50
                    ${isFastest ? "bg-green-50 hover:bg-green-100" : ""}
                  `}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{index + 1}</span>
                                            {isFastest && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                                    Fastest
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-right py-3 px-4 text-gray-700">
                                        {(split.distance / 1000).toFixed(2)} km
                                    </td>
                                    <td className="text-right py-3 px-4 font-mono text-gray-700">
                                        {formatTime(split.moving_time || split.elapsed_time)}
                                    </td>
                                    <td className="text-right py-3 px-4 font-mono text-gray-700">
                                        {formatPace(split.average_speed)}
                                    </td>
                                    <td className="text-right py-3 px-4 text-gray-700">
                                        {split.elevation_difference ? `${Math.round(split.elevation_difference)} m` : "-"}
                                    </td>
                                    <td className="text-right py-3 px-4 text-gray-700">
                                        {split.average_heartrate ? `${Math.round(split.average_heartrate)} bpm` : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Splits</div>
                    <div className="text-2xl font-bold text-gray-900">{splits.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Fastest Pace</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatPace(splits[fastestSplitIndex].average_speed)}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Avg Pace</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatPace(
                            splits.reduce((sum, s) => sum + (s.average_speed || 0), 0) / splits.length
                        )}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Elevation</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {Math.round(
                            splits.reduce((sum, s) => sum + (s.elevation_difference || 0), 0)
                        )} m
                    </div>
                </div>
            </div>
        </div>
    );
}
