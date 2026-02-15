import Link from "next/link";
import { ArrowRight, Zap, FolderOpen, Brain, Clock, Shield, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Jobinder</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</a>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">Log in</Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4" /> Automate your job search pipeline
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Aggregate Jobs from
            <span className="text-blue-600"> LinkedIn & Indeed</span>
            <br />in One Place
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop manually searching across platforms. Jobinder automatically fetches, filters, and organizes job listings
            with AI-powered intelligence designed for recruitment teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-lg text-base font-medium border hover:bg-gray-50 transition"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need for job aggregation</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools built specifically for recruitment firms and talent acquisition teams.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FolderOpen,
                title: "Organized Workspaces",
                desc: "Create folders and tables to organize searches by client, role type, or any criteria that fits your workflow.",
              },
              {
                icon: Brain,
                title: "AI-Powered Filtering",
                desc: "Use natural language to filter jobs. 'Only remote positions paying >$100k' - let AI do the screening.",
              },
              {
                icon: Clock,
                title: "Scheduled Updates",
                desc: "Set daily, weekly, or monthly schedules. Wake up to fresh job listings automatically fetched and filtered.",
              },
              {
                icon: Zap,
                title: "Multi-Platform Search",
                desc: "Pull jobs from LinkedIn and Indeed simultaneously. One search, multiple sources, zero duplicates.",
              },
              {
                icon: Shield,
                title: "Smart Deduplication",
                desc: "Advanced hashing ensures you never see the same job twice, even across different platforms.",
              },
              {
                icon: BarChart3,
                title: "Export & Analytics",
                desc: "Export to CSV, track application status, and get insights on your recruitment pipeline.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border hover:shadow-lg transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for trying out",
                features: ["1 folder", "2 tables", "100 jobs/month", "Weekly schedules"],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Starter",
                price: "$29",
                desc: "For individual recruiters",
                features: ["5 folders", "10 tables", "1,000 jobs/month", "Daily schedules", "AI filtering"],
                cta: "Start Trial",
                highlight: false,
              },
              {
                name: "Professional",
                price: "$99",
                desc: "For recruitment teams",
                features: ["Unlimited folders", "50 tables", "10,000 jobs/month", "All schedules", "AI filtering", "CSV export"],
                cta: "Start Trial",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For large organizations",
                features: ["Unlimited everything", "API access", "Custom retention", "Dedicated support", "SLA guarantee"],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border-2 ${
                  plan.highlight ? "border-blue-600 shadow-xl shadow-blue-600/10 relative" : "border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-500">/mo</span>}
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <Link
                  href="/register"
                  className={`block text-center py-2.5 rounded-lg text-sm font-medium transition ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Jobinder</span>
            </div>
            <p className="text-sm text-gray-500">2024 Jobinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
