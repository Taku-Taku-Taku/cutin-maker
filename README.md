# ココフォリア カットイン素材ジェネレータ

任意の日本語テキストから、虹グラデ＋袋文字＋集中線などの装飾アニメ画像
（**APNG / GIF / PNG**）を生成するWebアプリ。設計は `仕様書.md` を参照。

```bash
npm run dev      # 開発サーバ
npm test         # 単体テスト（レイアウト・カラー・ループ保証）
npm run build    # 型チェック + 本番ビルド（dist/、GitHub Pages 用に相対パス）
```

## 構成

```
src/
  core/          # UI非依存。DOM の canvas 以外に依存しない
    types.ts color.ts random.ts easing.ts fonts.ts targets.ts
    text/layout.ts text/draw.ts text/deco/*   # 文字装飾（1ファイル1デコレータ）
    layers/*                                   # 演出レイヤー（1ファイル1レイヤー）
    render.ts frames.ts templates.ts serialize.ts
  worker/encode.worker.ts   # ImageData[] -> APNG(UPNG.js) / GIF(gifenc)
  ui/                       # React。プレビューは rAF で実時間ループ
```

拡張は **1ファイル追加 + レジストリに1行** で済む（`text/deco/index.ts`, `layers/index.ts`,
`targets.ts` の `TARGETS`）。
