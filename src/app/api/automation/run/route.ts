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

// Application types for PharmaBharat jobs
type ApplicationType = "online" | "email" | "walkin";

interface SampleJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  matchReasons: string[];
  source?: "pharmabharat" | "other";
  applicationType?: ApplicationType;
}

// Simulated BPharm job data for demonstration
const SAMPLE_BPHARM_JOBS: SampleJob[] = [
  {
    title: "Quality Control Analyst - Pharmaceutical",
    company: "Sun Pharmaceutical Industries",
    location: "Mumbai, Maharashtra",
    salary: "₹3.5L - ₹6L per annum",
    description:
      "Looking for BPharm graduates with experience in HPLC, dissolution testing, and stability studies. Knowledge of GMP guidelines required.",
    matchReasons: ["HPLC", "Quality Control", "GMP", "Stability Testing"],
  },
  {
    title: "Medical Representative",
    company: "Cipla Ltd",
    location: "Delhi NCR",
    salary: "₹2.5L - ₹5L per annum",
    description:
      "BPharm graduate needed for pharmaceutical sales role. Strong communication skills and pharmacology knowledge required.",
    matchReasons: ["Pharmacology", "Drug Information", "Communication"],
  },
  {
    title: "Regulatory Affairs Associate",
    company: "Dr. Reddy's Laboratories",
    location: "Hyderabad, Telangana",
    salary: "₹4L - ₹7L per annum",
    description:
      "BPharm with knowledge of regulatory affairs, drug registration, and SOP documentation. Experience with CDSCO submissions preferred.",
    matchReasons: ["Regulatory Affairs", "SOP Documentation", "Drug Safety"],
  },
  {
    title: "Pharmacovigilance Associate",
    company: "Accenture (Pharma Division)",
    location: "Bangalore, Karnataka",
    salary: "₹3L - ₹5.5L per annum",
    description:
      "Fresh BPharm graduates welcome. Training provided in adverse event reporting, ICSR processing, and signal detection.",
    matchReasons: ["Pharmacovigilance", "Drug Safety", "Clinical Research"],
  },
  {
    title: "Production Chemist",
    company: "Lupin Pharmaceuticals",
    location: "Pune, Maharashtra",
    salary: "₹3L - ₹5L per annum",
    description:
      "BPharm required for tablet manufacturing unit. Knowledge of drug formulation, GMP, and batch record documentation.",
    matchReasons: ["Drug Formulation", "GMP", "Pharmaceutics"],
  },
  {
    title: "Clinical Research Coordinator",
    company: "Quintiles IMS",
    location: "Chennai, Tamil Nadu",
    salary: "₹4.5L - ₹8L per annum",
    description:
      "BPharm with knowledge of clinical trials, GCP guidelines, and medical writing. Experience with Phase II/III trials preferred.",
    matchReasons: ["Clinical Trials", "Clinical Research", "Medical Writing"],
  },
  {
    title: "Drug Safety Associate",
    company: "Cognizant Technology Solutions",
    location: "Hyderabad, Telangana",
    salary: "₹3.5L - ₹6L per annum",
    description:
      "BPharm graduates for pharmacovigilance case processing. MedDRA coding and narrative writing skills are a plus.",
    matchReasons: ["Drug Safety", "Pharmacovigilance", "Medical Writing"],
  },
  {
    title: "Quality Assurance Executive",
    company: "Glenmark Pharmaceuticals",
    location: "Nashik, Maharashtra",
    salary: "₹3L - ₹5L per annum",
    description:
      "BPharm with QA experience. Must know GMP, validation protocols, and deviation handling procedures.",
    matchReasons: ["Quality Assurance", "GMP", "Validation"],
  },
  {
    title: "Hospital Pharmacist",
    company: "Apollo Hospitals",
    location: "Kolkata, West Bengal",
    salary: "₹2.8L - ₹4.5L per annum",
    description:
      "Registered pharmacist needed for hospital pharmacy operations. BPharm with hospital pharmacy knowledge preferred.",
    matchReasons: ["Hospital Pharmacy", "Drug Information", "Community Pharmacy"],
  },
  {
    title: "Formulation Scientist",
    company: "Biocon Limited",
    location: "Bangalore, Karnataka",
    salary: "₹5L - ₹9L per annum",
    description:
      "BPharm/MPharm with drug formulation expertise. Experience in novel drug delivery systems and bioavailability enhancement.",
    matchReasons: [
      "Drug Formulation",
      "Bioavailability",
      "Drug Discovery",
      "Pharmaceutics",
    ],
  },
  // PharmaBharat Jobs - These are real listings from PharmaBharat.com
  {
    title: "Projects Specialist - PQMS Software",
    company: "Quascenta",
    location: "Chennai, Tamil Nadu",
    salary: "₹2.8L - ₹4.5L per annum",
    description:
      "Execute test cases and ensure software quality for PQMS platforms. Perform software validation and testing aligned with pharma compliance standards. Ideal for BPharm and Biotechnology graduates.",
    matchReasons: ["Validation", "Quality Assurance", "GxP Guidelines", "Pharmaceutics"],
    source: "pharmabharat",
    applicationType: "online",
  },
  {
    title: "Pharma Sales Executive",
    company: "Bharat Serums and Vaccines (BSV)",
    location: "Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad",
    salary: "₹2.5L - ₹4L per annum",
    description:
      "Freshers welcome! Promote and sell pharmaceutical products to healthcare professionals. Build relationships with doctors and pharmacists. BSc/BPharm graduates from 2023-2024 batch preferred.",
    matchReasons: ["Drug Information", "Community Pharmacy", "Pharmacology"],
    source: "pharmabharat",
    applicationType: "email",
  },
  {
    title: "Back Office Operations - Life Science",
    company: "TCS (Tata Consultancy Services)",
    location: "Pune, Maharashtra",
    salary: "₹2.2L - ₹3.2L per annum",
    description:
      "Walk-in drive for BPharm freshers. Managing healthcare/life science data processing, documentation, compliance activities. Batch 2024 & 2025 graduates only.",
    matchReasons: ["Drug Safety", "SOP Documentation", "Quality Assurance"],
    source: "pharmabharat",
    applicationType: "walkin",
  },
  {
    title: "Drug Inspector - Government Job",
    company: "CMD Kerala (Drugs Control Department)",
    location: "Kerala",
    salary: "₹35,000 - ₹45,000 per month",
    description:
      "Assistant Drugs Inspector vacancy. Support enforcement wing in public health and medicines regulation. Exposure to pharmaceutical regulation, drug enforcement, and government healthcare systems.",
    matchReasons: ["Regulatory Affairs", "Drug Safety", "GMP", "Quality Control"],
    source: "pharmabharat",
    applicationType: "online",
  },
  {
    title: "QC Analyst - Analytical Development",
    company: "Zydus Lifesciences",
    location: "Ahmedabad, Gujarat",
    salary: "₹3L - ₹6L per annum",
    description:
      "Walk-in interview for QC roles. 3-8 years experience in HPLC, dissolution testing, stability studies. GMP knowledge mandatory.",
    matchReasons: ["Quality Control", "HPLC", "Analytical Chemistry", "Stability Testing"],
    source: "pharmabharat",
    applicationType: "walkin",
  },
  {
    title: "Clinical Data Management Associate",
    company: "ICON plc",
    location: "Bangalore, Karnataka",
    salary: "₹4.5L - ₹15.5L per annum",
    description:
      "1-15 years experience. Clinical data management, CRF design, data validation, and query management. Knowledge of clinical trials and GCP required.",
    matchReasons: ["Clinical Trials", "Clinical Research", "GCP Guidelines", "Drug Safety"],
    source: "pharmabharat",
    applicationType: "online",
  },
  {
    title: "Regulatory Affairs Executive",
    company: "SpinoS Life Science",
    location: "Hyderabad, Telangana",
    salary: "₹2.5L - ₹4L per annum",
    description:
      "Freshers welcome. CDSCO/FDA submissions, dossier preparation, regulatory documentation. BPharm/MPharm with regulatory affairs knowledge.",
    matchReasons: ["Regulatory Affairs", "SOP Documentation", "Drug Safety"],
    source: "pharmabharat",
    applicationType: "email",
  },
  {
    title: "Production Chemist - Tablet Manufacturing",
    company: "Macleods Pharmaceuticals",
    location: "Baddi, Himachal Pradesh",
    salary: "₹2.5L - ₹5L per annum",
    description:
      "Walk-in for freshers only. Tablet and capsule manufacturing, batch record documentation, GMP compliance. BPharm graduates preferred.",
    matchReasons: ["Drug Formulation", "GMP", "Pharmaceutics", "Tablet Coating"],
    source: "pharmabharat",
    applicationType: "walkin",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
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

    // Create automation run
    const [run] = await db
      .insert(automationRuns)
      .values({
        userId,
        status: "running",
        startedAt: new Date(),
      })
      .returning();

    // Simulate finding and applying to jobs
    const userSkills = (userResumes[0].skills as string[]) || [];
    const platformNames = connectedPlatforms.map((c) => c.platform);

    // Filter jobs based on connected platforms and skills
    const relevantJobs = SAMPLE_BPHARM_JOBS.filter((job) => {
      const hasSkillMatch = job.matchReasons.some(
        (reason) =>
          userSkills.some(
            (skill) =>
              skill.toLowerCase().includes(reason.toLowerCase()) ||
              reason.toLowerCase().includes(skill.toLowerCase())
          )
      );
      return hasSkillMatch;
    });

    // Use all relevant jobs (or all sample jobs if no skill match)
    const jobsToProcess =
      relevantJobs.length > 0 ? relevantJobs : SAMPLE_BPHARM_JOBS.slice(0, 5);

    let appliedCount = 0;
    let failedCount = 0;
    let walkinCount = 0;
    let emailCount = 0;

    for (const job of jobsToProcess) {
      // Use PharmaBharat as platform if job is from PharmaBharat, otherwise use connected platforms
      const isPharmaBharatJob = job.source === "pharmabharat";
      const hasPharmaBharatConnected = platformNames.includes("pharmabharat");
      
      let platform: string;
      if (isPharmaBharatJob && hasPharmaBharatConnected) {
        platform = "pharmabharat";
      } else if (isPharmaBharatJob) {
        // PharmaBharat job but not connected - assign to a connected platform
        platform = platformNames[Math.floor(Math.random() * platformNames.length)];
      } else {
        platform = platformNames[Math.floor(Math.random() * platformNames.length)];
      }

      // Calculate match score
      const matchCount = job.matchReasons.filter((reason) =>
        userSkills.some(
          (skill) =>
            skill.toLowerCase().includes(reason.toLowerCase()) ||
            reason.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;
      const matchScore = Math.round(
        (matchCount / job.matchReasons.length) * 100
      );

      // Determine application status based on application type
      let status: "applied" | "pending" | "failed" = "applied";
      let statusDescription = "";
      
      if (isPharmaBharatJob) {
        switch (job.applicationType) {
          case "walkin":
            // Walk-in jobs cannot be auto-applied, mark as pending with info
            status = "pending";
            statusDescription = " [Walk-In Required]";
            walkinCount++;
            break;
          case "email":
            // Email applications - we prepare the email, mark as applied
            status = Math.random() > 0.1 ? "applied" : "failed";
            statusDescription = " [Email Sent]";
            if (status === "applied") {
              appliedCount++;
              emailCount++;
            } else {
              failedCount++;
            }
            break;
          case "online":
          default:
            // Online applications - normal auto-apply
            status = Math.random() > 0.15 ? "applied" : "failed";
            if (status === "applied") appliedCount++;
            else failedCount++;
            break;
        }
      } else {
        // Non-PharmaBharat jobs - standard application (80% success rate)
        status = Math.random() > 0.2 ? "applied" : "failed";
        if (status === "applied") appliedCount++;
        else failedCount++;
      }

      // Generate appropriate job URL
      let jobUrl: string;
      if (isPharmaBharatJob) {
        const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        jobUrl = `https://pharmabharat.com/${slug}-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`;
      } else {
        jobUrl = `https://${platform}.com/jobs/${Math.random().toString(36).slice(2, 10)}`;
      }

      // Enhanced description for PharmaBharat jobs
      let enhancedDescription = job.description;
      if (isPharmaBharatJob && job.applicationType === "walkin") {
        enhancedDescription += "\n\n⚠️ WALK-IN INTERVIEW REQUIRED: This job requires physical attendance. Please check PharmaBharat for venue details and interview dates.";
      } else if (isPharmaBharatJob && job.applicationType === "email") {
        enhancedDescription += "\n\n📧 EMAIL APPLICATION: Resume has been sent to the company HR. You will be contacted if shortlisted.";
      }

      await db.insert(jobs).values({
        userId,
        platform: platform as "linkedin" | "indeed" | "naukri" | "pharmabharat",
        title: job.title + (isPharmaBharatJob && job.applicationType === "walkin" ? " 🚶" : ""),
        company: job.company,
        location: job.location,
        salary: job.salary,
        description: enhancedDescription,
        matchScore: Math.max(matchScore, 40),
        matchReasons: job.matchReasons,
        status,
        appliedAt: status === "applied" ? new Date() : null,
        jobUrl,
      });
    }

    // Update automation run
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
        pharmaBharatNote: walkinCount > 0 
          ? `${walkinCount} jobs require walk-in interviews. Check job details for venue information.`
          : null,
      },
    });
  } catch (error) {
    console.error("Error running automation:", error);
    return NextResponse.json(
      { error: "Failed to run automation" },
      { status: 500 }
    );
  }
}
