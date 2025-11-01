import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/EcomX-website',
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'global': 'window', // 👈 Fix: Add this line to define global
  },
})