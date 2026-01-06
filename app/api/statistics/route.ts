import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import {
  calculateCoreSummary,
  calculateActivityTypeBreakdown,
  calculateMonthlyStats,
  calculateBestPerformances,
  calculateWeeklyInsights,
  calculateTimeOfDay,
  calculateLocationInsights,
  generateFunFacts,
} from "@/lib/statistics";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : new Date().getFullYear();

    // Get activities for the year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const activities = await Activity.find({
      userId: user._id,
      startDate: { $gte: startOfYear, $lte: endOfYear },
    })
      .sort({ startDate: -1 })
      .lean();

    // Calculate all statistics
    const coreSummary = calculateCoreSummary(activities as any);
    const activityBreakdown = calculateActivityTypeBreakdown(activities as any);
    const monthlyStats = calculateMonthlyStats(activities as any, year);
    const bestPerformances = calculateBestPerformances(activities as any);
    const weeklyInsights = calculateWeeklyInsights(activities as any);
    const timeOfDay = calculateTimeOfDay(activities as any);
    const locationInsights = calculateLocationInsights(activities as any);
    const funFacts = generateFunFacts(coreSummary, activities as any);

    return NextResponse.json({
      year,
      coreSummary,
      activityBreakdown,
      monthlyStats,
      bestPerformances,
      weeklyInsights,
      timeOfDay,
      locationInsights,
      funFacts,
    });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

