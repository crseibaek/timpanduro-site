import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * Returns the view log. Protected by a shared key held in the STATS_KEY
 * environment variable on Netlify. Not Fort Knox — but this data is only
 * "someone opened a page", and it keeps it off the open web.
 */
export default async (req: Request, _ctx: Context) => {
  const key = process.env.STATS_KEY;
  if (!key) {
    return Response.json(
      { error: 'STATS_KEY is not set in the Netlify environment variables.' },
      { status: 503 }
    );
  }

  const given =
    new URL(req.url).searchParams.get('key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

  if (given !== key) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const store = getStore({ name: 'offer-views', consistency: 'strong' });
  const { blobs } = await store.list();

  const rows = await Promise.all(
    blobs.map(async (b) => {
      const rec = await store.get(b.key, { type: 'json' }).catch(() => null);
      return rec;
    })
  );

  const clean = rows
    .filter(Boolean)
    .sort((a: any, b: any) => (a.last < b.last ? 1 : -1));

  return Response.json(
    { offers: clean },
    { headers: { 'cache-control': 'no-store' } }
  );
};

export const config: Config = {
  path: '/api/stats',
};
