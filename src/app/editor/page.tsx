'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import SlideEditor, { type SlideData, slidesToMarp } from '@/components/SlideEditor';
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

  // 既存のドキュメントを読み込む
  useEffect(() => {
    if (documentId) {
      const doc = documents.find((d) => d.id === documentId);
      if (doc) {
        setDocumentTitle(doc.title);
        // Marpコンテンツからスライドを解析（簡易版）
        const slidesFromMarp = parseMarpToSlides(doc.marpContent);
        setSlides(slidesFromMarp);
        return;
      }
    }

    // 新規作成時のデフォルトスライド
    setSlides([
      {
        id: crypto.randomUUID(),
        content: '# タイトル\n\nここに内容を入力',
        style: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '24px',
          textAlign: 'left',
          padding: '40px',
        },
        images: [],
      },
    ]);
  }, [documentId, documents]);

  // Marpコンテンツからスライドを解析（簡易版）
  const parseMarpToSlides = (marpContent: string): SlideData[] => {
    const slideTexts = marpContent.split(/\n---\n/);
    return slideTexts.map((text, index) => {
      // フロントマターとスタイルをスキップ
      const cleanContent = text
        .replace(/^---[\s\S]*?---\n*/, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .trim();

      return {
        id: crypto.randomUUID(),
        content: cleanContent || `# スライド ${index + 1}`,
        style: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '24px',
          textAlign: 'left' as const,
          padding: '40px',
        },
        images: [],
      };
    });
  };

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

  // ダウンロード処理
  const handleDownload = () => {
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
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </Link>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="bg-transparent text-white text-lg font-medium focus:outline-none focus:border-b-2 focus:border-purple-500"
              placeholder="タイトルを入力..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ダウンロード</span>
          </button>
        </div>
      </header>

      {/* エディタ */}
      <main className="flex-1 overflow-hidden">
        <SlideEditor
          slides={slides}
          onSlidesChange={setSlides}
          onSave={handleSave}
          onPreview={handlePreview}
        />
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
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
            <div className="flex-1 bg-gray-800">
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
          <div className="bg-gray-800 rounded-lg px-6 py-4 text-white">
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
      <div className="text-white">読み込み中...</div>
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
