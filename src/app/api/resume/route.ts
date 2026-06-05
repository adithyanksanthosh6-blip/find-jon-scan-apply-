import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

// BPharm-specific skills for matching
const BPHARM_SKILLS = [
  "Pharmaceutical Chemistry",
  "Pharmacology",
  "Pharmacognosy",
  "Pharmaceutics",
  "Drug Formulation",
  "Quality Control",
  "Quality Assurance",
  "GMP",
  "GLP",
  "Regulatory Affairs",
  "Clinical Research",
  "Drug Safety",
  "Pharmacovigilance",
  "Medical Writing",
  "HPLC",
  "Analytical Chemistry",
  "Bioequivalence",
  "Bioavailability",
  "Drug Discovery",
  "Microbiology",
  "Biochemistry",
  "Hospital Pharmacy",
  "Community Pharmacy",
  "Drug Information",
  "Clinical Trials",
  "SOP Documentation",
  "Validation",
  "Stability Testing",
  "Dissolution Testing",
  "UV Spectroscopy",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fileName, skills, experience, education, summary } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Parse and match skills against BPharm keywords
    const userSkills: string[] = skills || [];
    const matchedSkills = userSkills.filter((s: string) =>
      BPHARM_SKILLS.some(
        (bs) =>
          bs.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(bs.toLowerCase())
      )
    );
    const matchScore = Math.min(
      100,
      Math.round((matchedSkills.length / Math.max(userSkills.length, 1)) * 100)
    );

    // Delete any existing resume for this user
    await db.delete(resumes).where(eq(resumes.userId, userId));

    const [resume] = await db
      .insert(resumes)
      .values({
        userId,
        fileName: fileName || "resume.pdf",
        skills: userSkills,
        experience: experience || [],
        education: education || [],
        summary: summary || "",
        matchScore,
        parsedData: {
          matchedBPharmSkills: matchedSkills,
          totalSkills: userSkills.length,
          bpharmRelevance: matchScore,
        },
      })
      .returning();

    return NextResponse.json({ resume, matchedSkills, matchScore });
  } catch (error) {
    console.error("Error saving resume:", error);
    return NextResponse.json(
      { error: "Failed to save resume" },
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

    const result = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .limit(1);

    return NextResponse.json({ resume: result[0] || null });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}
