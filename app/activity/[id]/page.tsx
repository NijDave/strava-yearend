import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { ActivityDetail } from "@/components/activity/ActivityDetail";
import mongoose from "mongoose";

export default async function ActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user?.email });

  if (!user) {
    redirect("/login");
  }

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    redirect("/dashboard");
  }

  const activity = await Activity.findOne({
    _id: params.id,
    userId: user._id,
  }).lean();

  if (!activity) {
    redirect("/dashboard");
  }

  return <ActivityDetail activity={activity as any} />;
}
