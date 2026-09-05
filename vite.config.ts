import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 配信を想定して相対パスで出す
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  // WSL2 から Windows のブラウザで開けるよう、既定で全インタフェースに待ち受ける
  server: { host: true, port: 5177, strictPort: true },
});
