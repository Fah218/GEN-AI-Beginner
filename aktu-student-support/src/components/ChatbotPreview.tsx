"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  FileText
} from "lucide-react";

interface QuickChatPreviewProps {
  onSelectQuery?: (q: string) => void;
}

export default function ChatbotPreview() {
  const [selectedDemo, setSelectedDemo] = useState<number>(0);

  const demoScenarios = [
    {
      userQuery: "What is the criteria for awarding grace marks in B.Tech?",
      botResponse: "Under **AKTU Ordinance Clause 12.3**:\n• A maximum of **10 grace marks** can be awarded per academic year to clear back papers.\n• It applies across not more than 3 subjects (theory or practical).\n• Awarded only if clearing these subjects allows the student to progress to the next academic year without year-back.",
      category: "Examination Ordinance",
      tag: "Passing Criteria",
    },
    {
      userQuery: "How do I calculate AKTU CGPA to percentage?",
      botResponse: "As per official AKTU notification (Ref: AKTU/COE/2022/4112):\n$$\\text{Equivalent Percentage (\\%)} = \\text{CGPA} \\times 10$$\n*Example:* If your CGPA on OneView is **7.84**, your aggregate percentage is **78.4%**.",
      category: "Academic Rules",
      tag: "CGPA Conversion",
    },
    {
      userQuery: "What is the fee and process for Challenge Evaluation?",
      botResponse: "The Challenge Evaluation follows a **2-Stage SOP**:\n1. **Stage 1 (Booklet Viewing):** Apply on ERP with ₹300 per subject to inspect the digital answer script.\n2. **Stage 2 (Challenge Evaluation):** If unsatisfied, pay ₹2,500/subject for external evaluation. If marks increase by ≥ 20%, **₹1,500 is refunded** to your bank account.",
      category: "Carry-over & Scrutiny",
      tag: "Challenge Evaluation",
    },
  ];

  return (
    <div className="relative rounded-2xl p-1 bg-gradient-to-b from-blue-500/30 via-indigo-500/10 to-transparent shadow-2xl shadow-blue-900/20">
      <div className="bg-slate-900/90 rounded-[15px] border border-slate-800/80 backdrop-blur-xl overflow-hidden">
        {/* Terminal / Chat Window Header */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              <span>AKTU AI Knowledge Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Knowledge Base
            </span>
          </div>
        </div>

        {/* Demo Topic Switcher Chips */}
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/50 flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 text-[11px] self-center mr-1">Sample Queries:</span>
          {demoScenarios.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDemo(idx)}
              className={`px-3 py-1 rounded-full font-medium transition-all text-xs flex items-center gap-1.5 ${
                selectedDemo === idx
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              <span>{demo.tag}</span>
              {selectedDemo === idx && <Sparkles className="w-3 h-3 text-sky-300" />}
            </button>
          ))}
        </div>

        {/* Chat message dialog body */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[300px] flex flex-col justify-center">
          
          {/* User message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 text-white p-3.5 shadow-md shadow-blue-600/10 text-sm">
              <p className="font-medium">{demoScenarios[selectedDemo].userQuery}</p>
              <div className="flex justify-end mt-1 text-[10px] text-blue-200">
                10:42 AM
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          {/* Bot response */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            
            <div className="max-w-[90%] sm:max-w-[82%] rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/70 p-4 shadow-lg text-sm text-slate-200 space-y-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                  {demoScenarios[selectedDemo].category}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Rule
                </span>
              </div>

              <div className="text-slate-200 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                {demoScenarios[selectedDemo].botResponse}
              </div>

              {/* Citations preview */}
              <div className="pt-2 mt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-400" /> Reference: AKTU Gazette Vol. 4
                </span>
                <Link 
                  href="/resources?category=regulations" 
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                >
                  View Ordinance <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive mock input preview */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              placeholder="Ask anything about syllabus, back paper rules, dates..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-400 focus:outline-none cursor-pointer"
            />
          </div>
          <Link
            href="/chat"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
