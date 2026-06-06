"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OnboardingForm from "@/components/OnboardingForm";
import DashboardPage from "@/components/DashboardPage";
import PlatformsPage from "@/components/PlatformsPage";
import ResumePage from "@/components/ResumePage";
import SearchLinksPage from "@/components/SearchLinksPage";
import JobsPage from "@/components/JobsPage";
import WalkInPage from "@/components/WalkInPage";

interface User {
  id: string;
  email: string;
  fullName: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pharmaapply_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setCurrentPage("dashboard");
      } catch {
        // Invalid data
      }
    }
    setInitialized(true);
  }, []);

  const handleUserCreated = (newUser: User) => {
    setUser(newUser);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    if (page === "home" && user) {
      setCurrentPage("dashboard");
      return;
    }
    if (page !== "home" && !user) {
      setCurrentPage("onboarding");
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading PharmaApply...</p>
        </div>
      </div>
    );
  }

  // Landing page
  if (currentPage === "home" && !user) {
    return (
      <>
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <HeroSection onGetStarted={() => setCurrentPage("onboarding")} />
      </>
    );
  }

  // Onboarding
  if (currentPage === "onboarding") {
    return <OnboardingForm onComplete={handleUserCreated} />;
  }

  // Authenticated pages
  if (!user) {
    return (
      <>
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <HeroSection onGetStarted={() => setCurrentPage("onboarding")} />
      </>
    );
  }

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userName={user.fullName}
      />
      <main className="min-h-[calc(100vh-64px)]">
        {currentPage === "dashboard" && (
          <DashboardPage userId={user.id} onNavigate={handleNavigate} />
        )}
        {currentPage === "platforms" && (
          <PlatformsPage userId={user.id} />
        )}
        {currentPage === "resume" && (
          <ResumePage userId={user.id} />
        )}
        {currentPage === "search" && (
          <SearchLinksPage userId={user.id} />
        )}
        {currentPage === "jobs" && (
          <JobsPage userId={user.id} />
         )}
       {currentPage === "walkin" && (
       <WalkInPage />
        )}
      </main>
    </>
  );
}
