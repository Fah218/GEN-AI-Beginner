"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  GraduationCap, 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  Filter, 
  Calendar, 
  BookOpenCheck, 
  BellRing, 
  Award,
  Layers,
  Sparkles,
  FileCheck2,
  Share2,
  Check,
  Tag
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORIES, MOCK_RESOURCES } from "@/data/mockData";
import { DocumentResource } from "@/types";

import { Suspense } from "react";

function ResourcesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadModalDoc, setDownloadModalDoc] = useState<DocumentResource | null>(null);

  const branches = [
    { id: "all", label: "All Engineering Branches" },
    { id: "CSE", label: "Computer Science (CSE / AI / ML)" },
    { id: "IT", label: "Information Technology" },
    { id: "ECE", label: "Electronics & Communication" },
    { id: "First Year", label: "First Year Common (AICTE)" },
  ];

  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((doc) => {
      const matchesCategory =
        activeCategory === "all" || doc.category === activeCategory;

      const matchesSearch =
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.officialCode && doc.officialCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBranch =
        selectedBranch === "all" ||
        doc.tags.some((t: string) => t.toLowerCase().includes(selectedBranch.toLowerCase())) ||
        (doc.course && doc.course.toLowerCase().includes(selectedBranch.toLowerCase()));

      return matchesCategory && matchesSearch && matchesBranch;
    });
  }, [activeCategory, searchQuery, selectedBranch]);

  const handleShare = (docId: string) => {
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "syllabus":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "regulations":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "calendar":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "circulars":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "results":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101b] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="py-8 border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Official AKTU Documentation Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Curriculum, Ordinances & Exam Regulations
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl">
                Search and download verified Dr. A.P.J. Abdul Kalam Technical University schemes, carry-over examination policies, grace mark rules, and circulars.
              </p>
            </div>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all self-start md:self-auto shrink-0"
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>Ask AI About These Docs</span>
            </Link>
          </div>
        </div>

        {/* Category Pills Navigation (5 Categories required) */}
        <div className="py-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-100"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{cat.label}</span>
                {cat.id !== "all" && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-slate-300 font-mono">
                    {MOCK_RESOURCES.filter((r) => r.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8">
          
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject name, code, ordinance clause, COP rule..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Branch Filter dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="Filter documents by engineering branch"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{filteredResources.length}</span> documents
            {activeCategory !== "all" && (
              <span> in <span className="text-sky-400">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</span></span>
            )}
          </div>
          {searchQuery && (
            <span className="italic">
              Filtering for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Documents Grid / Empty State */}
        {filteredResources.length === 0 ? (
          <div className="rounded-2xl glass-panel p-12 text-center max-w-lg mx-auto border border-slate-800 my-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No documents found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              No circular or syllabus matched your search criteria. Try clearing filters or asking the AI assistant directly.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setSelectedBranch("all");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Reset All Filters
              </button>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
              >
                Ask Chatbot
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl glass-panel p-6 border border-slate-800/80 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  {/* Category and File Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded border ${getCategoryBadgeColor(
                        doc.category
                      )}`}
                    >
                      {doc.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {doc.fileType} • {doc.fileSize}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">
                    {doc.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {doc.description}
                  </p>

                  {/* Official Code & Session */}
                  {doc.officialCode && (
                    <div className="mb-3 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{doc.officialCode}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {doc.tags.map((tag: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-medium bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-700/60 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    Updated {doc.dateUpdated}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShare(doc.id)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Reference"
                      aria-label="Share document link"
                    >
                      {copiedId === doc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setDownloadModalDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition-all hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download Modal Mock */}
        {downloadModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Official AKTU Document
              </h3>
              <p className="text-xs text-slate-300 font-medium mb-3">
                {downloadModalDoc.title}
              </p>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 mb-5">
                <div className="flex justify-between">
                  <span>Document ID:</span>
                  <span className="font-mono text-slate-200">{downloadModalDoc.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-mono text-slate-200">{downloadModalDoc.fileType} ({downloadModalDoc.fileSize})</span>
                </div>
                <div className="flex justify-between">
                  <span>University Code:</span>
                  <span className="font-mono text-slate-200">{downloadModalDoc.officialCode || "AKTU/2024-STD"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDownloadModalDoc(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Mock Download initiated: "${downloadModalDoc.title}" will open when the official storage backend is linked.`);
                    setDownloadModalDoc(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b101b] text-slate-100 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading AKTU resources...</p>
          </div>
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
