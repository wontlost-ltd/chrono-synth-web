/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      manifest: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(configDir, 'src'),
      '@chrono/contracts': resolve(configDir, 'packages/contracts/dist/index.js'),
      '@chrono/design-tokens': resolve(configDir, 'packages/design-tokens/dist/index.js'),
      '@chrono/sync-engine': resolve(configDir, 'packages/sync-engine/dist/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    onConsoleLog: (log) => {
      // Suppress sourcemap warnings from vendored @chrono/* dist files (sources not committed)
      if (log.includes('Sourcemap for') && log.includes('points to missing source files')) return false;
    },
  },
  build: {
    rollupOptions: {
      output: {
        /* Vite 8 ships rolldown by default, which only accepts the function
         * form of manualChunks. Mirror the previous static map by checking
         * id against well-known package roots. */
        manualChunks(id: string): string | undefined {
          if (id.includes('/node_modules/recharts/') || id.includes('/node_modules/d3-sankey/')) {
            return 'charts';
          }
          if (id.includes('/node_modules/@tanstack/react-query/')) {
            return 'query';
          }
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router-dom/')
          ) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/healthz': 'http://localhost:3000',
      '/readyz': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
    },
  },
});
