import Link from "next/link";
import { 
  GraduationCap, 
  FileText, 
  Calendar, 
  BellRing, 
  Award, 
  ArrowRight, 
  ExternalLink,
  Download,
  Search,
  BookOpenCheck
} from "lucide-react";
import { CATEGORIES } from "@/data/mockData";

export default function ResourceCategories() {
  const resourceIcons: Record<string, any> = {
    syllabus: GraduationCap,
    regulations: BookOpenCheck,
    calendar: Calendar,
    circulars: BellRing,
    results: Award,
  };

  const featureCards = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <section className="py-20 relative overflow-hidden" id="categories">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Official University Repository</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            5 Core Knowledge Pillars for AKTU Students
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Browse verified academic guidelines, ordinances, mark calculation sheets, and syllabus documents curated directly from university notices.
          </p>
        </div>

        {/* 5 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((category, index) => {
            const Icon = resourceIcons[category.id] || FileText;

            return (
              <div
                key={category.id}
                className="group relative rounded-2xl glass-panel p-6 sm:p-7 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-[1px] shadow-lg shadow-blue-500/20">
                      <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/50">
                      Pillar #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                    {category.label}
                  </h3>

                  <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/resources?category=${category.id}`}
                    className="text-xs sm:text-sm font-semibold text-sky-400 group-hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore Documents</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[11px] text-slate-400 font-medium bg-slate-800/60 px-2 py-0.5 rounded">
                    Verified PDF/ERP
                  </span>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Direct AI Query Assistant Card */}
          <div className="group relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-blue-900/60 via-indigo-950/80 to-slate-900 border border-blue-500/40 shadow-xl shadow-blue-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                  Instant Answers
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">
                Can&apos;t find what you need?
              </h3>

              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Ask our AI assistant directly. It understands complex AKTU circulars, back paper rules, credit requirements, and challenge evaluation policies.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-blue-800/40">
              <Link
                href="/chat"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Launch Student AI Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
