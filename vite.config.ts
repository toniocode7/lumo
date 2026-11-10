import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the build works on GitHub Pages under /<repo>/.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // New versions install in the background and apply on the next launch.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lumo',
        short_name: 'Lumo',
        description: 'Tes tâches font grandir une créature de lumière.',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#11131a',
        theme_color: '#11131a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the app needs, fonts included, so it works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // French only needs the Latin font files; other alphabets load on demand if ever needed.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
