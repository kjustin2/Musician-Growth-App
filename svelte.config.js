import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/Musician-Growth-App' : '',
    },
    // Note: files.routes, files.lib, and files.appTemplate are deprecated
    // but still functional. In newer versions, use the default structure or
    // configure via vite.config.ts
    files: {
      routes: 'src/frontend/routes',
      lib: 'src/frontend/lib',
      appTemplate: 'src/frontend/app.html',
    },
  },
};

export default config;
