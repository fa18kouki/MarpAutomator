'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSession, Document, LibraryItem, Message } from '@/types';
import {
  sessionsApi,
  documentsApi,
  libraryApi,
  type SessionData,
  type DocumentData,
  type LibraryItemData,
} from '@/lib/api';

interface AppState {
  // チャットセッション
  chatSessions: ChatSession[];
  currentSessionId: string | null;

  // ドキュメント
  documents: Document[];
  currentDocumentId: string | null;

  // ライブラリ
  libraryItems: LibraryItem[];

  // 選択されたプリセット
  selectedPresetId: string | null;

  // UI状態
  isSidebarOpen: boolean;
  activeView: 'chat' | 'library' | 'preview';
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;

  // データ同期
  syncFromDatabase: () => Promise<void>;

  // チャットセッション操作
  createChatSession: () => Promise<string>;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;

  // ドキュメント操作
  createDocument: (title: string, marpContent: string, htmlContent: string, chatSessionId?: string) => Promise<string>;
  updateDocument: (documentId: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  setCurrentDocument: (documentId: string | null) => void;

  // ライブラリ操作
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLibraryItem: (itemId: string, updates: Partial<LibraryItem>) => Promise<void>;
  deleteLibraryItem: (itemId: string) => Promise<void>;

  // プリセット操作
  setSelectedPreset: (presetId: string | null) => void;

  // UI操作
  toggleSidebar: () => void;
  setActiveView: (view: 'chat' | 'library' | 'preview') => void;
  setIsLoading: (isLoading: boolean) => void;
}

// Helper functions to convert API data to app types
const convertSessionData = (data: SessionData): ChatSession => ({
  id: data.id,
  title: data.title,
  messages: data.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
  })),
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
});

const convertDocumentData = (data: DocumentData): Document => ({
  id: data.id,
  title: data.title,
  marpContent: data.marpContent,
  htmlContent: data.htmlContent,
  presetId: data.presetId || undefined,
  templateIds: data.templateIds,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
  chatSessionId: data.chatSessionId || undefined,
});

