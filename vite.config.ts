import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⬇️ ADD THIS CONFIGURATION
  server: {
    // Try setting host to '0.0.0.0' or true to bind to all addresses
    // This often resolves connection issues on Windows/Linux.
    host: true, 
    port: 5173, // Keep the default port
  },
  // ⬆️ END ADDITION
})