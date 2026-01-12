'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, FileText, Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import PresetSelector from './PresetSelector';
import { initGemini, createSlidesFromChat } from '@/lib/gemini';
import { combineSlides, generateFullHtml } from '@/lib/marp';
import { getTemplateById, slideTemplates } from '@/templates/slideTemplates';

interface ChatViewProps {
  onPreviewDocument?: (html: string, title: string) => void;
}

export default function ChatView({ onPreviewDocument }: ChatViewProps) {
  const {
    chatSessions,
    currentSessionId,
    selectedPresetId,
    isLoading,
    createChatSession,
    addMessage,
    updateSessionTitle,
    setIsLoading,
    createDocument,
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<{
    title: string;
    marpContent: string;
    htmlContent: string;
  } | null>(null);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);

  useEffect(() => {
    // APIキーを初期化
    const apiKey = localStorage.getItem('gemini-api-key');
    if (apiKey) {
      initGemini(apiKey);
    }
  }, []);

  useEffect(() => {
    // メッセージが追加されたらスクロール
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSendMessage = async (content: string) => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      alert('設定からGemini APIキーを設定してください');
      return;
    }

    // セッションがない場合は新規作成
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createChatSession();
    }

    // ユーザーメッセージを追加
    addMessage(sessionId, { role: 'user', content });

    // 最初のメッセージでタイトルを更新
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session?.messages.length === 0) {
      updateSessionTitle(sessionId, content.slice(0, 30) + (content.length > 30 ? '...' : ''));
    }

    setIsLoading(true);

    try {
      initGemini(apiKey);

      // 会話履歴を構築
      const history =
        session?.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })) || [];

      // Gemini APIで応答を生成
      const result = await createSlidesFromChat(content, history, true);

      // アシスタントメッセージを追加
      addMessage(sessionId, {
        role: 'assistant',
        content: result.response,
      });

      // スライドが生成された場合
      if (result.slides && result.slides.length > 0) {
        // スライドをMarp形式に変換
        const marpSlides = result.slides.map((slide) => {
          // カテゴリに基づいてテンプレートを選択
          const categoryTemplates = slideTemplates.filter(
            (t) => t.category === slide.templateCategory
          );
          if (categoryTemplates.length > 0) {
            return slide.content;
          }
          return slide.content;
        });

        const combinedMarp = combineSlides(marpSlides);
        const htmlContent = generateFullHtml(combinedMarp);

        setGeneratedDocument({
          title: result.title || '無題の資料',
          marpContent: combinedMarp,
          htmlContent,
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage(sessionId, {
        role: 'assistant',
        content:
          'エラーが発生しました。もう一度お試しください。APIキーが正しく設定されているか確認してください。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = () => {
    if (!generatedDocument) return;

    createDocument(
      generatedDocument.title,
      generatedDocument.marpContent,
      generatedDocument.htmlContent
    );

    // プレビュー表示
    onPreviewDocument?.(generatedDocument.htmlContent, generatedDocument.title);

    setGeneratedDocument(null);
  };

  const handleDownloadDocument = () => {
    if (!generatedDocument) return;

    const blob = new Blob([generatedDocument.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDocument.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 新規チャット画面（セッションがない場合）
  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Marp AI で資料を作成
          </h1>
          <p className="text-gray-400">
            作りたい資料の内容を入力してください。
            AIが自動的にプレゼンテーション資料を作成します。
          </p>
        </div>

        {/* プリセット選択 */}
        <div className="max-w-2xl w-full mb-8">
          <button
            onClick={() => setShowPresetSelector(!showPresetSelector)}
            className="w-full text-left px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {selectedPresetId
                  ? `プリセット: ${
                      useStore.getState().chatSessions.find(
                        (s) => s.id === selectedPresetId
                      )?.title || 'カスタム'
                    }`
                  : 'プリセットを選択（任意）'}
              </span>
              <span className="text-gray-500 text-sm">
                {showPresetSelector ? '閉じる' : '開く'}
              </span>
            </div>
          </button>

          {showPresetSelector && (
            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <PresetSelector onSelect={() => setShowPresetSelector(false)} />
            </div>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="max-w-2xl w-full">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="例: 新製品の発表会用のプレゼン資料を作成して"
          />
        </div>

        {/* サンプルプロンプト */}
        <div className="max-w-2xl w-full mt-6">
          <p className="text-xs text-gray-500 mb-3 text-center">サンプル</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              '会社紹介のプレゼン資料を作って',
              'プロジェクト進捗報告書を作成して',
              '新サービスのピッチ資料を作って',
              '研修用の資料を5枚で作って',
            ].map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sample)}
                className="text-left px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:bg-gray-800/50 hover:border-gray-600 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // チャット画面
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {currentSession.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>考え中...</span>
            </div>
          )}

          {/* 生成されたドキュメント */}
          {generatedDocument && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">
                    {generatedDocument.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    資料が生成されました
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDocument}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-lg transition-all"
                    >
                      保存してプレビュー
                    </button>
                    <button
                      onClick={handleDownloadDocument}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      ダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <div className="p-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
