import { NextResponse } from "next/server";

const WALKIN_FEEDS = [
    "https://pharmabharat.com/feed/",
];

interface WalkinJob {
  title: string;
  company: string;
  location: string;
  date: string;
  description: string;
  jobUrl: string;
  skills: string[];
}

const BPHARM_SKILLS = [
  "Quality Control", "Quality Assurance", "GMP", "GLP", "HPLC",
  "Regulatory Affairs", "Pharmacovigilance", "Clinical Research",
  "Drug Safety", "Medical Writing", "Analytical Chemistry",
  "Pharmaceutics", "Drug Formulation", "Microbiology", "Biochemistry",
  "Clinical Trials", "SOP Documentation", "Validation",
  "Stability Testing", "Dissolution Testing", "Pharmacology",
  "Hospital Pharmacy", "Production", "Formulation Development",
  "Tablet Coating", "GCP Guidelines", "UV Spectroscopy",
  "API", "Sterile Manufacturing", "Packaging", "Engineering",
];

export async function GET() {
  const allJobs: WalkinJob[] = [];

  for (const feedUrl of WALKIN_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PharmaApply/1.0)" },
        next: { revalidate: 1800 }, // cache 30 mins
      });

      if (!res.ok) continue;
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items) {
        const title = (
          item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>(.*?)<\/title>/)?.[1] || ""
        ).trim();

        const link = (
          item.match(/<link>(https?:\/\/[^\s<]+)<\/link>/)?.[1] ||
          item.match(/<guid[^>]*>(https?:\/\/[^\s<]+)<\/guid>/)?.[1] || ""
        ).trim();

        const pubDate = (
          item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
        ).trim();

        const content = (
          item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ||
          item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
          item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ""
        );

        const cleanContent = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        // Only include walk-in jobs
       const text = (title + " " + cleanContent).toLowerCase();

const isWalkin =
  text.includes("walk in") ||
  text.includes("walk-in") ||
  text.includes("walkin") ||
  text.includes("interview venue") ||
  text.includes("hiring drive") ||
  text.includes("direct interview");
        if (!isWalkin || !title || !link) continue;

        // Extract company name from title
        const companyPatterns = [
          /^([\w\s&\-\.]+?)\s+(?:Walk|Hiring|is Hiring|Walk-In)/i,
          /^([\w\s&\-\.]+?)\s+Walk/i,
        ];
        let company = "Pharmaceutical Company";
        for (const pattern of companyPatterns) {
          const match = title.match(pattern);
          if (match?.[1]) { company = match[1].trim(); break; }
        }

        // Extract location
        const locationKeywords = [
          "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune",
          "Ahmedabad", "Kolkata", "Baddi", "Sikkim", "Gujarat", "Maharashtra",
          "Karnataka", "Telangana", "Tamil Nadu", "Rajasthan", "Himachal",
          "Kerala", "Noida", "Gurgaon", "Chandigarh", "Vadodara",
        ];
        const foundLocation = locationKeywords.find((loc) =>
          cleanContent.includes(loc) || title.includes(loc)
        ) || "India";

        // Extract date from content
        const dateMatch = cleanContent.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+202\d)/i);
        const dateStr = dateMatch?.[1] || pubDate.slice(0, 16) || "Check website";

        // Match BPharm skills
        const jobText = (title + " " + cleanContent).toLowerCase();
        const matchedSkills = BPHARM_SKILLS.filter((skill) =>
          jobText.includes(skill.toLowerCase())
        );

        allJobs.push({
          title,
          company,
          location: foundLocation,
          date: dateStr,
          description: cleanContent.slice(0, 500),
          jobUrl: link,
          skills: matchedSkills.length > 0 ? matchedSkills : ["BPharm", "Pharmacy"],
        });
      }
    } catch (err) {
      console.error(`Feed error for ${feedUrl}:`, err);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allJobs.filter((j) => {
    if (seen.has(j.jobUrl)) return false;
    seen.add(j.jobUrl);
    return true;
  });

  return NextResponse.json({ walkinJobs: unique, total: unique.length });
}
