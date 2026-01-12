import type { SlideTemplate, TemplateCategory } from '@/types';

// テンプレート定義（40種類）
export const slideTemplates: SlideTemplate[] = [
  // タイトルスライド (1-5)
  {
    id: 'title-centered',
    name: 'タイトル（中央揃え）',
    category: 'title',
    description: 'シンプルな中央揃えのタイトルスライド',
    marpTemplate: `---
marp: true
class: title-centered
---

# {{title}}

## {{subtitle}}

{{author}} | {{date}}`,
  },
  {
    id: 'title-left',
    name: 'タイトル（左揃え）',
    category: 'title',
    description: '左揃えのモダンなタイトルスライド',
    marpTemplate: `---
marp: true
class: title-left
---

# {{title}}

### {{subtitle}}

---

*{{author}}*
*{{date}}*`,
  },
  {
    id: 'title-gradient',
    name: 'タイトル（グラデーション背景）',
    category: 'title',
    description: 'グラデーション背景のタイトルスライド',
    marpTemplate: `---
marp: true
class: title-gradient
style: |
  section.title-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
---

# {{title}}

## {{subtitle}}`,
  },
  {
    id: 'title-image-bg',
    name: 'タイトル（背景画像）',
    category: 'title',
    description: '背景画像付きのタイトルスライド',
    marpTemplate: `---
marp: true
class: title-image
backgroundImage: url('{{backgroundImage}}')
backgroundSize: cover
---

<div style="background: rgba(0,0,0,0.6); padding: 40px; border-radius: 10px;">

# {{title}}

## {{subtitle}}

</div>`,
  },
  {
    id: 'title-minimal',
    name: 'タイトル（ミニマル）',
    category: 'title',
    description: 'シンプルでミニマルなタイトルスライド',
    marpTemplate: `---
marp: true
class: title-minimal
---

# {{title}}

---

{{subtitle}}`,
  },

  // コンテンツスライド (6-15)
  {
    id: 'content-basic',
    name: 'コンテンツ（基本）',
    category: 'content',
    description: '基本的なコンテンツスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

{{content}}`,
  },
  {
    id: 'content-two-column',
    name: 'コンテンツ（2カラム）',
    category: 'content',
    description: '2カラムのコンテンツスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 40px;">
<div style="flex: 1;">

{{leftContent}}

</div>
<div style="flex: 1;">

{{rightContent}}

</div>
</div>`,
  },
  {
    id: 'content-three-column',
    name: 'コンテンツ（3カラム）',
    category: 'content',
    description: '3カラムのコンテンツスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 20px;">
<div style="flex: 1;">

### {{column1Title}}
{{column1Content}}

</div>
<div style="flex: 1;">

### {{column2Title}}
{{column2Content}}

</div>
<div style="flex: 1;">

### {{column3Title}}
{{column3Content}}

</div>
</div>`,
  },
  {
    id: 'content-numbered',
    name: 'コンテンツ（番号付き）',
    category: 'content',
    description: '番号付きステップのスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

1. **{{step1}}**
2. **{{step2}}**
3. **{{step3}}**
4. **{{step4}}**`,
  },
  {
    id: 'content-highlight',
    name: 'コンテンツ（ハイライト）',
    category: 'content',
    description: '重要なポイントをハイライトするスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

> **{{highlight}}**

{{description}}`,
  },
  {
    id: 'content-icon-grid',
    name: 'コンテンツ（アイコングリッド）',
    category: 'content',
    description: 'アイコンと説明のグリッドレイアウト',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px;">

<div>

### {{icon1}} {{item1Title}}
{{item1Desc}}

</div>

<div>

### {{icon2}} {{item2Title}}
{{item2Desc}}

</div>

<div>

### {{icon3}} {{item3Title}}
{{item3Desc}}

</div>

<div>

### {{icon4}} {{item4Title}}
{{item4Desc}}

</div>

</div>`,
  },
  {
    id: 'content-stats',
    name: 'コンテンツ（統計データ）',
    category: 'content',
    description: '統計データを表示するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; justify-content: space-around; text-align: center; margin-top: 50px;">

<div>
<h1 style="font-size: 3em; margin: 0; color: #667eea;">{{stat1Value}}</h1>
<p>{{stat1Label}}</p>
</div>

<div>
<h1 style="font-size: 3em; margin: 0; color: #764ba2;">{{stat2Value}}</h1>
<p>{{stat2Label}}</p>
</div>

<div>
<h1 style="font-size: 3em; margin: 0; color: #f093fb;">{{stat3Value}}</h1>
<p>{{stat3Label}}</p>
</div>

</div>`,
  },
  {
    id: 'content-feature',
    name: 'コンテンツ（機能紹介）',
    category: 'content',
    description: '機能や特徴を紹介するスライド',
    marpTemplate: `---
marp: true
---

# {{featureName}}

## {{tagline}}

{{description}}

---

**Key Benefits:**
- {{benefit1}}
- {{benefit2}}
- {{benefit3}}`,
  },
  {
    id: 'content-agenda',
    name: 'コンテンツ（アジェンダ）',
    category: 'content',
    description: '会議やプレゼンのアジェンダスライド',
    marpTemplate: `---
marp: true
---

# アジェンダ

| 時間 | 内容 |
|------|------|
| {{time1}} | {{item1}} |
| {{time2}} | {{item2}} |
| {{time3}} | {{item3}} |
| {{time4}} | {{item4}} |`,
  },
  {
    id: 'content-process',
    name: 'コンテンツ（プロセス）',
    category: 'content',
    description: 'プロセスやワークフローを示すスライド',
    marpTemplate: `---
marp: true
---

# {{processTitle}}

<div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 40px;">

<div style="text-align: center; padding: 20px; background: #e8f4fd; border-radius: 10px;">
<h3>1</h3>
{{step1}}
</div>

→

<div style="text-align: center; padding: 20px; background: #e8f4fd; border-radius: 10px;">
<h3>2</h3>
{{step2}}
</div>

→

<div style="text-align: center; padding: 20px; background: #e8f4fd; border-radius: 10px;">
<h3>3</h3>
{{step3}}
</div>

→

<div style="text-align: center; padding: 20px; background: #e8f4fd; border-radius: 10px;">
<h3>4</h3>
{{step4}}
</div>

</div>`,
  },

  // 画像スライド (16-20)
  {
    id: 'image-center',
    name: '画像（中央配置）',
    category: 'image',
    description: '中央に大きな画像を配置するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

![center w:700]({{imageUrl}})

{{caption}}`,
  },
  {
    id: 'image-left-text',
    name: '画像（左画像＋右テキスト）',
    category: 'image',
    description: '左に画像、右にテキストを配置するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 40px; align-items: center;">

![w:400]({{imageUrl}})

<div>

{{content}}

</div>
</div>`,
  },
  {
    id: 'image-right-text',
    name: '画像（右画像＋左テキスト）',
    category: 'image',
    description: '左にテキスト、右に画像を配置するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 40px; align-items: center;">

<div style="flex: 1;">

{{content}}

</div>

![w:400]({{imageUrl}})

</div>`,
  },
  {
    id: 'image-gallery',
    name: '画像（ギャラリー）',
    category: 'image',
    description: '複数の画像をギャラリー形式で表示するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">

![w:350]({{image1}})
![w:350]({{image2}})
![w:350]({{image3}})
![w:350]({{image4}})

</div>`,
  },
  {
    id: 'image-fullscreen',
    name: '画像（フルスクリーン）',
    category: 'image',
    description: '全画面背景画像のスライド',
    marpTemplate: `---
marp: true
backgroundImage: url('{{imageUrl}}')
backgroundSize: cover
---

<div style="background: rgba(0,0,0,0.5); padding: 40px; color: white;">

# {{heading}}

{{content}}

</div>`,
  },

  // 分割スライド (21-25)
  {
    id: 'split-50-50',
    name: '分割（50/50）',
    category: 'split',
    description: '左右均等に分割したスライド',
    marpTemplate: `---
marp: true
---

<div style="display: flex; height: 100%;">

<div style="flex: 1; padding: 40px; background: #f5f5f5;">

# {{leftTitle}}

{{leftContent}}

</div>

<div style="flex: 1; padding: 40px;">

# {{rightTitle}}

{{rightContent}}

</div>

</div>`,
  },
  {
    id: 'split-30-70',
    name: '分割（30/70）',
    category: 'split',
    description: '左30%、右70%に分割したスライド',
    marpTemplate: `---
marp: true
---

<div style="display: flex; height: 100%;">

<div style="width: 30%; padding: 30px; background: #667eea; color: white;">

## {{sideTitle}}

{{sideContent}}

</div>

<div style="flex: 1; padding: 40px;">

# {{mainTitle}}

{{mainContent}}

</div>

</div>`,
  },
  {
    id: 'split-vertical',
    name: '分割（上下）',
    category: 'split',
    description: '上下に分割したスライド',
    marpTemplate: `---
marp: true
---

<div style="height: 45%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px;">

# {{topTitle}}

{{topContent}}

</div>

<div style="padding: 30px;">

{{bottomContent}}

</div>`,
  },
  {
    id: 'split-asymmetric',
    name: '分割（非対称）',
    category: 'split',
    description: '非対称なレイアウトのスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 30px; margin-top: 30px;">

<div style="flex: 2; background: #f8f9fa; padding: 30px; border-radius: 10px;">

### メインコンテンツ

{{mainContent}}

</div>

<div style="flex: 1;">

<div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px;">

**ポイント1**
{{point1}}

</div>

<div style="background: #fce4ec; padding: 20px; border-radius: 10px;">

**ポイント2**
{{point2}}

</div>

</div>
</div>`,
  },
  {
    id: 'split-cards',
    name: '分割（カード形式）',
    category: 'split',
    description: 'カード形式で分割したスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 20px; margin-top: 30px;">

<div style="flex: 1; background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

### {{card1Title}}
{{card1Content}}

</div>

<div style="flex: 1; background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

### {{card2Title}}
{{card2Content}}

</div>

<div style="flex: 1; background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

### {{card3Title}}
{{card3Content}}

</div>

</div>`,
  },

  // リストスライド (26-30)
  {
    id: 'list-bullet',
    name: 'リスト（箇条書き）',
    category: 'list',
    description: '基本的な箇条書きリストスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

- {{item1}}
- {{item2}}
- {{item3}}
- {{item4}}
- {{item5}}`,
  },
  {
    id: 'list-nested',
    name: 'リスト（ネスト）',
    category: 'list',
    description: 'ネストした箇条書きリストスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

- **{{category1}}**
  - {{item1_1}}
  - {{item1_2}}
- **{{category2}}**
  - {{item2_1}}
  - {{item2_2}}
- **{{category3}}**
  - {{item3_1}}
  - {{item3_2}}`,
  },
  {
    id: 'list-checklist',
    name: 'リスト（チェックリスト）',
    category: 'list',
    description: 'チェックリスト形式のスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

- [x] {{completed1}}
- [x] {{completed2}}
- [ ] {{pending1}}
- [ ] {{pending2}}
- [ ] {{pending3}}`,
  },
  {
    id: 'list-pros-cons',
    name: 'リスト（メリット・デメリット）',
    category: 'list',
    description: 'メリットとデメリットを並べたスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 40px;">

<div style="flex: 1;">

### メリット

- {{pro1}}
- {{pro2}}
- {{pro3}}

</div>

<div style="flex: 1;">

### デメリット

- {{con1}}
- {{con2}}
- {{con3}}

</div>

</div>`,
  },
  {
    id: 'list-timeline-vertical',
    name: 'リスト（縦タイムライン）',
    category: 'list',
    description: '縦方向のタイムラインスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="margin-left: 20px; border-left: 3px solid #667eea; padding-left: 30px;">

**{{date1}}** - {{event1}}

**{{date2}}** - {{event2}}

**{{date3}}** - {{event3}}

**{{date4}}** - {{event4}}

</div>`,
  },

  // 比較スライド (31-33)
  {
    id: 'comparison-table',
    name: '比較（テーブル）',
    category: 'comparison',
    description: 'テーブル形式の比較スライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

| 項目 | {{option1}} | {{option2}} | {{option3}} |
|:----:|:----:|:----:|:----:|
| {{feature1}} | {{v1_1}} | {{v1_2}} | {{v1_3}} |
| {{feature2}} | {{v2_1}} | {{v2_2}} | {{v2_3}} |
| {{feature3}} | {{v3_1}} | {{v3_2}} | {{v3_3}} |
| {{feature4}} | {{v4_1}} | {{v4_2}} | {{v4_3}} |`,
  },
  {
    id: 'comparison-before-after',
    name: '比較（Before/After）',
    category: 'comparison',
    description: 'ビフォー・アフター形式の比較スライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 40px;">

<div style="flex: 1; background: #ffebee; padding: 30px; border-radius: 10px;">

## Before

{{beforeContent}}

</div>

<div style="flex: 1; background: #e8f5e9; padding: 30px; border-radius: 10px;">

## After

{{afterContent}}

</div>

</div>`,
  },
  {
    id: 'comparison-versus',
    name: '比較（VS）',
    category: 'comparison',
    description: '対決形式の比較スライド',
    marpTemplate: `---
marp: true
---

<div style="display: flex; align-items: center;">

<div style="flex: 1; text-align: center; padding: 30px;">

## {{option1}}

{{option1Features}}

</div>

<div style="font-size: 3em; font-weight: bold; color: #e53935;">
VS
</div>

<div style="flex: 1; text-align: center; padding: 30px;">

## {{option2}}

{{option2Features}}

</div>

</div>`,
  },

  // タイムラインスライド (34-35)
  {
    id: 'timeline-horizontal',
    name: 'タイムライン（横）',
    category: 'timeline',
    description: '横方向のタイムラインスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 50px;">

<div style="text-align: center; flex: 1;">
<div style="width: 60px; height: 60px; background: #667eea; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
<strong>{{phase1}}</strong>
<p style="font-size: 0.8em;">{{phase1Desc}}</p>
</div>

<div style="text-align: center; flex: 1;">
<div style="width: 60px; height: 60px; background: #764ba2; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
<strong>{{phase2}}</strong>
<p style="font-size: 0.8em;">{{phase2Desc}}</p>
</div>

<div style="text-align: center; flex: 1;">
<div style="width: 60px; height: 60px; background: #f093fb; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
<strong>{{phase3}}</strong>
<p style="font-size: 0.8em;">{{phase3Desc}}</p>
</div>

<div style="text-align: center; flex: 1;">
<div style="width: 60px; height: 60px; background: #11998e; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">4</div>
<strong>{{phase4}}</strong>
<p style="font-size: 0.8em;">{{phase4Desc}}</p>
</div>

</div>`,
  },
  {
    id: 'timeline-roadmap',
    name: 'タイムライン（ロードマップ）',
    category: 'timeline',
    description: 'ロードマップ形式のタイムラインスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="position: relative; margin-top: 40px;">

<div style="display: flex; justify-content: space-between;">

<div style="text-align: center; width: 22%; background: #e3f2fd; padding: 20px; border-radius: 10px;">
<h4>{{q1}}</h4>
{{q1Content}}
</div>

<div style="text-align: center; width: 22%; background: #f3e5f5; padding: 20px; border-radius: 10px;">
<h4>{{q2}}</h4>
{{q2Content}}
</div>

<div style="text-align: center; width: 22%; background: #e8f5e9; padding: 20px; border-radius: 10px;">
<h4>{{q3}}</h4>
{{q3Content}}
</div>

<div style="text-align: center; width: 22%; background: #fff3e0; padding: 20px; border-radius: 10px;">
<h4>{{q4}}</h4>
{{q4Content}}
</div>

</div>

</div>`,
  },

  // 引用スライド (36-37)
  {
    id: 'quote-centered',
    name: '引用（中央）',
    category: 'quote',
    description: '中央配置の引用スライド',
    marpTemplate: `---
marp: true
---

<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">

> *"{{quote}}"*

**— {{author}}**
*{{source}}*

</div>`,
  },
  {
    id: 'quote-highlighted',
    name: '引用（ハイライト）',
    category: 'quote',
    description: 'ハイライト付きの引用スライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 15px; margin-top: 30px;">

> ### "{{quote}}"

**{{author}}** - {{title}}

</div>`,
  },

  // コードスライド (38-39)
  {
    id: 'code-single',
    name: 'コード（単一）',
    category: 'code',
    description: 'コードブロック付きのスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

\`\`\`{{language}}
{{code}}
\`\`\`

{{explanation}}`,
  },
  {
    id: 'code-comparison',
    name: 'コード（比較）',
    category: 'code',
    description: '2つのコードを比較するスライド',
    marpTemplate: `---
marp: true
---

# {{heading}}

<div style="display: flex; gap: 20px;">

<div style="flex: 1;">

### {{label1}}

\`\`\`{{language1}}
{{code1}}
\`\`\`

</div>

<div style="flex: 1;">

### {{label2}}

\`\`\`{{language2}}
{{code2}}
\`\`\`

</div>

</div>`,
  },

  // クロージングスライド (40)
  {
    id: 'closing-thankyou',
    name: 'クロージング（ありがとう）',
    category: 'closing',
    description: '感謝のメッセージで締めくくるスライド',
    marpTemplate: `---
marp: true
class: closing
style: |
  section.closing {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }
---

# {{closingMessage}}

---

**{{contactInfo}}**

{{socialLinks}}`,
  },
];

// カテゴリ別にテンプレートを取得
export const getTemplatesByCategory = (category: TemplateCategory): SlideTemplate[] => {
  return slideTemplates.filter((t) => t.category === category);
};

// IDでテンプレートを取得
export const getTemplateById = (id: string): SlideTemplate | undefined => {
  return slideTemplates.find((t) => t.id === id);
};

// カテゴリの日本語名
export const categoryNames: Record<TemplateCategory, string> = {
  title: 'タイトル',
  content: 'コンテンツ',
  image: '画像',
  split: '分割',
  list: 'リスト',
  comparison: '比較',
  timeline: 'タイムライン',
  quote: '引用',
  code: 'コード',
  chart: 'チャート',
  closing: 'クロージング',
};
