import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages usa /Santa-Cruz/. O servidor Node usa / na raiz.
  base: process.env.DEPLOY_TARGET === 'github-pages' ? '/Santa-Cruz/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/', import.meta.url))
    }
  }
});
