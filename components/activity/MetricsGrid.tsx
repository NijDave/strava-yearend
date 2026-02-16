"use client";

interface MetricsGridProps {
    activity: any;
    streams: any;
}

interface MetricCardProps {
    icon: string;
    label: string;
    value: string;
    subValue?: string;
    gradient: string;
    delay?: string;
}

function MetricCard({ icon, label, value, subValue, gradient, delay = "" }: MetricCardProps) {
    return (
        <div className={`glass rounded-xl p-6 hover-lift transition-smooth animate-scale-in ${delay}`}>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subValue && <div className="text-sm text-gray-500 mt-1">{subValue}</div>}
        </div>
    );
}

export function MetricsGrid({ activity, streams }: MetricsGridProps) {
    // Helper functions
    const formatDistance = (meters: number) => {
        const km = meters / 1000;
        return `${km.toFixed(2)} km`;
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    };

    const formatPace = (metersPerSecond: number) => {
        if (!metersPerSecond || metersPerSecond === 0) return "N/A";
        const secondsPerKm = 1000 / metersPerSecond;
        const minutes = Math.floor(secondsPerKm / 60);
        const seconds = Math.floor(secondsPerKm % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
    };

    const formatSpeed = (metersPerSecond: number) => {
        if (!metersPerSecond || metersPerSecond === 0) return "N/A";
        const kmPerHour = metersPerSecond * 3.6;
        return `${kmPerHour.toFixed(1)} km/h`;
    };

    const formatSwimPace = (metersPerSecond: number) => {
        if (!metersPerSecond || metersPerSecond === 0) return "N/A";
        const secondsPer100m = 100 / metersPerSecond;
        const minutes = Math.floor(secondsPer100m / 60);
        const seconds = Math.floor(secondsPer100m % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")} /100m`;
    };

    const calculateCalories = () => {
        if (activity.calories) return activity.calories;
        // Rough estimate: 1 calorie per kg per km for running
        const km = activity.distance / 1000;
        return Math.round(km * 65); // Assuming average 65kg
    };

    const calculateSteps = () => {
        if (activity.type === "Run" || activity.type === "Walk" || activity.type === "Hike") {
            // Rough estimate: 1250 steps per km
            const km = activity.distance / 1000;
            return Math.round(km * 1250);
        }
        return null;
    };

    const getAverageHeartRate = () => {
        if (streams?.heartrate?.data) {
            const hrData = streams.heartrate.data;
            const sum = hrData.reduce((a: number, b: number) => a + b, 0);
            return Math.round(sum / hrData.length);
        }
        return activity.average_heartrate || null;
    };

    const getMaxHeartRate = () => {
        if (streams?.heartrate?.data) {
            return Math.max(...streams.heartrate.data);
        }
        return activity.max_heartrate || null;
    };

    const getAverageCadence = () => {
        if (streams?.cadence?.data) {
            const cadenceData = streams.cadence.data.filter((c: number) => c > 0);
            if (cadenceData.length > 0) {
                const sum = cadenceData.reduce((a: number, b: number) => a + b, 0);
                return Math.round(sum / cadenceData.length);
            }
        }
        return activity.average_cadence || null;
    };

    const getBestPace = () => {
        if (streams?.velocity_smooth?.data) {
            const maxSpeed = Math.max(...streams.velocity_smooth.data);
            if (activity.type === "Run" || activity.type === "Walk" || activity.type === "Hike") {
                return formatPace(maxSpeed);
            } else if (activity.type === "Swim") {
                return formatSwimPace(maxSpeed);
            } else {
                return formatSpeed(maxSpeed);
            }
        }
        return null;
    };

    // Determine if activity uses pace or speed
    const usesPace = ["Run", "Walk", "Hike"].includes(activity.type);
    const isSwim = activity.type === "Swim";
    const usesSpeed = ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type);

    // Activities that don't use pace or speed (court sports, gym activities, etc.)
    const noPaceActivities = ["Badminton", "Tennis", "Squash", "TableTennis", "Workout", "WeightTraining", "Yoga", "Crossfit"];
    const showsPaceOrSpeed = !noPaceActivities.includes(activity.type);

    const avgHR = getAverageHeartRate();
    const maxHR = getMaxHeartRate();
    const avgCadence = getAverageCadence();
    const calories = calculateCalories();
    const steps = calculateSteps();
    const bestPace = getBestPace();

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Activity Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <MetricCard
                    icon="📏"
                    label="Distance"
                    value={formatDistance(activity.distance)}
                    gradient="from-blue-500 to-cyan-500"
                />

                <MetricCard
                    icon="⏱️"
                    label="Moving Time"
                    value={formatTime(activity.moving_time)}
                    gradient="from-green-500 to-emerald-500"
                    delay="stagger-1"
                />

                <MetricCard
                    icon="⏳"
                    label="Elapsed Time"
                    value={formatTime(activity.elapsed_time)}
                    gradient="from-purple-500 to-pink-500"
                    delay="stagger-2"
                />

                <MetricCard
                    icon="⛰️"
                    label="Elevation Gain"
                    value={`${Math.round(activity.total_elevation_gain || 0)} m`}
                    gradient="from-amber-500 to-orange-500"
                    delay="stagger-3"
                />

                {calories && (
                    <MetricCard
                        icon="🔥"
                        label="Calories"
                        value={`${calories} kcal`}
                        gradient="from-red-500 to-pink-500"
                        delay="stagger-4"
                    />
                )}

                {avgHR && (
                    <MetricCard
                        icon="❤️"
                        label="Average Heart Rate"
                        value={`${avgHR} bpm`}
                        subValue={maxHR ? `Max: ${maxHR} bpm` : undefined}
                        gradient="from-rose-500 to-red-500"
                        delay="stagger-5"
                    />
                )}

                {/* Activity-specific pace/speed metric - only for activities where it makes sense */}
                {showsPaceOrSpeed && usesPace && (
                    <MetricCard
                        icon="⚡"
                        label="Average Pace"
                        value={formatPace(activity.average_speed)}
                        subValue={bestPace ? `Best: ${bestPace}` : undefined}
                        gradient="from-indigo-500 to-blue-500"
                    />
                )}

                {showsPaceOrSpeed && isSwim && (
                    <MetricCard
                        icon="🏊"
                        label="Average Pace"
                        value={formatSwimPace(activity.average_speed)}
                        subValue={bestPace ? `Best: ${bestPace}` : undefined}
                        gradient="from-blue-600 to-cyan-600"
                    />
                )}

                {showsPaceOrSpeed && usesSpeed && (
                    <MetricCard
                        icon="🚴"
                        label="Average Speed"
                        value={formatSpeed(activity.average_speed)}
                        subValue={bestPace ? `Max: ${bestPace}` : undefined}
                        gradient="from-green-500 to-teal-500"
                    />
                )}

                {avgCadence && (
                    <MetricCard
                        icon="👟"
                        label="Average Cadence"
                        value={`${avgCadence} spm`}
                        gradient="from-teal-500 to-cyan-500"
                        delay="stagger-1"
                    />
                )}

                {steps && (
                    <MetricCard
                        icon="🚶"
                        label="Estimated Steps"
                        value={steps.toLocaleString()}
                        gradient="from-violet-500 to-purple-500"
                        delay="stagger-2"
                    />
                )}

                {activity.average_watts && (
                    <MetricCard
                        icon="⚡"
                        label="Average Power"
                        value={`${Math.round(activity.average_watts)} W`}
                        gradient="from-yellow-500 to-amber-500"
                        delay="stagger-3"
                    />
                )}

                {activity.average_temp && (
                    <MetricCard
                        icon="🌡️"
                        label="Temperature"
                        value={`${Math.round(activity.average_temp)}°C`}
                        gradient="from-orange-400 to-red-400"
                        delay="stagger-4"
                    />
                )}
            </div>
        </div>
    );
}
