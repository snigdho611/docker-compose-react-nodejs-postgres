import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: true, // Autorise tous les hôtes (le plus simple pour les previews)
    // OU si tu veux être plus restrictif :
    // allowedHosts: ['.sslip.io'],
  },
  plugins: [react()],
})
