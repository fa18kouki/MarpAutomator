import type { SlideData } from '@/components/CanvaEditor';

// PNGエクスポート（html2canvasを使用）
export async function exportSlidesToPng(
  slides: SlideData[],
  title: string,
  options: { scale?: number; quality?: number } = {}
): Promise<void> {
  const { scale = 2, quality = 1 } = options;

  // html2canvasを動的にインポート
  const html2canvas = (await import('html2canvas')).default;
  const JSZip = (await import('jszip')).default;
  const { saveAs } = await import('file-saver');

  const zip = new JSZip();
  const folder = zip.folder(title);

  // 各スライドを描画してPNG化
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    // 一時的なDOM要素を作成
    const container = document.createElement('div');
    container.style.width = '1920px';
    container.style.height = '1080px';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.background = slide.backgroundImage || slide.backgroundColor;
    document.body.appendChild(container);

    // 要素を描画
    for (const element of slide.elements.sort((a, b) => a.zIndex - b.zIndex)) {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = `${element.x * 2}px`;
      el.style.top = `${element.y * 2}px`;
      el.style.width = `${element.width * 2}px`;
      el.style.height = element.type === 'text' ? 'auto' : `${element.height * 2}px`;
      el.style.transform = `rotate(${element.rotation}deg)`;
      el.style.opacity = String(element.style.opacity);

      if (element.type === 'text') {
        el.style.fontFamily = element.style.fontFamily;
        el.style.fontSize = `${element.style.fontSize * 2}px`;
        el.style.fontWeight = element.style.fontWeight;
        el.style.fontStyle = element.style.fontStyle;
        el.style.textDecoration = element.style.textDecoration;
        el.style.textAlign = element.style.textAlign;
        el.style.color = element.style.color;
        el.style.backgroundColor = element.style.backgroundColor;
        el.style.padding = '16px';
        el.innerText = element.content || '';
      } else if (element.type === 'image' && element.src) {
        const img = document.createElement('img');
        img.src = element.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.crossOrigin = 'anonymous';
        // Wait for image to load before appending
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn('Failed to load image:', element.src);
            resolve(); // Continue even if image fails to load
          };
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        });
        el.appendChild(img);
      } else if (element.type === 'shape') {
        el.style.backgroundColor = element.style.backgroundColor;
        el.style.border = element.style.borderWidth > 0
          ? `${element.style.borderWidth * 2}px solid ${element.style.borderColor}`
          : 'none';

        if (element.shapeType === 'circle') {
          el.style.borderRadius = '50%';
        } else if (element.shapeType === 'rectangle') {
          el.style.borderRadius = `${element.style.borderRadius * 2}px`;
        }
      }

      container.appendChild(el);
    }

    // フォントの読み込みを待つ
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 100));

    // html2canvasでキャプチャ
    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    // PNG Blobを取得
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png', quality);
    });

    // ZIPに追加
    folder?.file(`slide_${String(i + 1).padStart(3, '0')}.png`, blob);

    // クリーンアップ
    document.body.removeChild(container);
  }

  // ZIPをダウンロード
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${title}_slides.zip`);
}

// PPTXエクスポート
export async function exportSlidesToPptx(
  slides: SlideData[],
  title: string
): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;

  const pptx = new PptxGenJS();
  pptx.title = title;
  pptx.author = 'Marp AI';
  pptx.subject = 'Generated Presentation';

  // スライドサイズを16:9に設定
  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
  pptx.layout = 'CUSTOM';

  for (const slideData of slides) {
    const slide = pptx.addSlide();

    // 背景を設定
    if (slideData.backgroundImage) {
      // グラデーションの場合は単色にフォールバック
      if (slideData.backgroundImage.includes('gradient')) {
        const colorMatch = slideData.backgroundImage.match(/#[a-fA-F0-9]{6}/);
        if (colorMatch) {
          slide.background = { color: colorMatch[0].replace('#', '') };
        }
      } else {
        slide.background = { path: slideData.backgroundImage };
      }
    } else {
      slide.background = { color: slideData.backgroundColor.replace('#', '') };
    }

    // 要素を追加
    for (const element of slideData.elements.sort((a, b) => a.zIndex - b.zIndex)) {
      // 座標をインチに変換（960px = 10インチ）
      const x = (element.x / 960) * 10;
      const y = (element.y / 540) * 5.625;
      const w = (element.width / 960) * 10;
      const h = (element.height / 540) * 5.625;

      if (element.type === 'text') {
        slide.addText(element.content || '', {
          x,
          y,
          w,
          h: element.type === 'text' ? undefined : h,
          fontSize: element.style.fontSize * 0.75,
          fontFace: getFontFaceName(element.style.fontFamily),
          color: element.style.color.replace('#', ''),
          bold: element.style.fontWeight === 'bold',
          italic: element.style.fontStyle === 'italic',
          underline: element.style.textDecoration === 'underline' ? { style: 'sng' } : undefined,
          align: element.style.textAlign as 'left' | 'center' | 'right',
          fill: element.style.backgroundColor !== 'transparent'
            ? { color: element.style.backgroundColor.replace('#', '') }
            : undefined,
          rotate: element.rotation,
        });
      } else if (element.type === 'image' && element.src) {
        try {
          slide.addImage({
            path: element.src,
            x,
            y,
            w,
            h,
            rotate: element.rotation,
          });
        } catch (e) {
          console.warn('Failed to add image:', e);
        }
      } else if (element.type === 'shape') {
        const shapeType = getShapeType(element.shapeType);
        slide.addShape(shapeType, {
          x,
          y,
          w,
          h,
          fill: { color: element.style.backgroundColor.replace('#', '') },
          line: element.style.borderWidth > 0
            ? {
                color: element.style.borderColor.replace('#', ''),
                width: element.style.borderWidth,
              }
            : undefined,
          rotate: element.rotation,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `${title}.pptx` });
}

// フォントファミリー名を取得
function getFontFaceName(fontFamily: string): string {
  const match = fontFamily.match(/"([^"]+)"/);
  if (match) {
    return match[1];
  }
  return fontFamily.split(',')[0].trim();
}

// pptxgenjsのシェイプタイプを取得
function getShapeType(shapeType?: string): 'ellipse' | 'triangle' | 'line' | 'rect' {
  switch (shapeType) {
    case 'circle':
      return 'ellipse';
    case 'triangle':
      return 'triangle';
    case 'line':
      return 'line';
    default:
      return 'rect';
  }
}

// SVGエクスポート
export async function exportSlideToSvg(
  slide: SlideData,
  filename: string
): Promise<void> {
  const { saveAs } = await import('file-saver');

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&amp;display=swap');
    </style>
  </defs>
  <rect width="1920" height="1080" fill="${slide.backgroundColor}"/>
`;

  for (const element of slide.elements.sort((a, b) => a.zIndex - b.zIndex)) {
    const x = element.x * 2;
    const y = element.y * 2;
    const width = element.width * 2;
    const height = element.height * 2;

    if (element.type === 'text') {
      const fontSize = element.style.fontSize * 2;
      const textAnchor = element.style.textAlign === 'center' ? 'middle'
        : element.style.textAlign === 'right' ? 'end' : 'start';
      const textX = element.style.textAlign === 'center' ? x + width / 2
        : element.style.textAlign === 'right' ? x + width : x;

      svgContent += `  <text x="${textX}" y="${y + fontSize}"
    font-family="${escapeXml(getFontFaceName(element.style.fontFamily))}"
    font-size="${fontSize}"
    font-weight="${element.style.fontWeight}"
    font-style="${element.style.fontStyle}"
    fill="${element.style.color}"
    text-anchor="${textAnchor}"
    opacity="${element.style.opacity}">
    ${escapeXml(element.content || '')}
  </text>
`;
    } else if (element.type === 'shape') {
      if (element.shapeType === 'circle') {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
    fill="${element.style.backgroundColor}"
    ${element.style.borderWidth > 0 ? `stroke="${element.style.borderColor}" stroke-width="${element.style.borderWidth * 2}"` : ''}
    opacity="${element.style.opacity}"/>
`;
      } else if (element.shapeType === 'triangle') {
        const points = `${x + width/2},${y} ${x + width},${y + height} ${x},${y + height}`;
        svgContent += `  <polygon points="${points}"
    fill="${element.style.backgroundColor}"
    ${element.style.borderWidth > 0 ? `stroke="${element.style.borderColor}" stroke-width="${element.style.borderWidth * 2}"` : ''}
    opacity="${element.style.opacity}"/>
`;
      } else {
        svgContent += `  <rect x="${x}" y="${y}" width="${width}" height="${height}"
    fill="${element.style.backgroundColor}"
    ${element.style.borderWidth > 0 ? `stroke="${element.style.borderColor}" stroke-width="${element.style.borderWidth * 2}"` : ''}
    rx="${element.style.borderRadius * 2}"
    opacity="${element.style.opacity}"/>
`;
      }
    } else if (element.type === 'image' && element.src) {
      svgContent += `  <image href="${escapeXml(element.src)}" x="${x}" y="${y}" width="${width}" height="${height}"
    opacity="${element.style.opacity}"/>
`;
    }
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, `${filename}.svg`);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
