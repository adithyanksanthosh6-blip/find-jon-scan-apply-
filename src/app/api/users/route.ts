import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, platformConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, phone } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ user: existing[0] });
    }

    const [user] = await db
      .insert(users)
      .values({ email, fullName, phone })
      .returning();

    // Create default platform connections
    await db.insert(platformConnections).values([
      { userId: user.id, platform: "linkedin" as const, isConnected: false },
      { userId: user.id, platform: "indeed" as const, isConnected: false },
      { userId: user.id, platform: "naukri" as const, isConnected: false },
      { userId: user.id, platform: "pharmabharat" as const, isConnected: false },
    ]);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
