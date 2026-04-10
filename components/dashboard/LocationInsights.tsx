"use client";

import { useEffect, useState, useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";

interface GpsActivity {
  _id: string;
  type: string;
  name: string;
  startDate: string;
  startLatlng: [number, number];
}

interface LocationInsightsProps {
  gpsActivities: GpsActivity[];
  year: number;
}

interface PlaceResult {
  city: string;
  country: string;
  countryCode: string;
}

interface CityEntry {
  city: string;
  country: string;
  flag: string;
  count: number;
  firstDate: string;
}

interface CountryEntry {
  country: string;
  flag: string;
  count: number;
}

interface TimelineEntry {
  _id: string;
  city: string;
  country: string;
  flag: string;
  activityName: string;
  startDate: string;
  type: string;
}

const CACHE_KEY = "geocache_v1";
const ACTIVITY_ICONS: Record<string, string> = {
  Run: "🏃", Ride: "🚴", Walk: "🚶", Hike: "🥾",
  Swim: "🏊", Workout: "💪", default: "🏃",
};

// Sleep utility for rate limiting
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Country code → flag emoji
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return code.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join("");
}

// Load/save geocache from localStorage
function loadCache(): Record<string, PlaceResult | null> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCache(cache: Record<string, PlaceResult | null>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

async function geocode(lat: number, lng: number): Promise<PlaceResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "Athlytic-Dashboard/1.0 (personal-fitness-app)",
          "Accept-Language": "en",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || "Unknown";
    const country = addr.country || "Unknown";
    const countryCode = addr.country_code?.toUpperCase() || "";
    return { city, country, countryCode };
  } catch {
    return null;
  }
}

