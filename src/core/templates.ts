import type { BackgroundSpec, ColorSpec, LayerSpec, MotionSpec, RenderParams, TextDecoSpec } from './types';

/* ------------------------------------------------------------------ */
/* 軸1: カラーテーマ（decorations 内の ColorSpec を差し替える）           */
/* ------------------------------------------------------------------ */

export interface ColorTheme {
  id: string;
  label: string;
  /** 本体の塗り */
  fill: ColorSpec;
  /** 外→内の順。デコテンプレが必要なぶんだけ拾う */
  strokes: ColorSpec[];
  background: BackgroundSpec;
  /** 影・グロー等の単色が要る場面で使う */
  accent: string;
  /** 想定する背景の明るさ */
  tone: 'dark' | 'light' | 'any';
}

const RAINBOW: ColorSpec = { kind: 'rainbow', saturation: 1, lightness: 0.5, cycles: 1, speed: 1, angle: 0 };

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'rainbow-gold',
    label: '虹＋金縁',
    fill: RAINBOW,
    strokes: [{ kind: 'metal', base: 'gold', angle: 90 }, { kind: 'solid', color: '#ffffff' }],
    background: { kind: 'transparent' },
    accent: '#2b1a00',
    tone: 'any',
  },
  {
    id: 'rainbow-black',
    label: '虹＋黒縁',
    fill: RAINBOW,
    strokes: [{ kind: 'solid', color: '#000000' }, { kind: 'solid', color: '#ffffff' }],
    background: { kind: 'transparent' },
    accent: '#000000',
    tone: 'any',
  },
  {
    id: 'gold-lux',
    label: '金一色',
    fill: { kind: 'metal', base: 'gold', angle: 90 },
    strokes: [{ kind: 'solid', color: '#3b2400' }, { kind: 'solid', color: '#ffe9a0' }],
    background: { kind: 'transparent' },
    accent: '#3b2400',
    tone: 'any',
  },
  {
    id: 'pastel-pop',
    label: 'パステル',
    fill: { kind: 'linear', stops: [{ at: 0, color: '#ffd1dc' }, { at: 1, color: '#c1e7ff' }], angle: 90, scrollSpeed: 0 },
    strokes: [{ kind: 'solid', color: '#3a2b4a' }, { kind: 'solid', color: '#ffffff' }],
    background: { kind: 'transparent' },
    accent: '#3a2b4a',
    tone: 'any',
  },
  {
    id: 'fire',
    label: '炎',
    fill: { kind: 'linear', stops: [{ at: 0, color: '#ffe259' }, { at: 1, color: '#ff512f' }], angle: 90, scrollSpeed: 0 },
    strokes: [{ kind: 'solid', color: '#4a1500' }, { kind: 'solid', color: '#ffd08a' }],
    background: { kind: 'transparent' },
    accent: '#ff512f',
    tone: 'any',
  },
  {
    id: 'ice',
    label: '氷',
    fill: { kind: 'linear', stops: [{ at: 0, color: '#e0f7ff' }, { at: 1, color: '#2196f3' }], angle: 90, scrollSpeed: 0 },
    strokes: [{ kind: 'solid', color: '#0b3a5c' }, { kind: 'solid', color: '#ffffff' }],
    background: { kind: 'transparent' },
    accent: '#2196f3',
    tone: 'any',
  },
  {
    id: 'blood',
    label: '血赤（ホラー）',
    fill: { kind: 'linear', stops: [{ at: 0, color: '#ff4d4d' }, { at: 1, color: '#7a0000' }], angle: 90, scrollSpeed: 0 },
    strokes: [{ kind: 'solid', color: '#12060a' }, { kind: 'solid', color: '#c98b8b' }],
    background: { kind: 'transparent' },
    accent: '#7a0000',
    tone: 'any',
  },
  {
    id: 'mono',
    label: 'モノクロ',
    fill: { kind: 'solid', color: '#ffffff' },
    strokes: [{ kind: 'solid', color: '#000000' }, { kind: 'solid', color: '#8a8a8a' }],
    background: { kind: 'transparent' },
    accent: '#000000',
    tone: 'any',
  },
];

export function getTheme(id: string): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES[0];
}

const stroke = (theme: ColorTheme, i: number): ColorSpec => theme.strokes[i] ?? theme.strokes[theme.strokes.length - 1] ?? { kind: 'solid', color: '#000000' };

/* ------------------------------------------------------------------ */
/* 軸2: 文字装飾テンプレ（text.decorations を差し替える）                 */
/* ------------------------------------------------------------------ */

