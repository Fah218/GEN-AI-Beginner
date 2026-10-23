/**
 * Client API utility to communicate with the AKTU Backend
 */

import { StudentProfile, BackendConversation, ChatCitation } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "aktu_auth_token";
const STUDENT_KEY = "aktu_student_profile";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, student: StudentProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STUDENT_KEY);
}

export function getStoredStudent(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STUDENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    // If token expired or invalid, clear stored auth
    if (res.status === 401) {
      clearStoredAuth();
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Health
  checkHealth: () =>
    request<{
      status: string;
      database: { status: string; connected: boolean };
      aiService: { configured: boolean; model: string; mode: string };
    }>("/api/health"),

  // Auth
  signup: (payload: {
    fullName: string;
    rollNumber: string;
    email: string;
    branch: string;
    semester: string;
    password: string;
  }) =>
    request<{ success: boolean; token: string; student: StudentProfile }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { rollNumberOrEmail: string; password: string }) =>
    request<{ success: boolean; token: string; student: StudentProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ success: boolean; student: StudentProfile }>("/api/auth/me"),

  // Conversations
  getConversations: () =>
    request<{
      success: boolean;
      conversations: Array<{
        id: string;
        title: string;
        snippet: string;
        timestamp: string;
        messageCount: number;
      }>;
    }>("/api/conversations"),

  createConversation: (title?: string) =>
    request<{ success: boolean; conversation: BackendConversation }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  getConversation: (id: string) =>
    request<{ success: boolean; conversation: BackendConversation }>(`/api/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<{ success: boolean; deletedId: string }>(`/api/conversations/${id}`, {
      method: "DELETE",
    }),

  // Chat
  sendChat: (payload: {
    message: string;
    conversationId?: string | null;
    history?: { sender: string; content: string }[];
  }) =>
    request<{
      success: boolean;
      reply: string;
      conversationId: string;
      messageId: string;
      citations: ChatCitation[];
      mode: string;
    }>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
