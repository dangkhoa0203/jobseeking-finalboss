import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this from /jobseeking-finalboss/, not the domain root — local dev
  // and the Render-deployed API itself are unaffected, this only changes asset/base paths.
  base: process.env.BASE_PATH || '/',
})
