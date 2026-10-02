# Portfolio + tilbudssider

A portfolio site for a videographer, built around one idea: instead of sending a
customer to a general showreel, you send them `timpanduro.com/offers/deres-navn` — a
page with their name on it, a short personal note, and only the films that are
relevant to them.

Everything is in English — the public site, the admin (`/admin`) and the
stats page.

---

## What is in here

| Page | Address | What it is |
|---|---|---|
| The wall | `/` | Every production as a tile, manually ordered, with category toggles in the header and a lightbox player |
| Offer page | `/offers/<customer>` | Per-customer page. `noindex`, so it never turns up in Google |
| Admin | `/admin` | Where productions and offer pages are written. Works on a phone |
| Stats | `/stats` | Which customers have opened their page, and when |

---

## Looking at it right now

Open `preview/index.html` by double-clicking it. That is a snapshot of the built
site with relative links, so it runs straight off the disk with no server. The
admin and the view tracking do not work there — everything else does.

To run the real thing:

```bash
npm install
npm run dev        # http://localhost:4321
```

---

## Deploying it

See **SETUP.md** — a step-by-step walkthrough written for a first deployment.
The short version: push to a private GitHub repo, connect it to Netlify, point
the domain, create a GitHub OAuth App and put its two values into Netlify's
environment variables along with a `STATS_KEY`.

---

## Using it (every day)

**Adding a production:** `/admin` → Productions → New. Pick at least one
category. The other field that really matters is the Vimeo ID: the numbers from
`vimeo.com/123456789`, so `123456789`. Leave `Order` at 999 and it lands at the
bottom of the wall; give it a low number to pull it up front.

**Making an offer page:** `/admin` → Offer pages → New.

- **Customer** — this becomes the address. "City Museum" gives
  `/offers/city-museum`.
- **Your message** — write it like an email. Blank line between paragraphs.
- **Selected films** — search and tick. The order you pick them is the order on
  the page.

Save, click **Publish Changes**, wait about a minute for Netlify to rebuild, then send the link.

**Seeing whether they looked:** `/stats`, enter the key. It shows opens,
roughly how many separate people, and when the page was last opened.

---

## Things worth knowing

**Saving does not publish.** Every production deploy costs 15 Netlify credits,
and the free plan has 300 a month. So saving in the admin only stores the
change in GitHub (the commit gets `[skip ci]`, which Netlify skips). Click
**Publish Changes** in the admin header when you are done for the session —
that runs one deploy for everything saved since the last one. It works through
a Netlify build hook (Project configuration → Build & deploy → Build hooks),
whose URL is pasted once in the admin under Account → Settings → Advanced.
Deleting an entry is the exception: it deploys straight away. Code changes
merged to `main` also deploy (and cost credits) as usual.

**Categories.** There are four: `stage`, `cinema`, `documentary`,
`commercial`. They are defined once, in `src/data/categories.ts`, and the four
toggles in the header come from there. A production can be in several. The
admin dropdown in `public/admin/config.yml` (Productions → Categories) has to
list the same ids, because the admin cannot read code — `npm run build` checks
the two against each other and fails if they differ.

**Filtering.** No toggle pressed shows everything. Pressing one or more shows
productions in *any* of the pressed categories. The selection is kept in the
address, e.g. `/?c=cinema,documentary`, so a filtered wall can be sent as a
link.

**Old addresses.** The site used to have `/en/...` mirrors and an about page
at `/om`. `netlify.toml` sends those to their current equivalents with 301s.

**Thumbnails** resolve in this order: an image uploaded in the admin, then
Vimeo's own poster frame, then a matching file in `public/thumbs/`, then a
neutral placeholder. Never put 50 Vimeo embeds on the wall — the tiles are
images, and the player is only created when someone clicks. That is deliberate.

**Vimeo.** The account is Plus, so the player can be unbranded and embeds can be
locked to timpanduro.com. Thumbnails are fetched from Vimeo's oEmbed endpoint at
build time when the Still field is left empty — no thumbnail is requested from
Vimeo when a visitor loads a page.

**Offer pages are guessable but harmless.** `/offers/byhistorisk-museum` is easy
to guess, so the pages carry no prices — only films and a note. They are
`noindex` and blocked in `robots.txt`, so they will not surface in search. If
prices ever go on these pages, add a random suffix to the address.

**View tracking stores no personal data.** No cookies, no IP addresses. Per
offer: a count, the first and last time it was opened, and the hostname of
wherever the link was clicked from.

---

## Structure

```
src/
  content/productions/   one markdown file per production   (written by the admin)
  content/offers/        one markdown file per customer     (written by the admin)
  data/site.json         name and contact details           (written by the admin)
  data/categories.ts     the four categories — the only place they are defined
  components/            Header (category toggles), Gallery (tiles), Lightbox (player), page templates
  pages/                 routes — /, /offers/[slug], /stats
netlify/functions/       auth + callback (admin login), track (records an open), stats (reads the log)
public/admin/            the admin UI and its configuration
scripts/                 screenshots, local preview
```

## Checks

```bash
npm run build
node scripts/make_local_preview.mjs   # regenerates preview/
```
