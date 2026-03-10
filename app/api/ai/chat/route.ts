import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Activity from "@/models/Activity";
import ChatHistory from "@/models/ChatHistory";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const userId = new mongoose.Types.ObjectId(session.user.id);
        // Fetch newest 100 first, then reverse so client gets chronological order
        const history = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        history.reverse();
        return NextResponse.json({ history });
    } catch (err) {
        console.error("GET chat error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message } = await req.json();
        if (!message?.trim()) {
            return NextResponse.json({ error: "Empty message" }, { status: 400 });
        }

        await connectDB();
        const userId = new mongoose.Types.ObjectId(session.user.id);

        const activities = await Activity.find({ userId })
            .sort({ startDate: -1 })
            .limit(200)
            .lean();

        const activitySummary = activities.map((a) => ({
            name: a.name,
            type: a.type,
            date: new Date(a.startDate).toDateString(),
            year: new Date(a.startDate).getFullYear(),
            distanceKm: (a.distance / 1000).toFixed(2),
            durationMins: Math.round(a.movingTime / 60),
            elevationM: a.totalElevationGain ?? 0,
            avgPaceMinPerKm:
                a.distance > 0
                    ? (a.movingTime / 60 / (a.distance / 1000)).toFixed(2)
                    : null,
        }));

        const byYear: Record<number, typeof activitySummary> = {};
        for (const a of activitySummary) {
            if (!byYear[a.year]) byYear[a.year] = [];
            byYear[a.year].push(a);
        }

        const yearSummaries = Object.entries(byYear)
            .map(([year, acts]) => {
                const runs = acts.filter((a) => a.type === "Run");
                const rides = acts.filter((a) => a.type === "Ride");
                const longestRun = [...runs].sort(
                    (a, b) => parseFloat(b.distanceKm) - parseFloat(a.distanceKm)
                )[0];
                const longestRide = [...rides].sort(
                    (a, b) => parseFloat(b.distanceKm) - parseFloat(a.distanceKm)
                )[0];
                return `${year}: ${acts.length} total (${runs.length} runs, ${rides.length} rides)${longestRun ? `, longest run: ${longestRun.distanceKm}km on ${longestRun.date}` : ""}${longestRide ? `, longest ride: ${longestRide.distanceKm}km on ${longestRide.date}` : ""}`;
            })
            .join("\n");

        const stravaContext = `
ATHLETE STRAVA DATA:
Year-by-year summary:
${yearSummaries}

Last 20 activities (detailed):
${JSON.stringify(activitySummary.slice(0, 20), null, 2)}
    `.trim();

        // Load past chat history for context (newest 20, reversed to chronological)
        const chatHistory = await ChatHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const pastMessages = chatHistory.reverse().map((h) => ({
            role: h.role,
            content: h.content,
        }));

        const messages = [
            {
                role: "system",
                content: `You are Athlytic AI, a personal fitness coach and general assistant. You have full access to the athlete's Strava data.

IMPORTANT RULES:
- Always differentiate between Run and Ride - never confuse them
- When asked about runs, only look at type="Run" activities
- When asked about rides, only look at type="Ride" activities
- Reference specific activity names, dates, distances from the data
- For year-specific questions, use the year summaries
- Format responses clearly with markdown
- Also answer general knowledge questions
- Be encouraging and accurate

${stravaContext}`,
            },
            ...pastMessages,
            { role: "user", content: message },
        ];

        const ollamaRes = await fetch("http://127.0.0.1:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gemma3:4b",
                messages,
                stream: false,
            }),
        });

        if (!ollamaRes.ok) {
            const errText = await ollamaRes.text();
            console.error("Ollama error:", errText);
            throw new Error("Ollama request failed");
        }

        const ollamaData = await ollamaRes.json();
        const reply =
            ollamaData.message?.content ?? "Sorry, I couldn't respond.";

        // Save both messages atomically — only after a successful AI reply
        await ChatHistory.insertMany([
            { userId, role: "user", content: message },
            { userId, role: "assistant", content: reply },
        ]);

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("AI chat error:", err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
