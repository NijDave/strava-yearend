import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await request.json();

    if (!stats) {
      return NextResponse.json({ error: "No stats provided" }, { status: 400 });
    }

    // Build the data context string
    const ctx = `
Year: ${stats.year}
Total activities: ${stats.totalActivities}
Total distance: ${Math.round(stats.totalDistance / 1000)} km
Total time: ${Math.round(stats.totalTime / 3600)} hours  
Total elevation: ${Math.round(stats.totalElevation)} m
Active days: ${stats.activeDays}
Avg activities per week: ${stats.avgPerWeek?.toFixed(1) || "N/A"}
Longest streak: ${stats.longestStreak} days
Most active month: ${stats.mostActiveMonth || "N/A"}
Activity breakdown: ${stats.activityBreakdown?.map((a: any) => `${a.type} (${a.count}x)`).join(", ") || "N/A"}
Fastest pace: ${stats.fastestPaceStr || "N/A"}
Highest elevation activity: ${stats.highestElevation || "N/A"} m
`.trim();

    const prompt = `You are a witty, savage, and deeply impressed sports analyst roasting and celebrating an athlete's yearly stats.

Here are their ${stats.year} stats:
${ctx}

Generate EXACTLY 7 fun facts about these stats. Rules:
- Each fact is 1 punchy sentence
- Use the actual numbers (don't generalize)  
- Mix of impressed, humorous, and savage tone
- Use real-world comparisons (city distances, famous landmarks, sports records, everyday objects)
- Be specific — "you ran 847km" not "you ran a lot"
- India-relevant comparisons welcome (Mumbai-Delhi, cricket stadiums, etc.)
- No emojis in the facts themselves

Return ONLY a valid JSON array of 7 strings, no other text:
["fact 1", "fact 2", "fact 3", "fact 4", "fact 5", "fact 6", "fact 7"]`;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
      return NextResponse.json({ error: "Groq API failed", facts: [] }, { status: 200 }); // Return empty so fallback kicks in
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content || "";

    // Parse JSON array from response
    let facts: string[] = [];
    try {
      // Extract JSON array from response (sometimes Groq adds explanation text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        facts = JSON.parse(jsonMatch[0]);
      } else {
        facts = JSON.parse(content);
      }
      // Ensure it's an array of strings
      if (!Array.isArray(facts)) facts = [];
      facts = facts.filter(f => typeof f === "string").slice(0, 7);
    } catch (e) {
      console.error("Failed to parse Groq response:", content);
      facts = [];
    }

    return NextResponse.json({ facts });
  } catch (error: any) {
    console.error("Fun facts error:", error);
    return NextResponse.json({ facts: [], error: error.message }, { status: 200 }); // Graceful fallback
  }
}
