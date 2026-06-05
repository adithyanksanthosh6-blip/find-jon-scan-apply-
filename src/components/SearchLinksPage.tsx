"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchLinksPageProps {
  userId: string;
}

interface SearchLink {
  id: string;
  url: string;
  platform: string;
  label: string;
  isActive: boolean;
  createdAt: string;
}

const SUGGESTED_LINKS = [
  {
    platform: "PharmaBharat",
    icon: "PB",
    color: "bg-emerald-600",
    featured: true,
    links: [
      {
        label: "Quality Control Jobs",
        url: "https://pharmabharat.com/category/quality-control-jobs/",
      },
      {
        label: "Quality Assurance Jobs",
        url: "https://pharmabharat.com/category/quality-assurance-jobs/",
      },
      {
        label: "Regulatory Affairs Jobs",
        url: "https://pharmabharat.com/category/regulatory-affairs-jobs/",
      },
      {
        label: "Clinical Research Jobs",
        url: "https://pharmabharat.com/category/clinical-data-management-jobs/",
      },
      {
        label: "Production Jobs",
        url: "https://pharmabharat.com/category/production-jobs/",
      },
      {
        label: "Government Pharma Jobs",
        url: "https://pharmabharat.com/category/government-jobs/",
      },
    ],
  },
  {
    platform: "LinkedIn",
    icon: "in",
    color: "bg-blue-600",
    links: [
      {
        label: "BPharm Jobs India",
        url: "https://www.linkedin.com/jobs/search/?keywords=BPharm&location=India",
      },
      {
        label: "Pharma QC Analyst",
        url: "https://www.linkedin.com/jobs/search/?keywords=Pharmaceutical+Quality+Control&location=India",
      },
      {
        label: "Pharmacovigilance Jobs",
        url: "https://www.linkedin.com/jobs/search/?keywords=Pharmacovigilance&location=India",
      },
    ],
  },
  {
    platform: "Indeed",
    icon: "i",
    color: "bg-blue-800",
    links: [
      {
        label: "BPharm Fresher Jobs",
        url: "https://www.indeed.co.in/jobs?q=bpharm+fresher&l=India",
      },
      {
        label: "Pharma Production Jobs",
        url: "https://www.indeed.co.in/jobs?q=pharmaceutical+production&l=India",
      },
      {
        label: "Medical Representative",
        url: "https://www.indeed.co.in/jobs?q=medical+representative+pharma&l=India",
      },
    ],
  },
  {
    platform: "Naukri",
    icon: "N",
    color: "bg-purple-600",
    links: [
      {
        label: "BPharm Jobs",
        url: "https://www.naukri.com/bpharm-jobs",
      },
      {
        label: "Pharma Quality Assurance",
        url: "https://www.naukri.com/pharmaceutical-quality-assurance-jobs",
      },
      {
        label: "Regulatory Affairs",
        url: "https://www.naukri.com/regulatory-affairs-pharma-jobs",
      },
    ],
  },
];

export default function SearchLinksPage({ userId }: SearchLinksPageProps) {
  const [links, setLinks] = useState<SearchLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [error, setError] = useState("");

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/search-links?userId=${userId}`);
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async (url: string, label: string) => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/search-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url, label }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add link");
        return;
      }
      await fetchLinks();
      setCustomUrl("");
      setCustomLabel("");
    } catch {
      setError("Network error adding link");
    } finally {
      setAdding(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/search-links?id=${id}`, { method: "DELETE" });
      await fetchLinks();
    } catch {
      alert("Failed to delete link");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          🔍 Job Search URLs
        </h1>
        <p className="text-slate-600">
          Add job search URLs from LinkedIn, Indeed, or Naukri.com. The
          automation engine will crawl these pages to find matching BPharm jobs.
        </p>
      </div>

      {/* Custom URL Input */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          ➕ Add Custom Search URL
        </h3>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste job search URL from LinkedIn, Indeed, or Naukri.com..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
          <div className="flex gap-3">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Label (optional) e.g. 'QC Analyst Jobs Mumbai'"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={() => addLink(customUrl, customLabel)}
              disabled={adding || !customUrl}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-pharma-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-pharma-700 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? "Adding..." : "Add URL"}
            </button>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Supported: linkedin.com/jobs/*, indeed.com/jobs/*, naukri.com/*-jobs
        </div>
      </div>

      {/* Suggested Links */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          ⚡ Quick Add — BPharm Job Searches
        </h3>
        <div className="space-y-6">
          {SUGGESTED_LINKS.map((group) => (
            <div key={group.platform} className={("featured" in group && group.featured) ? "bg-emerald-50 rounded-xl p-4 -mx-2 mb-4 border border-emerald-200" : ""}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 ${group.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                >
                  {group.icon}
                </div>
                <span className="font-semibold text-slate-700 text-sm">
                  {group.platform}
                </span>
                {("featured" in group && group.featured) && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    ⭐ Recommended for BPharm
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                {group.links.map((link) => {
                  const alreadyAdded = links.some((l) => l.url === link.url);
                  return (
                    <button
                      key={link.url}
                      onClick={() => !alreadyAdded && addLink(link.url, link.label)}
                      disabled={adding || alreadyAdded}
                      className={`p-3 rounded-xl text-left text-sm transition-all border ${
                        alreadyAdded
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-slate-50 border-slate-100 hover:border-primary-200 hover:bg-primary-50 text-slate-700"
                      }`}
                    >
                      <div className="font-medium">
                        {alreadyAdded ? "✓ " : "+ "}
                        {link.label}
                      </div>
                      <div className="text-xs mt-1 text-slate-400 truncate">
                        {link.url}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Links */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          📋 Your Active Search Links ({links.length})
        </h3>
        {links.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-slate-500">
              No search links added yet. Add URLs above to start finding jobs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const display = getPlatformDisplay(link.platform);
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl group"
                >
                  <div
                    className={`w-10 h-10 ${display.color} rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  >
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">
                      {link.label}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {link.url}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {display.name}
                  </span>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
