'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Maximize,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { LibraryItem } from '@/types';

interface PreviewModalProps {
  item: LibraryItem | null;
  onClose: () => void;
}

export default function PreviewModal({ item, onClose }: PreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    if (!item) return;

    // スライド数をカウント
    const sectionCount = (item.htmlContent.match(/<section/gi) || []).length;
    setTotalSlides(sectionCount || 1);
    setCurrentSlide(0);
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentSlide, totalSlides]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      navigateToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      navigateToSlide(currentSlide - 1);
    }
  };

  const navigateToSlide = (index: number) => {
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'NAVIGATE_SLIDE', index }, '*');
      }
    } catch (error) {
      console.error('Failed to navigate slide:', error);
    }
  };

  const handleDownload = () => {
    if (!item) return;
    const blob = new Blob([item.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!item) return null;

  // iframeに表示するHTMLにナビゲーションスクリプトを追加
  const htmlWithNavigation = item.htmlContent.replace(
    '</body>',
    `<script>
      window.addEventListener('message', (e) => {
        if (e.data.type === 'NAVIGATE_SLIDE') {
          const slides = document.querySelectorAll('section');
          slides.forEach((slide, i) => {
            slide.style.display = i === e.data.index ? 'flex' : 'none';
          });
        }
      });

      // 初期化時に最初のスライドを表示
      const initSlides = document.querySelectorAll('section');
      initSlides.forEach((slide, i) => {
        slide.style.display = i === 0 ? 'flex' : 'none';
      });
    </script></body>`
  );

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[100] bg-black'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4';

  const contentClass = isFullscreen
    ? 'w-full h-full'
    : 'bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* ヘッダー */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-800 ${
            isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-black/80' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-white">{item.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* スライドナビゲーション */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    currentSlide === 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentSlide === totalSlides - 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              title="ダウンロード"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              title="全画面表示"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className={`flex-1 bg-gray-800 ${isFullscreen ? 'pt-16' : ''}`}>
          <iframe
            ref={iframeRef}
            srcDoc={htmlWithNavigation}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
