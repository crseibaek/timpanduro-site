# Setting up timpanduro.com

Written for someone who has never deployed a website before. Everything in
Parts 1–5 happens in a browser — you do not need to install anything on your
computer, and you never have to touch a terminal.

Budget about an hour, plus waiting time for DNS.

---

## First, the mental model

You are signing up for **two** services, and each has one job:

**GitHub — the filing cabinet.**
It holds the site's files. It is also, in effect, the database: every
production and every offer page is one small text file in there. When Tim
writes a new offer page in the admin, what actually happens is that a file gets
added to GitHub.

**Netlify — the workshop and the shop window.**
It watches GitHub. Whenever a file changes, Netlify rebuilds the site from
scratch and publishes the result at timpanduro.com. It also runs the four tiny
server-side bits this site needs: two for logging in to the admin, one that
records that an offer page was opened, one that reads that log back out.

That is the whole architecture. There is no server to maintain, no database to
back up, and no WordPress to keep updated. Both services are free at this size —
you will not be asked for a card.

**The one non-obvious idea:** the site is *rebuilt* every time something
changes, rather than assembled fresh for each visitor. That is why it will be
fast and why nothing can go down. The cost is that after saving in the admin,
there is roughly a one-minute wait before the change is live.

---

## Before you start

- A GitHub account — github.com, free.
- A Netlify account — netlify.com, free. **Sign up using your GitHub account**;
  it makes step 2 one click instead of several.
- Login to wherever timpanduro.com is registered, so you can change its DNS.
- The project folder, unzipped.

A note on whose accounts these should be: for now, use yours. Getting it working
matters more than getting the ownership right. Once Tim is happy, GitHub can
transfer the repository to his account and Netlify can transfer the site — both
are a few clicks, and it's much easier to do that later than to coordinate two
new accounts while debugging.

---

## Part 1 — Put the files on GitHub (10 minutes)

1. github.com → the **+** in the top right → **New repository**.
2. Name it `timpanduro-site`. Set it to **Private** — this matters, because the
   offer pages contain things you write to specific customers, and a public
   repository would let anyone read them. Do not tick "Add a README".
   **Create repository.**
3. On the empty repository page, click **uploading an existing file**.
4. Open the unzipped `portfolio` folder. Select everything *inside* it — `src`,
   `public`, `netlify`, `scripts`, `package.json`, `astro.config.mjs`,
   `netlify.toml`, `README.md`, `SETUP.md` — and drag it all into the browser
   window. Do not drag the `portfolio` folder itself, or everything ends up one
   level too deep.
5. Wait for the uploads to finish, then **Commit changes**.

**Done when:** the repository page lists `netlify`, `public`, `scripts`, `src`
and the loose files. If you see a single `portfolio` folder instead, you dragged
the wrong thing — delete it and redo step 4.

---

## Part 2 — Put it online (10 minutes)

1. netlify.com → **Add new site** → **Import an existing project** → **GitHub**.
2. Authorise Netlify when it asks, and pick `timpanduro-site`.
3. It will show a build command and a publish directory. They should already say
   `npm run build` and `dist`, because the project ships a `netlify.toml` that
   tells it so. If they are empty, type them in.
4. **Deploy.** The first build takes one to two minutes.

You now have a live site at some address like `sparkling-otter-4f2a.netlify.app`.

**This is your first real checkpoint — open it and click around.** The wall, the
three category filters, the lightbox, `/om`, and
`/offers/byhistorisk-museum` should all work. The admin and the stats page will
not work yet; that is expected.

If the build failed, click into the deploy and read the log from the bottom up.
The overwhelmingly likely cause is a file that did not upload in Part 1.

---

## Part 3 — Point the domain at it (15 minutes, plus waiting)

In Netlify: **Domain management** → **Add a domain** → `timpanduro.com`.

Netlify will offer you two routes. Either is fine:

- **Change the nameservers** at whoever timpanduro.com is registered with, to
  the four Netlify gives you. Netlify then handles DNS and the HTTPS
  certificate. Simplest, and the one I would pick.
- **Keep DNS where it is** and add the records Netlify shows you — an A record
  for the bare domain, a CNAME for `www`.

Either way the HTTPS certificate is issued automatically once DNS resolves.
That can take ten minutes or a few hours; there is nothing to do but wait.

**Done when:** https://timpanduro.com loads the site with a padlock in the
address bar.

Do the next part *after* this one. The login is tied to the exact domain, so
setting it up before the domain works means doing it twice.

---

## Part 4 — Turn on the admin (20 minutes)

This is the fiddliest part, and the only one where the steps are not
self-explanatory. What you are doing: telling GitHub that this website is
allowed to ask people to log in as themselves, so that Tim can write to the
repository from a web page instead of using GitHub directly.

### 4a. Create a GitHub OAuth App

github.com → your avatar → **Settings** → scroll to **Developer settings** (very
bottom of the left column) → **OAuth Apps** → **New OAuth App**.

