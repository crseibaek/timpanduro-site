import type { Config, Context } from '@netlify/functions';

/**
 * Step 1 of logging in to the admin.
 *
 * The admin sends the browser here. We bounce it on to GitHub's login screen.
 * GitHub then sends it back to /callback with a one-time code.
 *
 * Needs two environment variables on Netlify:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET   (used in /callback, not here)
 */
export default async (req: Request, _ctx: Context) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response(
      'GITHUB_CLIENT_ID is not set in the Netlify environment variables.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const url = new URL(req.url);
  // "repo" is required so the admin can write to a private repository.
  const scope = url.searchParams.get('scope') || 'repo,user';
  const state = crypto.randomUUID();

  const target = new URL('https://github.com/login/oauth/authorize');
  target.searchParams.set('client_id', clientId);
  target.searchParams.set('redirect_uri', `${url.origin}/callback`);
  target.searchParams.set('scope', scope);
  target.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      location: target.toString(),
      // Round-trips with GitHub so /callback can prove the reply is ours.
      'set-cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
      'cache-control': 'no-store',
    },
  });
};

export const config: Config = {
  path: '/auth',
};
