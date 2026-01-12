'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Minus,
  Copy,
  Layers,
  Download,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Grip,
  X,
  Search,
  Upload,
} from 'lucide-react';
import { availableFonts, getFontsByCategory, fontCategoryNames, type FontOption } from '@/lib/fonts';

// 要素の種類
type ElementType = 'text' | 'image' | 'shape';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line';

// キャンバス上の要素
export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  src?: string;
  shapeType?: ShapeType;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    opacity: number;
  };
  locked: boolean;
  zIndex: number;
}

// スライドデータ
export interface SlideData {
  id: string;
  backgroundColor: string;
  backgroundImage?: string;
  elements: CanvasElement[];
}

// デフォルト要素スタイル
const defaultElementStyle: CanvasElement['style'] = {
  fontFamily: '"Noto Sans JP", sans-serif',
  fontSize: 24,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  color: '#333333',
  backgroundColor: 'transparent',
  borderColor: '#333333',
  borderWidth: 0,
  borderRadius: 0,
  opacity: 1,
};

// プリセットカラー
const presetColors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
];

// 背景グラデーションプリセット
const gradientPresets = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

interface CanvaEditorProps {
  slides: SlideData[];
  onSlidesChange: (slides: SlideData[]) => void;
  onSave?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
}

export default function CanvaEditor({
  slides,
  onSlidesChange,
  onSave,
  onPreview,
  onExport,
}: CanvaEditorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'elements' | 'text' | 'images' | 'backgrounds' | null>('elements');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [fontSearch, setFontSearch] = useState('');
  const [fontCategory, setFontCategory] = useState<FontOption['category'] | 'all'>('all');
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  // スライドを追加
  const addSlide = useCallback(() => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      backgroundColor: '#ffffff',
      elements: [],
    };
    const newSlides = [...slides, newSlide];
    onSlidesChange(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    setSelectedElementId(null);
  }, [slides, onSlidesChange]);

  // スライドを削除
  const deleteSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    onSlidesChange(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    setSelectedElementId(null);
  }, [slides, currentSlideIndex, onSlidesChange]);

  // スライドを複製
  const duplicateSlide = useCallback(() => {
    const newSlide: SlideData = {
      ...currentSlide,
      id: crypto.randomUUID(),
      elements: currentSlide.elements.map(el => ({ ...el, id: crypto.randomUUID() })),
    };
    const newSlides = [
      ...slides.slice(0, currentSlideIndex + 1),
      newSlide,
      ...slides.slice(currentSlideIndex + 1),
    ];
    onSlidesChange(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  }, [slides, currentSlide, currentSlideIndex, onSlidesChange]);

  // 要素を追加
  const addElement = useCallback((type: ElementType, options?: Partial<CanvasElement>) => {
    const baseElement: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 100 : 200,
      rotation: 0,
      style: { ...defaultElementStyle },
      locked: false,
      zIndex: currentSlide.elements.length,
      ...options,
    };

    if (type === 'text') {
      baseElement.content = 'テキストを入力';
    } else if (type === 'shape') {
      baseElement.shapeType = options?.shapeType || 'rectangle';
      baseElement.style.backgroundColor = '#4a86e8';
      baseElement.style.borderWidth = 0;
    }

    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, baseElement] }
        : slide
    );
    onSlidesChange(newSlides);
    setSelectedElementId(baseElement.id);
  }, [slides, currentSlide, currentSlideIndex, onSlidesChange]);

  // 要素を更新
  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex
        ? {
            ...slide,
            elements: slide.elements.map(el =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          }
        : slide
    );
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange]);

  // 要素のスタイルを更新
  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<CanvasElement['style']>) => {
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (!element) return;
    updateElement(elementId, { style: { ...element.style, ...styleUpdates } });
  }, [currentSlide, updateElement]);

  // 要素を削除
  const deleteElement = useCallback((elementId: string) => {
    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex
        ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
        : slide
    );
    onSlidesChange(newSlides);
    setSelectedElementId(null);
  }, [slides, currentSlideIndex, onSlidesChange]);

  // 要素を複製
  const duplicateElement = useCallback((elementId: string) => {
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: crypto.randomUUID(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: currentSlide.elements.length,
    };

    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );
    onSlidesChange(newSlides);
    setSelectedElementId(newElement.id);
  }, [slides, currentSlide, currentSlideIndex, onSlidesChange]);

  // 背景を更新
  const updateBackground = useCallback((updates: Partial<Pick<SlideData, 'backgroundColor' | 'backgroundImage'>>) => {
    const newSlides = slides.map((slide, i) =>
      i === currentSlideIndex ? { ...slide, ...updates } : slide
    );
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange]);

  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;

    setSelectedElementId(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - element.x * zoom, y: e.clientY - element.y * zoom });
  }, [currentSlide, zoom]);

  // ドラッグ中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId) return;

    const newX = (e.clientX - dragStart.x) / zoom;
    const newY = (e.clientY - dragStart.y) / zoom;

    updateElement(selectedElementId, { x: newX, y: newY });
  }, [isDragging, selectedElementId, dragStart, zoom, updateElement]);

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // キャンバスクリック（選択解除）
  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        deleteElement(selectedElementId);
      }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateElement]);

  // フィルタリングされたフォント
  const filteredFonts = availableFonts.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory = fontCategory === 'all' || font.category === fontCategory;
    return matchesSearch && matchesCategory;
  });

  // 図形を描画
  const renderShape = (element: CanvasElement) => {
    const commonStyle: React.CSSProperties = {
      backgroundColor: element.style.backgroundColor,
      border: element.style.borderWidth > 0 ? `${element.style.borderWidth}px solid ${element.style.borderColor}` : 'none',
      opacity: element.style.opacity,
    };

    switch (element.shapeType) {
      case 'circle':
        return <div className="w-full h-full rounded-full" style={commonStyle} />;
      case 'triangle':
        return (
          <div
            className="w-full h-full"
            style={{
              ...commonStyle,
              backgroundColor: 'transparent',
              borderLeft: `${element.width / 2}px solid transparent`,
              borderRight: `${element.width / 2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.style.backgroundColor}`,
            }}
          />
        );
      case 'line':
        return (
          <div
            className="w-full"
            style={{
              height: `${element.style.borderWidth || 2}px`,
              backgroundColor: element.style.borderColor,
              marginTop: element.height / 2,
            }}
          />
        );
      default:
        return (
          <div
            className="w-full h-full"
            style={{
              ...commonStyle,
              borderRadius: `${element.style.borderRadius}px`,
            }}
          />
        );
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
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
    <div className="flex h-full bg-gray-950">
      {/* 左サイドパネル - 要素追加 */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* パネル切り替えタブ */}
        <div className="flex border-b border-gray-800">
          {[
            { id: 'elements', icon: Layers, label: '要素' },
            { id: 'text', icon: Type, label: 'テキスト' },
            { id: 'images', icon: ImageIcon, label: '画像' },
            { id: 'backgrounds', icon: Square, label: '背景' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(activePanel === tab.id ? null : tab.id as typeof activePanel)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs transition-colors ${
                activePanel === tab.id
                  ? 'bg-gray-800 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* パネル内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === 'elements' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">基本図形</h3>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => addElement('shape', { shapeType: 'rectangle' })}
                    className="aspect-square flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg p-3"
                  >
                    <Square className="w-6 h-6 text-gray-300" />
                  </button>
                  <button
                    onClick={() => addElement('shape', { shapeType: 'circle' })}
                    className="aspect-square flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg p-3"
                  >
                    <Circle className="w-6 h-6 text-gray-300" />
                  </button>
                  <button
                    onClick={() => addElement('shape', { shapeType: 'triangle' })}
                    className="aspect-square flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg p-3"
                  >
                    <Triangle className="w-6 h-6 text-gray-300" />
                  </button>
                  <button
                    onClick={() => addElement('shape', { shapeType: 'line', height: 4 })}
                    className="aspect-square flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg p-3"
                  >
                    <Minus className="w-6 h-6 text-gray-300" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">テキスト</h3>
                <button
                  onClick={() => addElement('text', { style: { ...defaultElementStyle, fontSize: 48, fontWeight: 'bold' }, content: '見出し' })}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold text-xl mb-2"
                >
                  見出しを追加
                </button>
                <button
                  onClick={() => addElement('text', { style: { ...defaultElementStyle, fontSize: 32 }, content: 'サブ見出し' })}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium mb-2"
                >
                  サブ見出しを追加
                </button>
                <button
                  onClick={() => addElement('text', { content: '本文テキスト' })}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
                >
                  本文を追加
                </button>
              </div>
            </div>
          )}

          {activePanel === 'text' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="フォントを検索..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFontCategory('all')}
                  className={`px-2 py-1 text-xs rounded ${
                    fontCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  すべて
                </button>
                {(Object.keys(fontCategoryNames) as FontOption['category'][]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFontCategory(cat)}
                    className={`px-2 py-1 text-xs rounded ${
                      fontCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {fontCategoryNames[cat]}
                  </button>
                ))}
              </div>

              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredFonts.map(font => (
                  <button
                    key={font.value}
                    onClick={() => {
                      if (selectedElementId && selectedElement?.type === 'text') {
                        updateElementStyle(selectedElementId, { fontFamily: font.value });
                      } else {
                        addElement('text', {
                          content: font.name,
                          style: { ...defaultElementStyle, fontFamily: font.value },
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-left bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'images' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  const url = prompt('画像のURLを入力してください:');
                  if (url) {
                    addElement('image', { src: url });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span>画像URLを追加</span>
              </button>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">サンプル画像</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
                    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
                    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400',
                    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400',
                  ].map((url, i) => (
                    <button
                      key={i}
                      onClick={() => addElement('image', { src: url })}
                      className="aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePanel === 'backgrounds' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">単色</h3>
                <div className="grid grid-cols-5 gap-1">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateBackground({ backgroundColor: color, backgroundImage: undefined })}
                      className={`aspect-square rounded border-2 transition-transform hover:scale-110 ${
                        currentSlide.backgroundColor === color && !currentSlide.backgroundImage
                          ? 'border-purple-500'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">グラデーション</h3>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((gradient, i) => (
                    <button
                      key={i}
                      onClick={() => updateBackground({ backgroundImage: gradient })}
                      className={`aspect-video rounded-lg border-2 transition-transform hover:scale-105 ${
                        currentSlide.backgroundImage === gradient
                          ? 'border-purple-500'
                          : 'border-transparent'
                      }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">カスタム</h3>
                <input
                  type="color"
                  value={currentSlide.backgroundColor}
                  onChange={(e) => updateBackground({ backgroundColor: e.target.value, backgroundImage: undefined })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* スライド一覧 */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">スライド</span>
            <button
              onClick={addSlide}
              className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => {
                  setCurrentSlideIndex(index);
                  setSelectedElementId(null);
                }}
                className={`flex-shrink-0 w-20 aspect-video rounded overflow-hidden border-2 transition-all ${
                  index === currentSlideIndex
                    ? 'border-purple-500'
                    : 'border-transparent hover:border-gray-600'
                }`}
                style={{
                  background: slide.backgroundImage || slide.backgroundColor,
                }}
              >
                <span className="text-xs text-white bg-black/50 px-1">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインキャンバスエリア */}
      <div className="flex-1 flex flex-col">
        {/* ツールバー */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-800 rounded text-gray-400">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded text-gray-400">
              <Redo className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-2" />
            <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
              <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1 hover:bg-gray-700 rounded">
                <ZoomOut className="w-4 h-4 text-gray-400" />
              </button>
              <span className="text-sm text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="p-1 hover:bg-gray-700 rounded">
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
            >
              <Play className="w-4 h-4" />
              プレビュー
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
            >
              保存
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
            >
              <Download className="w-4 h-4" />
              エクスポート
            </button>
          </div>
        </div>

        {/* キャンバス */}
        <div
          className="flex-1 overflow-auto bg-gray-950 p-8"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={canvasRef}
            className="relative mx-auto shadow-2xl"
            style={{
              width: 960 * zoom,
              height: 540 * zoom,
              background: currentSlide.backgroundImage || currentSlide.backgroundColor,
            }}
          >
            {/* 要素を描画 */}
            {currentSlide.elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-move ${
                    selectedElementId === element.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{
                    left: element.x * zoom,
                    top: element.y * zoom,
                    width: element.width * zoom,
                    height: element.type === 'text' ? 'auto' : element.height * zoom,
                    minHeight: element.type === 'text' ? element.height * zoom : undefined,
                    transform: `rotate(${element.rotation}deg)`,
                    opacity: element.style.opacity,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(element.id);
                  }}
                >
                  {element.type === 'text' && (
                    <div
                      contentEditable={selectedElementId === element.id}
                      suppressContentEditableWarning
                      className="w-full h-full outline-none"
                      style={{
                        fontFamily: element.style.fontFamily,
                        fontSize: element.style.fontSize * zoom,
                        fontWeight: element.style.fontWeight,
                        fontStyle: element.style.fontStyle,
                        textDecoration: element.style.textDecoration,
                        textAlign: element.style.textAlign,
                        color: element.style.color,
                        backgroundColor: element.style.backgroundColor,
                        padding: '8px',
                      }}
                      onBlur={(e) => {
                        updateElement(element.id, { content: e.currentTarget.textContent || '' });
                      }}
                    >
                      {element.content}
                    </div>
                  )}

                  {element.type === 'image' && element.src && (
                    <img
                      src={element.src}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  )}

                  {element.type === 'shape' && renderShape(element)}

                  {/* リサイズハンドル */}
                  {selectedElementId === element.id && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-purple-500 rounded-full cursor-nw-resize" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-purple-500 rounded-full cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-purple-500 rounded-full cursor-sw-resize" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-purple-500 rounded-full cursor-se-resize" />
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-center gap-4 py-3 bg-gray-900 border-t border-gray-800">
          <button
            onClick={() => {
              setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
              setSelectedElementId(null);
            }}
            disabled={currentSlideIndex === 0}
            className={`p-2 rounded ${
              currentSlideIndex === 0 ? 'text-gray-600' : 'hover:bg-gray-800 text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => {
              setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
              setSelectedElementId(null);
            }}
            disabled={currentSlideIndex === slides.length - 1}
            className={`p-2 rounded ${
              currentSlideIndex === slides.length - 1 ? 'text-gray-600' : 'hover:bg-gray-800 text-white'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 右サイドパネル - プロパティ */}
      {selectedElement && (
        <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">プロパティ</h3>
            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="p-1 hover:bg-gray-800 rounded text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              {/* フォントサイズ */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">フォントサイズ</label>
                <input
                  type="number"
                  value={selectedElement.style.fontSize}
                  onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>

              {/* テキストスタイル */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">スタイル</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateElementStyle(selectedElement.id, {
                      fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold'
                    })}
                    className={`p-2 rounded ${
                      selectedElement.style.fontWeight === 'bold' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <Bold className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => updateElementStyle(selectedElement.id, {
                      fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic'
                    })}
                    className={`p-2 rounded ${
                      selectedElement.style.fontStyle === 'italic' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <Italic className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => updateElementStyle(selectedElement.id, {
                      textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline'
                    })}
                    className={`p-2 rounded ${
                      selectedElement.style.textDecoration === 'underline' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <Underline className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* テキスト配置 */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">配置</label>
                <div className="flex gap-1">
                  {[
                    { align: 'left', icon: AlignLeft },
                    { align: 'center', icon: AlignCenter },
                    { align: 'right', icon: AlignRight },
                  ].map(({ align, icon: Icon }) => (
                    <button
                      key={align}
                      onClick={() => updateElementStyle(selectedElement.id, { textAlign: align as 'left' | 'center' | 'right' })}
                      className={`p-2 rounded ${
                        selectedElement.style.textAlign === align ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </button>
                  ))}
                </div>
              </div>

              {/* テキスト色 */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">テキスト色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.style.color}
                    onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {presetColors.slice(0, 10).map(color => (
                      <button
                        key={color}
                        onClick={() => updateElementStyle(selectedElement.id, { color })}
                        className="w-full aspect-square rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedElement.type === 'shape' && (
            <div className="space-y-4">
              {/* 塗りつぶし色 */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">塗りつぶし色</label>
                <input
                  type="color"
                  value={selectedElement.style.backgroundColor}
                  onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              {/* 枠線 */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">枠線</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedElement.style.borderWidth}
                    onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                    className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    min="0"
                  />
                  <input
                    type="color"
                    value={selectedElement.style.borderColor}
                    onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })}
                    className="flex-1 h-8 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 角丸 */}
              {selectedElement.shapeType === 'rectangle' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">角丸</label>
                  <input
                    type="range"
                    value={selectedElement.style.borderRadius}
                    onChange={(e) => updateElementStyle(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
          )}

          {/* 共通設定 */}
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
            {/* 透明度 */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">透明度</label>
              <input
                type="range"
                value={selectedElement.style.opacity * 100}
                onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseInt(e.target.value) / 100 })}
                className="w-full"
                min="0"
                max="100"
              />
            </div>

            {/* サイズ */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">サイズ</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  placeholder="W"
                />
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                  className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  placeholder="H"
                />
              </div>
            </div>

            {/* アクション */}
            <div className="flex gap-2">
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
              >
                <Copy className="w-4 h-4" />
                複製
              </button>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Marp形式に変換するヘルパー関数
export function slidesToMarp(slides: SlideData[]): string {
  const header = `---
marp: true
theme: default
paginate: true
---

`;

  const slideContents = slides.map(slide => {
    const bgStyle = slide.backgroundImage
      ? `<!-- _backgroundImage: ${slide.backgroundImage} -->`
      : `<!-- _backgroundColor: ${slide.backgroundColor} -->`;

    const elementsContent = slide.elements
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(el => {
        if (el.type === 'text') {
          const styleAttr = `style="font-family: ${el.style.fontFamily}; font-size: ${el.style.fontSize}px; color: ${el.style.color}; text-align: ${el.style.textAlign}; font-weight: ${el.style.fontWeight}; font-style: ${el.style.fontStyle};"`;
          return `<div ${styleAttr}>${el.content}</div>`;
        }
        if (el.type === 'image' && el.src) {
          return `![](${el.src})`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

    return `${bgStyle}\n\n${elementsContent}`;
  });

  return header + slideContents.join('\n\n---\n\n');
}
