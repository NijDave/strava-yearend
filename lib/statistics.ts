import { ActivityData } from "@/types";

export interface CoreSummary {
  totalActivities: number;
  totalDistance: number; // meters
  totalTime: number; // seconds
  totalElevation: number; // meters
  activeDays: number;
  averagePerWeek: {
    activities: number;
    distance: number;
    time: number;
  };
}

export interface ActivityTypeBreakdown {
  type: string;
  count: number;
  distance: number;
  percentage: number;
  icon: string;
}

export interface MonthlyStats {
  month: number;
  monthName: string;
  activities: number;
  distance: number;
  time: number;
  elevation: number;
}

export interface BestPerformances {
  longestActivity: ActivityData | null;
  longestRun: ActivityData | null;
  longestRide: ActivityData | null;
  highestElevation: ActivityData | null;
  fastestPace: ActivityData | null;
  mostActiveMonth: { month: number; count: number } | null;
  mostActiveDay: { date: string; count: number } | null;
}

export interface WeeklyInsights {
  averagePerWeek: number;
  longestStreak: number;
  mostCommonDay: { day: string; count: number } | null;
  mostCommonTime: { period: string; count: number } | null;
}

export interface TimeOfDayStats {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface LocationInsights {
  topCities: Array<{ city: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  totalLocations: number;
}

export function calculateCoreSummary(activities: ActivityData[]): CoreSummary {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      totalDistance: 0,
      totalTime: 0,
      totalElevation: 0,
      activeDays: 0,
      averagePerWeek: { activities: 0, distance: 0, time: 0 },
    };
  }

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.movingTime, 0);
  const totalElevation = activities.reduce(
    (sum, a) => sum + (a.totalElevationGain || 0),
    0
  );

  // Count unique active days
  const uniqueDays = new Set(
    activities.map((a) => {
      const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
      return date.toISOString().split("T")[0];
    })
  );

  // Calculate weeks in the year
  const dates = activities.map((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    return new Date(date);
  });
  const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const weeks = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1;

  return {
    totalActivities: activities.length,
    totalDistance,
    totalTime,
    totalElevation,
    activeDays: uniqueDays.size,
    averagePerWeek: {
      activities: activities.length / weeks,
      distance: totalDistance / weeks,
      time: totalTime / weeks,
    },
  };
}

