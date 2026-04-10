"use client";

export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatPace(meters: number, seconds: number): string {
  if (!meters || !seconds) return "—";
  const secondsPerKm = (seconds / meters) * 1000;
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}H ${m}M`;
  return `${m}M`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

export function formatSpeed(meters: number, seconds: number): string {
  if (!meters || !seconds) return "—";
  const kmvh = (meters / seconds) * 3.6;
  return `${kmvh.toFixed(1)} km/h`;
}

export function getOverlayStats(activity: any) {
  const type = activity.type;
  const d = activity.distance;
  const t = activity.movingTime || activity.moving_time;
  const e = activity.totalElevationGain || activity.total_elevation_gain;

  const gymTypes = ["Workout", "WeightTraining", "Yoga", "Crossfit", "Badminton", "Tennis", "Squash", "TableTennis"];

  if (gymTypes.includes(type)) {
    return [{ label: "Time", value: formatDuration(t) }];
  }

  if (["Ride", "VirtualRide", "EBikeRide", "Bike"].includes(type)) {
    return [
      { label: "Distance", value: formatDistance(d) },
      { label: "Elev Gain", value: e ? formatElevation(e) : "—" },
      { label: "Time", value: formatDuration(t) },
    ];
  }

  if (type === "Swim") {
    return [
      { label: "Distance", value: formatDistance(d) },
      { label: "Time", value: formatDuration(t) },
    ];
  }

  // Run, Hike, Walk, etc.
  return [
    { label: "Distance", value: formatDistance(d) },
    { label: "Pace", value: formatPace(d, t) },
    { label: "Time", value: formatDuration(t) },
  ];
}