| Field | Value |
|---|---|
| Application name | `TimPanduro CMS` |
| Homepage URL | `https://timpanduro.com` |
| Authorization callback URL | `https://timpanduro.com/callback` |

The callback URL has to be exactly that — no trailing slash, no `www`.

**Register application.** Copy the **Client ID**. Then click **Generate a new
client secret** and copy that too — GitHub shows it once and never again.

### 4b. Give those two values to Netlify

Netlify → **Site configuration** → **Environment variables** → **Add a
variable**, twice:

| Key | Value |
|---|---|
| `GITHUB_CLIENT_ID` | the Client ID |
| `GITHUB_CLIENT_SECRET` | the secret |

### 4c. Tell the admin which repository to write to

In GitHub, open `public/admin/config.yml` and click the pencil icon. Near the
top, change:

```yml
  repo: BRUGERNAVN/REPOSITORY
```

to your actual username and repository, for example:

```yml
  repo: crseibaek/timpanduro-site
```

Commit. That commit triggers a rebuild, which also picks up the two environment
variables you just added.

**Done when:** https://timpanduro.com/admin shows a *Sign in with GitHub*
button; clicking it opens a GitHub popup; approving it drops you into the admin
with **Produktioner**, **Tilbudssider** and **Indstillinger** in the sidebar.

Try it end to end: open a production, change a title, save, wait a minute,
reload the site. If the title changed, the whole chain works.

---

## Part 5 — Turn on the stats (2 minutes)

Netlify → Environment variables → add one more:

| Key | Value |
|---|---|
| `STATS_KEY` | any long random string — a password manager's generator is ideal |

Then **Deploys** → **Trigger deploy** → **Deploy site**, so the new variable is
picked up.

**Done when:** open an offer page in a private window, then go to
`timpanduro.com/stats`, paste the key, and see one visit listed.

---

## Part 6 — Replace the placeholder content

Everything currently on the site is invented. Best order to swap it out:

1. **Indstillinger** in the admin — real email, phone, CVR, Vimeo profile.
2. **The about text.** Those three paragraphs are mine. They are pitched about
   right in length and tone, but they should be Tim's own words; nothing reads
   more like a template than a bio someone else wrote.
3. **The portrait** — replace `/img/portrait.jpg` via the Indstillinger page.
4. **The productions.** Delete the 20 placeholders and add real ones. Do five or
   ten first and look at the wall before doing all fifty — it is much easier to
   change your mind about categories at that point.
5. **The two sample offer pages** — delete them.

Once real productions exist, the invented stills in `public/thumbs/` can be
deleted from GitHub.

---

## Vimeo, now that Plus is confirmed

- **Thumbnails are automatic.** Leave the *Still* field empty in the admin and
  the site fetches Vimeo's own poster frame while building. Only fill it in when
  you want a different frame than the one Vimeo chose.
- **Turn off the player chrome.** In each video's settings → Embed, switch off
  the title, byline and portrait. The site already asks for a minimal player,
  but the video's own settings win.
- **Lock the embeds to the domain.** Video settings → Privacy → *Where can this
  be embedded* → Specific domains → `timpanduro.com`. That stops anyone lifting
  the embed onto their own site. One catch: this also blocks the offline preview
  and `localhost`, so do it after the site is live.

---

## When something goes wrong

| What you see | What it usually is |
|---|---|
| Netlify build fails on the first try | A file did not upload in Part 1. The log names it. |
| `/admin` is a blank white page | `config.yml` has a YAML error — usually a stray indent from editing in GitHub. |
| Login popup opens, then nothing happens | The callback URL in the GitHub OAuth App does not exactly match `https://timpanduro.com/callback`. |
| Login says "State mismatch" | The popup was left open too long, or you started at `www.timpanduro.com`. Close it and try again from the bare domain. |
| Admin loads but saving fails | `repo:` in `config.yml` does not match the real `username/repository`. |
| `/stats` says the key is wrong | `STATS_KEY` was added but the site has not been redeployed since. |
| Offer page shows tiles but no video plays | The Vimeo id field has the whole URL in it. It wants only the digits. |
| A tile shows a grey play-icon placeholder | No image and no working Vimeo id for that production. Check the deploy log — it lists any ids Vimeo refused. |

---

## What this costs

Nothing, at this size. Netlify's free tier covers 100 GB of traffic and 300
build minutes a month; a site like this uses a rounding error of both, and a
rebuild takes well under a minute. GitHub private repositories are free. The
only bill is the domain and Vimeo, which Tim already pays.

---

## Optional: running it on your own machine

Not needed for any of the above, but useful if you want to try design changes
without pushing them live. Install Node.js (nodejs.org, the LTS version), then
in the project folder:

```bash
npm install
npm run dev          # http://localhost:4321
```

The admin and the stats page do not work locally — they need Netlify's
functions. Everything else does.
