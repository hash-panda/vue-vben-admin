import { defineConfig } from '@vben/vite-config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(async () => {
  return {
    application: {},
    plugins: [
      nodePolyfills(),
    ],
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
