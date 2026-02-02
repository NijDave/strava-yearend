import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import axios from "axios";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { StravaTokenResponse } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/dashboard?error=strava_connection_failed", request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard?error=no_code", request.url)
      );
    }

    await connectDB();

    // Exchange code for access token
    const tokenResponse = await axios.post<StravaTokenResponse>(
      "https://www.strava.com/oauth/token",
      {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }
    );

    const { access_token, refresh_token, athlete } = tokenResponse.data;

    // Update user with Strava tokens
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      user.stravaAccessToken = access_token;
      user.stravaRefreshToken = refresh_token;
      user.stravaConnected = true;
      user.stravaAthleteId = athlete.id;
      await user.save();
    }

    // Trigger initial activity sync
    try {
      await fetch(`${new URL(request.url).origin}/api/strava/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (syncError) {
      console.error("Error syncing activities:", syncError);
      // Don't fail the connection if sync fails
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error: any) {
    console.error("Strava callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=connection_failed", request.url)
    );
  }
}

