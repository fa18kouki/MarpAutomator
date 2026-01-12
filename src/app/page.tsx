'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Sidebar from '@/components/Sidebar';
import ChatView from '@/components/ChatView';
import LibraryView from '@/components/LibraryView';
import PreviewModal from '@/components/PreviewModal';
import SettingsModal from '@/components/SettingsModal';
import type { LibraryItem } from '@/types';

export default function Home() {
  const { activeView } = useStore();
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handlePreviewDocument = (htmlContent: string, title: string) => {
    setPreviewItem({
      id: 'preview',
      title,
      type: 'document',
      htmlContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handlePreviewLibraryItem = (item: LibraryItem) => {
    setPreviewItem(item);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* サイドバー */}
      <Sidebar onSettingsClick={() => setShowSettings(true)} />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat' && (
          <ChatView onPreviewDocument={handlePreviewDocument} />
        )}
        {activeView === 'library' && (
          <LibraryView onPreview={handlePreviewLibraryItem} />
        )}
      </main>

      {/* プレビューモーダル */}
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
