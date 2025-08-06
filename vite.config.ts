import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  root: 'src/frontend',
  base: process.env.NODE_ENV === 'production' ? '/svelte-dexie-app/' : '/',
  build: {
    outDir: '../../dist',
  },
  resolve: {
    alias: {
      $components: './components',
      $logic: './logic',
    },
  },
});
