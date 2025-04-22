import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/order-owners': 'http://localhost:5001',
      '/save-data': 'http://localhost:5001'
    }
  }


})
