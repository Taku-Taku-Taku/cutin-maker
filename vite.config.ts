import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Fontsource の @font-face は woff2 と woff の2つを並べている。
 * woff しか読めないブラウザは対象外なので、woff への参照を落として
 * dist に同じフォントが2形式ぶん出るのを防ぐ（配信サイズが半分になる）。
 */
function woff2Only(): Plugin {
  return {
    name: 'fontsource-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@fontsource') || !id.endsWith('.css')) return null;
      return { code: code.replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, ''), map: null };
    },
  };
}

// Cloudflare Pages / GitHub Pages のどちらでも動くよう相対パスで出す
export default defineConfig({
  base: './',
  plugins: [woff2Only(), react()],
  worker: { format: 'es' },
  // WSL2 から Windows のブラウザで開けるよう、既定で全インタフェースに待ち受ける
  server: { host: true, port: 5177, strictPort: true },
});
