# Portfolio + tilbudssider

A portfolio site for a videographer, built around one idea: instead of sending a
customer to a general showreel, you send them `timpanduro.com/offers/deres-navn` — a
page with their name on it, a short personal note, and only the films that are
relevant to them.

Everything here is placeholder content. The design is real; the 20 productions,
the name, the contact details and the stills are invented so the thing can be
looked at before the real material exists.

---

## What is in here

| Page | Address | What it is |
|---|---|---|
| The wall | `/` and `/en` | Every production as a tile, manually ordered, with category filtering and a lightbox player |
| About | `/om` and `/en/about` | Portrait, three paragraphs, contact details |
| Offer page | `/offers/<kunde>` | Per-customer page. `noindex`, so it never turns up in Google |
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

**Adding a production:** `/admin` → Produktioner → New. The only field that
really matters is the Vimeo id: the numbers from `vimeo.com/123456789`, so
`123456789`. Leave `Rækkefølge` at 999 and it lands at the bottom of the wall;
give it a low number to pull it up front.

**Making an offer page:** `/admin` → Tilbudssider → New.

- **Kunde** — this becomes the address. "Byhistorisk Museum" gives
  `/offers/byhistorisk-museum`.
- **Din besked** — write it like an email. Blank line between paragraphs.
- **Udvalgte film** — search and tick. The order you pick them is the order on
  the page.

Save, wait about a minute for Netlify to rebuild, then send the link.

**Seeing whether they looked:** `/stats`, enter the key. It shows opens,
roughly how many separate people, and when the page was last opened.

---

## Things worth knowing

**Categories live in two files.** The labels are in `src/data/site.json`; the
dropdown the admin shows is in `public/admin/config.yml` under
Produktioner → Kategori. Change both, and keep the `id` values identical. The
current three (`film`, `kultur`, `erhverv`) are a guess — they should be
replaced once the real back catalogue exists.

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
  data/site.json         name, contact, about text, categories
  data/ui.ts             every piece of interface text, da + en
  components/            Gallery (tiles), Lightbox (player), page templates
  pages/                 routes — /, /om, /offers/[slug], and the /en mirrors
netlify/functions/       auth + callback (admin login), track (records an open), stats (reads the log)
public/admin/            the admin UI and its configuration
scripts/                 placeholder generation, checks, local preview
```

## Checks

```bash
npm run build
npx astro preview &        # then, in another shell:
node scripts/check.mjs     # 24 interaction checks: filtering, lightbox, offers, i18n
node scripts/make_local_preview.mjs   # regenerates preview/
```
