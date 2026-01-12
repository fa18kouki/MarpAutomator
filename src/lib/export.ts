// エクスポート関連のユーティリティ

// HTMLをダウンロード用に準備
export const prepareHtmlForDownload = (html: string, title: string): Blob => {
  return new Blob([html], { type: 'text/html;charset=utf-8' });
};

// ダウンロードを実行
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// HTMLをダウンロード
export const downloadHtml = (html: string, title: string): void => {
  const blob = prepareHtmlForDownload(html, title);
  downloadFile(blob, `${title}.html`);
};

// Google Slides形式でエクスポート（将来実装用のスタブ）
export const exportToGoogleSlides = async (
  html: string,
  title: string
): Promise<string> => {
  // Google Slides APIとの連携は将来実装
  // 現時点ではPPTX形式でのエクスポートを提供
  throw new Error('Google Slides エクスポートは今後実装予定です');
};

// PDF印刷用のHTMLを生成
export const generatePrintableHtml = (html: string): string => {
  // 印刷用のスタイルを追加
  const printStyles = `
    <style>
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        section {
          page-break-after: always;
          page-break-inside: avoid;
          margin: 0 !important;
          box-shadow: none !important;
        }
        section:last-child {
          page-break-after: auto;
        }
      }
    </style>
  `;

  // </head>の前に印刷スタイルを挿入
  return html.replace('</head>', `${printStyles}</head>`);
};

// PDFとして保存する方法の説明を表示
export const showPdfExportInstructions = (): void => {
  const instructions = `
PDFとして保存する方法:

1. プレビュー画面で「印刷」を実行（Ctrl/Cmd + P）
2. 保存先として「PDFとして保存」を選択
3. 「保存」をクリック

または、ブラウザの印刷機能を使用して
PDFとしてエクスポートできます。
  `.trim();

  alert(instructions);
};

// MarpマークダウンをPPTX形式に変換するためのヘルパー
// （実際のPPTX生成は複雑なので、基本的な構造のみ）
export const generatePptxStructure = (
  slides: { content: string }[]
): { xml: string; relationships: string } => {
  // PPTX形式の基本構造（簡略化）
  const slideXmls = slides.map(
    (slide, index) => `
    <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
      <p:cSld>
        <p:spTree>
          <p:sp>
            <p:txBody>
              <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:r>
                  <a:t>${escapeXml(slide.content)}</a:t>
                </a:r>
              </a:p>
            </p:txBody>
          </p:sp>
        </p:spTree>
      </p:cSld>
    </p:sld>
  `
  );

  return {
    xml: slideXmls.join('\n'),
    relationships: '',
  };
};

// XMLエスケープ
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
