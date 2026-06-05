import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { automationRuns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const runs = await db
      .select()
      .from(automationRuns)
      .where(eq(automationRuns.userId, userId))
      .orderBy(desc(automationRuns.createdAt))
      .limit(20);

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("Error fetching automation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch automation history" },
      { status: 500 }
    );
  }
}
