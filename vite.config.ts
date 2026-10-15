import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /* Stable vendor chunks: long-lived caching for React and anime.js,
           and keeps the app chunk under the size warning threshold. */
        manualChunks(id: string) {
          const path = id.replace(/\\/g, '/');
          if (path.includes('/node_modules/animejs/')) return 'anime';
          if (
            path.includes('/node_modules/react/') ||
            path.includes('/node_modules/react-dom/') ||
            path.includes('/node_modules/react-router') ||
            path.includes('/node_modules/scheduler/')
          ) {
            return 'react';
          }
        },
      },
    },
  },
});
