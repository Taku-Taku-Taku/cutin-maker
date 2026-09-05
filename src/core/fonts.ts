export interface FontDef {
  id: string;
  label: string;
  family: string;
  weight: number;
  /** この書体で袋文字にするときの縁取り太さ倍率。細い書体ほど大きく */
  strokeScale: number;
  recommendedMaxChars: number;
}

export const FONTS: FontDef[] = [
  { id: 'noto-black',   label: 'ゴシック（太）', family: '"Noto Sans JP"',         weight: 900, strokeScale: 1.0, recommendedMaxChars: 20 },
  { id: 'mplus-round',  label: '丸ゴシック',     family: '"M PLUS Rounded 1c"',    weight: 800, strokeScale: 1.0, recommendedMaxChars: 20 },
  { id: 'reggae',       label: 'インパクト',     family: '"Reggae One"',           weight: 400, strokeScale: 0.8, recommendedMaxChars: 12 },
  { id: 'rocknroll',    label: '手書き風',       family: '"RocknRoll One"',        weight: 400, strokeScale: 1.1, recommendedMaxChars: 16 },
  { id: 'shippori-b1',  label: '明朝（太）',     family: '"Shippori Mincho B1"',   weight: 800, strokeScale: 1.2, recommendedMaxChars: 16 },
  { id: 'dotgothic',    label: 'ドット',         family: '"DotGothic16"',          weight: 400, strokeScale: 1.4, recommendedMaxChars: 12 },
];

export const DEFAULT_FONT_ID = 'noto-black';

export function getFont(id: string): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

/** ctx.font に渡す文字列を組む */
export function fontString(font: FontDef, sizePx: number): string {
  return `${font.weight} ${sizePx}px ${font.family}, sans-serif`;
}

/**
 * 書体CSSは自前で配信する（Google Fonts CDN を使わない）。
 * - fonts.googleapis.com に到達できない地域がある
 * - 閲覧者のIPを第三者に渡さない
 * Fontsource の CSS も unicode-range で細かく分割されているので、
 * 実際に落ちてくるのは使った文字が入っているチャンクだけ。
 */
const FONT_CSS: Record<string, () => Promise<unknown>> = {
  'noto-black': () => import('@fontsource/noto-sans-jp/900.css'),
  'mplus-round': () => import('@fontsource/m-plus-rounded-1c/800.css'),
  'reggae': () => import('@fontsource/reggae-one/400.css'),
  'rocknroll': () => import('@fontsource/rocknroll-one/400.css'),
  'shippori-b1': () => import('@fontsource/shippori-mincho-b1/800.css'),
  'dotgothic': () => import('@fontsource/dotgothic16/400.css'),
};

const cssLoaded = new Map<string, Promise<void>>();
const loadedRanges = new Map<string, Set<string>>();

function loadCss(fontId: string): Promise<void> {
  let p = cssLoaded.get(fontId);
  if (!p) {
    // 失敗してもフォールバック書体で描き続ける
    p = (FONT_CSS[fontId]?.() ?? Promise.resolve()).then(() => undefined, () => undefined);
    cssLoaded.set(fontId, p);
  }
  return p;
}

/**
 * 書体 + 必要な文字だけをロードする。
 * 日本語Webフォントは unicode-range で分割配信されるため、
 * document.fonts.load の第2引数に実テキストを渡すのが必須。
 */
export async function ensureFont(font: FontDef, text: string): Promise<void> {
  await loadCss(font.id);
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
