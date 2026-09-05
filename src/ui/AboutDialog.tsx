import { FONTS } from '../core/fonts';
import { Dialog } from './kit';

export const REPO_URL = 'https://github.com/Taku-Taku-Taku/cutin-maker';

const OSS = [
  { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'UPNG.js', license: 'MIT', url: 'https://github.com/photopea/UPNG.js' },
  { name: 'gifenc', license: 'MIT', url: 'https://github.com/mattdesl/gifenc' },
  { name: 'Vite', license: 'MIT', url: 'https://github.com/vitejs/vite' },
  { name: 'Tailwind CSS', license: 'MIT', url: 'https://github.com/tailwindlabs/tailwindcss' },
];

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</h3>;
}

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="このツールについて">
      <div className="max-h-[70vh] overflow-y-auto pr-1 text-sm leading-relaxed text-neutral-300">
        <p>
          入力した文字を、ループするアニメ画像（APNG / GIF / PNG）にして書き出すツールです。
          オンラインセッションツールのカットイン素材を想定しています。
        </p>

        <H>非公式であること</H>
        <p>
          本ツールは<strong className="text-neutral-100">個人が作った非公式のツール</strong>です。
          「ココフォリア」は株式会社ccfolia、「Discord」は Discord Inc.、
          「クトゥルフ神話TRPG」は Chaosium Inc. および各権利者に帰属します。
          いずれとも関係がなく、承認・提携・後援を受けていません。各サービス名は
          用途を示すためだけに使っています。
        </p>

        <H>入力したものの扱い</H>
        <p>
          文字の入力から画像の生成まで<strong className="text-neutral-100">すべてブラウザの中だけで完結</strong>します。
          入力した文字も生成した画像もサーバへ送信しません。アクセス解析も Cookie も使っていません。
          「共有URL」は設定内容を URL の <code className="text-neutral-400">#</code> 以降に埋め込んだもので、
          この部分はブラウザからサーバへ送信されません。
        </p>

        <H>生成した画像について</H>
        <p>
          生成物の権利は入力した方に帰属します。利用は自己責任でお願いします。
          書体の権利は各フォント作者にあり、生成した画像の配布・商用利用は
          各フォントのライセンス（下記 SIL OFL 1.1）と、投稿先サービスの規約に従ってください。
        </p>

        <H>免責</H>
        <p>
          本ツールは現状有姿で提供され、動作・生成物・利用結果について一切保証しません。
          利用によって生じた損害について作者は責任を負いません。
        </p>

        <H>ライセンス</H>
        <p className="mb-1">
          本ツール本体は MIT License（
          <a className="text-sky-300 underline" href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer noopener">
            全文
          </a>
          ）。
        </p>
        <p className="mb-1">使用しているソフトウェア:</p>
        <ul className="mb-2 list-disc pl-5 text-[13px] text-neutral-400">
          {OSS.map((o) => (
            <li key={o.name}>
              <a className="underline hover:text-neutral-200" href={o.url} target="_blank" rel="noreferrer noopener">
                {o.name}
              </a>{' '}
              — {o.license}
            </li>
          ))}
        </ul>
        <p className="mb-1">
          同梱している書体（すべて{' '}
          <a className="text-sky-300 underline" href="./licenses/OFL.txt" target="_blank" rel="noreferrer noopener">
            SIL Open Font License 1.1
          </a>
          ）:
        </p>
        <ul className="list-disc pl-5 text-[13px] text-neutral-400">
          {FONTS.map((f) => (
            <li key={f.id}>
              {f.family.replace(/"/g, '')}（{f.label}）
            </li>
          ))}
        </ul>

        <H>ソースコード・不具合の報告</H>
        <p>
          <a className="text-sky-300 underline" href={REPO_URL} target="_blank" rel="noreferrer noopener">
            {REPO_URL.replace('https://', '')}
          </a>
        </p>
      </div>
    </Dialog>
  );
}

/** 全画面共通のフッタ。非公式である旨は畳まずに常時出す */
export function Footer({ onAbout }: { onAbout: () => void }) {
  return (
    <footer className="mx-auto mt-8 max-w-[1400px] border-t border-neutral-800 px-4 py-4 text-[11px] text-neutral-500">
      <p>
        個人が作った非公式ツールです。ココフォリア（株式会社ccfolia）および各権利者とは関係がありません。
        入力した文字と生成した画像はブラウザ内で完結し、サーバへ送信されません。
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <button type="button" onClick={onAbout} className="underline hover:text-neutral-300">
          このツールについて / ライセンス
        </button>
        <a href={REPO_URL} target="_blank" rel="noreferrer noopener" className="underline hover:text-neutral-300">
          GitHub
        </a>
      </div>
    </footer>
  );
}
