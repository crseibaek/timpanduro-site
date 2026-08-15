// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://timpanduro.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
