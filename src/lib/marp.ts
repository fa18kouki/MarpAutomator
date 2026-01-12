import Marp from '@marp-team/marp-core';

// Marpインスタンスを作成
const marp = new Marp({
  html: true,
  emoji: {
    shortcode: true,
    unicode: true,
  },
  math: true,
});

// MarpマークダウンをHTMLに変換
export const convertMarpToHtml = (markdown: string): { html: string; css: string } => {
  const { html, css } = marp.render(markdown);
  return { html, css };
};

// 完全なHTMLドキュメントを生成
export const generateFullHtml = (markdown: string): string => {
  const { html, css } = convertMarpToHtml(markdown);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marp Presentation</title>
  <style>
    ${css}

    /* カスタムスタイル */
    html, body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }

    .marpit {
      margin: 0 auto;
    }

    section {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 20px auto;
    }

    /* フルスクリーン時のスタイル */
    :fullscreen section,
    :-webkit-full-screen section {
      margin: 0;
      box-shadow: none;
    }
  </style>
</head>
<body>
  ${html}
  <script>
    // スライドナビゲーション
    let currentSlide = 0;
    const slides = document.querySelectorAll('section');

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'flex' : 'none';
      });
      currentSlide = index;
    }

    function nextSlide() {
      if (currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        showSlide(currentSlide - 1);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        document.documentElement.requestFullscreen?.();
      }
    });

    // 初期表示
    if (slides.length > 0) {
      showSlide(0);
    }
  </script>
</body>
</html>`;
};

// プレビュー用のHTMLを生成（すべてのスライドを表示）
export const generatePreviewHtml = (markdown: string): string => {
  const { html, css } = convertMarpToHtml(markdown);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marp Preview</title>
  <style>
    ${css}

    html, body {
      margin: 0;
      padding: 20px;
      background: #1a1a1a;
      min-height: 100vh;
    }

    .marpit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    section {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
};

// テンプレートに値を埋め込む
export const fillTemplate = (
  template: string,
  values: Record<string, string>
): string => {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

// 複数のスライドを結合
export const combineSlides = (slides: string[]): string => {
  // 最初のスライドのフロントマターを保持
  const firstSlide = slides[0] || '';
  const frontMatterMatch = firstSlide.match(/^---[\s\S]*?---/);
  const frontMatter = frontMatterMatch ? frontMatterMatch[0] : '---\nmarp: true\n---';

  // 各スライドからフロントマターを除去してコンテンツのみを取得
  const contents = slides.map((slide) => {
    return slide.replace(/^---[\s\S]*?---\n*/, '').trim();
  });

  // スライド区切り（---）で結合
  return `${frontMatter}\n\n${contents.join('\n\n---\n\n')}`;
};

// Marpテーマのスタイルを生成
export const getMarpThemeStyle = (theme: string): string => {
  const themes: Record<string, string> = {
    default: `
      section {
        background: white;
        color: #333;
      }
      h1, h2, h3 {
        color: #333;
      }
    `,
    gradient: `
      section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      h1, h2, h3 {
        color: white;
      }
    `,
    dark: `
      section {
        background: #1a1a2e;
        color: #eee;
      }
      h1, h2, h3 {
        color: #fff;
      }
      code {
        background: #16213e;
      }
    `,
    minimal: `
      section {
        background: #fafafa;
        color: #333;
        font-family: 'Helvetica Neue', sans-serif;
      }
      h1 {
        font-weight: 300;
        font-size: 2.5em;
      }
    `,
    modern: `
      section {
        background: white;
        color: #333;
      }
      h1 {
        background: linear-gradient(90deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `,
    clean: `
      section {
        background: #fff;
        color: #444;
        padding: 40px 60px;
      }
      h1 {
        border-bottom: 3px solid #667eea;
        padding-bottom: 10px;
      }
    `,
  };

  return themes[theme] || themes.default;
};
