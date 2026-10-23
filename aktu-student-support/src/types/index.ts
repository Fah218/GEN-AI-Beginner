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

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
  categoryTag?: string;
  citations?: {
    title: string;
    clause?: string;
    category: string;
  }[];
  helpful?: boolean | null;
}

export interface ChatSession {
  id: string;
  title: string;
  snippet: string;
  timestamp: string;
  unreadCount?: number;
}
