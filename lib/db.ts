import mongoose from "mongoose";

// Temporarily commented out to allow server to start
// if (!process.env.MONGODB_URI) {
//   throw new Error("Please add your Mongo URI to .env.local");
// }

const MONGODB_URI: string = process.env.MONGODB_URI || "";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // If no MongoDB URI is configured, return a mock connection
  if (!MONGODB_URI) {
    console.warn("⚠️  MongoDB URI not configured. Database features will be unavailable.");
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds
      socketTimeoutMS: 10000,
      connectTimeoutMS: 3000,
    };

    console.log("🔄 Attempting to connect to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        console.error("   This might be due to:");
        console.error("   - Network connectivity issues");
        console.error("   - IP address not whitelisted in MongoDB Atlas");
        console.error("   - Invalid connection string");
        console.error("   The app will continue without database functionality.");
        cached.promise = null;
        // Return mongoose anyway to prevent blocking
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error("Failed to establish MongoDB connection:", e.message);
    // Return mongoose to allow app to continue
    return mongoose;
  }

  return cached.conn;
}

export default connectDB;

