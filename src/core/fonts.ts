export interface FontDef {
  id: string;
  label: string;
  family: string;
  weight: number;
  /** Google Fonts CSS2 の URL */
  cssUrl: string;
  /** この書体で袋文字にするときの縁取り太さ倍率。細い書体ほど大きく */
  strokeScale: number;
  recommendedMaxChars: number;
  mood: string;
}

export const FONTS: FontDef[] = [
  { id: 'noto-black',  label: 'ゴシック（太）', family: '"Noto Sans JP"',       weight: 900, cssUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap',        strokeScale: 1.0, recommendedMaxChars: 20, mood: '標準' },
  { id: 'mplus-round', label: '丸ゴシック',     family: '"M PLUS Rounded 1c"',  weight: 800, cssUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@800&display=swap',   strokeScale: 1.0, recommendedMaxChars: 20, mood: 'ポップ' },
  { id: 'reggae',      label: 'インパクト',     family: '"Reggae One"',         weight: 400, cssUrl: 'https://fonts.googleapis.com/css2?family=Reggae+One&display=swap',                    strokeScale: 0.8, recommendedMaxChars: 12, mood: 'ネタ・強調' },
  { id: 'rocknroll',   label: '手書き風',       family: '"RocknRoll One"',      weight: 400, cssUrl: 'https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap',                 strokeScale: 1.1, recommendedMaxChars: 16, mood: 'カジュアル' },
  { id: 'shippori-b1', label: '明朝（太）',     family: '"Shippori Mincho B1"', weight: 800, cssUrl: 'https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@800&display=swap',   strokeScale: 1.2, recommendedMaxChars: 16, mood: 'シリアス・ホラー' },
  { id: 'dotgothic',   label: 'ドット',         family: '"DotGothic16"',        weight: 400, cssUrl: 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap',                   strokeScale: 1.4, recommendedMaxChars: 12, mood: 'レトロゲーム' },
];

export const DEFAULT_FONT_ID = 'noto-black';

export function getFont(id: string): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

/** ctx.font に渡す文字列を組む */
export function fontString(font: FontDef, sizePx: number): string {
  return `${font.weight} ${sizePx}px ${font.family}, sans-serif`;
}

const cssInserted = new Set<string>();
const loadedRanges = new Map<string, Set<string>>();

function loadCss(url: string): Promise<void> {
  if (cssInserted.has(url)) return Promise.resolve();
  cssInserted.add(url);
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => resolve(); // 失敗してもフォールバック書体で描き続ける
    document.head.appendChild(link);
  });
}

/**
 * 書体 + 必要な文字だけをロードする。
 * 日本語Webフォントは unicode-range で分割配信されるため、
 * document.fonts.load の第2引数に実テキストを渡すのが必須。
 */
export async function ensureFont(font: FontDef, text: string): Promise<void> {
  await loadCss(font.cssUrl);
  const key = `${font.weight} 100px ${font.family}`;
  try {
    await document.fonts.load(key, text || 'あ');
  } catch {
    /* 未対応環境ではフォールバック */
  }
  let set = loadedRanges.get(font.id);
  if (!set) {
    set = new Set();
    loadedRanges.set(font.id, set);
  }
  for (const ch of text) set.add(ch);
}

/** 開発時アサート用。ensureFont 未実行の文字があると豆腐になる */
export function isFontReady(font: FontDef, text: string): boolean {
  const set = loadedRanges.get(font.id);
  if (!set) return false;
  for (const ch of text) {
    if (ch.trim() === '') continue;
    if (!set.has(ch)) return false;
  }
  return true;
}

export function assertFontReady(font: FontDef, text: string): void {
  if (import.meta.env?.DEV && !isFontReady(font, text)) {
    console.warn(`[fonts] ensureFont() 未実行のまま描画しています: ${font.id} / "${text}" — 豆腐（□）になる可能性があります`);
  }
}
