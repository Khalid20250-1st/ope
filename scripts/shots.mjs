// Takes the README screenshots from the dev server. Needs `npm run dev` running
// with OPE_ROOT pointing at a project that has versions, and Playwright.
//   node scripts/shots.mjs /path/to/playwright-core
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2] || 'playwright-core');
const out = new URL('../docs/', import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const wait = ms => page.waitForTimeout(ms);
await page.goto('http://localhost:8790/'); await wait(2500);
await page.click('#ope .rail [data-view="prompt"]'); await wait(600);
await page.screenshot({ path: out + 'welcome.png' });
await page.click('#ope .rail [data-view="projects"]'); await wait(300);
await page.click('[data-p="0"]'); await wait(400);
await page.click('[data-v="1"]'); await wait(800);
await page.screenshot({ path: out + 'version.png' });
await page.click('[data-dir="src"]'); await wait(200);
await page.click('[data-dir="src/components"]'); await wait(200);
await page.click('[data-file="src/components/task-list.js"]'); await wait(1500);
await page.screenshot({ path: out + 'lines.png' });
await browser.close();
console.log('screenshots in docs/');
