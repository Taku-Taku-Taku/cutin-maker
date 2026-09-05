import type { Layer } from '../types';
import { bgFlashLayer } from './bgFlash';
import { confettiLayer } from './confetti';
import { radiateLayer } from './radiate';
import { ringLayer } from './ring';
import { sparkleLayer } from './sparkle';

/** 追加は 1ファイル + この 1行 */
const REGISTRY: Layer[] = [radiateLayer, sparkleLayer, bgFlashLayer, confettiLayer, ringLayer];

const BY_TYPE = new Map<string, Layer>(REGISTRY.map((l) => [l.type, l]));

export function getLayer(type: string): Layer | undefined {
  return BY_TYPE.get(type);
}

export const LAYER_TYPES = REGISTRY.map((l) => l.type);

export const LAYER_LABELS: Record<string, string> = {
  radiate: '集中線',
  sparkle: 'キラキラ',
  bgFlash: '背景フラッシュ',
  confetti: '紙吹雪',
  ring: '波紋',
};
