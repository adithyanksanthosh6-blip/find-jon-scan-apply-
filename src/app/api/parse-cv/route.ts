import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { base64, filename } = await req.json();

    if (!base64) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              },
              {
                type: "text",
                text: `Extract information from this CV/resume and return ONLY a JSON object with no preamble or markdown backticks. The JSON must have exactly these fields:
{
  "skills": ["skill1", "skill2"],
  "summary": "professional summary text",
  "experience": [{"title": "Job Title", "company": "Company Name", "duration": "Duration"}],
  "education": [{"degree": "Degree Name", "institution": "Institution Name", "year": "Year"}]
}
Focus on pharmaceutical, chemistry, and science-related skills. Extract as many relevant skills as possible.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return NextResponse.json({ error: "AI parsing failed" }, { status: 500 });
    }

    const text = data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

    if (!text) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ parsed, filename });
  } catch (error) {
    console.error("CV parse route error:", error);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
