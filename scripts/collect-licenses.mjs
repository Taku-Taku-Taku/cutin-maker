// 同梱物のライセンス全文を public/licenses/ に集める。
// フォントは自前配信＝再配布に当たるため、OFL の全文同梱が必須。
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const OUT = 'public/licenses';

const FONT_PKGS = [
  '@fontsource/noto-sans-jp',
  '@fontsource/m-plus-rounded-1c',
  '@fontsource/reggae-one',
  '@fontsource/rocknroll-one',
  '@fontsource/shippori-mincho-b1',
  '@fontsource/dotgothic16',
];

const OSS_PKGS = ['react', 'react-dom', 'upng-js', 'gifenc', 'vite', 'tailwindcss'];

async function licenseOf(pkg) {
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license']) {
    const p = `node_modules/${pkg}/${name}`;
    if (existsSync(p)) return readFile(p, 'utf8');
  }
  return null;
}

await mkdir(OUT, { recursive: true });

// フォントはすべて SIL OFL 1.1。全文を1つ置き、書体ごとの著作権表示を添える
let ofl = null;
const notices = [];
for (const pkg of FONT_PKGS) {
  const text = await licenseOf(pkg);
  if (!text) {
    console.warn(`[licenses] ${pkg} のライセンスが見つかりません`);
    continue;
  }
  if (!ofl) ofl = text;
  // LICENSE の1行目はパッケージによって形が違うので、metadata.json の attribution を使う
  const meta = JSON.parse(await readFile(`node_modules/${pkg}/metadata.json`, 'utf8'));
  // attribution はウェイトごとの表記が連結されていることがあるので1件目だけ残す
  const attribution = (meta.license?.attribution ?? '').split(/\s(?=[A-Za-z0-9-]+\.ttf:)/)[0].trim();
  notices.push(`${meta.family} — ${attribution} (${meta.license?.type ?? 'OFL-1.1'})`);
}
if (ofl) await writeFile(`${OUT}/OFL.txt`, ofl);
await writeFile(`${OUT}/fonts.txt`, `${notices.join('\n')}\n\nいずれも SIL Open Font License 1.1（OFL.txt）で配布されています。\n`);

for (const pkg of OSS_PKGS) {
  const text = await licenseOf(pkg);
  if (text) await cp(`node_modules/${pkg}/${(await fileNameOf(pkg)) ?? 'LICENSE'}`, `${OUT}/${pkg.replace('/', '-')}.txt`);
}

async function fileNameOf(pkg) {
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license']) {
    if (existsSync(`node_modules/${pkg}/${name}`)) return name;
  }
  return null;
}

console.log(`[licenses] ${OUT} に出力しました`);
