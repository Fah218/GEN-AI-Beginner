export interface DocumentResource {
  id: string;
  title: string;
  category: 
    | "syllabus"
    | "regulations"
    | "calendar"
    | "circulars"
    | "results";
  categoryLabel: string;
  course?: string;
  semester?: string;
  fileSize: string;
  fileType: "PDF" | "DOCX" | "CIRCULAR";
  dateUpdated: string;
  description: string;
  tags: string[];
  officialCode?: string;
  downloadUrl?: string;
}

export interface ChatCitation {
  title: string;
  clause?: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
  categoryTag?: string;
  citations?: ChatCitation[];
  helpful?: boolean | null;
}

export interface ChatSession {
  id: string;
  title: string;
  snippet: string;
  timestamp: string;
  unreadCount?: number;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  branch: string;
  semester: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendConversation {
  id: string;
  title: string;
  messages: Array<{
    _id?: string;
    sender: "user" | "bot" | "assistant";
    content: string;
    timestamp: string | Date;
    citations?: ChatCitation[];
    helpful?: boolean | null;
  }>;
  createdAt: string;
  updatedAt: string;
}