export interface DecoTemplate {
  id: string;
  label: string;
  /** 相性ヒント。禁止ではなく警告に使う */
  compatible: { background: 'dark' | 'light' | 'any' };
  /** 透過背景では成立しないテンプレ（くり抜き系） */
  needsOpaqueBackground?: boolean;
  build(theme: ColorTheme): TextDecoSpec[];
}

export const DECO_TEMPLATES: DecoTemplate[] = [
  {
    id: 'outline-gold',
    label: '金縁袋文字',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'stroke', widthRatio: 0.1, color: stroke(th, 0) },
      { type: 'stroke', widthRatio: 0.04, color: stroke(th, 1) },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'outline-simple',
    label: '袋文字（単色縁）',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'stroke', widthRatio: 0.09, color: stroke(th, 0) },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'extrude-3d',
    label: '3D押し出し',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'extrude', depth: 0.09, angle: 60, color: stroke(th, 0) },
      { type: 'stroke', widthRatio: 0.05, color: stroke(th, 0) },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'neon',
    label: 'ネオン発光',
    compatible: { background: 'dark' },
    build: (th) => [
      { type: 'glow', color: th.fill, radius: 0.22, passes: 3, intensity: 1.5 },
      { type: 'stroke', widthRatio: 0.025, color: th.fill },
      { type: 'fill', color: { kind: 'solid', color: '#ffffff' } },
    ],
  },
  {
    id: 'hard-shadow',
    label: 'ハードシャドウ',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'shadow', blur: 0, offset: { x: 0.07, y: 0.07 }, color: th.accent, opacity: 1 },
      { type: 'stroke', widthRatio: 0.07, color: stroke(th, 0) },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'sticker',
    label: 'ステッカー風',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'shadow', blur: 0.05, offset: { x: 0.02, y: 0.04 }, color: '#000000', opacity: 0.45 },
      { type: 'stroke', widthRatio: 0.14, color: { kind: 'solid', color: '#ffffff' } },
      { type: 'stroke', widthRatio: 0.05, color: stroke(th, 0) },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'glitch',
    label: 'グリッチ',
    compatible: { background: 'dark' },
    build: (th) => [
      { type: 'stroke', widthRatio: 0.06, color: stroke(th, 0) },
      { type: 'offsetCopy', offset: { x: -0.03, y: 0 }, color: '#ff0044', blend: 'screen', jitter: 0.012 },
      { type: 'offsetCopy', offset: { x: 0.03, y: 0 }, color: '#00e5ff', blend: 'screen', jitter: 0.012 },
      { type: 'fill', color: th.fill },
    ],
  },
  {
    id: 'stripe',
    label: 'ストライプ塗り',
    compatible: { background: 'any' },
    build: (th) => [
      { type: 'stroke', widthRatio: 0.1, color: stroke(th, 0) },
      { type: 'stroke', widthRatio: 0.04, color: stroke(th, 1) },
      { type: 'pattern', kind: 'stripe', colors: ['#ffffff', '#ff3355'], scale: 0.16, angle: 45, scrollSpeed: 1 },
    ],
  },
  {
    id: 'knockout',
    label: '背景くり抜き',
    compatible: { background: 'any' },
    needsOpaqueBackground: true,
    build: () => [{ type: 'knockout' }],
  },
];

export function getDecoTemplate(id: string): DecoTemplate {
  return DECO_TEMPLATES.find((d) => d.id === id) ?? DECO_TEMPLATES[0];
}

/* ------------------------------------------------------------------ */
/* 軸3: 演出テンプレ（layers + motion を差し替える）                     */
/* ------------------------------------------------------------------ */

export interface EffectTemplate {
  id: string;
  label: string;
  layers: LayerSpec[];
}

export const EFFECT_TEMPLATES: EffectTemplate[] = [
  { id: 'none', label: 'なし', layers: [] },
  {
    id: 'radiate',
    label: '集中線',
    layers: [{ type: 'radiate', z: 'back', params: { count: 48, minLen: 0.1, maxLen: 0.3, width: 0.012, gap: 0.02, groups: 2, pulse: true, colorMode: 'rainbow', jitter: 0.3 } }],
  },
  {
    id: 'sparkle',
    label: 'キラキラ',
    layers: [{ type: 'sparkle', z: 'front', params: { count: 16, size: 0.07, twinkleSpeed: 2, color: '#fffbe6' } }],
  },
  {
    id: 'confetti',
    label: '紙吹雪',
    layers: [{ type: 'confetti', z: 'front', params: { count: 28, speed: 1, size: 0.035 } }],
  },
  {
    id: 'ring',
    label: '波紋',
    layers: [{ type: 'ring', z: 'back', params: { count: 3, speed: 1, width: 0.012, color: '#ffffff' } }],
  },
];

