"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  RotateCcw, 
  Menu, 
  X,
  ArrowUpRight,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import { 
  MOCK_CHAT_SESSIONS, 
  SUGGESTED_QUERIES, 
  INITIAL_BOT_MESSAGES 
} from "@/data/mockData";
import { ChatMessage, ChatSession } from "@/types";

export default function ChatDashboardPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-current");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle New Chat
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Student Consultation",
      snippet: "What would you like to inquire about?",
      timestamp: "Just now",
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
    setMessages([
      {
        id: `bot-welcome-${Date.now()}`,
        sender: "bot",
        content: "Hello! I am ready to assist you with a new inquiry. You can ask about B.Tech syllabi, grace marks, carry-over exam schedules, or university circulars.",
        timestamp: "Just now",
        citations: [
          {
            title: "AKTU University Guidelines",
            clause: "Section 2024-25",
            category: "regulations",
          },
        ],
      },
    ]);
  };

  // Mock Realistic AI Responses based on keywords
  const generateMockAnswer = (query: string): ChatMessage => {
    const q = query.toLowerCase();

    if (q.includes("grace") || q.includes("grace mark")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: `**AKTU Grace Marks Regulations (Clause 12.3):**\n\n1. **Maximum Limit:** A candidate is eligible for a maximum of **10 grace marks** in an academic session.\n2. **Subject Spread:** The grace can be distributed across up to 3 subjects (Theory or Practical) if by doing so, the student qualifies for pass or year-clearance.\n3. **Eligibility:** You must have appeared in all required theory papers of the semester/year.\n4. **Transcript Notation:** In your OneView marksheet, grace marks are typically denoted by an asterisk (*) or letter code indicating conditional clearance.`,
        timestamp: "Just now",
        citations: [
          {
            title: "AKTU B.Tech Ordinance Section 12",
            clause: "Clause 12.3 (Award of Grace Marks)",
            category: "regulations",
          },
        ],
      };
    }

    if (q.includes("challenge") || q.includes("scrutiny") || q.includes("reeval") || q.includes("re-evaluation")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: `**AKTU Challenge Evaluation SOP:**\n\n• **Stage 1 (Booklet Inspection):** Pay ₹300 per subject on the ERP portal. You will receive digital access to view your evaluated answer booklet.\n• **Stage 2 (Challenge Evaluation):** If you find checking errors or unawarded answers, apply within the notified window by submitting ₹2,500 per subject.\n• **Refund Clause:** If the re-evaluated marks increase by **20% or more** compared to the original marks, **₹1,500 is refunded** to the student bank account!`,
        timestamp: "Just now",
        citations: [
          {
            title: "AKTU Evaluation Notice",
            clause: "COE Circular 2024/Challenge-SOP",
            category: "regulations",
          },
        ],
      };
    }

    if (q.includes("cgpa") || q.includes("percentage") || q.includes("formula")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: `**AKTU Official CGPA to Percentage Formula:**\n\n$$\\text{Equivalent Percentage (\\%)} = \\text{CGPA} \\times 10$$\n\nFor example:\n• If your CGPA on AKTU OneView is **7.65**, your aggregate percentage is **76.5%**.\n• If your CGPA is **8.40**, your percentage is **84.0%**.\n\n*Note:* This direct multiplier of 10 was officially adopted by the AKTU Academic Council replacing older AICTE conversion formulas.`,
        timestamp: "Just now",
        citations: [
          {
            title: "AKTU Academic Council Resolution",
            clause: "Ref: AKTU/COE/2022/4112",
            category: "regulations",
          },
        ],
      };
    }

    if (q.includes("cop") || q.includes("carry over") || q.includes("back")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: `**Carry Over Examination (COP) Guidelines:**\n\n• **Exam Fee:** Currently ₹1,000 per theory paper applied through the student ERP login.\n• **Schedule:** Odd semester back papers are generally held during the Odd Semester Regular exams, and Even semester back papers during Even Semester exams.\n• **Special COP (SCOP):** Only final-year passing-out students with back papers may be eligible for Special COP as and when notified by the university.`,
        timestamp: "Just now",
        citations: [
          {
            title: "Examination Regulations Bulletin",
            clause: "AKTU/COE/COP-RULES/2024",
            category: "results",
          },
        ],
      };
    }

    if (q.includes("syllabus") || q.includes("cse") || q.includes("curriculum")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: `**B.Tech Curriculum & Syllabus Overview:**\n\nAKTU has implemented the **NEP 2020 / AICTE Model Curriculum**.\n• **Core Subjects for CS:** Data Structures, Operating Systems, Database Management Systems, Theory of Computation, and Computer Networks.\n• **Departmental Electives (Sem 5-8):** Artificial Intelligence, Machine Learning, Cloud Computing, Cyber Security, and Big Data.\n• You can download the complete verified syllabus PDF from our **Syllabus & Schemes** tab.`,
        timestamp: "Just now",
        citations: [
          {
            title: "AICTE Model Scheme - AKTU CSE 2024",
            clause: "Dean Academics 2024/098",
            category: "syllabus",
          },
        ],
      };
    }

    // Default Fallback Response
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      content: `I reviewed your question regarding "${query}".\n\nBased on official **Dr. A.P.J. Abdul Kalam Technical University (AKTU)** rules, student queries of this nature are governed by the relevant Academic Council Ordinances and Controller of Examination notifications.\n\nFor verified details, please refer to our **Resources & Regulations Hub** or consult the Dean of Academics at your affiliated institution.`,
      timestamp: "Just now",
      citations: [
        {
          title: "AKTU Academic Manual 2024-25",
          clause: "General Student Provisions",
          category: "regulations",
        },
      ],
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: userText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate realistic AI thought and generation delay
    setTimeout(() => {
      const botResponse = generateMockAnswer(userText);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1100);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, isHelpful: boolean) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, helpful: isHelpful } : msg
      )
    );
  };

  return (
    <div className="h-screen bg-[#0b101b] text-slate-100 flex flex-col overflow-hidden">
      
      {/* Top Application Bar */}
      <header className="h-14 sm:h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle history sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-sm shadow-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm sm:text-base font-mono tracking-tight text-white">
                AKTU<span className="text-sky-400 font-sans">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Chatbot Assistant
              </span>
            </div>
          </Link>
        </div>

        {/* Header Right navigation & status */}
        <div className="flex items-center gap-3">
          <Link
            href="/resources"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Syllabus & Rules</span>
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xs font-bold">
              AK
            </div>
            <span className="text-xs font-medium text-slate-300 hidden md:inline">
              Student (210097)
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Chat Stream */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR: Chat History & New Chat */}
        <aside
          className={`absolute md:static top-0 bottom-0 left-0 w-72 sm:w-80 bg-slate-950/95 md:bg-slate-950/60 border-r border-slate-800/80 z-20 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* New Chat Button */}
          <div className="p-3.5 border-b border-slate-800/80">
            <button
              onClick={() => {
                handleNewChat();
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent Consultations
            </div>

            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 group ${
                  activeSessionId === session.id
                    ? "bg-slate-800/90 text-white border border-slate-700/80"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-slate-200 group-hover:text-white">
                    {session.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {session.snippet}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AKTU Ordinance v2024
              </span>
              <Link href="/resources" className="text-[11px] text-sky-400 hover:underline">
                View Docs
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 z-10 backdrop-blur-xs"
          />
        )}

        {/* CHAT AREA */}
        <section className="flex-1 flex flex-col bg-[#0b101b] overflow-hidden relative">
          
          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Message List */}
              {messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 sm:gap-4 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shrink-0 shadow-md shadow-blue-500/20">
                        <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                          <Bot className="w-4 h-4 text-sky-400" />
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-xs"
                          : "glass-panel text-slate-200 border-slate-800 rounded-tl-xs"
                      }`}
                    >
                      {/* Message Content with simple bold rendering */}
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>

                      {/* Official Citations Box for Bot */}
                      {!isUser && message.citations && message.citations.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-sky-400" /> Verified Academic Source:
                          </div>
                          {message.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="truncate mr-2">
                                <span className="font-semibold text-slate-200">{cite.title}</span>
                                {cite.clause && (
                                  <span className="text-slate-400 block text-[11px]">
                                    {cite.clause}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/resources?category=${cite.category}`}
                                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium shrink-0 flex items-center gap-0.5"
                              >
                                View <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bubble Actions: Timestamp, Copy, Thumbs */}
                      <div className="mt-2 flex items-center justify-between gap-4 text-[10px] text-slate-400">
                        <span>{message.timestamp}</span>

                        {!isUser && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(message.id, message.content)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Copy response"
                              aria-label="Copy message text"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, true)}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                                message.helpful === true ? "text-emerald-400" : "text-slate-400"
                              }`}
                              title="Helpful"
                              aria-label="Mark helpful"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, false)}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                                message.helpful === false ? "text-rose-400" : "text-slate-400"
                              }`}
                              title="Unhelpful"
                              aria-label="Mark unhelpful"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-sky-400" />
                    </div>
                  </div>
                  <div className="glass-panel rounded-2xl rounded-tl-xs p-3.5 border-slate-800 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                    </div>
                    <span className="text-xs text-slate-400">
                      Searching AKTU ordinances & circulars...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Control Area: Suggested Queries & Input */}
          <div className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md p-3 sm:p-4">
            <div className="max-w-3xl mx-auto space-y-3">
              
              {/* Suggested Questions Horizontal Scroller */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-slate-400 text-[11px] shrink-0 font-medium mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" /> Suggestions:
                </span>
                {SUGGESTED_QUERIES.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors shrink-0"
                  >
                    {query}
                  </button>
                ))}
              </div>

              {/* Message Input Box Form */}
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about grace marks, COP back papers, syllabus, exam dates..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-600/30 transition-all active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Advisory note */}
              <p className="text-[10px] text-center text-slate-400">
                AKTU AI Student Support provides advisory answers derived from official university regulations. For legal disputes, consult the Controller of Examination.
              </p>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
