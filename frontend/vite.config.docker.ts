// Use this vite.config when running inside Docker
// It enables HMR to work across the container network
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    host: '0.0.0.0',          // listen on all interfaces inside container
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',       // HMR connects back to host machine
      port: 5173,
    },
  },
});
