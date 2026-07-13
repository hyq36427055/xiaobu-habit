import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  // Relative assets keep the same build working on GitHub Pages and domestic hosting.
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['lots-integrating-decided-encountered.trycloudflare.com'],
  },
});
