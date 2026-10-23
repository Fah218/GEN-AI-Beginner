"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Trash2, 
  GraduationCap, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  Menu, 
  X, 
  ArrowUpRight, 
  FolderOpen, 
  AlertCircle, 
  LogOut, 
  LogIn, 
  Loader2 
} from "lucide-react";
import { 
  SUGGESTED_QUERIES, 
  INITIAL_BOT_MESSAGES 
} from "@/data/mockData";
import { ChatMessage, ChatSession, StudentProfile } from "@/types";
import { api, getStoredToken, clearStoredAuth } from "@/lib/api";

export default function ChatDashboardPage() {
  const router = useRouter();

  // Authentication & student profile state
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sessions and active conversation
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load messages for a specific conversation session
  const loadConversationMessages = useCallback(async (convId: string) => {
    setIsLoadingHistory(true);
    setChatError(null);
    try {
      const res = await api.getConversation(convId);
      if (res?.conversation?.messages) {
        const formatted: ChatMessage[] = res.conversation.messages.map((m) => ({
          id: m._id || `msg-${Date.now()}-${Math.random()}`,
          sender: m.sender === "user" ? "user" : "bot",
          content: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations: m.citations || [],
          helpful: m.helpful,
        }));
        setMessages(formatted);
      }
    } catch {
      setChatError("Could not retrieve conversation history. Please try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Handle New Chat
  const handleNewChat = useCallback(async (isAutoInit = false) => {
    setChatError(null);
    const token = getStoredToken();
    if (token) {
      try {
        const res = await api.createConversation("New Student Consultation");
        if (res?.conversation) {
          const newSession: ChatSession = {
            id: res.conversation.id,
            title: res.conversation.title,
            snippet: "What would you like to inquire about?",
            timestamp: "Just now",
          };
          setSessions((prev) => [newSession, ...prev]);
          setActiveSessionId(res.conversation.id);

          const formatted: ChatMessage[] = res.conversation.messages.map((m) => ({
            id: m._id || `bot-welcome-${Date.now()}`,
            sender: "bot",
            content: m.content,
            timestamp: "Just now",
            citations: m.citations || [],
          }));
          setMessages(formatted);
          return;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create conversation.";
        if (!isAutoInit) setChatError(message);
      }
    }

    // Fallback if guest or unauthenticated
    const fallbackId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: fallbackId,
      title: "New Student Consultation",
      snippet: "What would you like to inquire about?",
      timestamp: "Just now",
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(fallbackId);
    setMessages([
      {
        id: `bot-welcome-${Date.now()}`,
        sender: "bot",
        content: "Hello! I am ready to assist you. You can ask about B.Tech syllabi, grace marks, carry-over exam schedules, or university circulars.",
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
  }, []);

  // Fetch conversations from backend
  const loadStudentConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.conversations && res.conversations.length > 0) {
        const mappedSessions: ChatSession[] = res.conversations.map((c) => ({
          id: c.id,
          title: c.title,
          snippet: c.snippet,
          timestamp: new Date(c.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
        }));
        setSessions(mappedSessions);
        // Default to first conversation
        setActiveSessionId(mappedSessions[0].id);
        await loadConversationMessages(mappedSessions[0].id);
      } else {
        // Create initial conversation session if none exist
        await handleNewChat(true);
      }
    } catch {
      // Backend might be offline or no sessions yet
    }
  }, [handleNewChat, loadConversationMessages]);

  // Load authenticated student profile and their persisted conversations
  useEffect(() => {
    async function initUserAndSessions() {
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const meRes = await api.getMe();
        if (meRes?.student) {
          setStudent(meRes.student);
          setIsAuthenticated(true);
          await loadStudentConversations();
        } else {
          clearStoredAuth();
          setIsAuthenticated(false);
        }
      } catch {
        clearStoredAuth();
        setIsAuthenticated(false);
      }
    }

    initUserAndSessions();
  }, [loadStudentConversations]);

  // Handle switching session
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadConversationMessages(sessionId);
  };

  // Handle Delete Conversation
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await api.deleteConversation(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          loadConversationMessages(remaining[0].id);
        } else {
          handleNewChat(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete conversation.";
      setChatError(msg);
    }
  };

  // Send message to backend Gemini API
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setChatError(null);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const res = await api.sendChat({
        message: userText,
        conversationId: activeSessionId && !activeSessionId.startsWith("session-") ? activeSessionId : null,
        history: historyPayload,
      });

      const botResponse: ChatMessage = {
        id: res.messageId || `bot-${Date.now()}`,
        sender: "bot",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: res.citations || [],
      };

      setMessages((prev) => [...prev, botResponse]);

      // If backend created or bound a conversation, ensure active session is tracked
      if (res.conversationId && activeSessionId !== res.conversationId) {
        setActiveSessionId(res.conversationId);
        // Refresh session list to show updated title and snippet
        if (isAuthenticated) {
          const listRes = await api.getConversations().catch(() => null);
          if (listRes?.conversations) {
            setSessions(
              listRes.conversations.map((c) => ({
                id: c.id,
                title: c.title,
                snippet: c.snippet,
                timestamp: new Date(c.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
              }))
            );
          }
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to reach AI Chatbot service.";
      setChatError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: "bot",
          content: `⚠️ Error: ${errorMsg}\n\nPlease ensure your backend server is running on http://localhost:5000 with a valid GEMINI_API_KEY.`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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

  const handleLogout = () => {
    clearStoredAuth();
    setIsAuthenticated(false);
    setStudent(null);
    router.push("/login");
  };

  // Student initials
  const initials = student?.fullName
    ? student.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

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

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {student?.fullName || "Student"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {student?.rollNumber ? `(${student.rollNumber})` : "Authenticated"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                href="/login"
                className="text-xs font-medium text-sky-400 hover:text-sky-300 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
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
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isAuthenticated ? "Your Consultations" : "Recent Consultations"}</span>
              {!isAuthenticated && (
                <span className="text-[10px] text-amber-400 lowercase font-normal">(guest mode)</span>
              )}
            </div>

            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  handleSelectSession(session.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer relative ${
                  activeSessionId === session.id
                    ? "bg-slate-800/90 text-white border border-slate-700/80"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-medium truncate text-slate-200 group-hover:text-white">
                    {session.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {session.snippet}
                  </p>
                </div>

                {isAuthenticated && !session.id.startsWith("session-") && (
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-all absolute right-2 top-2.5"
                    title="Delete Conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No active conversations yet. Click &quot;New Conversation&quot; to start.
              </div>
            )}
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
          
          {/* Non-RAG Advisory Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Phase 2 Backend Mode:</strong> Direct Gemini AI enabled (Non-RAG). Official PDF retrieval will be added in Phase 3.
              </span>
            </div>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="underline underline-offset-2 hover:text-amber-200 shrink-0 hidden sm:inline"
              >
                Sign in to persist chats
              </Link>
            )}
          </div>

          {/* Optional inline error display */}
          {chatError && (
            <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{chatError}</span>
              </div>
              <button
                onClick={() => setChatError(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                  <span className="text-xs">Loading conversation history...</span>
                </div>
              ) : (
                messages.map((message) => {
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
                        {/* Message Content */}
                        <div className="whitespace-pre-line">
                          {message.content}
                        </div>

                        {/* Citations Box if available */}
                        {!isUser && message.citations && message.citations.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-sky-400" /> Academic Context Reference:
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
                })
              )}

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
                      Generating advisory response via Gemini API...
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
                AKTU AI Student Support provides non-RAG advisory answers. For official degree results and ordinances, consult the Controller of Examination portal (erp.aktu.ac.in).
              </p>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
