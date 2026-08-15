import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * Records that an offer page was opened.
 *
 * Deliberately minimal: no cookies, no IP, no third party. We store a counter
 * and a small ring buffer of timestamps per offer, which is all that is needed
 * to answer "did they look, and when?".
 */

type Record = {
  slug: string;
  customer: string;
  views: number;
  uniques: number;
  first: string;
  last: string;
  recent: { at: string; ref: string; repeat: boolean }[];
};

export default async (req: Request, _ctx: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const slug = String(body?.slug || '').slice(0, 120);
  if (!slug || !/^[a-z0-9._-]+$/i.test(slug)) {
    return new Response('Bad request', { status: 400 });
  }

  const customer = String(body?.customer || '').slice(0, 200);
  const repeat = Boolean(body?.repeat);
  // Keep only the referrer's origin — enough to tell "forwarded from webmail"
  // from "typed the link", without logging a full URL.
  let ref = '';
  try {
    ref = body?.ref ? new URL(String(body.ref)).hostname : '';
  } catch {
    ref = '';
  }

  const now = new Date().toISOString();
  const store = getStore({ name: 'offer-views', consistency: 'strong' });

  const existing = (await store.get(slug, { type: 'json' }).catch(() => null)) as Record | null;

  const rec: Record = existing ?? {
    slug,
    customer,
    views: 0,
    uniques: 0,
    first: now,
    last: now,
    recent: [],
  };

  rec.customer = customer || rec.customer;
  rec.views += 1;
  if (!repeat) rec.uniques += 1;
  rec.last = now;
  rec.recent.unshift({ at: now, ref, repeat });
  rec.recent = rec.recent.slice(0, 40);

  await store.setJSON(slug, rec);

  return new Response(null, { status: 204 });
};

export const config: Config = {
  path: '/api/track',
};
