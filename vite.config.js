import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: browser calls /api/... on :5173 and Vite forwards it to the backend (no CORS setup needed).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
