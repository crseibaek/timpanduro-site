import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../data/ui';
import { pick } from '../data/ui';
import site from '../data/site.json';
import { vimeoThumbnails } from './vimeo';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type Production = CollectionEntry<'productions'>;

/** Everything publishable, in the order it should appear on the wall. */
export async function getProductions(): Promise<Production[]> {
  const all = await getCollection('productions', (p) => !p.data.draft);
  return all.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return b.data.year - a.data.year;
  });
}

/**
 * Work out the poster frame for each production, once per build.
 *   1. an image uploaded in the admin
 *   2. otherwise Vimeo's own thumbnail
 *   3. otherwise a local still, if one exists under /thumbs
 *   4. otherwise a neutral placeholder
 */
export async function resolveThumbnails(
  items: Production[]
): Promise<Map<string, string>> {
  const needsVimeo = items
    .filter((p) => !p.data.thumbnail && p.data.vimeoId)
    .map((p) => p.data.vimeoId!);

  const fromVimeo = needsVimeo.length
    ? await vimeoThumbnails(needsVimeo)
    : new Map<string, string | null>();

  const out = new Map<string, string>();
  for (const p of items) {
    const own = p.data.thumbnail;
    const vim = p.data.vimeoId ? fromVimeo.get(p.data.vimeoId) : null;
    out.set(p.id, own || vim || localStill(p.id) || '/img/placeholder.svg');
  }
  return out;
}

/** A hand-made still under public/thumbs, if one happens to be there. */
function localStill(id: string): string | null {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    if (existsSync(join('public', 'thumbs', `${id}.${ext}`))) {
      return `/thumbs/${id}.${ext}`;
    }
  }
  return null;
}

/** Shape a production for the client-side wall/lightbox script. */
export function toCard(p: Production, lang: Lang, thumbs?: Map<string, string>) {
  return {
    id: p.id,
    title: pick(lang, p.data.title_da, p.data.title_en),
    client: p.data.client ?? '',
    year: p.data.year,
    category: p.data.category,
    role: pick(lang, p.data.role_da, p.data.role_en),
    description: pick(lang, p.data.description_da, p.data.description_en),
    vimeoId: p.data.vimeoId ?? '',
    thumb: thumbs?.get(p.id) || p.data.thumbnail || `/thumbs/${p.id}.jpg`,
  };
}

export type Card = ReturnType<typeof toCard>;

export function categoryLabel(id: string, lang: Lang): string {
  const c = site.categories.find((x) => x.id === id);
  if (!c) return id;
  return lang === 'en' ? c.label_en : c.label_da;
}
