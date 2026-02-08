import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages (https://<user>.github.io/<repo>/) needs an explicit base path.
  base: '/Typing-Game-React/',
})
