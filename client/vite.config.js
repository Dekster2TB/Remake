// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Marketplace Ropa', // Nombre real de tu app
        short_name: 'RopaApp',
        description: 'Compra y venta de ropa de segunda mano',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // ESTO ES CLAVE: Elimina la barra del navegador
        icons: [
          {
            src: '/icon-192x192.png', // Debes crear estos iconos
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});