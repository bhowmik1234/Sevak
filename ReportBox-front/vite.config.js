import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` controls the public path assets are served from.
// - GitHub Pages project site -> set VITE_BASE=/Sevak/ at build time.
// - Vercel / Cloudflare Pages / custom domain at root -> leave it as '/'.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
