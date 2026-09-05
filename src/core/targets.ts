import type { OutputFormat, RenderParams } from './types';
import { getFont } from './fonts';

export interface ExportTarget {
  id: string;
  label: string;
  /** null = 自由。数値指定は「厳密一致が必要」を意味する */
  fixedSize: { w: number; h: number } | null;
  defaultSize: { w: number; h: number };
  defaultFrames: number;
  defaultFps: number;
  maxBytes: number;
  /** 使用可能な形式。先頭が既定 */
  formats: OutputFormat[];
  alpha: 'full' | '1bit' | 'none';
  /** 実際にユーザーの画面で表示される概算px */
  displaySize: number;
  maxChars: number;
  /** GIF出力時のマット既定色。null=透過のまま */
  defaultMatte: string | null;
  notes: string[];
}

export const TARGETS: ExportTarget[] = [
  {
    id: 'ccfolia-cutin',
    label: 'ココフォリア カットイン',
    fixedSize: null,
    defaultSize: { w: 480, h: 480 },
    defaultFrames: 15,
    defaultFps: 20,
    maxBytes: 1_000_000,
    formats: ['apng', 'gif', 'png'],
    alpha: 'full',
    displaySize: 480,
    maxChars: 20,
    defaultMatte: null,
    notes: ['音源を設定しない場合、操作するまで消えない（無限ループ）'],
  },
  {
    id: 'discord-sticker',
    label: 'Discord ステッカー',
    fixedSize: { w: 320, h: 320 },
    defaultSize: { w: 320, h: 320 },
    defaultFrames: 12,
    defaultFps: 20,
    maxBytes: 512_000,
    formats: ['apng', 'png'],
    alpha: 'full',
    displaySize: 160,
    maxChars: 8,
    defaultMatte: null,
    notes: ['320×320ちょうどでないと弾かれる', 'GIF不可。アニメはAPNG'],
  },
  {
    id: 'discord-attachment',
    label: 'Discord チャット添付（ローカル保存して送信）',
    fixedSize: null,
    defaultSize: { w: 720, h: 720 },
    defaultFrames: 30,
    defaultFps: 30,
    maxBytes: 8_000_000,
    formats: ['gif', 'png'],
    alpha: '1bit',
    displaySize: 400,
    maxChars: 20,
    defaultMatte: '#313338',
    notes: [
      'DiscordはチャットのAPNGをアニメーションさせない（1フレーム目のみ表示）',
      '容量に余裕があるので高解像度・高フレームレートにできる',
      '暗いテーマ上に表示されるためマット合成を推奨',
    ],
  },
];

export const DEFAULT_TARGET_ID = 'ccfolia-cutin';

export function getTarget(id: string): ExportTarget {
  return TARGETS.find((t) => t.id === id) ?? TARGETS[0];
}

/** ターゲット既定値へ追従させるフィールド名 */
export type TargetDrivenField = 'canvas' | 'frameCount' | 'fps' | 'format' | 'matte';

/**
 * ターゲット切替時の既定値追従。
 * ユーザーが手で触ったフィールドは上書きしない（触った直後に値が消える不快な挙動を避ける）。
 */
export function applyTargetDefaults(
  params: RenderParams,
  target: ExportTarget,
  touched: ReadonlySet<TargetDrivenField>,
): RenderParams {
  const next: RenderParams = { ...params, canvas: { ...params.canvas }, output: { ...params.output } };
  if (target.fixedSize) {
    next.canvas = { ...target.fixedSize }; // 厳密一致が要求されるので手動値より優先
  } else if (!touched.has('canvas')) {
    next.canvas = { ...target.defaultSize };
  }
  if (!touched.has('frameCount')) next.frameCount = target.defaultFrames;
  if (!touched.has('fps')) next.fps = target.defaultFps;
  if (!touched.has('format') || !target.formats.includes(next.output.format)) {
    next.output.format = target.formats[0];
  }
  if (!touched.has('matte')) next.output.matte = target.defaultMatte;
  return next;
}

/**
 * 表示サイズに応じた自動調整。純関数。プレビューにも同じものを通す。
 */
export function adaptForTarget(params: RenderParams, target: ExportTarget): RenderParams {
  const k = target.displaySize / 480; // 480px（ココフォリアのカットイン）を基準にする
  if (Math.abs(k - 1) < 0.01) return params;

  const strokeBoost = k < 1 ? 1 + (1 - k) * 0.6 : 1; // 小さく表示されるほど縁を太く
  const decorations = params.text.decorations.map((d) =>
    d.type === 'stroke' ? { ...d, widthRatio: d.widthRatio * strokeBoost } : d,
  );

  const layers = params.layers.map((l) => {
    if (l.type !== 'radiate') return l;
    const count = typeof l.params.count === 'number' ? l.params.count : 48;
    return { ...l, params: { ...l.params, count: Math.max(8, Math.round(count * k)) } };
  });

  return {
    ...params,
    text: { ...params.text, decorations },
    layers,
    motion: k < 1 ? { ...params.motion, amount: params.motion.amount * (0.6 + 0.4 * k) } : params.motion,
  };
}

