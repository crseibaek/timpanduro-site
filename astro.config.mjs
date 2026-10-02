// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { CATEGORY_IDS } from './src/data/categories.ts';

/**
 * The admin dropdown (public/admin/config.yml) cannot import from code, so it
 * keeps its own copy of the category ids. Stop the build if the two drift
 * apart — that drift is what once broke filtering on the live site.
 */
function categoriesInSync() {
  return {
    name: 'categories-in-sync',
    hooks: {
      'astro:config:setup': () => {
        const lines = readFileSync('public/admin/config.yml', 'utf8').split('\n');
        const start = lines.findIndex((l) => /^\s+name: categories\s*$/.test(l));
        if (start === -1) throw new Error('[categories] No "categories" field in public/admin/config.yml');
        const fieldIndent = lines[start - 1].search(/\S/);
        const ids = [];
        for (const line of lines.slice(start + 1)) {
          if (line.trim() && line.search(/\S/) <= fieldIndent) break;
          const m = line.match(/value:\s*'?([\w-]+)'?/);
          if (m) ids.push(m[1]);
        }
        const want = [...CATEGORY_IDS].sort().join(', ');
        const got = [...ids].sort().join(', ');
        if (want !== got) {
          throw new Error(
            `[categories] public/admin/config.yml lists [${got}] but src/data/categories.ts has [${want}]. Make them match.`
          );
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://timpanduro.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
  integrations: [categoriesInSync()],
});
