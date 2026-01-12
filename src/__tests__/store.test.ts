import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from '@/store/useStore';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  sessionsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addMessage: vi.fn(),
  },
  documentsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  libraryApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Store - Chat Sessions', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      chatSessions: [],
      currentSessionId: null,
      documents: [],
      currentDocumentId: null,
      libraryItems: [],
      selectedPresetId: null,
      isSidebarOpen: true,
      activeView: 'chat',
      isLoading: false,
      isSyncing: false,
      syncError: null,
    });
    vi.clearAllMocks();
  });

  it('should create a new session and sync with API', async () => {
    const mockSession = {
      id: 'session-1',
      title: '新しいチャット',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      messages: [],
    };

    vi.mocked(api.sessionsApi.create).mockResolvedValueOnce(mockSession);

    const store = useStore.getState();
    const sessionId = await store.createChatSession();

    expect(sessionId).toBe('session-1');
    expect(api.sessionsApi.create).toHaveBeenCalled();
    expect(useStore.getState().chatSessions).toHaveLength(1);
    expect(useStore.getState().currentSessionId).toBe('session-1');
  });

  it('should fall back to local creation on API error', async () => {
    vi.mocked(api.sessionsApi.create).mockRejectedValueOnce(new Error('API Error'));

    const store = useStore.getState();
    const sessionId = await store.createChatSession();

    // Should still create a local session
    expect(sessionId).toBeDefined();
    expect(useStore.getState().chatSessions).toHaveLength(1);
    expect(useStore.getState().currentSessionId).toBe(sessionId);
  });

  it('should add a message to a session', async () => {
    // Setup initial session
    useStore.setState({
      chatSessions: [
        {
          id: 'session-1',
          title: 'Test Session',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      currentSessionId: 'session-1',
    });

    vi.mocked(api.sessionsApi.addMessage).mockResolvedValueOnce({
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: '2024-01-01T00:00:00Z',
      sessionId: 'session-1',
    });

    const store = useStore.getState();
    await store.addMessage('session-1', { role: 'user', content: 'Hello' });

    expect(api.sessionsApi.addMessage).toHaveBeenCalledWith('session-1', 'user', 'Hello');
    expect(useStore.getState().chatSessions[0].messages).toHaveLength(1);
    expect(useStore.getState().chatSessions[0].messages[0].content).toBe('Hello');
  });

  it('should delete a session', async () => {
    // Setup initial session
    useStore.setState({
      chatSessions: [
        {
          id: 'session-1',
          title: 'Test Session',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      currentSessionId: 'session-1',
    });

    vi.mocked(api.sessionsApi.delete).mockResolvedValueOnce({ success: true });

    const store = useStore.getState();
    await store.deleteSession('session-1');

    expect(api.sessionsApi.delete).toHaveBeenCalledWith('session-1');
    expect(useStore.getState().chatSessions).toHaveLength(0);
    expect(useStore.getState().currentSessionId).toBeNull();
  });
});

describe('Store - Documents', () => {
  beforeEach(() => {
    useStore.setState({
      chatSessions: [],
      currentSessionId: null,
      documents: [],
      currentDocumentId: null,
      libraryItems: [],
      selectedPresetId: null,
      isSidebarOpen: true,
      activeView: 'chat',
      isLoading: false,
      isSyncing: false,
      syncError: null,
    });
    vi.clearAllMocks();
  });

  it('should create a document and add to library', async () => {
    const mockDocument = {
      id: 'doc-1',
      title: 'Test Document',
      marpContent: '# Test',
      htmlContent: '<html></html>',
      presetId: null,
      templateIds: [],
      chatSessionId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockLibraryItems = [
      {
        id: 'lib-1',
        title: 'Test Document',
        type: 'document' as const,
        htmlContent: '<html></html>',
        thumbnail: null,
        documentId: 'doc-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(api.documentsApi.create).mockResolvedValueOnce(mockDocument);
    vi.mocked(api.libraryApi.getAll).mockResolvedValueOnce(mockLibraryItems);

    const store = useStore.getState();
    const docId = await store.createDocument('Test Document', '# Test', '<html></html>');

    expect(docId).toBe('doc-1');
    expect(api.documentsApi.create).toHaveBeenCalled();
    expect(useStore.getState().documents).toHaveLength(1);
    expect(useStore.getState().currentDocumentId).toBe('doc-1');
  });
});

describe('Store - Library', () => {
  beforeEach(() => {
    useStore.setState({
      chatSessions: [],
      currentSessionId: null,
      documents: [],
      currentDocumentId: null,
      libraryItems: [],
      selectedPresetId: null,
      isSidebarOpen: true,
      activeView: 'chat',
      isLoading: false,
      isSyncing: false,
      syncError: null,
    });
    vi.clearAllMocks();
  });

  it('should add an uploaded HTML to library', async () => {
    const mockLibraryItem = {
      id: 'lib-1',
      title: 'Uploaded HTML',
      type: 'uploaded_html' as const,
      htmlContent: '<html><body>Test</body></html>',
      thumbnail: null,
      documentId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(api.libraryApi.create).mockResolvedValueOnce(mockLibraryItem);

    const store = useStore.getState();
    const itemId = await store.addLibraryItem({
      title: 'Uploaded HTML',
      type: 'uploaded-html',
      htmlContent: '<html><body>Test</body></html>',
    });

    expect(itemId).toBe('lib-1');
    expect(api.libraryApi.create).toHaveBeenCalled();
    expect(useStore.getState().libraryItems).toHaveLength(1);
    expect(useStore.getState().libraryItems[0].type).toBe('uploaded-html');
  });

  it('should delete a library item', async () => {
    useStore.setState({
      libraryItems: [
        {
          id: 'lib-1',
          title: 'Test Item',
          type: 'uploaded-html',
          htmlContent: '<html></html>',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    vi.mocked(api.libraryApi.delete).mockResolvedValueOnce({ success: true });

    const store = useStore.getState();
    await store.deleteLibraryItem('lib-1');

    expect(api.libraryApi.delete).toHaveBeenCalledWith('lib-1');
    expect(useStore.getState().libraryItems).toHaveLength(0);
  });
});

describe('Store - Sync from Database', () => {
  beforeEach(() => {
    useStore.setState({
      chatSessions: [],
      currentSessionId: null,
      documents: [],
      currentDocumentId: null,
      libraryItems: [],
      selectedPresetId: null,
      isSidebarOpen: true,
      activeView: 'chat',
      isLoading: false,
      isSyncing: false,
      syncError: null,
    });
    vi.clearAllMocks();
  });

  it('should sync all data from database', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        title: 'Session 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        messages: [],
      },
    ];

    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document 1',
        marpContent: '# Test',
        htmlContent: '<html></html>',
        presetId: null,
        templateIds: [],
        chatSessionId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    const mockLibraryItems = [
      {
        id: 'lib-1',
        title: 'Library Item 1',
        type: 'document' as const,
        htmlContent: '<html></html>',
        thumbnail: null,
        documentId: 'doc-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(api.sessionsApi.getAll).mockResolvedValueOnce(mockSessions);
    vi.mocked(api.documentsApi.getAll).mockResolvedValueOnce(mockDocuments);
    vi.mocked(api.libraryApi.getAll).mockResolvedValueOnce(mockLibraryItems);

    const store = useStore.getState();
    await store.syncFromDatabase();

    expect(api.sessionsApi.getAll).toHaveBeenCalled();
    expect(api.documentsApi.getAll).toHaveBeenCalled();
    expect(api.libraryApi.getAll).toHaveBeenCalled();

    const state = useStore.getState();
    expect(state.chatSessions).toHaveLength(1);
    expect(state.documents).toHaveLength(1);
    expect(state.libraryItems).toHaveLength(1);
    expect(state.isSyncing).toBe(false);
    expect(state.syncError).toBeNull();
  });

  it('should handle sync errors', async () => {
    vi.mocked(api.sessionsApi.getAll).mockRejectedValueOnce(new Error('Sync failed'));

    const store = useStore.getState();
    await store.syncFromDatabase();

    const state = useStore.getState();
    expect(state.isSyncing).toBe(false);
    expect(state.syncError).toBe('Sync failed');
  });
});

describe('Store - UI State', () => {
  beforeEach(() => {
    useStore.setState({
      isSidebarOpen: true,
      activeView: 'chat',
      isLoading: false,
    });
  });

  it('should toggle sidebar', () => {
    const store = useStore.getState();

    expect(store.isSidebarOpen).toBe(true);
    store.toggleSidebar();
    expect(useStore.getState().isSidebarOpen).toBe(false);
    store.toggleSidebar();
    expect(useStore.getState().isSidebarOpen).toBe(true);
  });

  it('should change active view', () => {
    const store = useStore.getState();

    expect(store.activeView).toBe('chat');
    store.setActiveView('library');
    expect(useStore.getState().activeView).toBe('library');
  });

  it('should set loading state', () => {
    const store = useStore.getState();

    expect(store.isLoading).toBe(false);
    store.setIsLoading(true);
    expect(useStore.getState().isLoading).toBe(true);
  });
});
