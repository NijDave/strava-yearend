import axios, { AxiosResponse } from "axios";
import User from "@/models/User";
import { StravaTokenResponse, StravaActivity } from "@/types";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

// Rate limiting constants
// Strava allows 100 requests per 15 minutes (900 seconds)
// We'll be conservative and allow 90 requests per 15 minutes
const REQUESTS_PER_WINDOW = 90;
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MIN_DELAY_BETWEEN_REQUESTS_MS = 1000; // 1 second minimum delay

// Track request timestamps for rate limiting
const requestTimestamps: number[] = [];

// Helper function to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check and enforce rate limits
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();

  // Remove timestamps older than the window
  const recentRequests = requestTimestamps.filter(
    (timestamp) => now - timestamp < WINDOW_DURATION_MS
  );

  // Update the array
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentRequests);

  // If we're at the limit, wait until the oldest request expires
  if (recentRequests.length >= REQUESTS_PER_WINDOW) {
    const oldestRequest = Math.min(...recentRequests);
    const waitTime = WINDOW_DURATION_MS - (now - oldestRequest) + 100; // Add 100ms buffer
    console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
    await sleep(waitTime);
  }

  // Always wait minimum delay between requests
  await sleep(MIN_DELAY_BETWEEN_REQUESTS_MS);

  // Record this request
  requestTimestamps.push(Date.now());
}

// Helper function to parse rate limit headers
function parseRateLimitHeaders(response: AxiosResponse): {
  limit15min: number;
  usage15min: number;
  limitDaily: number;
  usageDaily: number;
} {
  const headers = response.headers;
  const limit15min = parseInt(headers["x-ratelimit-limit"]?.split(",")[0] || "100", 10);
  const usage15min = parseInt(headers["x-ratelimit-usage"]?.split(",")[0] || "0", 10);
  const limitDaily = parseInt(headers["x-ratelimit-limit"]?.split(",")[1] || "1000", 10);
  const usageDaily = parseInt(headers["x-ratelimit-usage"]?.split(",")[1] || "0", 10);

  return { limit15min, usage15min, limitDaily, usageDaily };
}

export async function refreshStravaToken(userId: string): Promise<string | null> {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stravaRefreshToken) {
      return null;
    }

    const response = await axios.post<StravaTokenResponse>(
      "https://www.strava.com/oauth/token",
      {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: user.stravaRefreshToken,
      }
    );

    user.stravaAccessToken = response.data.access_token;
    user.stravaRefreshToken = response.data.refresh_token;
    await user.save();

    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing Strava token:", error);
    return null;
  }
}

export async function getStravaAccessToken(userId: string): Promise<string | null> {
  const user = await User.findById(userId);
  if (!user || !user.stravaAccessToken) {
    return null;
  }

  // Token is valid, return it
  // In a real app, you'd check expiration time
  return user.stravaAccessToken;
}

export async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 200,
  retryCount: number = 0
): Promise<StravaActivity[]> {
  try {
    // Enforce rate limiting before making request
    await enforceRateLimit();

    const response = await axios.get<StravaActivity[]>(
      `${STRAVA_API_BASE}/athlete/activities`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page,
          per_page: perPage,
        },
      }
    );

    // Log rate limit status (optional, for monitoring)
    const rateLimitInfo = parseRateLimitHeaders(response);
    if (rateLimitInfo.usage15min > rateLimitInfo.limit15min * 0.8) {
      console.log(
        `Rate limit warning: ${rateLimitInfo.usage15min}/${rateLimitInfo.limit15min} (15min), ` +
        `${rateLimitInfo.usageDaily}/${rateLimitInfo.limitDaily} (daily)`
      );
    }

    return response.data;
  } catch (error: any) {
    // Handle rate limit errors (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const waitTime = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(60000 * Math.pow(2, retryCount), 300000); // Exponential backoff, max 5 minutes

      console.log(`Rate limited (429). Waiting ${waitTime / 1000} seconds before retry...`);

      if (retryCount < 3) {
        await sleep(waitTime);
        return fetchStravaActivities(accessToken, page, perPage, retryCount + 1);
      } else {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
    }

    if (error.response?.status === 401) {
      throw new Error("Unauthorized - token may be expired");
    }

    throw error;
  }
}

export async function fetchAllStravaActivities(
  userId: string
): Promise<StravaActivity[]> {
  const accessToken = await getStravaAccessToken(userId);
  if (!accessToken) {
    throw new Error("No Strava access token found");
  }

  let allActivities: StravaActivity[] = [];
  let page = 1;
  let hasMore = true;
  let currentToken = accessToken;

  while (hasMore) {
    try {
      const activities = await fetchStravaActivities(currentToken, page, 200);

      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities = [...allActivities, ...activities];
        page++;

        // Strava API typically limits to recent activities
        // If we get less than per_page, we've reached the end
        if (activities.length < 200) {
          hasMore = false;
        }

        // Log progress for large syncs
        if (allActivities.length % 200 === 0) {
          console.log(`Fetched ${allActivities.length} activities so far...`);
        }
      }
    } catch (error: any) {
      if (error.message.includes("Unauthorized") || error.message.includes("expired")) {
        // Try refreshing token
        const newToken = await refreshStravaToken(userId);
        if (newToken) {
          currentToken = newToken;
          // Retry with new token (don't increment page)
          continue;
        }
      }

      // If it's a rate limit error, re-throw it with more context
      if (error.message.includes("Rate limit")) {
        throw new Error(
          `Rate limit exceeded while fetching activities. ` +
          `Fetched ${allActivities.length} activities so far. ` +
          `Please wait a few minutes and try syncing again.`
        );
      }

      throw error;
    }
  }

  console.log(`Successfully fetched ${allActivities.length} total activities`);
  return allActivities;
}

export async function fetchDetailedActivity(
  accessToken: string,
  activityId: number
): Promise<any> {
  try {
    await enforceRateLimit();

    const response = await axios.get(
      `${STRAVA_API_BASE}/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          keys,
          key_by_type: true,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized - token may be expired");
    }
    // Return empty object if streams not available
    if (error.response?.status === 404) {
      return {};
    }
    throw error;
  }
}
