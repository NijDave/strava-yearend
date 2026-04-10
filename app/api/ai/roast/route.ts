import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Activity from "@/models/Activity";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = new mongoose.Types.ObjectId(session.user.id);

        const activities = await Activity.find({ userId })
            .sort({ startDate: -1 })
            .limit(100)
            .lean();

        if (activities.length === 0) {
            return NextResponse.json({
                roast: "I'd roast you, but you haven't even uploaded a single activity. Are you an athlete or a professional couch potato? Connect your Strava and give me something to work with!"
            });
        }

        const activitySummary = activities.map((a) => ({
            name: a.name,
            type: a.type,
            distanceKm: (a.distance / 1000).toFixed(2),
            durationMins: Math.round(a.movingTime / 60),
            elevationM: a.totalElevationGain ?? 0,
            date: new Date(a.startDate).toDateString(),
        }));

        const totalDistance = activities.reduce((sum, a) => sum + (a.distance / 1000), 0);
        const totalActivities = activities.length;
        const avgDistance = totalDistance / totalActivities;
        const runs = activities.filter(a => a.type === "Run");
        const rides = activities.filter(a => a.type === "Ride");

        const statsContext = `
Athlete Stats:
Total Activities: ${totalActivities}
Total Distance: ${totalDistance.toFixed(2)}km
Average Distance per Activity: ${avgDistance.toFixed(2)}km
Runs: ${runs.length}
Rides: ${rides.length}

Sample Activities (Last 10):
${JSON.stringify(activitySummary.slice(0, 10), null, 2)}
        `.trim();

        const messages = [
            {
                role: "system",
                content: `You are a savage, hilarious, and merciless Strava critic. 
                Your job is to "roast" the athlete based on their Strava data. 
                Keep the preliminary breakdown (the verdict) brief and punchy. Focus on 2-3 key failures.
                Use clear Markdown headers (e.g., ### The Verdict is In...).
                Ensure "The Final Roast" is a distinct, high-impact concluding section.
                Be sarcastic, witty, and slightly mean, but keep it funny. 
                Point out laziness, flat routes, or boring activity names.
                Use emojis like 🔥, 🐢, 🤡, 🏃‍♂️, 🚴‍♂️.
                Total length should be around 150-200 words.
                Format with bold text and bullet points for maximum impact.`,
            },
            {
                role: "user",
                content: `Here is my data. Destroy me:\n\n${statsContext}`,
            },
        ];

        // Use fetch directly instead of groq-sdk to avoid React context conflicts in Next.js 14 Turbopack
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.8,
                max_tokens: 1024,
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error("Groq API error:", errText);
            return NextResponse.json(
                { error: "AI roaster is temporarily offline. Even the AI doesn't want to deal with your stats right now." },
                { status: 500 }
            );
        }

        const groqData = await groqRes.json();
        const roast = groqData.choices?.[0]?.message?.content
            ?? "I'm literally speechless at how mediocre your stats are. I can't even find words to roast this.";

        return NextResponse.json({ roast });
    } catch (err: any) {
        console.error("Roast error details:", err);
        return NextResponse.json(
            { error: err.message || "Something went wrong while trying to destroy you." },
            { status: 500 }
        );
    }
}
