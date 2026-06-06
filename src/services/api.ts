const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

export interface Document {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  completed_at?: string;
  total_amount?: string;
  document_type?: string;
}

export interface DocumentDetail {
  document: Document;
  results: {
    raw_text: string;
    json_structured: any;
    images?: string[];
  } | null;
}

const getHeaders = (isMultipart = false) => {
  const geminiKey = localStorage.getItem('gemini_api_key');
  const groqKey = localStorage.getItem('groq_api_key');
  const activeEngine = localStorage.getItem('active_engine') || 'local';
  
  const headers: Record<string, string> = {
    'X-Active-Engine': activeEngine
  };
  
  if (geminiKey) headers['X-Gemini-API-Key'] = geminiKey;
  if (groqKey) headers['X-Groq-API-Key'] = groqKey;
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export const api = {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getDocumentDetails(id: number): Promise<DocumentDetail | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`);
      if (!response.ok) throw new Error('Failed to fetch document details');
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async searchDocuments(query: string): Promise<(Document & { snippet?: string })[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search documents');
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.json();
  },

  async sendChatMessage(documentId: number, message: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ document_id: documentId, message }),
    });
    
    if (!response.ok) throw new Error('Failed to get chat response');
    const data = await response.json();
    return data.response;
  },

  async translateDocument(documentId: number, targetLanguage: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ document_id: documentId, target_language: targetLanguage }),
    });
    if (!response.ok) throw new Error('Failed to translate document');
    const data = await response.json();
    return data;
  },

  async retryDocument(documentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/retry`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to retry document');
  },

  async deleteDocument(documentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete document');
  }
};
