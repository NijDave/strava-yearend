"use client";

interface ActivityDetailHeaderProps {
  activity: any;
}

const activityIcons: Record<string, string> = {
  Run: "🏃", Ride: "🚴", Walk: "🚶", Hike: "🥾",
  Swim: "🏊", Workout: "💪", default: "🏃",
};

const activityColors: Record<string, string> = {
  Run: "#FF5500", Ride: "#00F5FF", Walk: "#AAFF00",
  Hike: "#FFD700", Swim: "#8B2FC9", Workout: "#E91E8C", default: "#FF5500",
};

export function ActivityDetailHeader({ activity }: ActivityDetailHeaderProps) {
  const icon = activityIcons[activity.type] || activityIcons.default;
  const color = activityColors[activity.type] || activityColors.default;

  // Handle both Strava API (start_date) and MongoDB (startDate)
  const dateStr = activity.startDate || activity.start_date;
  const date = dateStr ? new Date(dateStr) : new Date();
  
  const isValidDate = !isNaN(date.getTime());
  
  const formattedDate = isValidDate 
    ? date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Date Unknown";
    
  const formattedTime = isValidDate
    ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const activityId = activity.stravaId || activity.id;
  const city = activity.location?.city || activity.location_city;

  return (
    <div className="relative overflow-hidden" style={{ background: "#000", borderBottom: "1px solid rgba(255,85,0,0.3)" }}>
      {/* Orange left border accent */}
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />

      {/* Scanline overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />

      {/* Background glow blob */}
      <div className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, transform: "translateY(-40%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Back + Share row */}
        <div className="flex items-center justify-between mb-6">
          <a href="/dashboard"
            className="font-mono text-xs text-white/60 hover:text-neon-orange transition-colors flex items-center gap-2">
            <span>←</span> <span>BACK TO ACTIVITIES</span>
          </a>
          {activityId && (
            <a href={`https://www.strava.com/activities/${activityId}`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs px-4 py-2 text-white/70 hover:text-white transition-all flex items-center gap-2"
              style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              VIEW ON STRAVA
            </a>
          )}
        </div>

        {/* Type badge */}
        <div className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 mb-4"
          style={{ border: `1px solid ${color}60`, background: `${color}18`, color }}>
          <span>{icon}</span>
          <span className="uppercase tracking-widest">{activity.type}</span>
        </div>

        {/* Activity name */}
        <h1 className="font-bebas text-white mb-4"
          style={{
            fontSize: "clamp(2rem, 8vw, 4.5rem)",
            lineHeight: 1,
            letterSpacing: "0.04em",
            textShadow: `0 0 40px ${color}40`,
          }}>
          {activity.name}
        </h1>

        {/* Date / time / location */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-white/50">
          <span>📅 {formattedDate}</span>
          <span>🕐 {formattedTime}</span>
          {city && <span>📍 {city}</span>}
        </div>
      </div>
    </div>
  );
}
