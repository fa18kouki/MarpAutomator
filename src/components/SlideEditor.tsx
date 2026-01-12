'use client';

import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Type,
  Palette,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Eye,
  Copy,
} from 'lucide-react';

// スライドのスタイル設定
export interface SlideStyle {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right';
  padding: string;
}

// スライドデータ
export interface SlideData {
  id: string;
  content: string;
  style: SlideStyle;
  images: { url: string; alt: string; position: 'left' | 'center' | 'right' }[];
}

// デフォルトスタイル
const defaultStyle: SlideStyle = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontFamily: 'system-ui',
  fontSize: '24px',
  textAlign: 'left',
  padding: '40px',
};

// 利用可能なフォント
const availableFonts = [
  { name: 'システム', value: 'system-ui, sans-serif' },
  { name: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'メイリオ', value: '"Meiryo", sans-serif' },
  { name: 'ゴシック', value: '"Hiragino Kaku Gothic Pro", sans-serif' },
  { name: '明朝', value: '"Hiragino Mincho Pro", serif' },
  { name: 'Courier', value: '"Courier New", monospace' },
];

// プリセットカラー
const presetColors = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#f39c12', '#2ecc71', '#3498db',
  '#9b59b6', '#1abc9c', '#e74c3c', '#2c3e50',
];

interface SlideEditorProps {
  slides: SlideData[];
  onSlidesChange: (slides: SlideData[]) => void;
  onSave?: () => void;
  onPreview?: () => void;
}

