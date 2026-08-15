/**
 * Looks up Vimeo poster frames at build time.
 *
 * This is why the "Still" field in the admin can be left empty: if a
 * production has a Vimeo id, we ask Vimeo for its thumbnail while the site is
 * being built and bake the URL into the HTML. Nothing is requested from Vimeo
 * when a visitor loads the page.
 *
 * Failures are not fatal — a missing thumbnail falls back to the local
 * placeholder, and the build carries on.
 */

const cache = new Map<string, string | null>();

async function fetchOne(id: string): Promise<string | null> {
  const url =
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
      `https://vimeo.com/${id}`
    )}&width=1280`;
  try {
    const ctl = AbortSignal.timeout(6000);
    const res = await fetch(url, { signal: ctl });
    if (!res.ok) return null;
    const data: any = await res.json();
    const thumb: string | undefined = data?.thumbnail_url;
    if (!thumb) return null;
    // Vimeo returns a sized URL like ..._295x166. Ask for something wall-sized.
    return thumb.replace(/_\d+x\d+(?=\.\w+$|$)/, '_1280x720');
  } catch {
    return null;
  }
}

/** Resolve many ids at once, with a small concurrency cap. */
export async function vimeoThumbnails(ids: string[]): Promise<Map<string, string | null>> {
  const todo = [...new Set(ids.filter(Boolean))].filter((id) => !cache.has(id));

  const LIMIT = 8;
  for (let i = 0; i < todo.length; i += LIMIT) {
    const batch = todo.slice(i, i + LIMIT);
    const got = await Promise.all(batch.map(fetchOne));
    batch.forEach((id, n) => cache.set(id, got[n]));
  }

  const missing = todo.filter((id) => !cache.get(id));
  if (missing.length) {
    console.warn(
      `[vimeo] No thumbnail for ${missing.length} id(s): ${missing.join(', ')}. ` +
        `Falling back to the local still. Is the video private or the id wrong?`
    );
  }

  return cache;
}
