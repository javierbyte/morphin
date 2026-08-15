import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from javier.xyz/morphin via a vercel rewrite to javierbyte.github.io/morphin.
export default defineConfig({
  base: '/morphin/',
  plugins: [react()],
  build: { outDir: 'dist' }
});
