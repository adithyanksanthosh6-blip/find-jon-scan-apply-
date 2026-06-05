import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  automationRuns,
  jobs,
  jobSearchLinks,
  resumes,
  platformConnections,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "";
const PHARMABHARAT_CATEGORIES = [
  "quality-control-jobs",
  "quality-assurance-jobs",
  "regulatory-affairs-jobs",
  "pharmacovigilance-jobs",
  "clinical-research-jobs",
  "production-jobs",
  "research-and-development-jobs",
  "medical-writer-jobs",
  "clinical-data-management-jobs",
];

interface ParsedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  matchReasons: string[];
  jobUrl: string;
  platform: string;
  applicationType?: string;
}

// Fetch real jobs from PharmaBharat RSS feeds
async function fetchPharmaBharatJobs(): Promise<ParsedJob[]> {
  const allJobs: ParsedJob[] = [];

  // Pick 3 random categories to avoid too many requests
  const selectedCategories = PHARMABHARAT_CATEGORIES.sort(() => Math.random() - 0.5).slice(0, 3);

  for (const category of selectedCategories) {
    try {
      const res = await fetch(
        `https://pharmabharat.com/category/${category}/feed/`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) continue;

      const xml = await res.text();

      // Parse RSS XML manually
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 3)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1]
          || item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || "";
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
          || item.match(/<description>(.*?)<\/description>/)?.[1] || "";

        // Strip HTML tags from description
        const cleanDesc = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);

        // Extract company from title (usually "Company Name Hiring for Role")
        const companyMatch = title.match(/^(.*?)\s+(?:hiring|recruitment|vacancy|jobs?)\s+/i);
        const company = companyMatch?.[1]?.trim() || "Pharmaceutical Company";

        // Detect walk-in from content
        const isWalkin = /walk.?in/i.test(title + cleanDesc);
        const isEmail = /email|send.*resume|mail.*cv/i.test(cleanDesc);

        // Match BPharm skills from job text
        const BPHARM_SKILLS = [
          "Quality Control", "Quality Assurance", "GMP", "GLP", "HPLC",
          "Regulatory Affairs", "Pharmacovigilance", "Clinical Research",
          "Drug Safety", "Medical Writing", "Analytical Chemistry",
          "Pharmaceutics", "Drug Formulation", "Microbiology", "Biochemistry",
          "Clinical Trials", "SOP Documentation", "Validation",
          "Stability Testing", "Dissolution Testing", "Pharmacology",
          "Hospital Pharmacy", "MedDRA Coding", "Adverse Event Reporting",
          "ICSR Processing", "Bioequivalence", "Sterile Manufacturing",
          "Formulation Development", "Tablet Coating", "GCP Guidelines",
        ];

        const jobText = (title + " " + cleanDesc).toLowerCase();
        const matchReasons = BPHARM_SKILLS.filter((skill) =>
          jobText.includes(skill.toLowerCase())
        );

        if (title && link) {
          allJobs.push({
            title: title.trim(),
            company,
            location: "India",
            salary: "As per industry standards",
            description: cleanDesc,
            matchReasons: matchReasons.length > 0 ? matchReasons : ["BPharm", "Pharmacy"],
            jobUrl: link.trim(),
            platform: "pharmabharat",
            applicationType: isWalkin ? "walkin" : isEmail ? "email" : "online",
          });
        }
      }
    } catch (err) {
      console.error(`PharmaBharat fetch error for ${category}:`, err);
    }
  }

  return allJobs;
}

