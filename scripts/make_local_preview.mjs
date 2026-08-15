/**
 * Turns dist/ into preview/ — the same site, but with relative links so it can
 * be opened by double-clicking preview/index.html, with no server.
 *
 * This exists only so the design can be looked at before the site is deployed.
 * The real site always runs from dist/ on Netlify.
 */
import { cp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, relative, dirname, sep } from 'node:path';

const SRC = 'dist';
const OUT = 'preview';

await rm(OUT, { recursive: true, force: true });
await cp(SRC, OUT, { recursive: true });

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** "/om" -> "../om/index.html" from a file two levels down. */
function rewrite(target, prefix) {
  if (
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.startsWith('/api/')
  )
    return null;
  let t = target.replace(/^\//, '');
  const [pathPart, query = ''] = t.split(/(?=[?#])/, 2);
  const last = pathPart.split('/').pop() || '';
  const isFile = last.includes('.');
  const resolved = isFile
    ? pathPart
    : pathPart === ''
      ? 'index.html'
      : pathPart.replace(/\/$/, '') + '/index.html';
  return prefix + resolved + query;
}

let count = 0;
for await (const file of walk(OUT)) {
  if (!file.endsWith('.html')) continue;
  const depth = relative(OUT, dirname(file)).split(sep).filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  let html = await readFile(file, 'utf8');

  // href/src/action attributes
  html = html.replace(
    /(\b(?:href|src|action)=")(\/[^"]*)"/g,
    (m, attr, target) => {
      const r = rewrite(target, prefix);
      return r ? `${attr}${r}"` : m;
    }
  );

  // paths that live inside the inlined JSON catalogue / style attributes
  html = html.replace(/"\/thumbs\//g, `"${prefix}thumbs/`);
  html = html.replace(/'\/thumbs\//g, `'${prefix}thumbs/`);
  html = html.replace(/url\('\/thumbs\//g, `url('${prefix}thumbs/`);
  html = html.replace(/"\/img\//g, `"${prefix}img/`);

  await writeFile(file, html);
  count++;
}

// The admin needs a server and a GitHub repo; it cannot work from disk.
await rm(join(OUT, 'admin'), { recursive: true, force: true });

console.log(`Rewrote ${count} pages into ${OUT}/ — open ${OUT}/index.html`);
