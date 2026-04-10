"use client";

interface SplitsTableProps {
  splits: any[];
}

export function SplitsTable({ splits }: SplitsTableProps) {
  if (!splits || splits.length === 0) return null;

  const formatPace = (mps: number) => {
    if (!mps || mps === 0) return "—";
    const spk = 1000 / mps;
    return `${Math.floor(spk / 60)}:${Math.floor(spk % 60).toString().padStart(2, "0")}`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const fastestIdx = splits.reduce((fi, split, idx) => {
    if (!splits[fi].average_speed || split.average_speed > splits[fi].average_speed) return idx;
    return fi;
  }, 0);

  const headers = ["#", "DIST", "TIME", "PACE /km", "ELEV", "HR"];
  const headerClasses = ["text-left", "text-right", "text-right", "text-right", "text-right", "text-right"];

  return (
    <div className="cyber-card p-4 sm:p-6">
      <div className="hud-label mb-4">// SPLIT TIMES</div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,85,0,0.4)" }}>
              {headers.map((h, i) => (
                <th key={h}
                  className={`${headerClasses[i]} py-2 px-3 font-mono text-[10px] tracking-widest text-neon-orange uppercase`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {splits.map((split, index) => {
              const isFastest = index === fastestIdx;
              return (
                <tr key={index}
                  style={{
                    background: isFastest
                      ? "rgba(255,85,0,0.08)"
                      : index % 2 === 0 ? "#111" : "#0d0d0d",
                    borderBottom: "1px solid rgba(255,85,0,0.1)",
                    borderLeft: isFastest ? "2px solid #FF5500" : "2px solid transparent",
                  }}>
                  {/* # */}
                  <td className="text-left py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white/80">{index + 1}</span>
                      {isFastest && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-neon-orange px-1.5 py-0.5"
                          style={{ border: "1px solid rgba(255,85,0,0.6)", background: "rgba(255,85,0,0.1)" }}>
                          FASTEST
                        </span>
                      )}
                    </div>
                  </td>
                  {/* DIST */}
                  <td className="text-right py-2.5 px-3 font-mono text-sm text-white/70">
                    {(split.distance / 1000).toFixed(2)} km
                  </td>
                  {/* TIME */}
                  <td className="text-right py-2.5 px-3 font-mono text-sm text-white/70">
                    {formatTime(split.moving_time || split.elapsed_time)}
                  </td>
                  {/* PACE */}
                  <td className="text-right py-2.5 px-3 font-mono text-sm"
                    style={{ color: isFastest ? "#FF5500" : "rgba(255,255,255,0.7)" }}>
                    {formatPace(split.average_speed)}
                  </td>
                  {/* ELEV */}
                  <td className="text-right py-2.5 px-3 font-mono text-sm text-white/50">
                    {split.elevation_difference != null ? `${Math.round(split.elevation_difference)}m` : "—"}
                  </td>
                  {/* HR */}
                  <td className="text-right py-2.5 px-3 font-mono text-sm text-white/50">
                    {split.average_heartrate ? `${Math.round(split.average_heartrate)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,85,0,0.2)" }}>
        {[
          { label: "TOTAL SPLITS", value: splits.length.toString() },
          { label: "FASTEST PACE", value: formatPace(splits[fastestIdx].average_speed) },
          { label: "AVG PACE", value: formatPace(splits.reduce((s, sp) => s + (sp.average_speed || 0), 0) / splits.length) },
          { label: "TOTAL ELEV", value: `${Math.round(splits.reduce((s, sp) => s + (sp.elevation_difference || 0), 0))}m` },
        ].map((item, i) => (
          <div key={i} className="relative p-3" style={{ background: "#0a0a0a", border: "1px solid rgba(255,85,0,0.2)" }}>
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-neon-orange/30" />
            <div className="hud-label mb-1">{item.label}</div>
            <div className="font-bebas text-xl text-neon-orange">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
