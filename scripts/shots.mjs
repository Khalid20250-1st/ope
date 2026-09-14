// Takes the README screenshots from the dev server. Run the dev server with a
// HOME whose ~/.config/ope/library.json lists a demo project with numbered
// versions (never your own projects), then:
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
await page.click('[data-num="1.0"]'); await wait(1200);
await page.click('#versionList [data-v="0"]'); await wait(1200);
await page.screenshot({ path: out + 'version.png' });
await page.click('[data-dir="src"]'); await wait(200);
await page.click('[data-dir="src/components"]'); await wait(200);
await page.click('[data-file="src/components/task-list.js"]'); await wait(1800);
await page.screenshot({ path: out + 'lines.png' });
await browser.close();
console.log('screenshots in docs/');
