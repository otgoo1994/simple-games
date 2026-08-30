import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@public': path.resolve(__dirname, './public'),
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
    },
  },
  build: {
    outDir: 'build',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // ['log', 'info'] console remove settings when true
        drop_debugger: false,
      },
    },
    // commonjsOptions: {
    //   include: ['node_modules/buffer/index.js'],
    // },
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
  define: {
    // enviroment variables
    global: 'window',
  },
  server: {
    // Development server port
    port: 5175,
    cors: true,
    // proxy: {
    //   // '/api': {
    //   //   target: process.env.VITE_BASE_URL,
    //   //   changeOrigin: true,
    //   //   rewrite: (path) => path.replace(/^\/api/, ''),
    //   // },
    //   '/backend': {
    //     target: 'http://192.168.0.73:5080',
    //     // target: 'https://cjlogis-api.radcns.com',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/backend/, ''),
    //   },
    // },
  },
});
