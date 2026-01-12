'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import CanvaEditor, { type SlideData, slidesToMarp } from '@/components/CanvaEditor';
import { useStore } from '@/store/useStore';
import { generateFullHtml } from '@/lib/marp';

function EditorContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');

  const { documents, createDocument, updateDocument } = useStore();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [documentTitle, setDocumentTitle] = useState('新しい資料');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // 初期スライドの作成
  useEffect(() => {
    if (documentId) {
      const doc = documents.find((d) => d.id === documentId);
      if (doc) {
        setDocumentTitle(doc.title);
        // 既存のドキュメントからスライドを読み込む（簡易版）
        // TODO: より精密なパース処理を実装
        setSlides([createDefaultSlide()]);
        return;
      }
    }

    // 新規作成時のデフォルトスライド
    setSlides([createDefaultSlide()]);
  }, [documentId, documents]);

  // デフォルトスライドを作成
  const createDefaultSlide = (): SlideData => ({
    id: crypto.randomUUID(),
    backgroundColor: '#ffffff',
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        x: 80,
        y: 60,
        width: 800,
        height: 80,
        rotation: 0,
        content: 'タイトルを入力',
        style: {
          fontFamily: '"Noto Sans JP", sans-serif',
          fontSize: 48,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          color: '#333333',
          backgroundColor: 'transparent',
          borderColor: '#333333',
          borderWidth: 0,
          borderRadius: 0,
          opacity: 1,
        },
        locked: false,
        zIndex: 0,
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        x: 80,
        y: 180,
        width: 800,
        height: 300,
        rotation: 0,
        content: 'ここに内容を入力してください',
        style: {
          fontFamily: '"Noto Sans JP", sans-serif',
          fontSize: 24,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          color: '#666666',
          backgroundColor: 'transparent',
          borderColor: '#333333',
          borderWidth: 0,
          borderRadius: 0,
          opacity: 1,
        },
        locked: false,
        zIndex: 1,
      },
    ],
  });

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const marpContent = slidesToMarp(slides);
      const htmlContent = generateFullHtml(marpContent);

      if (documentId) {
        await updateDocument(documentId, {
          title: documentTitle,
          marpContent,
          htmlContent,
        });
      } else {
        await createDocument(documentTitle, marpContent, htmlContent);
      }

      alert('保存しました');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // プレビュー処理
  const handlePreview = () => {
    const marpContent = slidesToMarp(slides);
    const html = generateFullHtml(marpContent);
    setPreviewHtml(html);
    setShowPreview(true);
  };

  // エクスポート処理
  const handleExport = () => {
    const marpContent = slidesToMarp(slides);
    const html = generateFullHtml(marpContent);

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="bg-transparent text-white text-lg font-medium focus:outline-none border-b border-transparent focus:border-purple-500 px-1"
              placeholder="タイトルを入力..."
            />
          </div>
        </div>
      </header>

      {/* エディタ */}
      <main className="flex-1 overflow-hidden">
        <CanvaEditor
          slides={slides}
          onSlidesChange={setSlides}
          onSave={handleSave}
          onPreview={handlePreview}
          onExport={handleExport}
        />
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">プレビュー</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                閉じる
              </button>
            </div>
            <div className="flex-1 bg-gray-800 min-h-[500px]">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* 保存中表示 */}
      {isSaving && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg px-6 py-4 text-white flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            保存中...
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function EditorLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="text-white flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        読み込み中...
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorContent />
    </Suspense>
  );
}
