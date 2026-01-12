'use client';

import { Check, Sparkles } from 'lucide-react';
import { presets } from '@/templates/presets';
import { useStore } from '@/store/useStore';

interface PresetSelectorProps {
  onSelect?: (presetId: string | null) => void;
}

export default function PresetSelector({ onSelect }: PresetSelectorProps) {
  const { selectedPresetId, setSelectedPreset } = useStore();

  const handleSelect = (presetId: string | null) => {
    setSelectedPreset(presetId);
    onSelect?.(presetId);
  };

  // プリセットの色を取得
  const getPresetColor = (index: number) => {
    const colors = [
      'from-purple-500 to-blue-500',
      'from-pink-500 to-rose-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-amber-500',
      'from-cyan-500 to-blue-500',
      'from-violet-500 to-purple-500',
      'from-emerald-500 to-green-500',
      'from-gray-600 to-gray-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-white">プリセットを選択</h3>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        プリセットを選択すると、そのテーマに合ったテンプレートが自動的に使用されます。
        選択しない場合はAIが最適なテンプレートを選びます。
      </p>

      {/* 選択なしオプション */}
      <button
        onClick={() => handleSelect(null)}
        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
          selectedPresetId === null
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">AIにおまかせ</h4>
            <p className="text-sm text-gray-400 mt-1">
              AIが内容に応じて最適なテンプレートを選択します
            </p>
          </div>
          {selectedPresetId === null && (
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>

      {/* プリセット一覧 */}
      <div className="grid grid-cols-1 gap-3">
        {presets.map((preset, index) => (
          <button
            key={preset.id}
            onClick={() => handleSelect(preset.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedPresetId === preset.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* サムネイル */}
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getPresetColor(
                  index
                )} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white font-bold text-lg">
                  {preset.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{preset.name}</h4>
                  {selectedPresetId === preset.id && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {preset.templateIds.length}枚のテンプレート
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
