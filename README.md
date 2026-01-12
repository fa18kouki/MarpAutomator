# Marp AI - AI資料作成ツール

Marpを使用してAIがプレゼンテーション資料を自動作成するWebアプリケーションです。

## 機能

### コア機能
- **AIチャット**: Gemini AIを使用したチャットインターフェースで資料を作成
- **40種類のテンプレート**: タイトル、コンテンツ、画像、リスト、比較など多様なテンプレート
- **8種類のプリセット**: ビジネス、技術ピッチ、教育など用途別のプリセット
- **ネット検索**: AIがネット検索を活用して情報を収集
- **画像認識**: 生成した資料の品質をAIがチェック

### ライブラリ機能
- 作成した資料の一覧表示
- HTMLファイルのアップロード・インポート
- 他のAIで作成したHTMLの表示

### プレビュー機能
- スライドごとのプレビュー表示
- 全画面表示対応
- キーボード操作（矢印キーでスライド切替）

### エクスポート機能
- HTML形式でダウンロード
- PDF出力（ブラウザの印刷機能を使用）

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **State Management**: Zustand
- **AI**: Google Gemini API
- **Presentation**: Marp Core

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

1. **設定**: 左下の設定ボタンからGemini APIキーを設定
2. **プリセット選択**: （任意）用途に合ったプリセットを選択
3. **チャット入力**: 作成したい資料の内容を入力
4. **AIが資料を作成**: テンプレートを自動選択して資料を生成
5. **保存・ダウンロード**: 作成した資料をライブラリに保存またはダウンロード

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # メインページ
│   ├── layout.tsx         # レイアウト
│   └── globals.css        # グローバルスタイル
├── components/            # UIコンポーネント
│   ├── Sidebar.tsx        # サイドバー
│   ├── ChatView.tsx       # チャット画面
│   ├── ChatInput.tsx      # 入力フォーム
│   ├── ChatMessage.tsx    # メッセージ表示
│   ├── LibraryView.tsx    # ライブラリ画面
│   ├── PresetSelector.tsx # プリセット選択
│   ├── PreviewModal.tsx   # プレビューモーダル
│   └── SettingsModal.tsx  # 設定モーダル
├── lib/                   # ユーティリティ
│   ├── marp.ts           # Marp関連処理
│   ├── gemini.ts         # Gemini API連携
│   └── export.ts         # エクスポート処理
├── store/                 # 状態管理
│   └── useStore.ts       # Zustandストア
├── templates/             # テンプレート定義
│   ├── slideTemplates.ts # 40種類のスライドテンプレート
│   └── presets.ts        # プリセット定義
└── types/                 # 型定義
    └── index.ts
```

## テンプレートカテゴリ

| カテゴリ | 説明 | 数 |
|---------|------|-----|
| title | タイトルスライド | 5 |
| content | コンテンツスライド | 10 |
| image | 画像を含むスライド | 5 |
| split | 分割レイアウト | 5 |
| list | リスト形式 | 5 |
| comparison | 比較スライド | 3 |
| timeline | タイムライン | 2 |
| quote | 引用 | 2 |
| code | コード表示 | 2 |
| closing | クロージング | 1 |

## 今後の予定

- [ ] 画像生成機能
- [ ] Googleスライドエクスポート
- [ ] カスタムテンプレート作成
- [ ] チーム共有機能

## ライセンス

MIT
