// API Client for database operations

const BASE_URL = '/api';

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ========== Sessions API ==========

export interface SessionData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageData[];
}

export interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sessionId: string;
}

export const sessionsApi = {
  // 全セッションを取得
  getAll: () => fetchApi<SessionData[]>('/sessions'),

  // 特定のセッションを取得
  getById: (id: string) => fetchApi<SessionData>(`/sessions/${id}`),

  // 新しいセッションを作成
  create: (title?: string) =>
    fetchApi<SessionData>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  // セッションを更新
  update: (id: string, data: { title?: string }) =>
    fetchApi<SessionData>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // セッションを削除
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  // メッセージを追加
  addMessage: (sessionId: string, role: 'user' | 'assistant', content: string) =>
    fetchApi<MessageData>(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    }),
};

// ========== Documents API ==========

export interface DocumentData {
  id: string;
  title: string;
  marpContent: string;
  htmlContent: string;
  presetId: string | null;
  templateIds: string[];
  chatSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const documentsApi = {
  // 全ドキュメントを取得
  getAll: () => fetchApi<DocumentData[]>('/documents'),

  // 特定のドキュメントを取得
  getById: (id: string) => fetchApi<DocumentData>(`/documents/${id}`),

  // 新しいドキュメントを作成
  create: (data: {
    title: string;
    marpContent: string;
    htmlContent: string;
    presetId?: string;
    templateIds?: string[];
    chatSessionId?: string;
  }) =>
    fetchApi<DocumentData>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ドキュメントを更新
  update: (
    id: string,
    data: { title?: string; marpContent?: string; htmlContent?: string }
  ) =>
    fetchApi<DocumentData>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ドキュメントを削除
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// ========== Library API ==========

export interface LibraryItemData {
  id: string;
  title: string;
  type: 'document' | 'uploaded_html';
  htmlContent: string;
  thumbnail: string | null;
  documentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const libraryApi = {
  // 全アイテムを取得
  getAll: () => fetchApi<LibraryItemData[]>('/library'),

  // 特定のアイテムを取得
  getById: (id: string) => fetchApi<LibraryItemData>(`/library/${id}`),

  // 新しいアイテムを作成（HTMLアップロード用）
  create: (data: { title: string; htmlContent: string; type?: 'uploaded_html' }) =>
    fetchApi<LibraryItemData>('/library', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: data.type || 'uploaded_html' }),
    }),

  // アイテムを更新
  update: (id: string, data: { title?: string; htmlContent?: string }) =>
    fetchApi<LibraryItemData>(`/library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // アイテムを削除
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/library/${id}`, {
      method: 'DELETE',
    }),
};
