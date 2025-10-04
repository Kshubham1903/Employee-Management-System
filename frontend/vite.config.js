// frontend/vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173, 
//     proxy: {
//       '/api': { target: 'http://localhost:3000', changeOrigin: true },
//       '/login': { target: 'http://localhost:3000', changeOrigin: true },
//       '/register': { target: 'http://localhost:3000', changeOrigin: true },
//       '/logout': { target: 'http://localhost:3000', changeOrigin: true },
//       '/check-auth': { target: 'http://localhost:3000', changeOrigin: true },
//     }
//   }
// });
// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, 
    proxy: {
      // ... (Proxy settings remain the same)
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/login': { target: 'http://localhost:3000', changeOrigin: true },
      '/register': { target: 'http://localhost:3000', changeOrigin: true },
      '/logout': { target: 'http://localhost:3000', changeOrigin: true },
      '/check-auth': { target: 'http://localhost:3000', changeOrigin: true },
    }
  },
  // --- CRITICAL ADDITION: Force reload on dependency change ---
  optimizeDeps: {
    include: ['react-router-dom', 'axios'],
  },
  css: {
    // Force Vite to reprocess all postCSS dependencies
    postcss: './postcss.config.js', 
  },
  // -----------------------------------------------------------
});