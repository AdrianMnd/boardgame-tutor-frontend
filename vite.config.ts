import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Escapa el origen de la API para poder usarlo dentro de una
  // expresión regular — las reglas de caché necesitan saber
  // contra qué dominio comparar, y ese dominio cambia entre
  // desarrollo local y producción según VITE_API_URL.
  const apiOrigin = (env.VITE_API_URL || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-icons/*.png'],
        manifest: {
          name: 'BoardGame Tutor',
          short_name: 'BG Tutor',
          description: 'Pregunta dudas de reglas de tus juegos de mesa favoritos, con respuestas citando la página exacta del reglamento.',
          lang: 'es',
          start_url: '/',
          display: 'standalone',
          background_color: '#0e1015',
          theme_color: '#0e1015',
          icons: [
            { src: 'pwa-icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          // El límite por defecto (2MB) se queda corto para el
          // chunk del visor de PDF (~420KB) más pdf.worker
          // (~1MB) — sin subirlo, ese archivo se quedaría fuera
          // de la precarga y el visor no funcionaría sin red.
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              // Lista de juegos: red primero, pero con algo en
              // caché para que la app no se quede vacía sin
              // conexión — solo desactualizada como mucho.
              urlPattern: new RegExp(`^${apiOrigin}/api/games$`),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'games-list',
                expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 }
              }
            },
            {
              // Portadas y manuales PDF: una vez consultados, no
              // cambian — caché primero, sin volver a pedirlos a
              // la red en cada visita. Esto es lo que permite
              // reabrir un reglamento ya visto sin conexión.
              urlPattern: new RegExp(`^${apiOrigin}/api/games/[^/]+/(cover|manual)$`),
              handler: 'CacheFirst',
              options: {
                cacheName: 'game-assets',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
            // Todo lo demás (chat, auth, favoritos...) sin
            // ninguna regla — sigue yendo directo a la red,
            // como debe ser para algo que necesita estar al día.
          ]
        }
      })
    ],
  }
})
