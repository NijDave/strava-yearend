import axios, { AxiosResponse } from "axios";
import User from "@/models/User";
import { StravaTokenResponse, StravaActivity } from "@/types";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

// Rate limiting constants
const REQUESTS_PER_WINDOW = 90;
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MIN_DELAY_BETWEEN_REQUESTS_MS = 1000; // 1 second minimum delay

const requestTimestamps: number[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const recentRequests = requestTimestamps.filter(
    (timestamp) => now - timestamp < WINDOW_DURATION_MS
  );
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentRequests);

  if (recentRequests.length >= REQUESTS_PER_WINDOW) {
    const oldestRequest = Math.min(...recentRequests);
    const waitTime = WINDOW_DURATION_MS - (now - oldestRequest) + 100;
    console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
    await sleep(waitTime);
  }

  await sleep(MIN_DELAY_BETWEEN_REQUESTS_MS);
  requestTimestamps.push(Date.now());
}

function parseRateLimitHeaders(response: AxiosResponse) {
  const headers = response.headers;
  const limit15min = parseInt(headers["x-ratelimit-limit"]?.split(",")[0] || "100", 10);
  const usage15min = parseInt(headers["x-ratelimit-usage"]?.split(",")[0] || "0", 10);
  const limitDaily = parseInt(headers["x-ratelimit-limit"]?.split(",")[1] || "1000", 10);
  const usageDaily = parseInt(headers["x-ratelimit-usage"]?.split(",")[1] || "0", 10);
  return { limit15min, usage15min, limitDaily, usageDaily };
}

/**
 * Force refresh the Strava token using the refresh_token
 */
export async function refreshStravaToken(userId: string): Promise<string | null> {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stravaRefreshToken) {
      console.error("User not found or no refresh token for user:", userId);
      return null;
    }

    console.log(`Refreshing Strava token for user ${userId}...`);
    const response = await axios.post<StravaTokenResponse>(
      "https://www.strava.com/oauth/token",
      {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: user.stravaRefreshToken,
      }
    );

    const { access_token, refresh_token, expires_at } = response.data;

    user.stravaAccessToken = access_token;
    user.stravaRefreshToken = refresh_token;
    user.stravaExpiresAt = expires_at;
    await user.save();

    console.log(`Strava token refreshed successfully. Next expiration in ${Math.round((expires_at - Date.now() / 1000) / 60)} minutes.`);
    return access_token;
  } catch (error: any) {
    console.error("Error refreshing Strava token:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Gets a valid Strava access token, refreshing it if necessary.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await User.findById(userId);
  if (!user || !user.stravaAccessToken) return null;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  
  // If no expiration time exists, or we are within 5 minutes of expiration, refresh it
  const isExpired = !user.stravaExpiresAt || (user.stravaExpiresAt - nowInSeconds) < 300;

  if (isExpired) {
    console.log(`Token for user ${userId} is expired or about to expire. Refreshing...`);
    return await refreshStravaToken(userId);
  }

  return user.stravaAccessToken;
}

/**
 * Legacy getter - just returns whatever is in the DB
 */
export async function getStravaAccessToken(userId: string): Promise<string | null> {
  const user = await User.findById(userId);
  return user?.stravaAccessToken || null;
}

export async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 200,
  retryCount: number = 0
): Promise<StravaActivity[]> {
  try {
    await enforceRateLimit();
    const response = await axios.get<StravaActivity[]>(
      `${STRAVA_API_BASE}/athlete/activities`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page, per_page: perPage },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      const waitTime = Math.min(60000 * Math.pow(2, retryCount), 300000);
      if (retryCount < 3) {
        await sleep(waitTime);
        return fetchStravaActivities(accessToken, page, perPage, retryCount + 1);
      }
    }
    throw error;
  }
}

export async function fetchDetailedActivity(
  accessToken: string,
  activityId: number
): Promise<any> {
  try {
    await enforceRateLimit();
    const response = await axios.get(
      `${STRAVA_API_BASE}/activities/${activityId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized - token may be expired");
    }
    throw error;
  }
}

export async function fetchActivityStreams(
  accessToken: string,
  activityId: number,
  streamTypes: string[] = ["time", "distance", "altitude", "velocity_smooth", "heartrate", "cadence", "watts", "temp", "latlng"]
): Promise<any> {
  try {
    await enforceRateLimit();
    const keys = streamTypes.join(",");
    const response = await axios.get(
      `${STRAVA_API_BASE}/activities/${activityId}/streams`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { keys, key_by_type: true },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return {};
    throw error;
  }
}

export async function fetchAllStravaActivities(userId: string): Promise<StravaActivity[]> {
  // Use the new hardened token getter
  let currentToken = await getValidAccessToken(userId);
  if (!currentToken) throw new Error("No Strava access token found");

  let allActivities: StravaActivity[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const activities = await fetchStravaActivities(currentToken, page, 200);
      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities = [...allActivities, ...activities];
        page++;
        if (activities.length < 200) hasMore = false;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        const newToken = await refreshStravaToken(userId);
        if (newToken) {
          currentToken = newToken;
          continue;
        }
      }
      throw error;
    }
  }
  return allActivities;
}
