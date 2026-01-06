import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  password?: string;
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaConnected: boolean;
  stravaAthleteId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    stravaAccessToken: {
      type: String,
    },
    stravaRefreshToken: {
      type: String,
    },
    stravaConnected: {
      type: Boolean,
      default: false,
    },
    stravaAthleteId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

