import { fmtBytes, type ExportTarget } from '../core/targets';
import type { OutputFormat } from '../core/types';
import { Button, Dialog } from './kit';

export interface ExportResult {
  url: string;
  bytes: number;
  format: OutputFormat;
  filename: string;
}

interface Props {
  result: ExportResult | null;
  target: ExportTarget;
  /** カットイン名として案内する文字列（テキスト1行目） */
  triggerWord: string;
  onClose: () => void;
  onLighten: () => void;
}

/** 配布先ごとの「このあとどうするか」 */
function usage(target: ExportTarget, word: string): string[] {
  switch (target.id) {
    case 'ccfolia-cutin':
      return [
        'ココフォリアのルーム画面 →［カットイン］→ ファイルをアップロード',
        `カットイン名を「${word || '成功'}」にすると、チャットの末尾がその文字列と一致したときに再生されます`,
        '音源を設定しない場合、操作するまで消えません（無限ループ）',
      ];
    case 'discord-sticker':
      return [
        'サーバー設定 →［スタンプ］→ スタンプをアップロード',
        '320×320ちょうど・512KB以内・APNGのみ受け付けられます',
      ];
    case 'discord-attachment':
      return [
        'ダウンロードしたGIFをチャット欄にドラッグして送信します',
        'APNGはDiscordのチャットでは動かない（1フレーム目だけ表示される）ため、この用途はGIFです',
      ];
    default:
      return target.notes;
  }
}

export function ResultDialog({ result, target, triggerWord, onClose, onLighten }: Props) {
  if (!result) return null;
  const over = result.bytes > target.maxBytes;
  const ratio = Math.round((result.bytes / target.maxBytes) * 100);

  return (
    <Dialog open onClose={onClose} title="書き出しできました">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="checker shrink-0 self-start rounded-lg p-2">
          <img src={result.url} alt="書き出し結果" className="max-h-[240px] max-w-[240px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-neutral-800 px-2 py-1 font-semibold">{result.format.toUpperCase()}</span>
            <span className={over ? 'text-red-400' : 'text-emerald-400'}>
              {fmtBytes(result.bytes)} / 上限 {fmtBytes(target.maxBytes)}（{ratio}%）
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <a
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-sky-400"
              href={result.url}
              download={result.filename}
            >
              ダウンロード
            </a>
            {over && <Button onClick={onLighten}>自動で軽くする</Button>}
            <Button variant="ghost" onClick={onClose}>続けて編集する</Button>
          </div>

          {over && (
            <p className="mb-3 text-xs text-red-400">
              上限を超えています。「自動で軽くする」を押すと、色数 → フレーム数 → エフェクト密度 → 寸法 の順で1段階ずつ落として作り直します。
            </p>
          )}

          <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-neutral-400">{target.label} での使い方</h3>
          <ol className="list-inside list-decimal space-y-1 text-xs text-neutral-300">
            {usage(target, triggerWord).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-neutral-500">ファイル名: {result.filename}</p>
        </div>
      </div>
    </Dialog>
  );
}
