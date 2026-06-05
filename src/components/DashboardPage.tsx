"use client";

import { useState, useEffect, useCallback } from "react";

interface DashboardPageProps {
  userId: string;
  onNavigate: (page: string) => void;
}

interface Stats {
  totalJobsFound: number;
  totalApplied: number;
  totalRuns: number;
  pendingJobs: number;
  appliedJobs: number;
  failedJobs: number;
  interviewJobs: number;
  connectedPlatforms: number;
  totalPlatforms: number;
  hasResume: boolean;
  resumeMatchScore: number;
  searchLinksCount: number;
}

export default function DashboardPage({ userId, onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [automating, setAutomating] = useState(false);
  const [automationResult, setAutomationResult] = useState<{
    totalFound: number;
    applied: number;
    failed: number;
    walkinPending?: number;
    emailApplications?: number;
    pharmaBharatNote?: string | null;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?userId=${userId}`);
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const runAutomation = async () => {
    setAutomating(true);
    setAutomationResult(null);
    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to run automation");
        return;
      }
      setAutomationResult(data.summary);
      fetchStats(); // Refresh stats
    } catch {
      alert("Network error running automation");
    } finally {
      setAutomating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const setupComplete =
    stats &&
    stats.hasResume &&
    stats.connectedPlatforms > 0 &&
    stats.searchLinksCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600">
          Monitor your automated BPharm job applications
        </p>
      </div>

      {/* Setup Progress */}
      {stats && !setupComplete && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-8">
          <h3 className="text-lg font-bold text-amber-800 mb-4">
            ⚡ Complete Setup to Start Automation
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate("platforms")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                stats.connectedPlatforms > 0
                  ? "border-green-300 bg-green-50"
                  : "border-amber-200 bg-white hover:border-primary-300"
              }`}
            >
              <div className="text-2xl mb-2">
                {stats.connectedPlatforms > 0 ? "✅" : "🔗"}
              </div>
              <div className="font-semibold text-sm text-slate-800">
                Connect Platforms
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.connectedPlatforms}/{stats.totalPlatforms} connected
              </div>
            </button>

            <button
              onClick={() => onNavigate("resume")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                stats.hasResume
                  ? "border-green-300 bg-green-50"
                  : "border-amber-200 bg-white hover:border-primary-300"
              }`}
            >
              <div className="text-2xl mb-2">
                {stats.hasResume ? "✅" : "📄"}
              </div>
              <div className="font-semibold text-sm text-slate-800">
                Upload CV
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.hasResume ? `Score: ${stats.resumeMatchScore}%` : "Not uploaded"}
              </div>
            </button>

            <button
              onClick={() => onNavigate("search")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                stats.searchLinksCount > 0
                  ? "border-green-300 bg-green-50"
                  : "border-amber-200 bg-white hover:border-primary-300"
              }`}
            >
              <div className="text-2xl mb-2">
                {stats.searchLinksCount > 0 ? "✅" : "🔍"}
              </div>
              <div className="font-semibold text-sm text-slate-800">
                Add Search URLs
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.searchLinksCount} link(s) added
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Jobs Found",
            value: stats?.totalJobsFound || 0,
            icon: "🔍",
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Applied",
            value: stats?.totalApplied || 0,
            icon: "✅",
            color: "from-green-500 to-green-600",
          },
          {
            label: "Automation Runs",
            value: stats?.totalRuns || 0,
            icon: "⚡",
            color: "from-purple-500 to-purple-600",
          },
          {
            label: "Platforms Connected",
            value: `${stats?.connectedPlatforms || 0}/${stats?.totalPlatforms || 3}`,
            icon: "🔗",
            color: "from-amber-500 to-orange-500",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`}
              ></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Automation Control */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              🤖 Automation Engine
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Find and apply to BPharm jobs automatically across all connected platforms
            </p>
          </div>
          <button
            onClick={runAutomation}
            disabled={automating || !setupComplete}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg whitespace-nowrap ${
              setupComplete
                ? "bg-gradient-to-r from-primary-600 to-pharma-600 hover:from-primary-700 hover:to-pharma-700"
                : "bg-slate-300 cursor-not-allowed"
            } disabled:opacity-60`}
          >
            {automating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </span>
            ) : (
              "🚀 Run Automation"
            )}
          </button>
        </div>

        {automationResult && (
          <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              ✅ Automation Complete!
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {automationResult.totalFound}
                </div>
                <div className="text-xs text-green-600">Jobs Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {automationResult.applied}
                </div>
                <div className="text-xs text-green-600">Auto-Applied</div>
              </div>
              {automationResult.walkinPending && automationResult.walkinPending > 0 ? (
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {automationResult.walkinPending}
                  </div>
                  <div className="text-xs text-amber-500">Walk-In Required</div>
                </div>
              ) : null}
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {automationResult.failed}
                </div>
                <div className="text-xs text-red-400">Failed</div>
              </div>
            </div>
            {automationResult.pharmaBharatNote && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500">🚶</span>
                  <div className="text-sm text-amber-700">
                    <strong>Walk-In Interviews:</strong> {automationResult.pharmaBharatNote}
                  </div>
                </div>
              </div>
            )}
            {automationResult.emailApplications && automationResult.emailApplications > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">📧</span>
                  <div className="text-sm text-blue-700">
                    <strong>Email Applications:</strong> {automationResult.emailApplications} resumes sent directly to company HR via PharmaBharat listings.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CV Match Score */}
      {stats?.hasResume && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            📊 CV BPharm Relevance Score
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="#e2e8f0" strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={stats.resumeMatchScore >= 70 ? "#22c55e" : stats.resumeMatchScore >= 40 ? "#eab308" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={`${(stats.resumeMatchScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">
                  {stats.resumeMatchScore}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                {stats.resumeMatchScore >= 70
                  ? "Excellent! Your CV is highly relevant for BPharm positions."
                  : stats.resumeMatchScore >= 40
                  ? "Good match. Consider adding more BPharm-specific skills."
                  : "Consider updating your CV with more pharmacy-related skills."}
              </p>
              <button
                onClick={() => onNavigate("resume")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                Update CV →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate("jobs")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="text-2xl mb-2">💼</div>
          <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
            View All Applications
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Track your applied, pending, and interview-stage jobs
          </div>
        </button>

        <button
          onClick={() => onNavigate("search")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
            Manage Search URLs
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Add or remove job search links for automation
          </div>
        </button>

        <button
          onClick={() => onNavigate("platforms")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="text-2xl mb-2">🔗</div>
          <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
            Platform Settings
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Manage your LinkedIn, Indeed, and Naukri connections
          </div>
        </button>
      </div>
    </div>
  );
}
