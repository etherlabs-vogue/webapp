import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const { PORT = 3001 } = process.env;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/terminals': {
        target: `ws://localhost:${PORT}`,
        ws:true
      },
    },
  },
  build: {
    outDir: 'dist/client',
  },
})
