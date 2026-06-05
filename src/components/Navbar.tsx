"use client";

import { useState } from "react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userName?: string;
}

export default function Navbar({ currentPage, onNavigate, userName }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "platforms", label: "Platforms", icon: "🔗" },
    { id: "resume", label: "CV Analysis", icon: "📄" },
    { id: "search", label: "Job Search", icon: "🔍" },
    { id: "jobs", label: "Applications", icon: "💼" },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <span className="text-2xl mr-2">💊</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-pharma-600 bg-clip-text text-transparent">
              PharmaApply
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* User */}
          <div className="hidden md:flex items-center gap-3">
            {userName && (
              <span className="text-sm text-slate-600">
                👋 {userName}
              </span>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
