"use client";

import { useState, useEffect, useCallback } from "react";

interface PlatformsPageProps {
  userId: string;
}

interface Connection {
  id: string;
  platform: "linkedin" | "indeed" | "naukri" | "pharmabharat";
  isConnected: boolean;
  profileUrl: string | null;
  username: string | null;
  connectedAt: string | null;
}

const PLATFORM_INFO = {
  linkedin: {
    name: "LinkedIn",
    icon: "in",
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    description: "Connect your LinkedIn profile for Easy Apply jobs and recruiter visibility.",
    urlPlaceholder: "https://linkedin.com/in/your-profile",
    features: [
      "Access LinkedIn Easy Apply jobs",
      "Auto-submit applications with your profile",
      "Get noticed by pharma recruiters",
    ],
  },
  indeed: {
    name: "Indeed",
    icon: "i",
    color: "bg-blue-800",
    lightColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
    description: "Link your Indeed account to search and apply to pharmaceutical positions.",
    urlPlaceholder: "https://indeed.com/profile/your-profile",
    features: [
      "Search millions of pharma job listings",
      "Apply with Indeed Resume",
      "Track application status",
    ],
  },
  naukri: {
    name: "Naukri.com",
    icon: "N",
    color: "bg-purple-600",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    description: "Connect Naukri.com — India's #1 job portal for BPharm graduates.",
    urlPlaceholder: "https://naukri.com/mnjuser/profile",
    features: [
      "Access India's largest pharma job database",
      "Auto-apply to matching positions",
      "Resume visibility to top pharma recruiters",
    ],
  },
  pharmabharat: {
    name: "PharmaBharat.com",
    icon: "PB",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    description: "India's dedicated BPharm job portal with verified pharma listings from top companies.",
    urlPlaceholder: "https://pharmabharat.com",
    features: [
      "Verified BPharm-specific job listings",
      "Walk-in interview alerts & notifications",
      "Direct email applications to HR",
      "Government pharma job listings",
    ],
  },
};

export default function PlatformsPage({ userId }: PlatformsPageProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { profileUrl: string; username: string }>>({
    linkedin: { profileUrl: "", username: "" },
    indeed: { profileUrl: "", username: "" },
    naukri: { profileUrl: "", username: "" },
    pharmabharat: { profileUrl: "", username: "" },
  });

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(`/api/platforms?userId=${userId}`);
      const data = await res.json();
      setConnections(data.connections || []);

      // Pre-fill form data
      const newFormData: Record<string, { profileUrl: string; username: string }> = {
        linkedin: { profileUrl: "", username: "" },
        indeed: { profileUrl: "", username: "" },
        naukri: { profileUrl: "", username: "" },
        pharmabharat: { profileUrl: "", username: "" },
      };
      for (const conn of data.connections || []) {
        newFormData[conn.platform] = {
          profileUrl: conn.profileUrl || "",
          username: conn.username || "",
        };
      }
      setFormData(newFormData);
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const toggleConnection = async (platform: string) => {
    const conn = connections.find((c) => c.platform === platform);
    const isCurrentlyConnected = conn?.isConnected || false;

    if (!isCurrentlyConnected && !formData[platform].profileUrl) {
      alert("Please enter your profile URL before connecting.");
      return;
    }

    setConnecting(platform);
    try {
      const res = await fetch("/api/platforms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          platform,
          isConnected: !isCurrentlyConnected,
          profileUrl: formData[platform].profileUrl,
          username: formData[platform].username,
        }),
      });

      if (res.ok) {
        await fetchConnections();
      }
    } catch {
      alert("Failed to update connection");
    } finally {
      setConnecting(null);
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
          🔗 Platform Connections
        </h1>
        <p className="text-slate-600">
          Connect your job portal accounts to enable automated applications.
          Your credentials are stored securely.
        </p>
      </div>

      <div className="space-y-6">
        {(["linkedin", "indeed", "naukri", "pharmabharat"] as const).map((platform) => {
          const info = PLATFORM_INFO[platform];
          const conn = connections.find((c) => c.platform === platform);
          const isConnected = conn?.isConnected || false;

          return (
            <div
              key={platform}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                isConnected ? `${info.borderColor} shadow-md` : "border-slate-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 ${info.color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {info.name}
                    </h3>
                    <p className="text-sm text-slate-500">{info.description}</p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isConnected ? "● Connected" : "○ Not Connected"}
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData[platform]?.profileUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [platform]: {
                            ...formData[platform],
                            profileUrl: e.target.value,
                          },
                        })
                      }
                      placeholder={info.urlPlaceholder}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                      disabled={isConnected}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username / Email
                    </label>
                    <input
                      type="text"
                      value={formData[platform]?.username || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [platform]: {
                            ...formData[platform],
                            username: e.target.value,
                          },
                        })
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                      disabled={isConnected}
                    />
                  </div>
                </div>

                {/* Features */}
                <div className={`${info.lightColor} rounded-lg p-4`}>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {info.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={info.textColor}>✓</span>
                        <span className="text-slate-700">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toggleConnection(platform)}
                  disabled={connecting === platform}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isConnected
                      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      : `${info.color} text-white hover:opacity-90 shadow-lg`
                  } disabled:opacity-50`}
                >
                  {connecting === platform ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isConnected ? (
                    "Disconnect Account"
                  ) : (
                    `Connect ${info.name} Account`
                  )}
                </button>

                {isConnected && conn?.connectedAt && (
                  <p className="text-xs text-center text-slate-400">
                    Connected on{" "}
                    {new Date(conn.connectedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
