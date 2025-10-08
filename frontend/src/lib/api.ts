const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: number;
}

export interface AIMemo {
  id: number;
  document_id: number;
  type: 'summary' | 'brainstorm' | 'publish';
  content: string;
  anchor_position?: number;
  created_at: string;
  memo_metadata?: {
    sources?: string[];
    confidence?: number;
    prompt?: string;
  };
}

export interface AIRequest {
  type: 'summary' | 'brainstorm' | 'publish';
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

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Documents API
  async getDocuments(): Promise<Document[]> {
    return this.request<Document[]>('/documents/');
  }

  async getDocument(id: number): Promise<Document & { ai_memos: AIMemo[] }> {
    return this.request<Document & { ai_memos: AIMemo[] }>(`/documents/${id}`);
  }

  async createDocument(document: { title: string; content: string }): Promise<Document> {
    return this.request<Document>('/documents/', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(id: number, document: { title?: string; content?: string }): Promise<Document> {
    return this.request<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(document),
    });
  }

  async deleteDocument(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Memos API
  async getAIMemos(documentId: number): Promise<AIMemo[]> {
    return this.request<AIMemo[]>(`/ai-memos/document/${documentId}`);
  }

  async generateAIMemo(request: AIRequest): Promise<AIResponse> {
    return this.request<AIResponse>('/ai-memos/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateAIMemo(id: number, memo: { content?: string; memo_metadata?: any }): Promise<AIMemo> {
    return this.request<AIMemo>(`/ai-memos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memo),
    });
  }

  async deleteAIMemo(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/ai-memos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