export function calculateActivityTypeBreakdown(
  activities: ActivityData[]
): ActivityTypeBreakdown[] {
  const typeMap: Record<string, { count: number; distance: number }> = {};

  activities.forEach((activity) => {
    const type = activity.type;
    if (!typeMap[type]) {
      typeMap[type] = { count: 0, distance: 0 };
    }
    typeMap[type].count++;
    typeMap[type].distance += activity.distance;
  });

  const total = activities.length;
  const typeIcons: Record<string, string> = {
    Run: "🏃",
    Ride: "🚴",
    Walk: "🚶",
    Hike: "🥾",
    Swim: "🏊",
    Workout: "💪",
    default: "🏃",
  };

  return Object.entries(typeMap)
    .map(([type, data]) => ({
      type,
      count: data.count,
      distance: data.distance,
      percentage: (data.count / total) * 100,
      icon: typeIcons[type] || typeIcons.default,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateMonthlyStats(
  activities: ActivityData[],
  year: number
): MonthlyStats[] {
  const monthly: Record<number, { activities: number; distance: number; time: number; elevation: number }> = {};

  // Initialize all months
  for (let i = 0; i < 12; i++) {
    monthly[i] = { activities: 0, distance: 0, time: 0, elevation: 0 };
  }

  activities.forEach((activity) => {
    const date = typeof activity.startDate === "string" ? new Date(activity.startDate) : activity.startDate;
    const month = date.getMonth();
    if (date.getFullYear() === year) {
      monthly[month].activities++;
      monthly[month].distance += activity.distance;
      monthly[month].time += activity.movingTime;
      monthly[month].elevation += activity.totalElevationGain || 0;
    }
  });

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return Object.entries(monthly).map(([month, data]) => ({
    month: parseInt(month),
    monthName: monthNames[parseInt(month)],
    ...data,
  }));
}

export function calculateBestPerformances(
  activities: ActivityData[]
): BestPerformances {
  if (activities.length === 0) {
    return {
      longestActivity: null,
      longestRun: null,
      longestRide: null,
      highestElevation: null,
      fastestPace: null,
      mostActiveMonth: null,
      mostActiveDay: null,
    };
  }

  const longestActivity = activities.reduce((max, a) =>
    a.distance > max.distance ? a : max
  );

  const runs = activities.filter((a) => a.type === "Run");
  const rides = activities.filter((a) => a.type === "Ride");

  const longestRun = runs.reduce(
    (max, a) => (a.distance > max.distance ? a : max),
    runs[0] || null
  );

  const longestRide = rides.reduce(
    (max, a) => (a.distance > max.distance ? a : max),
    rides[0] || null
  );

  const highestElevation = activities.reduce((max, a) => {
    const elevA = a.totalElevationGain || 0;
    const elevMax = max.totalElevationGain || 0;
    return elevA > elevMax ? a : max;
  });

  // Fastest pace (lowest time per km for runs)
  const fastestPace = runs.reduce((fastest, a) => {
    if (!fastest) return a;
    const paceA = a.movingTime / (a.distance / 1000); // seconds per km
    const paceFastest = fastest.movingTime / (fastest.distance / 1000);
    return paceA < paceFastest ? a : fastest;
  }, runs[0] || null);

  // Most active month
  const monthCounts: Record<number, number> = {};
  activities.forEach((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    const month = date.getMonth();
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const mostActiveMonth = Object.entries(monthCounts).reduce(
    (max, [month, count]) => (count > max.count ? { month: parseInt(month), count } : max),
    { month: 0, count: 0 }
  );

  // Most active day
  const dayCounts: Record<string, number> = {};
  activities.forEach((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    const dayKey = date.toISOString().split("T")[0];
    dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCounts).reduce(
    (max, [date, count]) => (count > max.count ? { date, count } : max),
    { date: "", count: 0 }
  );

  return {
    longestActivity,
    longestRun: longestRun || null,
    longestRide: longestRide || null,
    highestElevation: highestElevation.totalElevationGain ? highestElevation : null,
    fastestPace,
    mostActiveMonth: mostActiveMonth.count > 0 ? mostActiveMonth : null,
    mostActiveDay: mostActiveDay.count > 0 ? mostActiveDay : null,
  };
}

export function calculateWeeklyInsights(activities: ActivityData[]): WeeklyInsights {
  if (activities.length === 0) {
    return {
      averagePerWeek: 0,
      longestStreak: 0,
      mostCommonDay: null,
      mostCommonTime: null,
    };
  }

  const dates = activities.map((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    return new Date(date);
  });
  const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const weeks = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1;

  // Longest streak
  const sortedDates = [...new Set(dates.map((d) => d.toISOString().split("T")[0]))].sort();
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Most common day of week
  const dayCounts: Record<number, number> = {};
  activities.forEach((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    const day = new Date(date).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostCommonDay = Object.entries(dayCounts).reduce(
    (max, [day, count]) => (count > max.count ? { day: dayNames[parseInt(day)], count } : max),
    { day: "", count: 0 }
  );

  // Most common time of day
  const timeCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  activities.forEach((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    const hour = new Date(date).getHours();
    if (hour >= 5 && hour < 12) timeCounts.morning++;
    else if (hour >= 12 && hour < 17) timeCounts.afternoon++;
    else if (hour >= 17 && hour < 21) timeCounts.evening++;
    else timeCounts.night++;
  });
  const mostCommonTime = Object.entries(timeCounts).reduce(
    (max, [period, count]) => (count > max.count ? { period, count } : max),
    { period: "", count: 0 }
  );

  return {
    averagePerWeek: activities.length / weeks,
    longestStreak,
    mostCommonDay: mostCommonDay.count > 0 ? mostCommonDay : null,
    mostCommonTime: mostCommonTime.count > 0 ? mostCommonTime : null,
  };
}

export function calculateTimeOfDay(activities: ActivityData[]): TimeOfDayStats {
  const stats = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  activities.forEach((a) => {
    const date = typeof a.startDate === "string" ? new Date(a.startDate) : a.startDate;
    const hour = new Date(date).getHours();
    if (hour >= 5 && hour < 12) stats.morning++;
    else if (hour >= 12 && hour < 17) stats.afternoon++;
    else if (hour >= 17 && hour < 21) stats.evening++;
    else stats.night++;
  });

  return stats;
}

export function calculateLocationInsights(activities: ActivityData[]): LocationInsights {
  const cityCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const locations = new Set<string>();

  activities.forEach((a) => {
    if (a.location?.city) {
      cityCounts[a.location.city] = (cityCounts[a.location.city] || 0) + 1;
      const locKey = `${a.location.city}, ${a.location.country || ""}`;
      locations.add(locKey);
    }
    if (a.location?.country) {
      countryCounts[a.location.country] = (countryCounts[a.location.country] || 0) + 1;
    }
  });

  const topCities = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    topCities,
    topCountries,
    totalLocations: locations.size,
  };
}

export function generateFunFacts(
  summary: CoreSummary,
  activities: ActivityData[]
): string[] {
  const facts: string[] = [];

  // Distance comparisons
  const km = summary.totalDistance / 1000;
  if (km > 8848) {
    facts.push(`You climbed higher than Mount Everest! (${(km / 8848).toFixed(1)}x)`);
  }
  if (km > 40075) {
    facts.push(`You traveled around the Earth! (${(km / 40075).toFixed(2)}x)`);
  }

  // Time facts
  const hours = summary.totalTime / 3600;
  if (hours > 24) {
    facts.push(`You moved for ${Math.round(hours / 24)} full days!`);
  }

  // Activity count facts
  if (summary.totalActivities > 365) {
    facts.push(`You did more activities than days in a year!`);
  }

  // Elevation facts
  if (summary.totalElevation > 8848) {
    facts.push(`You climbed ${(summary.totalElevation / 8848).toFixed(1)} Mount Everests!`);
  }

  return facts;
}

