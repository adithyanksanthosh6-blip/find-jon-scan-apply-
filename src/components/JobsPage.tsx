"use client";

import { useState, useEffect, useCallback } from "react";

interface JobsPageProps {
  userId: string;
}

interface Job {
  id: string;
  platform: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  description: string | null;
  matchScore: number | null;
  matchReasons: string[] | null;
  status: string;
  jobUrl: string | null;
  appliedAt: string | null;
  createdAt: string;
}

export default function JobsPage({ userId }: JobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs?userId=${userId}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const statusCounts = {
    all: jobs.length,
    applied: jobs.filter((j) => j.status === "applied").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    interview: jobs.filter((j) => j.status === "interview").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "interview":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPlatformDisplay = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return { icon: "in", color: "bg-blue-600", name: "LinkedIn" };
      case "indeed":
        return { icon: "i", color: "bg-blue-800", name: "Indeed" };
      case "naukri":
        return { icon: "N", color: "bg-purple-600", name: "Naukri" };
      case "pharmabharat":
        return { icon: "PB", color: "bg-emerald-600", name: "PharmaBharat" };
      default:
        return { icon: "?", color: "bg-slate-500", name: platform };
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          💼 Job Applications
        </h1>
        <p className="text-slate-600">
          Track all your automated job applications across platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "applied", "pending", "failed", "interview"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === status
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {statusCounts[status]})
            </button>
          )
        )}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <span className="text-5xl mb-4 block">
            {filter === "all" ? "📋" : "🔍"}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {filter === "all"
              ? "No Applications Yet"
              : `No ${filter} applications`}
          </h3>
          <p className="text-slate-500 text-sm">
            {filter === "all"
              ? "Run the automation from your dashboard to start finding and applying to BPharm jobs."
              : "Try changing the filter to see other applications."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const platform = getPlatformDisplay(job.platform);
            const isExpanded = expandedJob === job.id;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedJob(isExpanded ? null : job.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}
                    >
                      {platform.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {job.company}
                            {job.location && ` • ${job.location}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {job.matchScore != null && (
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                job.matchScore >= 70
                                  ? "bg-green-50 text-green-700"
                                  : job.matchScore >= 40
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {job.matchScore}% match
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{platform.name}</span>
                        {job.salary && <span>💰 {job.salary}</span>}
                        {job.appliedAt && (
                          <span>
                            Applied{" "}
                            {new Date(job.appliedAt).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        <span className="ml-auto">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    {job.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {job.description}
                        </p>
                      </div>
                    )}

                    {job.matchReasons && (job.matchReasons as string[]).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">
                          Matching Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(job.matchReasons as string[]).map(
                            (reason: string, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200"
                              >
                                {reason}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View on {platform.name} →
                      </a>
                    )}
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
