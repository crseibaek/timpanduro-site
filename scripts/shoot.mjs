import { chromium } from 'playwright';

const base = process.env.BASE || 'http://localhost:4321';
const shots = JSON.parse(process.env.SHOTS || '[]');

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w || 1440, height: s.h || 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + s.path, { waitUntil: 'networkidle' });
  if (s.click) {
    await page.click(s.click);
    await page.waitForTimeout(700);
  }
  if (s.wait) await page.waitForTimeout(s.wait);
  await page.screenshot({ path: s.out, fullPage: !!s.full });
  console.log(`${s.out}  ${errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok'}`);
  await ctx.close();
}
await browser.close();
