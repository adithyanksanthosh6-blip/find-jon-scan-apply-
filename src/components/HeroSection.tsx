"use client";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pharma-300 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-1/3 w-48 h-48 bg-accent-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                <span className="text-sm">🎓 Built for BPharm Graduates</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Automate Your
                <span className="block text-pharma-200">Pharma Career</span>
                Job Applications
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                Connect your LinkedIn, Indeed, Naukri, and PharmaBharat accounts. Upload your CV.
                Let our AI find and apply to matching pharmaceutical jobs
                automatically — with minimal effort from you.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/20 text-lg"
                >
                  🚀 Get Started Free
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg"
                >
                  Learn More →
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-blue-200 text-sm">
                <span>✓ 100% Free</span>
                <span>✓ BPharm Focused</span>
                <span>✓ 4 Platforms</span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="glass-card rounded-2xl p-6 animate-float">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">PB</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">PharmaBharat</div>
                        <div className="text-xs text-green-600">● Connected</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">in</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">LinkedIn</div>
                        <div className="text-xs text-green-600">● Connected</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">Naukri.com</div>
                        <div className="text-xs text-green-600">● Connected</div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="text-xs text-slate-500 mb-1">Auto-Applied Today</div>
                      <div className="text-2xl font-bold text-slate-800">14 jobs</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 glass-card rounded-xl p-4 animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 text-xl">✓</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">QC Analyst — Sun Pharma</div>
                      <div className="text-xs text-slate-500">Applied 2 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to automate your BPharm job search
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: "👤",
                title: "Create Profile",
                desc: "Sign up with your email and basic details to get started",
              },
              {
                step: "02",
                icon: "🔗",
                title: "Connect Platforms",
                desc: "Link your LinkedIn, Indeed, and Naukri.com accounts securely",
              },
              {
                step: "03",
                icon: "📄",
                title: "Upload CV",
                desc: "Our AI analyzes your BPharm skills and matches them with relevant roles",
              },
              {
                step: "04",
                icon: "🚀",
                title: "Auto Apply",
                desc: "Sit back as we find and apply to matching pharmaceutical positions",
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="gradient-card rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-primary-500 mb-2">
                    STEP {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for BPharm Professionals
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Specialized features designed specifically for pharmacy graduates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔬",
                title: "BPharm Skill Matching",
                desc: "Our AI understands pharmaceutical skills like HPLC, GMP, Pharmacovigilance, Regulatory Affairs, and more to find the perfect job matches.",
              },
              {
                icon: "🌐",
                title: "Multi-Platform Support",
                desc: "Search and apply across LinkedIn, Indeed India, and Naukri.com simultaneously from a single dashboard.",
              },
              {
                icon: "📊",
                title: "Smart CV Analysis",
                desc: "Get detailed insights on your CV's strengths, skill gaps, and BPharm relevance score for better job matching.",
              },
              {
                icon: "⚡",
                title: "One-Click Automation",
                desc: "Start the automation engine with a single click. We handle job discovery, matching, and application submission.",
              },
              {
                icon: "📈",
                title: "Application Tracking",
                desc: "Monitor all your applications in real-time. Track statuses across platforms from your unified dashboard.",
              },
              {
                icon: "🎯",
                title: "Targeted Job Roles",
                desc: "Focus on roles like QC Analyst, Medical Rep, Pharmacovigilance, Regulatory Affairs, and more pharma-specific positions.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Supported Platforms
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "PharmaBharat",
                icon: "PB",
                color: "bg-emerald-600",
                desc: "India's dedicated BPharm job portal with verified listings from Sun Pharma, Cipla, Dr. Reddy's, and more.",
                features: ["Verified BPharm Jobs", "Walk-In Alerts", "Government Jobs", "Direct HR Contact"],
                featured: true,
              },
              {
                name: "LinkedIn",
                icon: "in",
                color: "bg-blue-600",
                desc: "Access the world's largest professional network. Connect with pharma recruiters and apply to premium positions.",
                features: ["Easy Apply", "Recruiter Visibility", "Professional Network"],
              },
              {
                name: "Indeed",
                icon: "i",
                color: "bg-blue-800",
                desc: "Search millions of job listings across India and worldwide. Find pharmaceutical roles from top companies.",
                features: ["Massive Database", "Salary Insights", "Company Reviews"],
              },
              {
                name: "Naukri.com",
                icon: "N",
                color: "bg-purple-600",
                desc: "India's #1 job portal with the largest pharma job listings. Perfect for BPharm freshers and experienced professionals.",
                features: ["India Focused", "Resume Database", "Recruiter Connect"],
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className={`rounded-2xl border overflow-hidden hover:shadow-xl transition-all ${
                  "featured" in platform && platform.featured
                    ? "border-emerald-300 ring-2 ring-emerald-100"
                    : "border-slate-200"
                }`}
              >
                {"featured" in platform && platform.featured && (
                  <div className="bg-emerald-500 text-white text-center text-xs font-semibold py-1">
                    ⭐ RECOMMENDED FOR BPHARM
                  </div>
                )}
                <div className={`${platform.color} p-5 text-center`}>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto text-white text-xl font-bold">
                    {platform.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">
                    {platform.name}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 mb-3">{platform.desc}</p>
                  <ul className="space-y-1.5">
                    {platform.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="text-green-500">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Automate Your Pharma Job Search?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of BPharm graduates who are landing their dream
            pharmaceutical jobs with automated applications.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg"
          >
            Start Applying Now — It&apos;s Free 🎯
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💊</span>
                <span className="text-lg font-bold text-white">PharmaApply</span>
              </div>
              <p className="text-sm">
                Automating job applications for BPharm graduates across India&apos;s
                top job platforms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platforms</h4>
              <ul className="space-y-2 text-sm">
                <li>PharmaBharat.com ⭐</li>
                <li>LinkedIn Integration</li>
                <li>Indeed India</li>
                <li>Naukri.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Job Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>Quality Control</li>
                <li>Pharmacovigilance</li>
                <li>Regulatory Affairs</li>
                <li>Clinical Research</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Technical Specs</h4>
              <ul className="space-y-2 text-sm">
                <li>Next.js App Router</li>
                <li>PostgreSQL + Drizzle ORM</li>
                <li>REST API Architecture</li>
                <li>Real-time Dashboard</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 PharmaApply. Built for BPharm students and professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
