import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import axios from "axios";

// Strava webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verify the webhook
  if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Handle webhook events
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify webhook signature if configured
    // For now, we'll process the event

    const objectType = body.object_type;
    const aspectType = body.aspect_type;
    const objectId = body.object_id;
    const ownerId = body.owner_id;

    // Only process activity creation/updates
    if (objectType === "activity" && aspectType === "create") {
      await connectDB();

      // Find user by Strava athlete ID
      const user = await User.findOne({ stravaAthleteId: ownerId });

      if (!user || !user.stravaAccessToken) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch the activity details from Strava
      try {
        const response = await axios.get(
          `https://www.strava.com/api/v3/activities/${objectId}`,
          {
            headers: {
              Authorization: `Bearer ${user.stravaAccessToken}`,
            },
          }
        );

        const activity = response.data;

        // Check if activity already exists
        const existingActivity = await Activity.findOne({ stravaId: activity.id });

        if (!existingActivity) {
          await Activity.create({
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
          });
        }
      } catch (error) {
        console.error("Error fetching activity from Strava:", error);
        // Don't fail the webhook if we can't fetch the activity
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

