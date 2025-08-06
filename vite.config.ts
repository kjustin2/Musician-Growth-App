import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  root: 'src/frontend',
  base: process.env.NODE_ENV === 'production' ? '/Musician-Growth-App/' : '/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  publicDir: '../../public',
  resolve: {
    alias: {
      $components: './components',
      $logic: './logic',
    },
  },
});
