import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// すべてクライアント完結。サーバー/バックエンドは使わない。
// GitHub Pages（プロジェクトサイト）はサブパス配信なので、本番ビルドのみ base を付ける。
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/osanpo-bingo/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // 単一の public/icon.svg から各サイズの PWA アイコンを自動生成する
        pwaAssets: {
          image: 'public/icon.svg',
          preset: 'minimal-2023',
        },
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'おさんぽビンゴ',
          short_name: 'おさんぽビンゴ',
          description: '散歩しながら遊ぶビンゴアプリ。見つけたらタップ、長押しで写真も。',
          lang: 'ja',
          theme_color: '#FFF6E9',
          background_color: '#FFF6E9',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // Google Fonts をオフラインでも使えるようにキャッシュ
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-stylesheets' },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    server: {
      host: true,
    },
  }
})
