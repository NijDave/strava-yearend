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
  accentColor?: string;
  index?: number;
}

function MetricCard({ icon, label, value, subValue, accentColor = "#FF5500", index = 0 }: MetricCardProps) {
  return (
    <div
      className="relative p-4 sm:p-5 group transition-all duration-300"
      style={{
        background: "#080808",
        border: `1px solid ${accentColor}40`,
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = accentColor;
        el.style.boxShadow = `0 0 20px ${accentColor}20, inset 0 0 20px ${accentColor}08`;
        el.style.background = `${accentColor}08`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${accentColor}40`;
        el.style.boxShadow = "none";
        el.style.background = "#080808";
      }}
    >
      {/* Reticle corners */}
      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l" style={{ borderColor: accentColor }} />
      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r" style={{ borderColor: accentColor }} />

      {/* Content */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      </div>

      {/* Value */}
      <div className="font-bebas leading-none mt-1"
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          color: accentColor,
          textShadow: `0 0 16px ${accentColor}60`,
        }}>
        {value}
      </div>

      {subValue && (
        <div className="font-mono text-[10px] text-white/30 mt-1 line-clamp-1">{subValue}</div>
      )}
    </div>
  );
}

export function MetricsGrid({ activity, streams }: MetricsGridProps) {
  const formatDistance = (m: number) => `${(m / 1000).toFixed(2)} km`;

  const formatTime = (seconds: number) => {
    if (!seconds) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatPace = (mps: number) => {
    if (!mps || mps === 0) return "N/A";
    const spk = 1000 / mps;
    return `${Math.floor(spk / 60)}:${Math.floor(spk % 60).toString().padStart(2, "0")} /km`;
  };

  const formatSpeed = (mps: number) =>
    (!mps || mps === 0) ? "N/A" : `${(mps * 3.6).toFixed(1)} km/h`;

  const formatSwimPace = (mps: number) => {
    if (!mps || mps === 0) return "N/A";
    const s100 = 100 / mps;
    return `${Math.floor(s100 / 60)}:${Math.floor(s100 % 60).toString().padStart(2, "0")} /100m`;
  };

  // Naming fallbacks (Strava API vs MongoDB camelCase)
  const movingTime = activity.movingTime ?? activity.moving_time ?? 0;
  const elapsedTime = activity.elapsedTime ?? activity.elapsed_time ?? 0;
  const elevationGain = activity.totalElevationGain ?? activity.total_elevation_gain ?? 0;
  const avgSpeed = activity.averageSpeed ?? activity.average_speed ?? 0;
  const maxSpeed = activity.max_speed ?? 0;

  const avgHR = streams?.heartrate?.data
    ? Math.round(streams.heartrate.data.reduce((a: number, b: number) => a + b, 0) / streams.heartrate.data.length)
    : (activity.averageHeartrate || activity.average_heartrate || null);

  const maxHR = streams?.heartrate?.data
    ? Math.max(...streams.heartrate.data)
    : (activity.maxHeartrate || activity.max_heartrate || null);

  const avgCadence = (() => {
    if (streams?.cadence?.data) {
      const cd = streams.cadence.data.filter((c: number) => c > 0);
      if (cd.length > 0) return Math.round(cd.reduce((a: number, b: number) => a + b, 0) / cd.length);
    }
    return activity.averageCadence || activity.average_cadence || null;
  })();

  const bestPace = (() => {
    if (!streams?.velocity_smooth?.data && !maxSpeed) return null;
    const mx = streams?.velocity_smooth?.data ? Math.max(...streams.velocity_smooth.data) : maxSpeed;
    if (["Run", "Walk", "Hike"].includes(activity.type)) return formatPace(mx);
    if (activity.type === "Swim") return formatSwimPace(mx);
    return formatSpeed(mx);
  })();

  const calories = activity.calories || (activity.distance ? Math.round((activity.distance / 1000) * 65) : 0);
  const steps = ["Run", "Walk", "Hike"].includes(activity.type) && activity.distance
    ? Math.round((activity.distance / 1000) * 1250) : null;

  const usesPace = ["Run", "Walk", "Hike"].includes(activity.type);
  const isSwim = activity.type === "Swim";
  const usesSpeed = ["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(activity.type);
  const noPace = ["Badminton", "Tennis", "Squash", "TableTennis", "Workout", "WeightTraining", "Yoga", "Crossfit"];
  const showPaceOrSpeed = !noPace.includes(activity.type);

  // Color by activity type
  const typeColor: Record<string, string> = {
    Run: "#FF5500", Ride: "#00F5FF", Walk: "#AAFF00",
    Hike: "#FFD700", Swim: "#8B2FC9", Workout: "#E91E8C", default: "#FF5500",
  };
  const ac = typeColor[activity.type] || typeColor.default;

  const cards: MetricCardProps[] = [
    { icon: "📏", label: "Distance", value: formatDistance(activity.distance), accentColor: ac },
    { icon: "⏱️", label: "Moving Time", value: formatTime(movingTime), accentColor: "#E91E8C" },
    { icon: "⏳", label: "Elapsed Time", value: formatTime(elapsedTime), accentColor: "#8B2FC9" },
    { icon: "⛰️", label: "Elevation Gain", value: `${Math.round(elevationGain)} m`, accentColor: "#FFD700" },
  ];

  if (calories) cards.push({ icon: "🔥", label: "Calories", value: `${calories} kcal`, accentColor: "#FF1744" });
  if (avgHR) cards.push({ icon: "❤️", label: "Avg Heart Rate", value: `${avgHR} bpm`, subValue: maxHR ? `Max: ${maxHR} bpm` : undefined, accentColor: "#FF1744" });
  if (showPaceOrSpeed && usesPace) cards.push({ icon: "⚡", label: "Avg Pace", value: formatPace(avgSpeed), subValue: bestPace ? `Best: ${bestPace}` : undefined, accentColor: ac });
  if (showPaceOrSpeed && isSwim) cards.push({ icon: "🏊", label: "Avg Pace", value: formatSwimPace(avgSpeed), subValue: bestPace ? `Best: ${bestPace}` : undefined, accentColor: "#8B2FC9" });
  if (showPaceOrSpeed && usesSpeed) cards.push({ icon: "🚴", label: "Avg Speed", value: formatSpeed(avgSpeed), subValue: bestPace ? `Max: ${bestPace}` : undefined, accentColor: "#00F5FF" });
  if (avgCadence) cards.push({ icon: "👟", label: "Avg Cadence", value: `${avgCadence} spm`, accentColor: "#00F5FF" });
  if (steps) cards.push({ icon: "🚶", label: "Est. Steps", value: steps.toLocaleString(), accentColor: "#AAFF00" });
  
  const watts = activity.averageWatts || activity.average_watts;
  if (watts) cards.push({ icon: "⚡", label: "Avg Power", value: `${Math.round(watts)} W`, accentColor: "#FFD700" });
  
  const temp = activity.averageTemp || activity.average_temp;
  if (temp) cards.push({ icon: "🌡️", label: "Temperature", value: `${Math.round(temp)}°C`, accentColor: "#FF5500" });

  return (
    <div>
      <div className="hud-label mb-4">// PERFORMANCE METRICS</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => (
          <MetricCard key={card.label} {...card} index={i} />
        ))}
      </div>
    </div>
  );
}
