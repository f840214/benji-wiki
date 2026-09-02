import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base 對應 GitHub Pages 的路徑 https://<帳號>.github.io/benji-wiki/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/benji-wiki/',
})
