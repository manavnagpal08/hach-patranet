const API_BASE_URL = 'http://localhost:8000';

export interface Document {
  id: number;
  filename: string;
  document_type: string;
  status: string;
  created_at: string;
  completed_at?: string;
  total_amount?: string;
}

export interface DocumentDetail {
  document: Document;
  results: {
    raw_text: string;
    json_structured: any;
  } | null;
}

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

  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.json();
  },

  async sendChatMessage(documentId: number, message: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ document_id: documentId, message }),
    });
    
    if (!response.ok) throw new Error('Failed to get chat response');
    const data = await response.json();
    return data.response;
  }
};
