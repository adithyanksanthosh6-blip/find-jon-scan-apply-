import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, automationRuns, platformConnections, resumes, jobSearchLinks } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Count jobs by status
    const jobStats = await db
      .select({
        status: jobs.status,
        count: count(),
      })
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .groupBy(jobs.status);

    // Count total runs
    const runStats = await db
      .select({
        totalRuns: count(),
        totalApplied: sql<number>`COALESCE(SUM(${automationRuns.jobsApplied}), 0)`,
        totalFound: sql<number>`COALESCE(SUM(${automationRuns.jobsFound}), 0)`,
      })
      .from(automationRuns)
      .where(eq(automationRuns.userId, userId));

    // Connected platforms
    const connections = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.userId, userId));

    // Resume
    const resume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .limit(1);

    // Search links
    const links = await db
      .select()
      .from(jobSearchLinks)
      .where(eq(jobSearchLinks.userId, userId));

    const statusMap: Record<string, number> = {};
    for (const stat of jobStats) {
      statusMap[stat.status] = stat.count;
    }

    return NextResponse.json({
      stats: {
        totalJobsFound: Number(runStats[0]?.totalFound || 0),
        totalApplied: Number(runStats[0]?.totalApplied || 0),
        totalRuns: Number(runStats[0]?.totalRuns || 0),
        pendingJobs: statusMap["pending"] || 0,
        appliedJobs: statusMap["applied"] || 0,
        failedJobs: statusMap["failed"] || 0,
        interviewJobs: statusMap["interview"] || 0,
        connectedPlatforms: connections.filter((c) => c.isConnected).length,
        totalPlatforms: connections.length,
        hasResume: resume.length > 0,
        resumeMatchScore: resume[0]?.matchScore || 0,
        searchLinksCount: links.length,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
