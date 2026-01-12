import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { SlideTemplate } from '@/types';
import { slideTemplates } from '@/templates/slideTemplates';

// Geminiクライアント
let genAI: GoogleGenerativeAI | null = null;

export const initGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

// セーフティ設定
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// 資料作成用のシステムプロンプト
const SLIDE_CREATION_PROMPT = `あなたはプレゼンテーション資料を作成するAIアシスタントです。
ユーザーの要望に基づいて、Marp形式のスライドを作成します。

利用可能なテンプレートカテゴリ:
- title: タイトルスライド
- content: コンテンツスライド
- image: 画像を含むスライド
- split: 分割レイアウトスライド
- list: リスト形式のスライド
- comparison: 比較スライド
- timeline: タイムラインスライド
- quote: 引用スライド
- code: コードスライド
- closing: 締めくくりスライド

以下のルールに従ってスライドを作成してください:
1. 各スライドは「---」で区切る
2. 最初のスライドはタイトルスライドにする
3. 内容に応じて適切なテンプレートカテゴリを選択する
4. 日本語で作成する（特に指定がない限り）
5. スライドは簡潔に、箇条書きを活用する
6. 最後は締めくくりスライドで終わる

レスポンスはJSON形式で返してください:
{
  "slides": [
    {
      "templateCategory": "title",
      "content": "Marp形式のスライド内容"
    }
  ],
  "title": "プレゼンテーションのタイトル"
}`;

// チャットでスライドを作成
export const createSlidesFromChat = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  searchEnabled: boolean = true
): Promise<{
  response: string;
  slides?: { templateCategory: string; content: string }[];
  title?: string;
  searchResults?: { title: string; url: string; snippet: string }[];
}> => {
  if (!genAI) {
    throw new Error('Gemini APIが初期化されていません');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    safetySettings,
  });

  // 会話履歴を構築
  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

  // 資料作成が必要かどうかを判断するプロンプト
  const analysisPrompt = `
ユーザーのメッセージ: "${userMessage}"

このメッセージに対して:
1. プレゼンテーション資料の作成が必要な場合は、JSON形式でスライド内容を返してください
2. 質問や会話の場合は、通常のテキストで返答してください
3. 資料作成に必要な情報が不足している場合は、確認の質問をしてください

${searchEnabled ? 'ネット検索が必要な場合は、[SEARCH_NEEDED: 検索クエリ]の形式で示してください。' : ''}

${SLIDE_CREATION_PROMPT}
`;

  try {
    const result = await chat.sendMessage(analysisPrompt);
    const responseText = result.response.text();

    // JSONレスポンスを解析
    const jsonMatch = responseText.match(/\{[\s\S]*"slides"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: `「${parsed.title}」の資料を作成しました。${parsed.slides.length}枚のスライドが含まれています。`,
          slides: parsed.slides,
          title: parsed.title,
        };
      } catch {
        // JSONパースに失敗した場合は通常のレスポンスとして返す
      }
    }

    return {
      response: responseText,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

// 画像を分析してスライドの品質をチェック
export const analyzeSlideImage = async (
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<{
  issues: string[];
  suggestions: string[];
  score: number;
}> => {
  if (!genAI) {
    throw new Error('Gemini APIが初期化されていません');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    safetySettings,
  });

  const prompt = `このプレゼンテーションスライドの画像を分析してください。

以下の点をチェックしてください:
1. テキストの可読性（文字が小さすぎないか、詰まりすぎていないか）
2. レイアウトのバランス（要素がはみ出していないか、余白は適切か）
3. 視覚的な整合性（色使い、フォントの統一性）
4. 情報量（1スライドに情報が多すぎないか）

JSON形式で回答してください:
{
  "issues": ["問題点1", "問題点2"],
  "suggestions": ["改善提案1", "改善提案2"],
  "score": 0-100の品質スコア
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      issues: [],
      suggestions: [],
      score: 80,
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
};

// スライド内容を改善
export const improveSlideContent = async (
  currentContent: string,
  issues: string[],
  suggestions: string[]
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini APIが初期化されていません');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    safetySettings,
  });

  const prompt = `以下のMarpスライドを改善してください。

現在の内容:
${currentContent}

指摘された問題点:
${issues.map((i) => `- ${i}`).join('\n')}

改善提案:
${suggestions.map((s) => `- ${s}`).join('\n')}

改善されたMarpスライドのみを返してください（説明は不要です）。`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// 適切なテンプレートを選択
export const selectTemplate = (
  category: string,
  context?: string
): SlideTemplate | undefined => {
  const categoryTemplates = slideTemplates.filter(
    (t) => t.category === category
  );

  if (categoryTemplates.length === 0) {
    return undefined;
  }

  // コンテキストがある場合は、より適切なテンプレートを選択
  // 現在はランダムに選択（将来的にはAIで選択）
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
};

// ネット検索（Gemini 2.0の検索機能を使用）
export const searchWeb = async (
  query: string
): Promise<{ title: string; url: string; snippet: string }[]> => {
  if (!genAI) {
    throw new Error('Gemini APIが初期化されていません');
  }

  // Gemini 2.0の検索グラウンディング機能を使用
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    safetySettings,
  });

  const prompt = `「${query}」について検索し、関連する情報を提供してください。
信頼できる情報源からの情報を基に回答してください。

以下のJSON形式で結果を返してください:
{
  "results": [
    {
      "title": "情報のタイトル",
      "snippet": "要約された情報"
    }
  ],
  "summary": "全体のまとめ"
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return (
        parsed.results?.map((r: { title: string; snippet: string }) => ({
          title: r.title,
          url: '',
          snippet: r.snippet,
        })) || []
      );
    }

    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
