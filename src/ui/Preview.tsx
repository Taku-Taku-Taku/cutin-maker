import { useEffect, useRef } from 'react';
import { render } from '../core/render';
import type { RenderParams } from '../core/types';

interface Props {
  params: RenderParams;
  /** フォントロード完了などで強制再描画したいときに変える */
  epoch: number;
}

/** GIFは作らない。rAF で render(ctx, params, t) を回すだけ */
export function Preview({ params, epoch }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const empty = params.text.lines.join('').trim() === '';

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = paramsRef.current;
      const canvas = ref.current;
      if (canvas) {
        if (canvas.width !== p.canvas.w || canvas.height !== p.canvas.h) {
          canvas.width = p.canvas.w;
          canvas.height = p.canvas.h;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const period = (p.frameCount / p.fps) * 1000;
          // 書き出し結果と同じ絵になるよう、フレーム位置にスナップする
          const phase = (performance.now() % period) / period;
          const i = Math.floor(phase * p.frameCount) % p.frameCount;
          render(ctx, p, i / p.frameCount);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [epoch]);

  return (
    <div className="flex items-center justify-center">
      <div className="checker relative w-fit max-w-full rounded-lg p-2">
        <canvas ref={ref} className="block max-h-[38vh] max-w-full object-contain" />
        {empty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
            ここに文字が入ります
          </div>
        )}
      </div>
    </div>
  );
}
