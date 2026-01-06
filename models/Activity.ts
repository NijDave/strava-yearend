import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  stravaId: number;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain?: number;
  startDate: Date;
  timezone: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  rawData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    stravaId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    movingTime: {
      type: Number,
      required: true,
    },
    elapsedTime: {
      type: Number,
      required: true,
    },
    totalElevationGain: {
      type: Number,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    rawData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ActivitySchema.index({ userId: 1, startDate: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;

