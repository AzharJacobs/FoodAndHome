import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // optional

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }) // optional: opens a report in browser after build
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 2000, // increases limit from default 500 KB to 2000 KB
  },
});