export default function SlideEditor({
  slides,
  onSlidesChange,
  onSave,
  onPreview,
}: SlideEditorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | null>(null);
  const [showFontPicker, setShowFontPicker] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  // スライドを追加
  const addSlide = useCallback(() => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      content: '# 新しいスライド\n\nここに内容を入力',
      style: { ...defaultStyle },
      images: [],
    };
    const newSlides = [...slides, newSlide];
    onSlidesChange(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  }, [slides, onSlidesChange]);

  // スライドを削除
  const deleteSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    onSlidesChange(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  }, [slides, currentSlideIndex, onSlidesChange]);

  // スライドを複製
  const duplicateSlide = useCallback(() => {
    const newSlide: SlideData = {
      ...currentSlide,
      id: crypto.randomUUID(),
    };
    const newSlides = [
      ...slides.slice(0, currentSlideIndex + 1),
      newSlide,
      ...slides.slice(currentSlideIndex + 1),
    ];
    onSlidesChange(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  }, [slides, currentSlide, currentSlideIndex, onSlidesChange]);

  // コンテンツを更新
  const updateContent = useCallback(
    (content: string) => {
      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex ? { ...slide, content } : slide
      );
      onSlidesChange(newSlides);
    },
    [slides, currentSlideIndex, onSlidesChange]
  );

  // スタイルを更新
  const updateStyle = useCallback(
    (styleUpdate: Partial<SlideStyle>) => {
      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex
          ? { ...slide, style: { ...slide.style, ...styleUpdate } }
          : slide
      );
      onSlidesChange(newSlides);
    },
    [slides, currentSlideIndex, onSlidesChange]
  );

  // 画像を追加
  const addImage = useCallback(() => {
    const url = prompt('画像のURLを入力してください:');
    if (!url) return;

    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex
        ? {
            ...slide,
            images: [...slide.images, { url, alt: '画像', position: 'center' as const }],
          }
        : slide
    );
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange]);

  // テキストフォーマットを挿入
  const insertFormat = useCallback(
    (format: 'bold' | 'italic' | 'list') => {
      const textarea = document.querySelector(
        '.slide-content-editor'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = currentSlide.content.substring(start, end);

      let newText = '';
      switch (format) {
        case 'bold':
          newText = `**${selectedText || 'テキスト'}**`;
          break;
        case 'italic':
          newText = `*${selectedText || 'テキスト'}*`;
          break;
        case 'list':
          newText = `\n- ${selectedText || 'リスト項目'}`;
          break;
      }

      const newContent =
        currentSlide.content.substring(0, start) +
        newText +
        currentSlide.content.substring(end);
      updateContent(newContent);
    },
    [currentSlide, updateContent]
  );

  // スライドをMarp形式に変換
  const generateMarpForSlide = (slide: SlideData): string => {
    const styleBlock = `
<!-- _backgroundColor: ${slide.style.backgroundColor} -->
<!-- _color: ${slide.style.textColor} -->
<style scoped>
section {
  font-family: ${slide.style.fontFamily};
  font-size: ${slide.style.fontSize};
  text-align: ${slide.style.textAlign};
  padding: ${slide.style.padding};
}
</style>
`;

    const imageBlock = slide.images
      .map((img) => `![${img.alt}](${img.url})`)
      .join('\n');

    return `${styleBlock}\n${slide.content}\n${imageBlock}`;
  };

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          最初のスライドを作成
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900">
      {/* 左パネル: スライド一覧 */}
      <div className="w-48 bg-gray-950 border-r border-gray-800 overflow-y-auto">
        <div className="p-3">
          <button
            onClick={addSlide}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg mb-3"
          >
            <Plus className="w-4 h-4" />
            スライド追加
          </button>

          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`relative p-2 rounded-lg cursor-pointer transition-all ${
                  index === currentSlideIndex
                    ? 'ring-2 ring-purple-500 bg-gray-800'
                    : 'bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <div
                  className="aspect-video rounded overflow-hidden text-xs"
                  style={{
                    backgroundColor: slide.style.backgroundColor,
                    color: slide.style.textColor,
                    padding: '8px',
                    fontSize: '6px',
                    lineHeight: 1.2,
                  }}
                >
                  {slide.content.substring(0, 50)}...
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 中央: エディタ */}
      <div className="flex-1 flex flex-col">
        {/* ツールバー */}
        <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
          {/* フォーマットボタン */}
          <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
            <button
              onClick={() => insertFormat('bold')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300"
              title="太字"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormat('italic')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300"
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormat('list')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300"
              title="リスト"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 配置ボタン */}
          <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
            <button
              onClick={() => updateStyle({ textAlign: 'left' })}
              className={`p-2 rounded ${
                currentSlide.style.textAlign === 'left'
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
              title="左揃え"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateStyle({ textAlign: 'center' })}
              className={`p-2 rounded ${
                currentSlide.style.textAlign === 'center'
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
              title="中央揃え"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateStyle({ textAlign: 'right' })}
              className={`p-2 rounded ${
                currentSlide.style.textAlign === 'right'
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
              title="右揃え"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* スタイルボタン */}
          <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
            {/* 背景色 */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
                className="flex items-center gap-1 p-2 hover:bg-gray-700 rounded text-gray-300"
                title="背景色"
              >
                <Palette className="w-4 h-4" />
                <div
                  className="w-4 h-4 rounded border border-gray-500"
                  style={{ backgroundColor: currentSlide.style.backgroundColor }}
                />
              </button>
              {showColorPicker === 'bg' && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-gray-700 rounded-lg shadow-lg z-10">
                  <p className="text-xs text-gray-400 mb-2">背景色</p>
                  <div className="grid grid-cols-4 gap-1">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          updateStyle({ backgroundColor: color });
                          setShowColorPicker(null);
                        }}
                        className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={currentSlide.style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-full h-8 mt-2 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* テキスト色 */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                className="flex items-center gap-1 p-2 hover:bg-gray-700 rounded text-gray-300"
                title="テキスト色"
              >
                <Type className="w-4 h-4" />
                <div
                  className="w-4 h-4 rounded border border-gray-500"
                  style={{ backgroundColor: currentSlide.style.textColor }}
                />
              </button>
              {showColorPicker === 'text' && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-gray-700 rounded-lg shadow-lg z-10">
                  <p className="text-xs text-gray-400 mb-2">テキスト色</p>
                  <div className="grid grid-cols-4 gap-1">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          updateStyle({ textColor: color });
                          setShowColorPicker(null);
                        }}
                        className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={currentSlide.style.textColor}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    className="w-full h-8 mt-2 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* フォント */}
            <div className="relative">
              <button
                onClick={() => setShowFontPicker(!showFontPicker)}
                className="flex items-center gap-1 px-2 py-1 hover:bg-gray-700 rounded text-gray-300 text-sm"
                title="フォント"
              >
                <Type className="w-4 h-4" />
                <span className="max-w-20 truncate">
                  {availableFonts.find((f) => f.value === currentSlide.style.fontFamily)?.name || 'フォント'}
                </span>
              </button>
              {showFontPicker && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                  {availableFonts.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => {
                        updateStyle({ fontFamily: font.value });
                        setShowFontPicker(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-600 ${
                        currentSlide.style.fontFamily === font.value
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 画像追加 */}
            <button
              onClick={addImage}
              className="p-2 hover:bg-gray-700 rounded text-gray-300"
              title="画像追加"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* スライド操作 */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={duplicateSlide}
              className="p-2 hover:bg-gray-700 rounded text-gray-300"
              title="スライドを複製"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={deleteSlide}
              disabled={slides.length <= 1}
              className={`p-2 rounded ${
                slides.length <= 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'hover:bg-gray-700 text-red-400'
              }`}
              title="スライドを削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
            {onPreview && (
              <button
                onClick={onPreview}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
              >
                <Eye className="w-4 h-4" />
                プレビュー
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            )}
          </div>
        </div>

        {/* エディタ本体 */}
        <div className="flex-1 flex overflow-hidden">
          {/* テキストエディタ */}
          <div className="flex-1 p-4">
            <textarea
              className="slide-content-editor w-full h-full bg-gray-800 text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              value={currentSlide.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Markdown形式でスライドの内容を入力..."
            />
          </div>

          {/* プレビュー */}
          <div className="flex-1 p-4 border-l border-gray-700">
            <div className="h-full rounded-lg overflow-hidden shadow-lg">
              <div
                className="w-full h-full p-8 overflow-auto"
                style={{
                  backgroundColor: currentSlide.style.backgroundColor,
                  color: currentSlide.style.textColor,
                  fontFamily: currentSlide.style.fontFamily,
                  fontSize: currentSlide.style.fontSize,
                  textAlign: currentSlide.style.textAlign,
                }}
              >
                {/* 簡易Markdownレンダリング */}
                {currentSlide.content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return (
                      <h1 key={i} className="text-3xl font-bold mb-4">
                        {line.substring(2)}
                      </h1>
                    );
                  }
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={i} className="text-2xl font-bold mb-3">
                        {line.substring(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={i} className="text-xl font-bold mb-2">
                        {line.substring(4)}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="ml-4 mb-1">
                        {line.substring(2)}
                      </li>
                    );
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  return (
                    <p key={i} className="mb-2">
                      {line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>)/)
                        .map((part, j) => {
                          if (part.startsWith('<strong>')) {
                            return (
                              <strong key={j}>
                                {part.replace(/<\/?strong>/g, '')}
                              </strong>
                            );
                          }
                          if (part.startsWith('<em>')) {
                            return (
                              <em key={j}>{part.replace(/<\/?em>/g, '')}</em>
                            );
                          }
                          return part;
                        })}
                    </p>
                  );
                })}

                {/* 画像表示 */}
                {currentSlide.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {currentSlide.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={img.alt}
                        className="max-w-full max-h-40 object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-center gap-4 p-3 bg-gray-800 border-t border-gray-700">
          <button
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
            className={`p-2 rounded ${
              currentSlideIndex === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() =>
              setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))
            }
            disabled={currentSlideIndex === slides.length - 1}
            className={`p-2 rounded ${
              currentSlideIndex === slides.length - 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// スライドをMarp形式に変換するヘルパー関数
export function slidesToMarp(slides: SlideData[]): string {
  const header = `---
marp: true
theme: default
paginate: true
---

`;

  const slideContents = slides.map((slide) => {
    const styleBlock = `<!-- _backgroundColor: ${slide.style.backgroundColor} -->
<!-- _color: ${slide.style.textColor} -->
<style scoped>
section {
  font-family: ${slide.style.fontFamily};
  font-size: ${slide.style.fontSize};
  text-align: ${slide.style.textAlign};
  padding: ${slide.style.padding};
}
</style>

`;

    const imageBlock =
      slide.images.length > 0
        ? '\n' + slide.images.map((img) => `![${img.alt}](${img.url})`).join('\n')
        : '';

    return styleBlock + slide.content + imageBlock;
  });

  return header + slideContents.join('\n\n---\n\n');
}
