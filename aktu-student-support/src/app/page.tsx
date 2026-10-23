"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  Users, 
  Award,
  Zap,
  HelpCircle,
  FileCheck2,
  ChevronDown,
  Building2,
  ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotPreview from "@/components/ChatbotPreview";
import ResourceCategories from "@/components/ResourceCategories";
import { SUGGESTED_QUERIES } from "@/data/mockData";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    { label: "Affiliated Colleges", value: "800+" },
    { label: "Engineering Students", value: "400K+" },
    { label: "Curriculum Documents", value: "1,200+" },
    { label: "Verified Ordinances", value: "100%" },
  ];

  const features = [
    {
      title: "Ordinance & Grace Rule Clarification",
      description: "Quickly check whether you qualify for grace marks, carry-over examination, or division upgrade under AKTU regulations.",
      icon: ShieldCheck,
      badge: "Rule Engine",
    },
    {
      title: "Latest NEP 2020 & AICTE Syllabus",
      description: "Access official credit schemes, core and departmental elective curriculum for B.Tech CSE, IT, ECE, ME, and more.",
      icon: BookOpen,
      badge: "Curriculum",
    },
    {
      title: "Challenge Evaluation & Results SOP",
      description: "Get detailed clarity on Stage 1 answer booklet viewing (₹300) and Stage 2 challenge evaluation recheck with refund terms.",
      icon: Award,
      badge: "Examinations",
    },
    {
      title: "Examination Schedules & Datesheets",
      description: "Stay ahead of odd/even semester examination timetables, practical viva dates, and admit card release dates.",
      icon: Zap,
      badge: "Real-time Notices",
    },
  ];

  const faqs = [
    {
      question: "How does the AKTU Student AI Chatbot provide accurate information?",
      answer: "The chatbot knowledge base is aligned with official Dr. A.P.J. Abdul Kalam Technical University ordinances, Controller of Examination notices, syllabus PDF schemes, and ERP updates so answers remain factual, grounded, and reference official clauses.",
    },
    {
      question: "Can I find branch-wise syllabus for 1st through 4th year B.Tech?",
      answer: "Yes! The Resources section contains the complete repository for AICTE and NEP 2020 B.Tech schemes across CSE, AI/ML, Data Science, IT, ECE, EE, Civil, and Mechanical engineering branches.",
    },
    {
      question: "What should I do if my attendance is below 75%?",
      answer: "According to AKTU detention ordinances, 75% attendance is mandatory. However, on genuine medical grounds (accompanied by a CMO-attested certificate), a relaxation of up to 15% can be granted by the College Director/Dean.",
    },
    {
      question: "Is this portal accessible from mobile phones and tablets?",
      answer: "Yes! The entire portal and AI chat dashboard is built with responsive UI, allowing students to access syllabus, circulars, and the AI chatbot seamlessly from any device.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b101b] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
          {/* Background ambient decorative glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headline and Call to Actions */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                
                {/* Status pill badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-blue-500/30 text-xs font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-300">Dr. A.P.J. Abdul Kalam Technical University</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Academic AI Helpdesk</span>
                </div>

                {/* Primary Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Instant Academic Support for <br className="hidden sm:inline" />
                  <span className="text-gradient">AKTU Engineering</span> Students
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Clear your doubts about B.Tech syllabus, grace marks, carry-over rules, academic calendars, and challenge evaluations in seconds with official university references.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <Link
                    href="/chat"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Bot className="w-5 h-5 text-sky-300" />
                    <span>Start Chatting with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/resources"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white hover:bg-slate-800/80 font-medium text-sm border border-slate-700/80 transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Browse Syllabus & Schemes</span>
                  </Link>
                </div>

                {/* Quick Prompts list */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Popular Inquiries:
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    {SUGGESTED_QUERIES.slice(0, 3).map((query, index) => (
                      <Link
                        key={index}
                        href={`/chat?query=${encodeURIComponent(query)}`}
                        className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{query}</span>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Chatbot Preview Component */}
              <div className="lg:col-span-5 relative">
                <ChatbotPreview />
              </div>

            </div>

            {/* University Stats Bar */}
            <div className="mt-20 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 5 RESOURCE CATEGORIES SECTION */}
        <ResourceCategories />

        {/* KEY FEATURES SECTION */}
        <section className="py-20 bg-slate-950/60 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                Engineered for University Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                Designed to Solve Common AKTU Student Confusion
              </h2>
              <p className="mt-4 text-slate-400 text-sm sm:text-base">
                No more digging through 200-page gazettes or waiting in college administrative lines for straightforward academic answers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-1 text-xs text-sky-400 font-medium">
                      <span>Full Ordinance Backing</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-20" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Common Student Inquiries
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-4">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Have questions about ordinances, back paper rules, or syllabus access?
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl glass-panel border border-slate-800/80 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-slate-200 hover:text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Student Callout Box */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 text-center space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Ready to find answers for your upcoming examinations?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Join over thousands of AKTU students using AI for immediate academic guidance, syllabus verification, and exam preparation.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/chat"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Ask AI Now
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
                >
                  Create Student Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
