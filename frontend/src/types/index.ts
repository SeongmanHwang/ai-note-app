export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface AIMemo {
  id: string;
  documentId: string;
  type: 'qa' | 'critical-thinking' | 'summary';
  content: string;
  anchorPosition?: number;
  createdAt: Date;
  memo_metadata?: {
    sources?: string[];
    confidence?: number;
    prompt?: string;
  };
}

export interface AIRequest {
  type: 'qa' | 'critical-thinking' | 'summary';
  content: string;
  context?: string;
  prompt?: string;
}

export interface AIResponse {
  success: boolean;
  data?: {
    memo: AIMemo;
    suggestions?: string[];
  };
  error?: string;
}

export interface EditorState {
  content: string;
  selection: {
    from: number;
    to: number;
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
