import { CCFOLIA_SIZE_PRESETS, fmtBytes, type ExportTarget } from '../../core/targets';
import type { OutputFormat, RenderParams } from '../../core/types';
import { Advanced, Choice, Field, NumberInput, Section, Slider } from '../kit';

interface Props {
  params: RenderParams;
  target: ExportTarget;
  onSize: (w: number, h: number) => void;
  onFrames: (n: number) => void;
  onFps: (n: number) => void;
  onFormat: (f: OutputFormat) => void;
  onContentScale: (v: number) => void;
  onOutput: (patch: Partial<RenderParams['output']>) => void;
}

const FORMAT_LABELS: Record<OutputFormat, string> = { apng: 'APNG', gif: 'GIF', png: 'PNG（静止画）' };

export function ExportPanel({ params, target, onSize, onFrames, onFps, onFormat, onContentScale, onOutput }: Props) {
  const sizePreset = CCFOLIA_SIZE_PRESETS.find((p) => p.w === params.canvas.w && p.h === params.canvas.h)?.id ?? '';

  return (
    <div>
      <Section title="形式">
        <Choice
          columns={1}
          value={params.output.format}
          onChange={onFormat}
          items={(['apng', 'gif', 'png'] as OutputFormat[]).map((f) => ({
            id: f,
            label: FORMAT_LABELS[f],
            sub: target.formats.includes(f) ? undefined : `${target.label} では使えません`,
            disabled: !target.formats.includes(f),
          }))}
        />
      </Section>

      <Section title="大きさ">
        {target.fixedSize ? (
          <p className="text-[11px] text-neutral-400">
            {target.label} は {target.fixedSize.w}×{target.fixedSize.h} 固定です（厳密一致でないと弾かれます）
          </p>
        ) : (
          <Choice
            columns={2}
            value={sizePreset}
            onChange={(id) => {
              const p = CCFOLIA_SIZE_PRESETS.find((x) => x.id === id)!;
              onSize(p.w, p.h);
              onFrames(p.frames);
              onFps(p.fps);
              onContentScale(p.contentScale ?? 1);
            }}
            items={CCFOLIA_SIZE_PRESETS.map((p) => ({ id: p.id, label: p.label, sub: `${p.w}×${p.h}` }))}
          />
        )}
        <p className="mt-2 text-[11px] text-neutral-500">
          現在 {params.canvas.w}×{params.canvas.h} ・ {params.frameCount}コマ ・ {params.fps}fps（1周 {(params.frameCount / params.fps).toFixed(2)}秒）・ 上限 {fmtBytes(target.maxBytes)}
        </p>
      </Section>

      <Advanced>
        <Section title="寸法・コマ数">
          <div className="grid grid-cols-2 gap-2">
            <Field label="幅">
              <NumberInput value={params.canvas.w} min={64} max={1600} step={8} onChange={(v) => onSize(Math.round(v), params.canvas.h)} />
            </Field>
            <Field label="高さ">
              <NumberInput value={params.canvas.h} min={64} max={1600} step={8} onChange={(v) => onSize(params.canvas.w, Math.round(v))} />
            </Field>
          </div>
          <Slider label="フレーム数" value={params.frameCount} min={2} max={60} step={1} onChange={(v) => onFrames(Math.round(v))} />
          <Slider label="fps" value={params.fps} min={5} max={30} step={1} onChange={(v) => onFps(Math.round(v))} format={(v) => `${v} fps`} />
          <Slider
            label="全体の大きさ"
            value={params.contentScale ?? 1}
            min={0.4}
            max={1}
            step={0.02}
            onChange={onContentScale}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </Section>

        <Section title="エンコード">
          <Slider
            label="色数（APNG/PNG）"
            value={params.output.colors}
            min={0}
            max={256}
            step={16}
            onChange={(v) => onOutput({ colors: Math.round(v) })}
            format={(v) => (v === 0 ? '無損失（大きい）' : `${v}色`)}
          />
          {params.output.format === 'gif' && (
            <Field label="マット合成（GIFの粗い透過の対策）" hint={params.output.matte ?? '透過のまま'}>
              <div className="flex items-center gap-2">
                <input type="color" value={params.output.matte ?? '#313338'} onChange={(e) => onOutput({ matte: e.target.value })} />
                <button type="button" className="text-xs text-neutral-400 underline" onClick={() => onOutput({ matte: null })}>
                  透過のまま
                </button>
                <button type="button" className="text-xs text-neutral-400 underline" onClick={() => onOutput({ matte: '#313338' })}>
                  Discordダーク
                </button>
              </div>
            </Field>
          )}
        </Section>
      </Advanced>
    </div>
  );
}