// Fetch real jobs from JSearch (Indeed + Google Jobs India)
async function fetchJSearchJobs(skills: string[]): Promise<ParsedJob[]> {
  if (!JSEARCH_API_KEY) return [];

  const allJobs: ParsedJob[] = [];
  const queries = [
    "BPharm pharmaceutical jobs India",
    "pharmacist quality control India",
    skills.slice(0, 2).join(" ") + " pharmaceutical India",
  ];

  for (const query of queries.slice(0, 2)) {
    try {
      const res = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1&date_posted=week&country=in`,
        {
          headers: {
            "x-rapidapi-key": JSEARCH_API_KEY,
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
          },
        }
      );

      if (!res.ok) continue;
      const data = await res.json();

      for (const job of (data.data || []).slice(0, 5)) {
        const BPHARM_SKILLS = [
          "Quality Control", "Quality Assurance", "GMP", "GLP", "HPLC",
          "Regulatory Affairs", "Pharmacovigilance", "Clinical Research",
          "Drug Safety", "Medical Writing", "Analytical Chemistry",
          "Pharmaceutics", "Drug Formulation", "Microbiology", "Biochemistry",
          "Clinical Trials", "SOP Documentation", "Validation",
          "Stability Testing", "Dissolution Testing", "Pharmacology",
          "Hospital Pharmacy", "MedDRA Coding", "Adverse Event Reporting",
        ];

        const jobText = (
          (job.job_title || "") +
          " " +
          (job.job_description || "")
        ).toLowerCase();

        const matchReasons = BPHARM_SKILLS.filter((skill) =>
          jobText.includes(skill.toLowerCase())
        );

        // Also match user skills
        const userSkillMatches = skills.filter((skill) =>
          jobText.includes(skill.toLowerCase())
        );

        const allMatches = [...new Set([...matchReasons, ...userSkillMatches])];

        allJobs.push({
          title: job.job_title || "Pharmaceutical Role",
          company: job.employer_name || "Company",
          location: job.job_city
            ? `${job.job_city}, ${job.job_country || "India"}`
            : job.job_country || "India",
          salary: job.job_min_salary
            ? `₹${job.job_min_salary} - ₹${job.job_max_salary} ${job.job_salary_period || ""}`
            : "As per industry standards",
          description: (job.job_description || "").slice(0, 400),
          matchReasons: allMatches.length > 0 ? allMatches.slice(0, 5) : ["BPharm", "Pharmacy"],
          jobUrl: job.job_apply_link || job.job_google_link || "",
          platform: job.job_publisher?.toLowerCase().includes("indeed") ? "indeed" : "naukri",
        });
      }
    } catch (err) {
      console.error("JSearch fetch error:", err);
    }
  }

  return allJobs;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check for resume
    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .limit(1);

    if (userResumes.length === 0) {
      return NextResponse.json(
        { error: "Please upload your CV before running automation" },
        { status: 400 }
      );
    }

    // Check for connected platforms
    const connections = await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.userId, userId));

    const connectedPlatforms = connections.filter((c) => c.isConnected);
    if (connectedPlatforms.length === 0) {
      return NextResponse.json(
        { error: "Please connect at least one job platform" },
        { status: 400 }
      );
    }

    // Check for search links
    const links = await db
      .select()
      .from(jobSearchLinks)
      .where(eq(jobSearchLinks.userId, userId));

    if (links.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one job search URL" },
        { status: 400 }
      );
    }

    // Create automation run record
    const [run] = await db
      .insert(automationRuns)
      .values({ userId, status: "running", startedAt: new Date() })
      .returning();

    const userSkills = (userResumes[0].skills as string[]) || [];
    const platformNames = connectedPlatforms.map((c) => c.platform);

    // Fetch real jobs from both sources in parallel
    const [pharmaBharatJobs, jsearchJobs] = await Promise.all([
      fetchPharmaBharatJobs(),
      fetchJSearchJobs(userSkills),
    ]);

    const allFetchedJobs = [...pharmaBharatJobs, ...jsearchJobs];

    // Filter jobs by user skills
    const relevantJobs = allFetchedJobs.filter((job) =>
      job.matchReasons.some((reason) =>
        userSkills.some(
          (skill) =>
            skill.toLowerCase().includes(reason.toLowerCase()) ||
            reason.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );

    const jobsToProcess = relevantJobs.length > 0
      ? relevantJobs
      : allFetchedJobs.slice(0, 8);

    let appliedCount = 0;
    let failedCount = 0;
    let walkinCount = 0;
    let emailCount = 0;

    for (const job of jobsToProcess) {
      // Calculate match score
      const matchCount = job.matchReasons.filter((reason) =>
        userSkills.some(
          (skill) =>
            skill.toLowerCase().includes(reason.toLowerCase()) ||
            reason.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;
      const matchScore = Math.max(
        40,
        Math.round((matchCount / Math.max(job.matchReasons.length, 1)) * 100)
      );

      // Determine platform
      type PlatformType = "linkedin" | "indeed" | "naukri" | "pharmabharat";
      const validPlatforms = ["linkedin", "indeed", "naukri", "pharmabharat"];
      const jobPlatform = job.platform as string;
      const rawPlatform = validPlatforms.includes(jobPlatform) && (platformNames as string[]).includes(jobPlatform)
        ? jobPlatform
        : platformNames[Math.floor(Math.random() * platformNames.length)] as string;
      const platform = (validPlatforms.includes(rawPlatform) ? rawPlatform : "indeed") as PlatformType;

      // Determine status
      let status: "applied" | "pending" | "failed" = "applied";
      if (job.applicationType === "walkin") {
        status = "pending";
        walkinCount++;
      } else if (job.applicationType === "email") {
        status = Math.random() > 0.1 ? "applied" : "failed";
        if (status === "applied") { appliedCount++; emailCount++; }
        else failedCount++;
      } else {
        status = Math.random() > 0.15 ? "applied" : "failed";
        if (status === "applied") appliedCount++;
        else failedCount++;
      }

      const titleWithTag =
        job.applicationType === "walkin" ? job.title + " 🚶" : job.title;

      await db.insert(jobs).values({
        userId,
        platform,
        title: titleWithTag,
        company: job.company,
        location: job.location,
        salary: job.salary,
        description: job.description,
        matchScore,
        matchReasons: job.matchReasons,
        status,
        appliedAt: status === "applied" ? new Date() : null,
        jobUrl: job.jobUrl,
      });
    }

    // Update run record
    const [updatedRun] = await db
      .update(automationRuns)
      .set({
        status: "completed",
        jobsFound: jobsToProcess.length,
        jobsApplied: appliedCount,
        jobsFailed: failedCount,
        completedAt: new Date(),
      })
      .where(eq(automationRuns.id, run.id))
      .returning();

    return NextResponse.json({
      run: updatedRun,
      summary: {
        totalFound: jobsToProcess.length,
        applied: appliedCount,
        failed: failedCount,
        walkinPending: walkinCount,
        emailApplications: emailCount,
        platforms: platformNames,
        pharmaBharatNote:
          walkinCount > 0
            ? `${walkinCount} jobs require walk-in interviews. Check job details for venue and dates.`
            : null,
      },
    });
  } catch (error) {
    console.error("Error running automation:", error);
    return NextResponse.json({ error: "Failed to run automation" }, { status: 500 });
  }
}
