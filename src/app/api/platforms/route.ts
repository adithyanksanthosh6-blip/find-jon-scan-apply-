import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platformConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const connections = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.userId, userId));

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, platform, isConnected, profileUrl, username } = body;

    if (!userId || !platform) {
      return NextResponse.json(
        { error: "userId and platform are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(platformConnections)
      .set({
        isConnected,
        profileUrl,
        username,
        connectedAt: isConnected ? new Date() : null,
      })
      .where(
        and(
          eq(platformConnections.userId, userId),
          eq(platformConnections.platform, platform)
        )
      )
      .returning();

    if (!updated) {
      // Create if not exists
      const [created] = await db
        .insert(platformConnections)
        .values({
          userId,
          platform,
          isConnected,
          profileUrl,
          username,
          connectedAt: isConnected ? new Date() : null,
        })
        .returning();
      return NextResponse.json({ connection: created });
    }

    return NextResponse.json({ connection: updated });
  } catch (error) {
    console.error("Error updating platform:", error);
    return NextResponse.json(
      { error: "Failed to update platform" },
      { status: 500 }
    );
  }
}