const convertLibraryItemData = (data: LibraryItemData): LibraryItem => ({
  id: data.id,
  title: data.title,
  type: data.type === 'uploaded_html' ? 'uploaded-html' : 'document',
  htmlContent: data.htmlContent,
  thumbnail: data.thumbnail || undefined,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初期状態
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

      // データベースから同期
      syncFromDatabase: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const [sessions, documents, libraryItems] = await Promise.all([
            sessionsApi.getAll(),
            documentsApi.getAll(),
            libraryApi.getAll(),
          ]);

          set({
            chatSessions: sessions.map(convertSessionData),
            documents: documents.map(convertDocumentData),
            libraryItems: libraryItems.map(convertLibraryItemData),
            isSyncing: false,
          });
        } catch (error) {
          console.error('Failed to sync from database:', error);
          set({
            syncError: error instanceof Error ? error.message : 'Sync failed',
            isSyncing: false,
          });
        }
      },

      // チャットセッション操作
      createChatSession: async () => {
        try {
          const session = await sessionsApi.create();
          const newSession = convertSessionData(session);

          set((state) => ({
            chatSessions: [newSession, ...state.chatSessions],
            currentSessionId: newSession.id,
          }));

          return newSession.id;
        } catch (error) {
          console.error('Failed to create session:', error);
          // フォールバック: ローカルで作成
          const id = crypto.randomUUID();
          const newSession: ChatSession = {
            id,
            title: '新しいチャット',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            chatSessions: [newSession, ...state.chatSessions],
            currentSessionId: id,
          }));
          return id;
        }
      },

      addMessage: async (sessionId, message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        // 即座にUIを更新
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));

        // バックグラウンドでDBに保存
        try {
          await sessionsApi.addMessage(sessionId, message.role, message.content);
        } catch (error) {
          console.error('Failed to save message to database:', error);
        }
      },

      updateSessionTitle: async (sessionId, title) => {
        // 即座にUIを更新
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          ),
        }));

        // バックグラウンドでDBに保存
        try {
          await sessionsApi.update(sessionId, { title });
        } catch (error) {
          console.error('Failed to update session title:', error);
        }
      },

      deleteSession: async (sessionId) => {
        // 即座にUIを更新
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));

        // バックグラウンドでDBから削除
        try {
          await sessionsApi.delete(sessionId);
        } catch (error) {
          console.error('Failed to delete session:', error);
        }
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      // ドキュメント操作
      createDocument: async (title, marpContent, htmlContent, chatSessionId) => {
        try {
          const document = await documentsApi.create({
            title,
            marpContent,
            htmlContent,
            chatSessionId,
          });

          const newDocument = convertDocumentData(document);

          set((state) => ({
            documents: [newDocument, ...state.documents],
            currentDocumentId: newDocument.id,
          }));

          // ライブラリを再同期
          const libraryItems = await libraryApi.getAll();
          set({
            libraryItems: libraryItems.map(convertLibraryItemData),
          });

          return newDocument.id;
        } catch (error) {
          console.error('Failed to create document:', error);
          // フォールバック: ローカルで作成
          const id = crypto.randomUUID();
          const newDocument: Document = {
            id,
            title,
            marpContent,
            htmlContent,
            templateIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            documents: [newDocument, ...state.documents],
            currentDocumentId: id,
          }));

          // ライブラリにも追加
          await get().addLibraryItem({
            title,
            type: 'document',
            htmlContent,
          });

          return id;
        }
      },

      updateDocument: async (documentId, updates) => {
        // 即座にUIを更新
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, ...updates, updatedAt: new Date() }
              : doc
          ),
        }));

        // バックグラウンドでDBに保存
        try {
          await documentsApi.update(documentId, updates);
        } catch (error) {
          console.error('Failed to update document:', error);
        }
      },

      deleteDocument: async (documentId) => {
        // 即座にUIを更新
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== documentId),
          currentDocumentId:
            state.currentDocumentId === documentId ? null : state.currentDocumentId,
        }));

        // バックグラウンドでDBから削除
        try {
          await documentsApi.delete(documentId);
          // ライブラリを再同期
          const libraryItems = await libraryApi.getAll();
          set({
            libraryItems: libraryItems.map(convertLibraryItemData),
          });
        } catch (error) {
          console.error('Failed to delete document:', error);
        }
      },

      setCurrentDocument: (documentId) => {
        set({ currentDocumentId: documentId });
      },

      // ライブラリ操作
      addLibraryItem: async (item) => {
        try {
          const libraryItem = await libraryApi.create({
            title: item.title,
            htmlContent: item.htmlContent,
            type: item.type === 'uploaded-html' ? 'uploaded_html' : undefined,
          });

          const newItem = convertLibraryItemData(libraryItem);

          set((state) => ({
            libraryItems: [newItem, ...state.libraryItems],
          }));

          return newItem.id;
        } catch (error) {
          console.error('Failed to add library item:', error);
          // フォールバック: ローカルで作成
          const id = crypto.randomUUID();
          const now = new Date();
          const newItem: LibraryItem = {
            ...item,
            id,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            libraryItems: [newItem, ...state.libraryItems],
          }));
          return id;
        }
      },

      updateLibraryItem: async (itemId, updates) => {
        // 即座にUIを更新
        set((state) => ({
          libraryItems: state.libraryItems.map((item) =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));

        // バックグラウンドでDBに保存
        try {
          await libraryApi.update(itemId, updates);
        } catch (error) {
          console.error('Failed to update library item:', error);
        }
      },

      deleteLibraryItem: async (itemId) => {
        // 即座にUIを更新
        set((state) => ({
          libraryItems: state.libraryItems.filter((i) => i.id !== itemId),
        }));

        // バックグラウンドでDBから削除
        try {
          await libraryApi.delete(itemId);
        } catch (error) {
          console.error('Failed to delete library item:', error);
        }
      },

      // プリセット操作
      setSelectedPreset: (presetId) => {
        set({ selectedPresetId: presetId });
      },

      // UI操作
      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setActiveView: (view) => {
        set({ activeView: view });
      },

      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'marp-automator-storage',
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        documents: state.documents,
        libraryItems: state.libraryItems,
        selectedPresetId: state.selectedPresetId,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
