import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { fetchAllStravaActivities } from "@/lib/strava";
import { StravaActivity } from "@/types";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.stravaConnected) {
      return NextResponse.json(
        { error: "Strava not connected" },
        { status: 400 }
      );
    }

    // Fetch all activities from Strava
    const activities = await fetchAllStravaActivities(user._id.toString());

    // Get existing activity IDs for efficient lookup
    const existingStravaIds = new Set(
      (await Activity.find({ userId: user._id }).select("stravaId").lean()).map(
        (a: any) => a.stravaId
      )
    );

    // Prepare bulk operations
    const bulkOps: any[] = [];
    let synced = 0;
    let updated = 0;

    for (const activity of activities) {
      const activityData = {
        stravaId: activity.id,
        userId: user._id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        totalElevationGain: activity.total_elevation_gain,
        startDate: new Date(activity.start_date),
        timezone: activity.timezone,
        location: {
          city: activity.location_city,
          state: activity.location_state,
          country: activity.location_country,
        },
        rawData: activity,
      };

      if (existingStravaIds.has(activity.id)) {
        // Update existing
        bulkOps.push({
          updateOne: {
            filter: { stravaId: activity.id },
            update: { $set: activityData },
          },
        });
        updated++;
      } else {
        // Insert new
        bulkOps.push({
          insertOne: {
            document: activityData,
          },
        });
        synced++;
      }
    }

    // Execute bulk operations in batches of 1000 for better performance
    if (bulkOps.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < bulkOps.length; i += batchSize) {
        const batch = bulkOps.slice(i, i + batchSize);
        await Activity.bulkWrite(batch, { ordered: false });
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      updated,
      total: activities.length,
    });
  } catch (error: any) {
    console.error("Error syncing activities:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync activities" },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    const activities = await Activity.find({ userId: user._id })
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

