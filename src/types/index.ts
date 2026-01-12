// チャットメッセージの型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// チャットセッションの型
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  documentId?: string;
}

// ドキュメント（資料）の型
export interface Document {
  id: string;
  title: string;
  marpContent: string;
  htmlContent: string;
  presetId?: string;
  templateIds: string[];
  createdAt: Date;
  updatedAt: Date;
  chatSessionId?: string;
}

// テンプレートのカテゴリ
export type TemplateCategory =
  | 'title'
  | 'content'
  | 'image'
  | 'split'
  | 'list'
  | 'comparison'
  | 'timeline'
  | 'quote'
  | 'code'
  | 'chart'
  | 'closing';

// スライドテンプレートの型
export interface SlideTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  marpTemplate: string;
  thumbnail?: string;
}

// プリセット（テンプレートのセット）の型
export interface Preset {
  id: string;
  name: string;
  description: string;
  theme: string;
  templateIds: string[];
  thumbnail?: string;
}

// Gemini APIのレスポンス型
export interface GeminiResponse {
  text: string;
  searchResults?: SearchResult[];
}

// ネット検索結果の型
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// スライドの構造
export interface Slide {
  index: number;
  content: string;
  templateId?: string;
}

// エクスポートオプション
export type ExportFormat = 'pdf' | 'html' | 'pptx';

export interface ExportOptions {
  format: ExportFormat;
  includeNotes?: boolean;
  theme?: string;
}

// ライブラリアイテム（HTMLファイル含む）
export interface LibraryItem {
  id: string;
  title: string;
  type: 'document' | 'uploaded-html';
  htmlContent: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}
