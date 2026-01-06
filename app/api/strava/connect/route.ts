import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI || "http://localhost:3000/api/strava/callback";
  const scope = "activity:read_all";
  const responseType = "code";
  const approvalPrompt = "force";

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${scope}&approval_prompt=${approvalPrompt}`;

  return NextResponse.redirect(authUrl);
}

