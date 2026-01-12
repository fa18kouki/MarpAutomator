'use client';

import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  Search,
  MoreVertical,
  Code,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import type { LibraryItem } from '@/types';

interface LibraryViewProps {
  onPreview: (item: LibraryItem) => void;
}

export default function LibraryView({ onPreview }: LibraryViewProps) {
  const { libraryItems, addLibraryItem, deleteLibraryItem } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = libraryItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      addLibraryItem({
        title: file.name.replace(/\.html?$/i, ''),
        type: 'uploaded-html',
        htmlContent: content,
      });
    };
    reader.readAsText(file);
    setShowUploadModal(false);
  };

  const handlePasteHtml = () => {
    if (!htmlInput.trim()) return;

    addLibraryItem({
      title: titleInput.trim() || `HTML資料 ${libraryItems.length + 1}`,
      type: 'uploaded-html',
      htmlContent: htmlInput,
    });

    setHtmlInput('');
    setTitleInput('');
    setShowUploadModal(false);
  };

  const handleDownload = (item: LibraryItem) => {
    const blob = new Blob([item.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMenuOpenId(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">ライブラリ</h2>

        {/* 検索とアップロードボタン */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="資料を検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>アップロード</span>
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchQuery ? '検索結果がありません' : '資料がありません'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              {searchQuery
                ? '別のキーワードで検索してみてください'
                : 'チャットで資料を作成するか、HTMLファイルをアップロードしてください'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors group"
              >
                {/* サムネイル */}
                <div
                  className="h-40 bg-gray-900 relative cursor-pointer"
                  onClick={() => onPreview(item)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.type === 'uploaded-html' ? (
                      <Code className="w-12 h-12 text-gray-600" />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* 情報 */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.type === 'uploaded-html'
                          ? 'アップロード済みHTML'
                          : '作成した資料'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    {/* メニューボタン */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenId(menuOpenId === item.id ? null : item.id)
                        }
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {menuOpenId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                          <button
                            onClick={() => onPreview(item)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>プレビュー</span>
                          </button>
                          {item.type === 'document' && (
                            <Link
                              href={`/editor?id=${item.id}`}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-gray-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>編集</span>
                            </Link>
                          )}
                          <button
                            onClick={() => handleDownload(item)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-gray-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>ダウンロード</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteLibraryItem(item.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>削除</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アップロードモーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                HTMLをアップロード
              </h3>

              {/* ファイルアップロード */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">
                  HTMLファイルをアップロード
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-500" />
                  <span className="text-gray-400">
                    クリックしてファイルを選択
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-500 text-sm">または</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* HTML直接入力 */}
              <div className="space-y-3">
                <p className="text-sm text-gray-400">HTMLを直接貼り付け</p>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="タイトル（任意）"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="HTMLコードを貼り付け..."
                  className="w-full h-40 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
                />
                <button
                  onClick={handlePasteHtml}
                  disabled={!htmlInput.trim()}
                  className={`w-full py-2.5 rounded-lg transition-all ${
                    htmlInput.trim()
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  追加
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full py-2.5 text-gray-400 hover:text-white transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
