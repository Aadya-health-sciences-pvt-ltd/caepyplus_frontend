import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env so we can read VITE_BASE_PATH at config time
  const env = loadEnv(mode, process.cwd(), '');
  const rawBase = env.VITE_BASE_PATH ?? '';
  const base = rawBase ? `/${rawBase.replace(/^\/|\/$/g, '')}/` : '/';

  return {
    base,
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  };
})

