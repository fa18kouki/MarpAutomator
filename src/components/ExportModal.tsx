'use client';

import { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  FileText,
  Code,
  FileDown,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { SlideData } from './CanvaEditor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: SlideData[];
  title: string;
  onExportHtml: () => void;
}

type ExportFormat = 'png' | 'pptx' | 'svg' | 'html';
type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export default function ExportModal({
  isOpen,
  onClose,
  slides,
  title,
  onExportHtml,
}: ExportModalProps) {
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, ExportStatus>>({
    png: 'idle',
    pptx: 'idle',
    svg: 'idle',
    html: 'idle',
  });

  if (!isOpen) return null;

  const handleExport = async (format: ExportFormat) => {
    setExportStatus(prev => ({ ...prev, [format]: 'exporting' }));

    try {
      if (format === 'html') {
        onExportHtml();
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
      } else if (format === 'png') {
        const { exportSlidesToPng } = await import('@/lib/export');
        await exportSlidesToPng(slides, title);
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
      } else if (format === 'pptx') {
        const { exportSlidesToPptx } = await import('@/lib/export');
        await exportSlidesToPptx(slides, title);
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
      } else if (format === 'svg') {
        const { exportSlideToSvg } = await import('@/lib/export');
        for (let i = 0; i < slides.length; i++) {
          await exportSlideToSvg(slides[i], `${title}_slide_${i + 1}`);
        }
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
      }

      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(prev => ({ ...prev, [format]: 'error' }));

      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: 'idle' }));
      }, 3000);
    }
  };

  const exportOptions = [
    {
      format: 'png' as ExportFormat,
      icon: ImageIcon,
      title: 'PNG画像（ZIP）',
      description: 'Canvaに取り込む場合に最適。高解像度の画像として各スライドを書き出します。',
      recommended: true,
    },
    {
      format: 'pptx' as ExportFormat,
      icon: FileText,
      title: 'PowerPoint（PPTX）',
      description: 'PowerPointやCanvaで編集可能。テキストや図形を維持します。',
      recommended: true,
    },
    {
      format: 'svg' as ExportFormat,
      icon: Code,
      title: 'SVG（ベクター）',
      description: '拡大しても劣化しないベクター形式。イラストレーターなどで編集可能。',
      recommended: false,
    },
    {
      format: 'html' as ExportFormat,
      icon: FileDown,
      title: 'HTML（Marp形式）',
      description: 'ブラウザで表示可能なプレゼンテーション形式。',
      recommended: false,
    },
  ];

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'exporting':
        return <Loader2 className="w-5 h-5 animate-spin text-purple-400" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-white">エクスポート</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {/* Canvaへの注意書き */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              <strong>Canvaに取り込む場合:</strong> PNG画像またはPPTX形式で書き出すと、レイアウトが崩れにくくなります。
            </p>
          </div>

          {/* エクスポートオプション */}
          <div className="space-y-3">
            {exportOptions.map(({ format, icon: Icon, title, description, recommended }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exportStatus[format] === 'exporting'}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                  recommended
                    ? 'border-purple-600/50 bg-purple-900/20 hover:bg-purple-900/30'
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                } ${exportStatus[format] === 'exporting' ? 'opacity-70 cursor-wait' : ''}`}
              >
                <div className={`p-3 rounded-lg ${recommended ? 'bg-purple-600' : 'bg-gray-700'}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{title}</h3>
                    {recommended && (
                      <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                        おすすめ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{description}</p>
                </div>
                <div className="flex items-center h-full">
                  {getStatusIcon(exportStatus[format])}
                </div>
              </button>
            ))}
          </div>

          {/* スライド数の表示 */}
          <p className="text-center text-sm text-gray-500">
            {slides.length}枚のスライドを書き出します
          </p>
        </div>
      </div>
    </div>
  );
}
