import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSearchLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

function detectPlatform(url: string): "linkedin" | "indeed" | "naukri" | "pharmabharat" | null {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("indeed.com") || lower.includes("indeed.co")) return "indeed";
  if (lower.includes("naukri.com")) return "naukri";
  if (lower.includes("pharmabharat.com")) return "pharmabharat";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, url, label } = body;

    if (!userId || !url) {
      return NextResponse.json(
        { error: "userId and url are required" },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json(
        {
          error:
            "URL must be from LinkedIn, Indeed, Naukri.com, or PharmaBharat.com",
        },
        { status: 400 }
      );
    }

    const [link] = await db
      .insert(jobSearchLinks)
      .values({
        userId,
        url,
        platform,
        label: label || `${platform} search`,
      })
      .returning();

    return NextResponse.json({ link });
  } catch (error) {
    console.error("Error adding search link:", error);
    return NextResponse.json(
      { error: "Failed to add search link" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const links = await db
      .select()
      .from(jobSearchLinks)
      .where(eq(jobSearchLinks.userId, userId));

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching search links:", error);
    return NextResponse.json(
      { error: "Failed to fetch search links" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(jobSearchLinks).where(eq(jobSearchLinks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting search link:", error);
    return NextResponse.json(
      { error: "Failed to delete search link" },
      { status: 500 }
    );
  }
}
