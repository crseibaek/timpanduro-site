import { chromium } from 'playwright';

const base = 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));

let fails = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) fails++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
};

// --- wall + filter ---------------------------------------------------------
await page.goto(base + '/', { waitUntil: 'networkidle' });
const total = await page.locator('.tile').count();
ok('wall renders all productions', total === 20, `${total} tiles`);

await page.click('button[data-filter="film"]');
await page.waitForTimeout(200);
const visible = await page.locator('.tile:not([hidden])').count();
const filmCount = await page.locator('.tile[data-category="film"]').count();
ok('filter narrows to one category', visible === filmCount && visible > 0, `${visible}/${total}`);
ok('filter is reflected in the URL', page.url().includes('k=film'));

// deep link restores the filter
await page.goto(base + '/?k=erhverv', { waitUntil: 'networkidle' });
await page.waitForTimeout(250);
const erh = await page.locator('.tile:not([hidden])').count();
const erhAll = await page.locator('.tile[data-category="erhverv"]').count();
ok('filter restores from the URL', erh === erhAll && erh > 0, `${erh}`);

// --- lightbox --------------------------------------------------------------
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.click('.tile[data-index="0"]');
await page.waitForTimeout(300);
ok('lightbox opens', await page.locator('#lightbox').isVisible());
const t1 = await page.locator('[data-lb-title]').textContent();
ok('lightbox shows the right title', t1?.trim() === 'Fortabte somre', t1 ?? '');
ok('real Vimeo id becomes an iframe', (await page.locator('.lb-frame iframe').count()) === 1);

await page.click('[data-lb-next]');
await page.waitForTimeout(250);
const t2 = await page.locator('[data-lb-title]').textContent();
ok('next advances', t2?.trim() === 'Stålværket', t2 ?? '');
ok('missing Vimeo id falls back to placeholder', (await page.locator('.lb-frame .ph').count()) === 1);

await page.click('[data-lb-prev]');
await page.waitForTimeout(200);
ok('prev goes back', (await page.locator('[data-lb-title]').textContent())?.trim() === 'Fortabte somre');
ok('prev is disabled at the start', await page.locator('[data-lb-prev]').isDisabled());

await page.keyboard.press('Escape');
await page.waitForTimeout(250);
ok('escape closes', !(await page.locator('#lightbox').isVisible()));
ok('iframe is torn down on close', (await page.locator('.lb-frame iframe').count()) === 0);

// --- offer page ------------------------------------------------------------
await page.goto(base + '/offers/nordlys-destilleri', { waitUntil: 'networkidle' });
const offerTiles = await page.locator('.tile').count();
ok('offer shows exactly the curated films', offerTiles === 4, `${offerTiles}`);
const firstTitle = await page.locator('.tile .t').first().textContent();
ok('curated order is preserved', firstTitle?.includes('Nordlys Gin'), firstTitle ?? '');
ok(
  'offer page is noindex',
  (await page.locator('meta[name="robots"]').getAttribute('content'))?.includes('noindex')
);
ok('no filter bar on an offer page', (await page.locator('.filters').count()) === 0);
ok('offer links back to the portfolio', (await page.locator('a.btn.ghost[href="/"]').count()) === 1);

// language toggle from an offer keeps the customer
await page.click('a.lang');
await page.waitForURL('**/en/offers/nordlys-destilleri**');
ok('language toggle stays on the same offer', page.url().endsWith('/en/offers/nordlys-destilleri'));
const enIntro = await page.locator('.offer-note p').first().textContent();
ok('English offer uses the English text', enIntro?.startsWith('Hi Mikkel'), enIntro?.slice(0, 30) ?? '');

// --- language toggle round trip -------------------------------------------
await page.goto(base + '/om', { waitUntil: 'networkidle' });
await page.click('a.lang');
await page.waitForURL('**/en/about**');
ok('da about -> en about', page.url().endsWith('/en/about'));
await page.click('a.lang');
await page.waitForURL('**/om**');
ok('en about -> da about', page.url().endsWith('/om'));

// --- catalogue integrity ---------------------------------------------------
await page.goto(base + '/', { waitUntil: 'networkidle' });
const broken = await page.evaluate(async () => {
  const srcs = [...document.querySelectorAll('.tile img')].map((i) => i.getAttribute('src'));
  const results = await Promise.all(
    srcs.map((s) => fetch(s, { method: 'HEAD' }).then((r) => (r.ok ? null : s)).catch(() => s))
  );
  return results.filter(Boolean);
});
ok('every thumbnail resolves', broken.length === 0, broken.join(', '));

const trackOnly = errors.filter((e) => !e.includes('/api/track') && !e.includes('404'));
ok('no unexpected JS errors', trackOnly.length === 0, trackOnly.join(' | '));

await browser.close();
console.log(fails === 0 ? '\nAll checks passed.' : `\n${fails} check(s) failed.`);
process.exit(fails === 0 ? 0 : 1);