export function LocationInsights({ gpsActivities, year }: LocationInsightsProps) {
  const [geocoded, setGeocoded] = useState<Map<string, PlaceResult | null>>(new Map());
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const abortRef = useRef(false);

  // Derived stats
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [uniqueCount, setUniqueCount] = useState(0);

  useEffect(() => {
    abortRef.current = false;
    runGeocoding();
    return () => { abortRef.current = true; };
  }, [year, gpsActivities.length]);

  const runGeocoding = async () => {
    setDone(false);
    setProgress(0);
    const cache = loadCache();
    const toFetch: GpsActivity[] = [];
    const preloaded = new Map<string, PlaceResult | null>();

    for (const act of gpsActivities) {
      const [lat, lng] = act.startLatlng;
      const key = cacheKey(lat, lng);
      if (cache[key] !== undefined) {
        preloaded.set(act._id, cache[key]);
      } else {
        toFetch.push(act);
      }
    }

    setTotal(toFetch.length);
    setGeocoded(new Map(preloaded));

    // Geocode uncached activities (1 req/sec Nominatim limit)
    for (let i = 0; i < toFetch.length; i++) {
      if (abortRef.current) break;
      const act = toFetch[i];
      const [lat, lng] = act.startLatlng;
      const key = cacheKey(lat, lng);

      const result = await geocode(lat, lng);
      cache[key] = result;
      preloaded.set(act._id, result);

      setProgress(i + 1);
      setGeocoded(new Map(preloaded));
      saveCache(cache);

      if (i < toFetch.length - 1) await sleep(1100); // 1.1s gap = safe rate limit
    }

    setDone(true);
    computeStats(preloaded);
  };

  const computeStats = (geoMap: Map<string, PlaceResult | null>) => {
    const cityMap: Record<string, { country: string; countryCode: string; count: number; firstDate: string }> = {};
    const countryMap: Record<string, { code: string; count: number }> = {};
    const uniquePlaces = new Set<string>();
    const tl: TimelineEntry[] = [];

    for (const act of gpsActivities) {
      const place = geoMap.get(act._id);
      if (!place || place.city === "Unknown") continue;

      const placeKey = `${place.city}|${place.country}`;
      uniquePlaces.add(placeKey);

      // Cities
      if (!cityMap[place.city]) {
        cityMap[place.city] = { country: place.country, countryCode: place.countryCode, count: 0, firstDate: act.startDate };
      }
      cityMap[place.city].count++;
      if (new Date(act.startDate) < new Date(cityMap[place.city].firstDate)) {
        cityMap[place.city].firstDate = act.startDate;
      }

      // Countries
      if (!countryMap[place.country]) {
        countryMap[place.country] = { code: place.countryCode, count: 0 };
      }
      countryMap[place.country].count++;

      // Timeline
      tl.push({
        _id: act._id,
        city: place.city,
        country: place.country,
        flag: countryFlag(place.countryCode),
        activityName: act.name,
        startDate: act.startDate,
        type: act.type,
      });
    }

    const topCities: CityEntry[] = Object.entries(cityMap)
      .map(([city, data]) => ({ city, country: data.country, flag: countryFlag(data.countryCode), count: data.count, firstDate: data.firstDate }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topCountries: CountryEntry[] = Object.entries(countryMap)
      .map(([country, data]) => ({ country, flag: countryFlag(data.code), count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const sortedTimeline = tl
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 20);

    setCities(topCities);
    setCountries(topCountries);
    setTimeline(sortedTimeline);
    setUniqueCount(uniquePlaces.size);
  };

  // Run stats computation also when geocoding updates come in (from cache)
  useEffect(() => {
    if (geocoded.size > 0) {
      computeStats(geocoded);
    }
  }, [geocoded.size]);

  const { ref: countRef, displayValue: countDisplay } = useCountUp({
    target: uniqueCount,
    duration: 1200,
    triggerOnView: true,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isGeocoding = !done && total > 0;
  const hasCachedData = cities.length > 0 || countries.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-neon-orange/60 to-transparent" />
        <div className="font-bebas text-xl text-neon-orange tracking-widest">LOCATION INTEL</div>
        <div className="h-px flex-1 bg-gradient-to-l from-neon-orange/60 to-transparent" />
      </div>

      {/* Geocoding progress bar */}
      {isGeocoding && (
        <div className="cyber-card p-4"
          style={{ border: "1px solid rgba(255,85,0,0.3)" }}>
          <div className="flex justify-between items-center mb-2">
            <div className="hud-label">GEOCODING LOCATIONS...</div>
            <div className="font-mono text-xs text-neon-orange">{progress}/{total}</div>
          </div>
          <div className="h-1.5 bg-black/60" style={{ border: "1px solid rgba(255,85,0,0.3)" }}>
            <div className="h-full bg-neon-orange"
              style={{
                width: total > 0 ? `${(progress / total) * 100}%` : "0%",
                boxShadow: "0 0 8px rgba(255,85,0,0.8)",
                transition: "width 0.5s ease",
              }} />
          </div>
          <p className="font-mono text-[10px] text-white/30 mt-2 uppercase tracking-widest">
            Rate limited to 1 req/sec · Results cache locally
          </p>
        </div>
      )}

      {/* No GPS data case */}
      {!hasCachedData && done && uniqueCount === 0 && (
        <div className="cyber-card p-8 text-center">
          <div className="font-bebas text-2xl text-white/30 mb-2">NO GPS DATA AVAILABLE</div>
          <p className="font-mono text-xs text-white/30">
            Activities with start GPS coordinates will appear here
          </p>
        </div>
      )}

      {hasCachedData && (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Unique locations counter */}
            <div className="relative cyber-card p-4 col-span-1"
              style={{ border: "1px solid rgba(255,85,0,0.3)" }}>
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-neon-orange/50" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-neon-orange/50" />
              <div className="hud-label mb-1">UNIQUE LOCATIONS</div>
              <div ref={countRef as React.RefObject<HTMLDivElement>}
                className="font-bebas text-4xl text-neon-orange"
                style={{ textShadow: "0 0 20px rgba(255,85,0,0.6)" }}>
                {countDisplay}
              </div>
            </div>

            <div className="relative cyber-card p-4"
              style={{ border: "1px solid rgba(233,30,140,0.3)" }}>
              <div className="hud-label mb-1">TOP COUNTRY</div>
              <div className="font-bebas text-2xl text-neon-magenta">
                {countries[0] ? `${countries[0].flag} ${countries[0].country}` : "—"}
              </div>
              {countries[0] && (
                <div className="font-mono text-xs text-white/40 mt-1">{countries[0].count} activities</div>
              )}
            </div>

            <div className="relative cyber-card p-4"
              style={{ border: "1px solid rgba(139,47,201,0.3)" }}>
              <div className="hud-label mb-1">TOP CITY</div>
              <div className="font-bebas text-2xl" style={{ color: "#8B2FC9" }}>
                {cities[0] ? cities[0].city : "—"}
              </div>
              {cities[0] && (
                <div className="font-mono text-xs text-white/40 mt-1">{cities[0].count} activities</div>
              )}
            </div>
          </div>

          {/* Top cities + countries grid */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Top Cities */}
            <div className="cyber-card p-4">
              <div className="hud-label mb-4">// TOP CITIES</div>
              <div className="space-y-2">
                {cities.map((city, i) => (
                  <div key={city.city} className="flex items-center gap-3 py-1.5"
                    style={{ borderBottom: "1px solid rgba(255,85,0,0.1)" }}>
                    <span className="font-mono text-xs text-white/30 w-4">{i + 1}</span>
                    <span className="text-base">{city.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-white truncate">{city.city}</div>
                      <div className="font-mono text-[10px] text-white/30">{city.country}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bebas text-lg text-neon-orange">{city.count}</div>
                      <div className="font-mono text-[10px] text-white/30">acts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="cyber-card p-4">
              <div className="hud-label mb-4">// TOP COUNTRIES</div>
              <div className="space-y-3">
                {countries.map((country, i) => {
                  const maxCount = countries[0]?.count || 1;
                  const pct = (country.count / maxCount) * 100;
                  return (
                    <div key={country.country} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="font-mono text-sm text-white/80">{country.country}</span>
                        </div>
                        <span className="font-bebas text-lg text-neon-orange">{country.count}</span>
                      </div>
                      <div className="h-1 bg-black/60" style={{ border: "1px solid rgba(255,85,0,0.2)" }}>
                        <div className="h-full bg-neon-orange"
                          style={{ width: `${pct}%`, boxShadow: "0 0 6px rgba(255,85,0,0.6)", transition: "width 1s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location timeline */}
          {timeline.length > 0 && (
            <div className="cyber-card p-4">
              <div className="hud-label mb-4">// RECENT LOCATIONS</div>
              <div className="space-y-1 max-h-80 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#FF5500 #000" }}>
                {timeline.map((entry) => (
                  <div key={entry._id} className="flex items-center gap-3 py-2 px-2 group transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,85,0,0.08)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.05)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {/* Location pin icon */}
                    <span className="text-neon-orange text-sm flex-shrink-0">📍</span>

                    {/* Flag */}
                    <span className="text-base flex-shrink-0">{entry.flag}</span>

                    {/* City + activity name */}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-white/80 truncate">{entry.city}</div>
                      <div className="font-mono text-[10px] text-white/35 truncate">{entry.activityName}</div>
                    </div>

                    {/* Activity type icon */}
                    <span className="text-sm flex-shrink-0">
                      {ACTIVITY_ICONS[entry.type] || ACTIVITY_ICONS.default}
                    </span>

                    {/* Date */}
                    <div className="font-mono text-[10px] text-white/40 flex-shrink-0">
                      {formatDate(entry.startDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
