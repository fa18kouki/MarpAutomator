'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Library,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

interface SidebarProps {
  onSettingsClick: () => void;
}

export default function Sidebar({ onSettingsClick }: SidebarProps) {
  const {
    chatSessions,
    currentSessionId,
    isSidebarOpen,
    activeView,
    createChatSession,
    setCurrentSession,
    deleteSession,
    toggleSidebar,
    setActiveView,
  } = useStore();

  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const handleNewChat = async () => {
    await createChatSession();
    setActiveView('chat');
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setActiveView('chat');
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    return d.toLocaleDateString('ja-JP');
  };

  if (!isSidebarOpen) {
    return (
      <div className="w-12 h-full bg-gray-900 flex flex-col items-center py-4 gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="サイドバーを開く"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={handleNewChat}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="新しいチャット"
        >
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => setActiveView('library')}
          className={`p-2 rounded-lg transition-colors ${
            activeView === 'library'
              ? 'bg-gray-700 text-white'
              : 'hover:bg-gray-800 text-gray-400'
          }`}
          title="ライブラリ"
        >
          <Library className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">Marp AI</h1>
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 新しいチャットボタン */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>新しいチャット</span>
        </button>
      </div>

      {/* ナビゲーションタブ */}
      <div className="px-3 flex gap-2 mb-2">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'chat'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>チャット</span>
        </button>
        <button
          onClick={() => setActiveView('library')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'library'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>ライブラリ</span>
        </button>
      </div>

      {/* チャット履歴 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {activeView === 'chat' && (
          <div className="space-y-1">
            {chatSessions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                チャット履歴がありません
              </p>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                    currentSessionId === session.id
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{session.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(session.updatedAt)}
                    </p>
                  </div>
                  {hoveredSession === session.id && (
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/editor"
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Edit3 className="w-5 h-5" />
          <span className="text-sm">新規作成（エディタ）</span>
        </Link>
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">設定</span>
        </button>
      </div>
    </div>
  );
}
