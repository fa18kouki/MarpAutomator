'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ChatSession, Document, LibraryItem, Message, Preset } from '@/types';

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

  // チャットセッション操作
  createChatSession: () => string;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;

  // ドキュメント操作
  createDocument: (title: string, marpContent: string, htmlContent: string) => string;
  updateDocument: (documentId: string, updates: Partial<Document>) => void;
  deleteDocument: (documentId: string) => void;
  setCurrentDocument: (documentId: string | null) => void;

  // ライブラリ操作
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLibraryItem: (itemId: string, updates: Partial<LibraryItem>) => void;
  deleteLibraryItem: (itemId: string) => void;

  // プリセット操作
  setSelectedPreset: (presetId: string | null) => void;

  // UI操作
  toggleSidebar: () => void;
  setActiveView: (view: 'chat' | 'library' | 'preview') => void;
  setIsLoading: (isLoading: boolean) => void;
}

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

      // チャットセッション操作
      createChatSession: () => {
        const id = uuidv4();
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
      },

      addMessage: (sessionId, message) => {
        const newMessage: Message = {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        };
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
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          ),
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      // ドキュメント操作
      createDocument: (title, marpContent, htmlContent) => {
        const id = uuidv4();
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
        get().addLibraryItem({
          title,
          type: 'document',
          htmlContent,
        });

        return id;
      },

      updateDocument: (documentId, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, ...updates, updatedAt: new Date() }
              : doc
          ),
        }));
      },

      deleteDocument: (documentId) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== documentId),
          currentDocumentId:
            state.currentDocumentId === documentId ? null : state.currentDocumentId,
        }));
      },

      setCurrentDocument: (documentId) => {
        set({ currentDocumentId: documentId });
      },

      // ライブラリ操作
      addLibraryItem: (item) => {
        const id = uuidv4();
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
      },

      updateLibraryItem: (itemId, updates) => {
        set((state) => ({
          libraryItems: state.libraryItems.map((item) =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));
      },

      deleteLibraryItem: (itemId) => {
        set((state) => ({
          libraryItems: state.libraryItems.filter((i) => i.id !== itemId),
        }));
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
      }),
    }
  )
);