export type Issue = { level: 'error' | 'warn' | 'info'; message: string };

/** 書き出しボタンの近くに常時表示する */
export function validate(params: RenderParams, target: ExportTarget, actualBytes?: number): Issue[] {
  const issues: Issue[] = [];
  const fmt = params.output.format;

  if (!target.formats.includes(fmt)) {
    issues.push({ level: 'error', message: `${target.label} は ${fmt.toUpperCase()} を受け付けません（使用可: ${target.formats.map((f) => f.toUpperCase()).join(' / ')}）` });
  }
  if (target.fixedSize) {
    if (params.canvas.w !== target.fixedSize.w || params.canvas.h !== target.fixedSize.h) {
      issues.push({ level: 'error', message: `寸法は ${target.fixedSize.w}×${target.fixedSize.h} ちょうどである必要があります` });
    }
  }
  if (target.alpha === '1bit' && fmt === 'gif' && !params.output.matte && params.background.kind === 'transparent') {
    issues.push({ level: 'warn', message: 'GIFの透過は1bitのため、袋文字の縁が白いギザギザになります。マット色の指定を推奨' });
  }
  if (fmt === 'gif' && params.output.matte && target.alpha === 'full') {
    issues.push({ level: 'info', message: 'マット合成を行うため不透明GIFになります（盤面に矩形で乗ります）' });
  }

  const chars = params.text.lines.join('').length;
  if (chars > target.maxChars) {
    issues.push({ level: 'warn', message: `文字数 ${chars} は推奨上限 ${target.maxChars} を超えています（実表示 ${target.displaySize}px で読みにくくなります）` });
  }
  const font = getFont(params.text.fontId);
  if (chars > font.recommendedMaxChars) {
    issues.push({ level: 'warn', message: `${font.label} の推奨文字数は ${font.recommendedMaxChars} 文字までです` });
  }
  if (actualBytes !== undefined && actualBytes > target.maxBytes) {
    issues.push({ level: 'error', message: `${fmtBytes(actualBytes)} は上限 ${fmtBytes(target.maxBytes)} を超えています` });
  }
  return issues;
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** 超過時の自動軽量化。効果が大きく劣化が小さい順に1段階だけ下げる */
export function lighten(params: RenderParams, target: ExportTarget): { params: RenderParams; applied: string } | null {
  const next: RenderParams = {
    ...params,
    output: { ...params.output },
    layers: params.layers.map((l) => ({ ...l, params: { ...l.params } })),
    canvas: { ...params.canvas },
  };
  if (next.output.colors > 64) {
    next.output.colors = next.output.colors > 128 ? 128 : 64;
    return { params: next, applied: `色数を ${next.output.colors} に下げました` };
  }
  if (next.frameCount > 10) {
    next.frameCount = Math.max(10, next.frameCount - 3);
    return { params: next, applied: `フレーム数を ${next.frameCount} に下げました` };
  }
  const radiate = next.layers.find((l) => l.type === 'radiate');
  if (radiate && typeof radiate.params.count === 'number' && radiate.params.count > 16) {
    radiate.params.count = Math.max(16, Math.round(radiate.params.count * 0.7));
    return { params: next, applied: `集中線を ${radiate.params.count} 本に減らしました` };
  }
  if (!target.fixedSize && Math.min(next.canvas.w, next.canvas.h) > 240) {
    next.canvas = { w: Math.round(next.canvas.w * 0.8), h: Math.round(next.canvas.h * 0.8) };
    return { params: next, applied: `キャンバスを ${next.canvas.w}×${next.canvas.h} に縮小しました` };
  }
  return null;
}

/** ココフォリア向けサイズプリセット */
export interface SizePreset {
  id: string;
  label: string;
  w: number;
  h: number;
  frames: number;
  fps: number;
  /** 円い演出が切れないように中身を縮める率。省略=1 */
  contentScale?: number;
}

export const CCFOLIA_SIZE_PRESETS: SizePreset[] = [
  { id: 'square', label: 'カットイン（正方形）', w: 480, h: 480, frames: 15, fps: 20 },
  { id: 'large', label: 'カットイン（大）', w: 600, h: 600, frames: 18, fps: 20, contentScale: 0.72 },
  { id: 'wide', label: 'ワイド 16:9', w: 800, h: 450, frames: 15, fps: 20 },
  { id: 'light', label: '軽量', w: 320, h: 320, frames: 10, fps: 15 },
];
