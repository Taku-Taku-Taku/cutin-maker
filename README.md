# カットイン素材ジェネレータ

文字を入れるだけで、**ループするアニメ画像（APNG / GIF / PNG）**を作るブラウザツールです。
オンラインセッションツールのカットインや、Discord のスタンプ向けの素材を想定しています。

- テンプレを選ぶ → 文字を打ち替える → 書き出す、の3手順
- 文字の加工9種 × 配色8種 × エフェクト5種を、実際に描画したサムネから選べます
- **すべてブラウザ内で完結**します。入力した文字も生成した画像もサーバへ送信しません。
  アクセス解析も Cookie もありません
- 書体は自前で配信しているため、外部CDNに接続できない環境でも動きます

## 非公式であることについて

個人が作った非公式のツールです。「ココフォリア」は株式会社ccfolia、「Discord」は Discord Inc.、
「クトゥルフ神話TRPG」は Chaosium Inc. および各権利者に帰属します。
いずれとも関係がなく、承認・提携・後援を受けていません。

生成物の権利は入力した方に帰属します。配布・商用利用の可否は、同梱書体のライセンス
（すべて SIL OFL 1.1）と投稿先サービスの規約に従ってください。

## 開発

```bash
npm ci
npm run dev      # 開発サーバ（http://localhost:5177/）
npm test         # 単体テスト（レイアウト・カラー・ループ保証）
npm run build    # ライセンス収集 + 型チェック + 本番ビルド（dist/）
```

Node 20 以上（`.nvmrc` 参照）。

### 構成

```
src/
  core/          # UI非依存。DOM の canvas 以外に依存しない
    types.ts color.ts random.ts easing.ts fonts.ts targets.ts
    text/layout.ts text/draw.ts text/deco/*   # 文字装飾（1ファイル1デコレータ）
    layers/*                                   # エフェクトレイヤー（1ファイル1レイヤー）
    render.ts frames.ts templates.ts serialize.ts
  worker/encode.worker.ts   # ImageData[] -> APNG(UPNG.js) / GIF(gifenc)
  ui/                       # React。プレビューは rAF で実時間ループ
docs/仕様書.md               # 設計の元になった仕様
```

拡張は **1ファイル追加 + レジストリに1行** で済みます（`text/deco/index.ts`, `layers/index.ts`,
`targets.ts` の `TARGETS`）。

**ループの保証**：全レイヤーとモーションを周期1の `t` の関数として書き、乱数はフレームごとに
`deriveSeed(seed, salt)` で引き直します（フレーム間で乱数を進めるとループが破綻するため）。

### 公開（Cloudflare Workers 静的アセット）

`main` に push すると Cloudflare 側でビルドとデプロイが走ります。

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- 設定は `wrangler.jsonc`（`name` はダッシュボードのプロジェクト名と一致させる）

手元から直接上げる場合は `npm run deploy`（初回は `npx wrangler login` が必要）。
公開URLが決まったら `index.html` の `og:url` と `og:image` を差し替えてください。

## ライセンス

本体は [MIT License](./LICENSE)。同梱している書体はすべて SIL Open Font License 1.1 です
（全文と著作権表示は `public/licenses/`）。
