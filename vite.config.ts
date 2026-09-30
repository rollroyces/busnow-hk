import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'BusNow · HK Bus',
        short_name: 'BusNow',
        description: 'Real-time Hong Kong bus arrivals · 即時到站時間',
        theme_color: '#1c1412',
        background_color: '#1c1412',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(data\.etabus\.gov\.hk|rt\.data\.gov\.hk)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hk-bus-api',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    target: 'es2020',
    sourcemap: false
  }
});
