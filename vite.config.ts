import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import Layouts from 'vite-plugin-vue-layouts'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    // 1. Pages must come before Layouts or Vue in some configurations
    Pages({
      dirs: 'src/pages',
    }),
    // 2. Layouts plugin handles the 'virtual:generated-layouts' import
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default',
    }),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    watch: {
      usePolling: true, // Forces Vite to check for changes manually
      interval: 100, // Check every 100ms
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      overlay: true, // Shows an error overlay in the browser if a change breaks the app
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Change this to your backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
