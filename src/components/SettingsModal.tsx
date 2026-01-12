'use client';

import { useState, useEffect } from 'react';
import { X, Key, Save, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ローカルストレージからAPIキーを読み込む
    const stored = localStorage.getItem('gemini-api-key');
    if (stored) {
      setSavedKey(stored);
      setApiKey(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください');
      return;
    }

    localStorage.setItem('gemini-api-key', apiKey.trim());
    setSavedKey(apiKey.trim());
    setShowSuccess(true);
    setError('');

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    setSavedKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">設定</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* Gemini APIキー設定 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium text-white">Gemini APIキー</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              AI機能を使用するには、Google AI StudioでGemini APIキーを取得してください。
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="API キーを入力..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 pr-20"
                />
                {savedKey && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    保存済み
                  </span>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {showSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>保存しました</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>保存</span>
                </button>
                {savedKey && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Google AI Studio でAPIキーを取得 →
            </a>
          </div>

          {/* 将来的な設定オプション用のプレースホルダー */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              その他の設定は今後追加予定です
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
