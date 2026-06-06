"use client";

import { useState, useEffect } from "react";

interface WalkinJob {
  title: string;
  company: string;
  location: string;
  date: string;
  description: string;
  jobUrl: string;
  skills: string[];
}

interface WalkInPageProps {
  userSkills?: string[];
}

export default function WalkInPage({ userSkills = [] }: WalkInPageProps) {
  const [jobs, setJobs] = useState<WalkinJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchWalkins = async () => {
      try {
        const res = await fetch("/api/walkin-jobs");
        const data = await res.json();
        if (res.ok) {
          setJobs(data.walkinJobs || []);
          setLastUpdated(new Date().toLocaleTimeString("en-IN"));
        } else {
          setError("Failed to load walk-in interviews.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchWalkins();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase();
    return (
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  // Sort: jobs matching user skills first
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const aMatch = a.skills.filter((s) =>
      userSkills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    ).length;
    const bMatch = b.skills.filter((s) =>
      userSkills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    ).length;
    return bMatch - aMatch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
        <p className="text-slate-600 font-medium">Loading walk-in interviews from PharmaBharat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">🚶 Walk-In Interviews</h1>
            <p className="text-slate-500">
              Live walk-in interviews from{" "}
              <a href="https://pharmabharat.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">
                PharmaBharat.com ↗
              </a>
              {lastUpdated && <span className="text-slate-400 ml-2 text-xs">· Updated at {lastUpdated}</span>}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-amber-700">{jobs.length}</div>
            <div className="text-xs text-amber-600">Walk-Ins Found</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div>
          <p className="font-semibold text-emerald-800">How to attend a walk-in interview</p>
          <p className="text-sm text-emerald-700 mt-1">
            Click <strong>"View Full Details"</strong> on any job to see the venue, date & time on PharmaBharat. Bring your CV, mark sheets, and ID proof.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title, company, location, or skill..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          ⚠️ {error} — <a href="https://pharmabharat.com/category/walk-in-interview/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Browse PharmaBharat directly ↗</a>
        </div>
      )}

      {/* Jobs */}
      {sortedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <span className="text-5xl mb-4 block">🚶</span>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Walk-In Interviews Found</h3>
          <p className="text-slate-500 text-sm mb-4">Try clearing your search or check PharmaBharat directly.</p>
          <a
            href="https://pharmabharat.com/category/walk-in-interview/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Browse PharmaBharat ↗
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs.map((job, idx) => {
            const isExpanded = expandedJob === job.jobUrl;
            const userMatchCount = job.skills.filter((s) =>
              userSkills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
            ).length;
            const matchPct = userSkills.length > 0
              ? Math.round((userMatchCount / Math.max(job.skills.length, 1)) * 100)
              : null;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-all ring-1 ring-amber-50"
              >
                {/* Walk-in tag */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between">
                  <span>🚶 WALK-IN INTERVIEW — Attend in Person</span>
                  {matchPct !== null && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{matchPct}% skill match</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
                      PB
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{job.title}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {job.company}
                        <span className="text-slate-400"> · {job.location}</span>
                      </p>

                      {/* Date */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                          📅 {job.date}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                          PharmaBharat
                        </span>
                      </div>

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 4).map((skill, i) => {
                            const isUserSkill = userSkills.some((us) =>
                              us.toLowerCase().includes(skill.toLowerCase()) ||
                              skill.toLowerCase().includes(us.toLowerCase())
                            );
                            return (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  isUserSkill
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {isUserSkill ? "✓ " : ""}{skill}
                              </span>
                            );
                          })}
                          {job.skills.length > 4 && (
                            <span className="text-xs text-slate-400">+{job.skills.length - 4} more</span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow"
                        >
                          🚶 View Full Details & Venue ↗
                        </a>
                        <button
                          onClick={() => setExpandedJob(isExpanded ? null : job.jobUrl)}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                          {isExpanded ? "Hide ▲" : "Preview ▼"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">📋 Description Preview</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-2">📌 How to Attend This Walk-In</p>
                      <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                        <li>Click <strong>"View Full Details & Venue"</strong> to get exact venue, date & time</li>
                        <li>Carry printed copies of your updated CV</li>
                        <li>Bring original mark sheets and degree certificates</li>
                        <li>Carry a valid government ID proof</li>
                        <li>Arrive early — interviews are on first-come first-served basis</li>
                      </ol>
                    </div>
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Open full post on PharmaBharat ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
