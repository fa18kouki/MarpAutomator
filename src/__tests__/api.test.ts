import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionsApi, documentsApi, libraryApi } from '@/lib/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Sessions API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch all sessions', async () => {
    const mockSessions = [
      {
        id: '1',
        title: 'Test Session',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        messages: [],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSessions,
    });

    const result = await sessionsApi.getAll();

    expect(mockFetch).toHaveBeenCalledWith('/api/sessions', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockSessions);
  });

  it('should create a new session', async () => {
    const mockSession = {
      id: '1',
      title: '新しいチャット',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      messages: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSession,
    });

    const result = await sessionsApi.create('新しいチャット');

    expect(mockFetch).toHaveBeenCalledWith('/api/sessions', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ title: '新しいチャット' }),
    });
    expect(result).toEqual(mockSession);
  });

  it('should add a message to session', async () => {
    const mockMessage = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2024-01-01T00:00:00Z',
      sessionId: 'session-1',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessage,
    });

    const result = await sessionsApi.addMessage('session-1', 'user', 'Hello');

    expect(mockFetch).toHaveBeenCalledWith('/api/sessions/session-1/messages', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ role: 'user', content: 'Hello' }),
    });
    expect(result).toEqual(mockMessage);
  });

  it('should delete a session', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await sessionsApi.delete('session-1');

    expect(mockFetch).toHaveBeenCalledWith('/api/sessions/session-1', {
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    });
    expect(result).toEqual({ success: true });
  });
});

describe('Documents API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch all documents', async () => {
    const mockDocuments = [
      {
        id: '1',
        title: 'Test Document',
        marpContent: '---\nmarp: true\n---\n# Test',
        htmlContent: '<html></html>',
        presetId: null,
        templateIds: [],
        chatSessionId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments,
    });

    const result = await documentsApi.getAll();

    expect(mockFetch).toHaveBeenCalledWith('/api/documents', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockDocuments);
  });

  it('should create a new document', async () => {
    const mockDocument = {
      id: '1',
      title: 'New Document',
      marpContent: '---\nmarp: true\n---\n# New',
      htmlContent: '<html></html>',
      presetId: null,
      templateIds: [],
      chatSessionId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocument,
    });

    const result = await documentsApi.create({
      title: 'New Document',
      marpContent: '---\nmarp: true\n---\n# New',
      htmlContent: '<html></html>',
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/documents', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        title: 'New Document',
        marpContent: '---\nmarp: true\n---\n# New',
        htmlContent: '<html></html>',
      }),
    });
    expect(result).toEqual(mockDocument);
  });
});

describe('Library API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch all library items', async () => {
    const mockItems = [
      {
        id: '1',
        title: 'Test Item',
        type: 'document',
        htmlContent: '<html></html>',
        thumbnail: null,
        documentId: 'doc-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    const result = await libraryApi.getAll();

    expect(mockFetch).toHaveBeenCalledWith('/api/library', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockItems);
  });

  it('should create a new library item (HTML upload)', async () => {
    const mockItem = {
      id: '1',
      title: 'Uploaded HTML',
      type: 'uploaded_html',
      htmlContent: '<html><body>Hello</body></html>',
      thumbnail: null,
      documentId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem,
    });

    const result = await libraryApi.create({
      title: 'Uploaded HTML',
      htmlContent: '<html><body>Hello</body></html>',
      type: 'uploaded_html',
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/library', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        title: 'Uploaded HTML',
        htmlContent: '<html><body>Hello</body></html>',
        type: 'uploaded_html',
      }),
    });
    expect(result).toEqual(mockItem);
  });

  it('should delete a library item', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await libraryApi.delete('item-1');

    expect(mockFetch).toHaveBeenCalledWith('/api/library/item-1', {
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    });
    expect(result).toEqual({ success: true });
  });
});

describe('API Error Handling', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should throw error on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    });

    await expect(sessionsApi.getAll()).rejects.toThrow('Internal Server Error');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(sessionsApi.getAll()).rejects.toThrow('Network error');
  });
});
