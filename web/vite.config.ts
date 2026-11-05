import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Portraits load as separate files, so 180 drawings don't swell the main script.
  build: {
    assetsInlineLimit: (file) => (file.includes('/art/avatars/') ? false : undefined),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
      manifest: {
        name: 'Level Goblin',
        short_name: 'Level Goblin',
        description: 'A free, ad-free level tracker for fantasy card games.',
        lang: 'en',
        start_url: '/',
        display: 'standalone',
        background_color: '#f3e4c3',
        theme_color: '#f3e4c3',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
