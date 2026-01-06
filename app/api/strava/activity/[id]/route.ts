import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStravaAccessToken, fetchDetailedActivity, fetchActivityStreams } from "@/lib/strava";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const activityId = parseInt(params.id);

        if (isNaN(activityId)) {
            return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
        }

        // Get user's Strava access token
        const accessToken = await getStravaAccessToken((session.user as any).id);

        if (!accessToken) {
            return NextResponse.json(
                { error: "Strava not connected" },
                { status: 403 }
            );
        }

        // Fetch detailed activity and streams in parallel
        const [detailedActivity, streams] = await Promise.all([
            fetchDetailedActivity(accessToken, activityId),
            fetchActivityStreams(accessToken, activityId),
        ]);

        return NextResponse.json({
            activity: detailedActivity,
            streams,
        });
    } catch (error: any) {
        console.error("Error fetching activity details:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch activity details" },
            { status: 500 }
        );
    }
}
