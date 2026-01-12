// 利用可能なフォント一覧
export interface FontOption {
  name: string;
  value: string;
  category: 'japanese' | 'english' | 'display' | 'handwriting' | 'monospace';
  weight?: string[];
}

export const availableFonts: FontOption[] = [
  // 日本語フォント
  { name: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif', category: 'japanese' },
  { name: 'Noto Serif JP', value: '"Noto Serif JP", serif', category: 'japanese' },
  { name: 'M PLUS 1p', value: '"M PLUS 1p", sans-serif', category: 'japanese' },
  { name: 'M PLUS Rounded 1c', value: '"M PLUS Rounded 1c", sans-serif', category: 'japanese' },
  { name: 'Kosugi Maru', value: '"Kosugi Maru", sans-serif', category: 'japanese' },
  { name: 'Kosugi', value: '"Kosugi", sans-serif', category: 'japanese' },
  { name: 'Sawarabi Gothic', value: '"Sawarabi Gothic", sans-serif', category: 'japanese' },
  { name: 'Sawarabi Mincho', value: '"Sawarabi Mincho", serif', category: 'japanese' },
  { name: 'Zen Kaku Gothic New', value: '"Zen Kaku Gothic New", sans-serif', category: 'japanese' },
  { name: 'Zen Maru Gothic', value: '"Zen Maru Gothic", sans-serif', category: 'japanese' },
  { name: 'Zen Old Mincho', value: '"Zen Old Mincho", serif', category: 'japanese' },
  { name: 'Shippori Mincho', value: '"Shippori Mincho", serif', category: 'japanese' },
  { name: 'Kiwi Maru', value: '"Kiwi Maru", serif', category: 'japanese' },
  { name: 'Hachi Maru Pop', value: '"Hachi Maru Pop", cursive', category: 'japanese' },
  { name: 'Yusei Magic', value: '"Yusei Magic", sans-serif', category: 'japanese' },
  { name: 'Reggae One', value: '"Reggae One", cursive', category: 'japanese' },
  { name: 'RocknRoll One', value: '"RocknRoll One", sans-serif', category: 'japanese' },
  { name: 'Dela Gothic One', value: '"Dela Gothic One", cursive', category: 'japanese' },
  { name: 'DotGothic16', value: '"DotGothic16", sans-serif', category: 'japanese' },
  { name: 'Potta One', value: '"Potta One", cursive', category: 'japanese' },
  { name: 'Stick', value: '"Stick", sans-serif', category: 'japanese' },
  { name: 'Train One', value: '"Train One", cursive', category: 'japanese' },

  // 英語フォント - Sans Serif
  { name: 'Roboto', value: '"Roboto", sans-serif', category: 'english' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', category: 'english' },
  { name: 'Lato', value: '"Lato", sans-serif', category: 'english' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif', category: 'english' },
  { name: 'Poppins', value: '"Poppins", sans-serif', category: 'english' },
  { name: 'Inter', value: '"Inter", sans-serif', category: 'english' },
  { name: 'Nunito', value: '"Nunito", sans-serif', category: 'english' },
  { name: 'Quicksand', value: '"Quicksand", sans-serif', category: 'english' },
  { name: 'Raleway', value: '"Raleway", sans-serif', category: 'english' },
  { name: 'Work Sans', value: '"Work Sans", sans-serif', category: 'english' },
  { name: 'Oswald', value: '"Oswald", sans-serif', category: 'english' },
  { name: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif', category: 'english' },

  // 英語フォント - Serif
  { name: 'Playfair Display', value: '"Playfair Display", serif', category: 'english' },
  { name: 'Merriweather', value: '"Merriweather", serif', category: 'english' },
  { name: 'Lora', value: '"Lora", serif', category: 'english' },
  { name: 'PT Serif', value: '"PT Serif", serif', category: 'english' },
  { name: 'Libre Baskerville', value: '"Libre Baskerville", serif', category: 'english' },
  { name: 'Crimson Text', value: '"Crimson Text", serif', category: 'english' },

  // ディスプレイフォント
  { name: 'Bebas Neue', value: '"Bebas Neue", cursive', category: 'display' },
  { name: 'Righteous', value: '"Righteous", cursive', category: 'display' },
  { name: 'Fredoka One', value: '"Fredoka One", cursive', category: 'display' },
  { name: 'Bangers', value: '"Bangers", cursive', category: 'display' },
  { name: 'Bungee', value: '"Bungee", cursive', category: 'display' },
  { name: 'Passion One', value: '"Passion One", cursive', category: 'display' },
  { name: 'Alfa Slab One', value: '"Alfa Slab One", cursive', category: 'display' },
  { name: 'Rubik Mono One', value: '"Rubik Mono One", sans-serif', category: 'display' },
  { name: 'Black Ops One', value: '"Black Ops One", cursive', category: 'display' },
  { name: 'Titan One', value: '"Titan One", cursive', category: 'display' },

  // 手書きフォント
  { name: 'Dancing Script', value: '"Dancing Script", cursive', category: 'handwriting' },
  { name: 'Pacifico', value: '"Pacifico", cursive', category: 'handwriting' },
  { name: 'Caveat', value: '"Caveat", cursive', category: 'handwriting' },
  { name: 'Satisfy', value: '"Satisfy", cursive', category: 'handwriting' },
  { name: 'Great Vibes', value: '"Great Vibes", cursive', category: 'handwriting' },
  { name: 'Lobster', value: '"Lobster", cursive', category: 'handwriting' },
  { name: 'Sacramento', value: '"Sacramento", cursive', category: 'handwriting' },
  { name: 'Indie Flower', value: '"Indie Flower", cursive', category: 'handwriting' },
  { name: 'Architects Daughter', value: '"Architects Daughter", cursive', category: 'handwriting' },
  { name: 'Shadows Into Light', value: '"Shadows Into Light", cursive', category: 'handwriting' },

  // 等幅フォント
  { name: 'Fira Code', value: '"Fira Code", monospace', category: 'monospace' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace', category: 'monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace', category: 'monospace' },
  { name: 'Roboto Mono', value: '"Roboto Mono", monospace', category: 'monospace' },
  { name: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace', category: 'monospace' },
  { name: 'Space Mono', value: '"Space Mono", monospace', category: 'monospace' },
];

// Google Fontsのimport文を生成
export function generateGoogleFontsImport(): string {
  const fontFamilies = availableFonts
    .filter(f => f.category !== 'monospace' || f.name.includes('Code') || f.name.includes('Mono'))
    .map(f => f.name.replace(/ /g, '+'))
    .join('&family=');

  return `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
}

// カテゴリー別にフォントを取得
export function getFontsByCategory(category: FontOption['category']): FontOption[] {
  return availableFonts.filter(f => f.category === category);
}

// フォントカテゴリーの日本語名
export const fontCategoryNames: Record<FontOption['category'], string> = {
  japanese: '日本語',
  english: '英語',
  display: 'ディスプレイ',
  handwriting: '手書き',
  monospace: '等幅',
};
