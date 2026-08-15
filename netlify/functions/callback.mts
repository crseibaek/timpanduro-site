import type { Config, Context } from '@netlify/functions';

/**
 * Step 2 of logging in to the admin.
 *
 * GitHub sends the browser back here with a one-time code. We swap that code
 * for an access token, then hand the token to the admin window that opened
 * this popup, using the message format Sveltia/Decap CMS expects.
 */

function page(status: 'success' | 'error', payload: unknown) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Login</title></head>
<body style="font:15px system-ui;background:#0c0c0d;color:#f2f0ed;display:grid;place-items:center;height:100vh;margin:0">
<p>${status === 'success' ? 'Logget ind. Du kan lukke dette vindue.' : 'Login mislykkedes.'}</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  function send(origin) {
    if (window.opener) window.opener.postMessage(message, origin || '*');
  }
  // The admin answers our hello, and we reply to exactly that origin.
  window.addEventListener('message', function (e) { send(e.origin); }, false);
  send('*');
  setTimeout(function () { window.close(); }, 1500);
})();
</script>
</body></html>`;
}

export default async (req: Request, _ctx: Context) => {
  const html = (body: string, status = 200) =>
    new Response(body, {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return html(page('error', { message: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET missing' }), 503);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) {
    return html(page('error', { message: 'No code returned by GitHub' }), 400);
  }

  // Check the state we set in /auth came back unchanged.
  const cookie = req.headers.get('cookie') || '';
  const saved = /(?:^|;\s*)oauth_state=([^;]+)/.exec(cookie)?.[1];
  if (!saved || saved !== state) {
    return html(page('error', { message: 'State mismatch — please try logging in again' }), 400);
  }

  let token: string | undefined;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    const data: any = await res.json();
    if (data.error) {
      return html(page('error', { message: data.error_description || data.error }), 400);
    }
    token = data.access_token;
  } catch (e) {
    return html(page('error', { message: 'Could not reach GitHub' }), 502);
  }

  if (!token) {
    return html(page('error', { message: 'No access token returned' }), 400);
  }

  return new Response(page('success', { token, provider: 'github' }), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      // Burn the state cookie.
      'set-cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    },
  });
};

export const config: Config = {
  path: '/callback',
};
