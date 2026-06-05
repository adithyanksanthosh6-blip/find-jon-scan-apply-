"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ResumePageProps {
  userId: string;
}

const BPHARM_SKILL_OPTIONS = [
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
  "IR Spectroscopy",
  "Formulation Development",
  "Tablet Coating",
  "Capsule Filling",
  "Sterile Manufacturing",
  "GCP Guidelines",
  "MedDRA Coding",
  "Adverse Event Reporting",
  "ICSR Processing",
  "MS Office",
];

interface ResumeData {
  id: string;
  fileName: string;
  skills: string[];
  experience: { title: string; company: string; duration: string }[];
  education: { degree: string; institution: string; year: string }[];
  summary: string;
  matchScore: number;
  parsedData: { matchedBPharmSkills?: string[] } | null;
}

export default function ResumePage({ userId }: ResumePageProps) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // CV Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<
    { title: string; company: string; duration: string }[]
  >([{ title: "", company: "", duration: "" }]);
  const [educations, setEducations] = useState<
    { degree: string; institution: string; year: string }[]
  >([{ degree: "Bachelor of Pharmacy (BPharm)", institution: "", year: "" }]);

  const fetchResume = useCallback(async () => {
    try {
      const res = await fetch(`/api/resume?userId=${userId}`);
      const data = await res.json();
      if (data.resume) {
        setResume(data.resume);
        setSelectedSkills((data.resume.skills as string[]) || []);
        setSummary(data.resume.summary || "");
        if (data.resume.experience && (data.resume.experience as { title: string; company: string; duration: string }[]).length > 0) {
          setExperiences(data.resume.experience as { title: string; company: string; duration: string }[]);
        }
        if (data.resume.education && (data.resume.education as { degree: string; institution: string; year: string }[]).length > 0) {
          setEducations(data.resume.education as { degree: string; institution: string; year: string }[]);
        }
      } else {
        setShowForm(true);
      }
    } catch (err) {
      console.error("Failed to fetch resume:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  // --- CV Upload & AI Parse ---
  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setParseError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError("File is too large. Please upload a PDF under 10MB.");
      return;
    }
    setParseError("");
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleParseCV = async () => {
    if (!uploadedFile) return;
    setParsing(true);
    setParseError("");

    try {
      // Convert PDF to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(uploadedFile);
      });

      // Send to Claude API for parsing
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
                  text: `Extract information from this CV/resume and return ONLY a JSON object with no preamble or markdown. The JSON must have these fields:
{
  "skills": ["skill1", "skill2", ...],
  "summary": "professional summary text",
  "experience": [{"title": "Job Title", "company": "Company Name", "duration": "Duration"}],
  "education": [{"degree": "Degree Name", "institution": "Institution Name", "year": "Year"}]
}
Focus on pharmaceutical, chemistry, and science-related skills. Extract as many relevant skills as possible from the CV content.`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");

      if (!text) throw new Error("No response from AI");

      // Clean and parse JSON
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Auto-fill form fields
      if (parsed.skills?.length) {
        // Match against known BPharm skills + add custom ones
        const matched = parsed.skills.filter((s: string) =>
          BPHARM_SKILL_OPTIONS.some(
            (opt) =>
              opt.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(opt.toLowerCase())
          )
        );
        const knownMatched = BPHARM_SKILL_OPTIONS.filter((opt) =>
          parsed.skills.some(
            (s: string) =>
              opt.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(opt.toLowerCase())
          )
        );
        const extras = parsed.skills.filter(
          (s: string) =>
            !matched.includes(s) &&
            !knownMatched.some(
              (k) =>
                k.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(k.toLowerCase())
            )
        );
        setSelectedSkills([...new Set([...knownMatched, ...extras])]);
      }
      if (parsed.summary) setSummary(parsed.summary);
      if (parsed.experience?.length) setExperiences(parsed.experience);
      if (parsed.education?.length) setEducations(parsed.education);

      setShowForm(true);
    } catch (err) {
      console.error("CV parse error:", err);
      setParseError("Failed to parse CV. Please fill in your details manually below.");
      setShowForm(true);
    } finally {
      setParsing(false);
    }
  };

  // --- Existing helpers ---
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleSave = async () => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fileName: uploadedFile?.name || "cv_bpharm.pdf",
          skills: selectedSkills,
          experience: experiences.filter((e) => e.title || e.company),
          education: educations.filter((e) => e.institution),
          summary,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResume(data.resume);
        setShowForm(false);
        setUploadedFile(null);
      } else {
        alert(data.error || "Failed to save CV");
      }
    } catch {
      alert("Network error saving CV");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          📄 CV Analysis & Skills
        </h1>
        <p className="text-slate-600">
          Upload your CV for AI-powered parsing, or enter your BPharm qualifications manually.
        </p>
      </div>

      {/* CV Upload Section — shown when no resume or editing */}
      {(showForm || !resume) && !parsing && (
        <div className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? "border-primary-500 bg-primary-50"
                : uploadedFile
                ? "border-green-400 bg-green-50"
                : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✅</div>
                <p className="font-semibold text-green-700">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024).toFixed(0)} KB — ready to parse
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setParseError(""); }}
                  className="text-xs text-slate-400 hover:text-red-500 mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-3xl">📎</div>
                <div>
                  <p className="font-semibold text-slate-700">
                    Drop your CV here or <span className="text-primary-600">browse</span>
                  </p>
                  <p className="text-sm text-slate-400 mt-1">PDF files only · Max 10MB</p>
                </div>
              </div>
            )}
          </div>

          {parseError && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              ⚠️ {parseError}
            </p>
          )}

          {uploadedFile && (
            <button
              onClick={handleParseCV}
              disabled={parsing}
              className="mt-3 w-full py-3 bg-gradient-to-r from-primary-600 to-pharma-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-pharma-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {parsing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI is reading your CV...
                </>
              ) : (
                "🤖 Parse CV with AI"
              )}
            </button>
          )}

          {!uploadedFile && (
            <p className="mt-3 text-center text-sm text-slate-400">
              — or fill in your details manually below —
            </p>
          )}
        </div>
      )}

      {/* Parsing overlay */}
      {parsing && (
        <div className="mb-6 bg-white rounded-2xl border border-primary-100 shadow-sm p-8 flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
          <div className="text-center">
            <p className="font-semibold text-slate-900">Reading your CV...</p>
            <p className="text-sm text-slate-500 mt-1">AI is extracting your skills, experience and education</p>
          </div>
        </div>
      )}

      {/* Existing Resume Display */}
      {resume && !showForm && (
        <div className="space-y-6">
          {/* Match Score */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={resume.matchScore >= 70 ? "#22c55e" : resume.matchScore >= 40 ? "#eab308" : "#ef4444"}
                      strokeWidth="8"
                      strokeDasharray={`${(resume.matchScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">{resume.matchScore}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    BPharm Relevance Score
                  </h3>
                  <p className="text-sm text-slate-500">
                    Based on {(resume.skills as string[]).length} skills analyzed
                  </p>
                  {resume.fileName && resume.fileName !== "cv_bpharm.pdf" && (
                    <p className="text-xs text-slate-400 mt-0.5">📎 {resume.fileName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary-50 text-primary-600 font-medium rounded-lg hover:bg-primary-100 transition-all text-sm"
              >
                ✏️ Edit CV
              </button>
            </div>
          </div>

          {/* Matched Skills */}
          {resume.parsedData &&
            typeof resume.parsedData === "object" &&
            "matchedBPharmSkills" in resume.parsedData &&
            Array.isArray(resume.parsedData.matchedBPharmSkills) &&
            resume.parsedData.matchedBPharmSkills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                ✅ Matched BPharm Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.parsedData.matchedBPharmSkills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All Skills */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              🏷️ Your Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(resume.skills as string[])?.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                📝 Professional Summary
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {(resume.experience as { title: string; company: string; duration: string }[])?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                💼 Experience
              </h3>
              <div className="space-y-3">
                {(resume.experience as { title: string; company: string; duration: string }[]).map((exp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="text-lg">🏥</span>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {exp.title}
                      </div>
                      <div className="text-slate-600 text-xs">
                        {exp.company} · {exp.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CV Form */}
      {showForm && !parsing && (
        <div className="space-y-6">
          {/* Skills Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              🏷️ Select Your BPharm Skills
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Click to select skills that match your expertise ({selectedSkills.length} selected)
              {uploadedFile && <span className="ml-2 text-primary-600 font-medium">✨ AI pre-filled from your CV</span>}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {BPHARM_SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    selectedSkills.includes(skill)
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600"
                  }`}
                >
                  {selectedSkills.includes(skill) ? "✔ " : ""}
                  {skill}
                </button>
              ))}
            </div>
            {/* Custom skills not in the list */}
            {selectedSkills.filter(s => !BPHARM_SKILL_OPTIONS.includes(s)).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Custom skills from your CV:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.filter(s => !BPHARM_SKILL_OPTIONS.includes(s)).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-primary-500 text-white rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {skill}
                      <button onClick={() => toggleSkill(skill)} className="ml-1 hover:text-red-200">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                placeholder="Add custom skill..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={addCustomSkill}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              📝 Professional Summary
            </h3>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="e.g. Dedicated BPharm graduate with hands-on experience in quality control, HPLC analysis, and GMP compliance..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              🎓 Education
            </h3>
            {educations.map((edu, idx) => (
              <div key={idx} className="grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...educations];
                    updated[idx] = { ...updated[idx], degree: e.target.value };
                    setEducations(updated);
                  }}
                  placeholder="Degree"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...educations];
                    updated[idx] = { ...updated[idx], institution: e.target.value };
                    setEducations(updated);
                  }}
                  placeholder="Institution"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => {
                    const updated = [...educations];
                    updated[idx] = { ...updated[idx], year: e.target.value };
                    setEducations(updated);
                  }}
                  placeholder="Year"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            ))}
            <button
              onClick={() =>
                setEducations([...educations, { degree: "", institution: "", year: "" }])
              }
              className="text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              + Add Education
            </button>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              💼 Experience (Optional)
            </h3>
            {experiences.map((exp, idx) => (
              <div key={idx} className="grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    setExperiences(updated);
                  }}
                  placeholder="Job Title"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx] = { ...updated[idx], company: e.target.value };
                    setExperiences(updated);
                  }}
                  placeholder="Company"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  value={exp.duration}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx] = { ...updated[idx], duration: e.target.value };
                    setExperiences(updated);
                  }}
                  placeholder="Duration"
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            ))}
            <button
              onClick={() =>
                setExperiences([...experiences, { title: "", company: "", duration: "" }])
              }
              className="text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              + Add Experience
            </button>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            {resume && (
              <button
                onClick={() => { setShowForm(false); setUploadedFile(null); }}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || selectedSkills.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-pharma-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-pharma-700 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "🚀 Analyze & Save CV"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