/** 文字の動き。種類を切り替えたときの既定の大きさ（0 のままだと何も起きない） */
export const MOTION_DEFAULT_AMOUNT: Record<MotionSpec['type'], number> = {
  none: 0,
  pulse: 0.05,
  bounce: 0.04,
  shake: 0.02,
  rotate: 1,
  wave: 0.08,
};

export function applyMotion(params: RenderParams, type: MotionSpec['type'], amount?: number): RenderParams {
  return {
    ...params,
    motion: { type, amount: amount ?? (params.motion.type === type ? params.motion.amount : MOTION_DEFAULT_AMOUNT[type]) },
    // 波打ちだけは1文字ずつ位相をずらす必要がある
    text: { ...params.text, perChar: type === 'wave' },
  };
}

export function getEffect(id: string): EffectTemplate {
  return EFFECT_TEMPLATES.find((e) => e.id === id) ?? EFFECT_TEMPLATES[0];
}

/* ------------------------------------------------------------------ */
/* レシピ = 3軸のセット。ギャラリーの入口                                 */
/* ------------------------------------------------------------------ */

export type RecipeCategory = 'coc' | 'general' | 'style';

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  coc: 'クトゥルフ神話TRPG 定番',
  general: '汎用',
  style: '見た目から選ぶ',
};

export interface Recipe {
  id: string;
  label: string;
  text: string;
  fontId: string;
  decoId: string;
  themeId: string;
  effectId: string;
  motion?: MotionSpec;
  category: RecipeCategory;
}

export const RECIPES: Recipe[] = [
  { id: 'success',       label: '成功',           text: '成功',              fontId: 'reggae',      decoId: 'outline-gold',   themeId: 'rainbow-gold', effectId: 'radiate' , category: 'coc' },
  { id: 'critical',      label: '決定的成功',     text: '決定的\n成功',      fontId: 'reggae',      decoId: 'outline-gold',   themeId: 'rainbow-gold', effectId: 'radiate', motion: { type: 'pulse', amount: 0.05 } , category: 'coc' },
  { id: 'failure',       label: '失敗',           text: '失敗',              fontId: 'shippori-b1', decoId: 'outline-simple', themeId: 'blood',        effectId: 'none', motion: { type: 'shake', amount: 0.02 } , category: 'coc' },
  { id: 'fumble',        label: '致命的失敗',     text: '致命的\n失敗',      fontId: 'shippori-b1', decoId: 'hard-shadow',    themeId: 'blood',        effectId: 'none', motion: { type: 'shake', amount: 0.02 } , category: 'coc' },
  { id: 'madness',       label: '狂気',           text: '正気度\n喪失',      fontId: 'shippori-b1', decoId: 'glitch',         themeId: 'blood',        effectId: 'none' , category: 'coc' },
  { id: 'secret',        label: 'シークレット',   text: 'シークレット\nダイス', fontId: 'noto-black', decoId: 'outline-simple', themeId: 'mono',        effectId: 'none' , category: 'coc' },
  { id: 'victory',       label: '勝利',           text: '勝利',              fontId: 'reggae',      decoId: 'extrude-3d',     themeId: 'gold-lux',     effectId: 'sparkle', motion: { type: 'pulse', amount: 0.03 } , category: 'general' },
  { id: 'defeat',        label: '敗北',           text: '敗北',              fontId: 'shippori-b1', decoId: 'outline-simple', themeId: 'mono',         effectId: 'none' , category: 'general' },
  { id: 'cyber',         label: 'サイバー',       text: 'ALERT',             fontId: 'dotgothic',   decoId: 'neon',           themeId: 'ice',          effectId: 'ring' , category: 'style' },
  { id: 'pop',           label: 'ポップ',         text: 'やったー！',        fontId: 'mplus-round', decoId: 'sticker',        themeId: 'pastel-pop',   effectId: 'confetti', motion: { type: 'bounce', amount: 0.03 } , category: 'style' },
  { id: 'retro',         label: 'レトロゲーム',   text: 'LEVEL UP',          fontId: 'dotgothic',   decoId: 'hard-shadow',    themeId: 'fire',         effectId: 'sparkle', motion: { type: 'pulse', amount: 0.03 } , category: 'style' },
  { id: 'stripe-pop',    label: 'ストライプ',     text: 'ぽっぷ',            fontId: 'mplus-round', decoId: 'stripe',         themeId: 'rainbow-black', effectId: 'none', motion: { type: 'wave', amount: 0.08 } , category: 'style' },
  { id: 'kp-trouble',    label: 'KPは困っています', text: 'KPは\n困っています', fontId: 'reggae',    decoId: 'outline-gold',   themeId: 'rainbow-gold', effectId: 'radiate' , category: 'general' },
  { id: 'handwrite',     label: '手書きメモ',     text: 'なんてこった',      fontId: 'rocknroll',   decoId: 'outline-simple', themeId: 'ice',          effectId: 'none', motion: { type: 'wave', amount: 0.08 } , category: 'style' },
];

