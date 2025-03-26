import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Sat-expense/',
  build: {
    outDir: '../../dist',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v3'),
      },
    },
  },
});
