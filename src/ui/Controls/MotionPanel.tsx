import { LAYER_LABELS } from '../../core/layers';
import { applyEffect, EFFECT_TEMPLATES } from '../../core/templates';
import type { MotionSpec, RenderParams } from '../../core/types';
import { Advanced, Choice, Field, Section, Slider, ThumbChoice } from '../kit';

interface Props {
  params: RenderParams;
  axes: { effectId: string };
  onEffect: (id: string) => void;
  onLayerParam: (layerIndex: number, key: string, value: number | string | boolean) => void;
  onMotionType: (t: MotionSpec['type']) => void;
  onMotionAmount: (v: number) => void;
  onSeed: (seed: number) => void;
}

const MOTIONS: Array<{ id: MotionSpec['type']; label: string }> = [
  { id: 'none', label: 'なし' },
  { id: 'pulse', label: '拡大縮小' },
  { id: 'bounce', label: '跳ねる' },
  { id: 'shake', label: '振動' },
  { id: 'rotate', label: '回転' },
  { id: 'wave', label: '波打ち' },
];

/** レイヤーの数値パラメータは総当りでスライダーにする（追加時にUI改修が要らない） */
const RANGES: Record<string, { min: number; max: number; step: number; label: string }> = {
  count: { min: 4, max: 96, step: 1, label: '本数・個数' },
  minLen: { min: 0.02, max: 0.4, step: 0.01, label: '最短' },
  maxLen: { min: 0.05, max: 0.6, step: 0.01, label: '最長' },
  width: { min: 0.002, max: 0.05, step: 0.001, label: '太さ' },
  gap: { min: 0, max: 0.3, step: 0.01, label: '文字との間隔' },
  groups: { min: 1, max: 4, step: 1, label: 'グループ数' },
  jitter: { min: 0, max: 1, step: 0.05, label: '角度ゆらぎ' },
  size: { min: 0.01, max: 0.2, step: 0.005, label: 'サイズ' },
  twinkleSpeed: { min: 1, max: 6, step: 1, label: '明滅速度' },
  speed: { min: 1, max: 5, step: 1, label: '速度' },
  saturation: { min: 0, max: 1, step: 0.05, label: '彩度' },
  lightness: { min: 0, max: 1, step: 0.05, label: '明度' },
  alpha: { min: 0, max: 1, step: 0.05, label: '不透明度' },
};

export function MotionPanel({ params, axes, onEffect, onLayerParam, onMotionType, onMotionAmount, onSeed }: Props) {
  return (
    <div>
      <Section title="まわりのエフェクト">
        <ThumbChoice
          columns={3}
          size={88}
          value={axes.effectId}
          onChange={onEffect}
          items={EFFECT_TEMPLATES.map((e) => ({ id: e.id, label: e.label, params: applyEffect(params, e.id) }))}
        />
      </Section>

      <Section title="文字の動き">
        <Choice columns={3} value={params.motion.type} onChange={onMotionType} items={MOTIONS} />
        {params.motion.type !== 'none' && (
          <div className="mt-2">
            <Slider
              label="動きの大きさ"
              value={params.motion.amount}
              min={params.motion.type === 'rotate' ? 1 : 0}
              max={params.motion.type === 'rotate' ? 3 : 0.2}
              step={params.motion.type === 'rotate' ? 1 : 0.005}
              onChange={onMotionAmount}
            />
          </div>
        )}
      </Section>

      <Advanced>
        {params.layers.map((layer, i) => (
          <Section key={`${layer.type}-${i}`} title={`${LAYER_LABELS[layer.type] ?? layer.type} の調整`}>
            {Object.entries(layer.params).map(([key, value]) => {
              if (typeof value === 'number') {
                const r = RANGES[key] ?? { min: 0, max: 1, step: 0.01, label: key };
                return (
                  <Slider key={key} label={r.label} value={value} min={r.min} max={r.max} step={r.step} onChange={(v) => onLayerParam(i, key, v)} />
                );
              }
              if (typeof value === 'boolean') {
                return (
                  <Field key={key} label={key === 'pulse' ? '伸縮アニメ' : key}>
                    <input type="checkbox" checked={value} onChange={(e) => onLayerParam(i, key, e.target.checked)} />
                  </Field>
                );
              }
              if (key === 'colorMode') {
                return (
                  <Field key={key} label="色">
                    <Choice
                      columns={2}
                      value={value as string}
                      onChange={(v) => onLayerParam(i, key, v)}
                      items={[{ id: 'rainbow', label: '虹' }, { id: 'solid', label: '単色' }]}
                    />
                    {value === 'solid' && (
                      <input
                        type="color"
                        className="mt-2"
                        value={typeof layer.params.color === 'string' ? layer.params.color : '#ffffff'}
                        onChange={(e) => onLayerParam(i, 'color', e.target.value)}
                      />
                    )}
                  </Field>
                );
              }
              // colorMode を持つレイヤーの色は上でまとめて出す
              if (key === 'color' && 'colorMode' in layer.params) return null;
              if (key === 'color') {
                return (
                  <Field key={key} label="色">
                    <input type="color" value={value as string} onChange={(e) => onLayerParam(i, key, e.target.value)} />
                  </Field>
                );
              }
              return null;
            })}
          </Section>
        ))}

        <Section title="乱数シード">
          <Slider label="シード（同じ値なら同じ絵）" value={params.seed} min={1} max={99999} step={1} onChange={onSeed} />
        </Section>
      </Advanced>
    </div>
  );
}