/* ------------------------------------------------------------------ */

export interface BuildInput {
  text: string;
  fontId: string;
  decoId: string;
  themeId: string;
  effectId: string;
  motion?: MotionSpec;
  canvas?: { w: number; h: number };
  frameCount?: number;
  fps?: number;
  seed?: number;
}

/** 3軸 + テキストから RenderParams を組む */
export function buildParams(input: BuildInput, base?: RenderParams): RenderParams {
  const theme = getTheme(input.themeId);
  const deco = getDecoTemplate(input.decoId);
  const effect = getEffect(input.effectId);
  const prev = base ?? DEFAULT_PARAMS;
  return {
    ...prev,
    version: 1,
    canvas: input.canvas ?? prev.canvas,
    frameCount: input.frameCount ?? prev.frameCount,
    fps: input.fps ?? prev.fps,
    seed: input.seed ?? prev.seed,
    background: backgroundFor(theme, deco),
    text: {
      ...prev.text,
      lines: input.text.split('\n'),
      fontId: input.fontId,
      decorations: deco.build(theme),
      perChar: input.motion?.type === 'wave',
    },
    layers: effect.layers.map((l) => ({ ...l, params: { ...l.params } })),
    motion: input.motion ? { ...input.motion } : { type: 'none', amount: 0 },
  };
}

/** 文字装飾テンプレを適用する（カラーテーマは据え置き） */
/** くり抜き系は透過背景だと消えるだけになるので、テーマの塗りを背景に回す */
function backgroundFor(theme: ColorTheme, deco: DecoTemplate): BackgroundSpec {
  if (deco.needsOpaqueBackground && theme.background.kind === 'transparent') return theme.fill;
  return theme.background;
}

export function applyDeco(params: RenderParams, decoId: string, themeId: string): RenderParams {
  const theme = getTheme(themeId);
  const deco = getDecoTemplate(decoId);
  return {
    ...params,
    background: backgroundFor(theme, deco),
    text: { ...params.text, decorations: deco.build(theme) },
  };
}

/** カラーテーマを適用する（背景も追従する） */
export function applyTheme(params: RenderParams, themeId: string, decoId: string): RenderParams {
  const theme = getTheme(themeId);
  const deco = getDecoTemplate(decoId);
  return {
    ...params,
    background: backgroundFor(theme, deco),
    text: { ...params.text, decorations: deco.build(theme) },
  };
}

/** 演出テンプレを適用する（レイヤーとモーションを差し替える） */
export function applyEffect(params: RenderParams, effectId: string): RenderParams {
  const e = getEffect(effectId);
  return { ...params, layers: e.layers.map((l) => ({ ...l, params: { ...l.params } })) };
}

/** ギャラリー用。レシピ1件を既定キャンバスで組む */
export function recipeParams(recipe: Recipe): RenderParams {
  return buildParams({ ...recipe }, DEFAULT_PARAMS);
}

export const DEFAULT_PARAMS: RenderParams = {
  version: 1,
  canvas: { w: 480, h: 480 },
  frameCount: 15,
  fps: 20,
  seed: 12345,
  background: { kind: 'transparent' },
  text: {
    lines: ['成功'],
    fontId: 'reggae',
    scale: 1,
    lineHeight: 1.1,
    letterSpacing: 0.02,
    decorations: getDecoTemplate('outline-gold').build(getTheme('rainbow-gold')),
    perChar: false,
  },
  layers: getEffect('radiate').layers.map((l) => ({ ...l, params: { ...l.params } })),
  motion: { type: 'none', amount: 0 },
  output: { format: 'apng', colors: 256, budgetBytes: 1_000_000, matte: null },
};

/** 一括書き出し用の文言プリセット */
export const TEXT_PRESETS: Array<{ id: string; label: string; items: string[] }> = [
  { id: 'coc', label: 'クトゥルフ（6種）', items: ['決定的成功', '成功', '失敗', '致命的失敗', '正気度喪失', 'シークレットダイス'] },
  { id: 'simple', label: '成功／失敗', items: ['成功', '失敗'] },
  { id: 'battle', label: '勝利／敗北', items: ['勝利', '敗北'] },
  { id: 'kp', label: 'KPは困っています', items: ['KPは\n困っています'] },
];
