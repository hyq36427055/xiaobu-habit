import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/xiaobu-habit/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['lots-integrating-decided-encountered.trycloudflare.com'],
  },
});
