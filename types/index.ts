import { Session } from "next-auth";

export interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain?: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  [key: string]: any;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    [key: string]: any;
  };
}

export interface ActivityData {
  _id: string;
  stravaId: number;
  userId: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain?: number;
  startDate: string | Date;
  timezone: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  rawData: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

