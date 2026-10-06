import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// عند النشر على GitHub Pages يُخدم الموقع تحت /mbta/
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/mbta/' : '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 800 },
}))
