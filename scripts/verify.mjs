// 用 Playwright 開起來實際操作一遍，確認沒有 JS 錯誤、互動正常。
// Playwright 是選用相依（僅驗收用），優先找專案／全域安裝。
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {}
  try {
    const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
    return await import(path.join(globalRoot, 'playwright', 'index.mjs'));
  } catch {}
  try {
    const p = require.resolve('playwright');
    return await import(p);
  } catch (err) {
    console.error('找不到 playwright，請先執行：npm i -D playwright（或 npm i -g playwright）');
    throw err;
  }
}
const { chromium } = await loadPlaywright();

const file = `file://${path.resolve(process.argv[2] || 'docs/index.html')}`;
const outDir = '/tmp/onepage-shots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto(file, { waitUntil: 'load' });
await page.waitForTimeout(1200);

const report = {};
report.title = await page.title();
report.products = await page.locator('.card').count();
report.thumbs = await page.locator('.thumbs button').count();
report.steps = await page.locator('.tstep').count();
report.scriptItems = await page.locator('.scriptItem').count();
report.faq = await page.locator('.qa').count();

// 圖庫切換
const img0 = await page.locator('.card .media .main img').first().getAttribute('src');
await page.locator('.card .thumbs button').nth(1).click();
await page.waitForTimeout(400);
const img1 = await page.locator('.card .media .main img').first().getAttribute('src');
report.gallerySwitched = img0 !== img1;

// 直播間：滾進去應自動播放
await page.locator('#live').scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);
report.subtitle = (await page.locator('#subtitle').innerText()).slice(0, 60);
report.playing = (await page.locator('#playBtn').innerText()).includes('❚');
report.chatMsgs = await page.locator('.chatList .msg').count();
report.pinnedVisible = await page.locator('#pinned').isVisible();
await page.waitForTimeout(9000);
report.subtitleLater = (await page.locator('#subtitle').innerText()).slice(0, 60);
report.progress = await page.locator('#progressBar').evaluate((el) => el.style.width);
await page.screenshot({ path: `${outDir}/live.png` });

// 聊天室送出
await page.locator('#chatInput').fill('敏感肌可以用嗎？運費多少');
await page.locator('#chatForm button').click();
await page.waitForTimeout(2200);
report.chatAfterSend = await page.locator('.chatList .msg').count();
report.lastReply = (await page.locator('.chatList .msg').last().innerText()).slice(0, 50);

// 購物車
await page.locator('#bundleAdd').click();
await page.waitForTimeout(700);
report.dockVisible = await page.locator('#dock').evaluate((el) => el.classList.contains('on'));
report.dockText = (await page.locator('#dockInfo').innerText()).slice(0, 60);

// 試算器
await page.locator('#calc-fill').click();
await page.waitForTimeout(500);
report.calcTotal = await page.locator('#calc-total').innerText();
report.calcJpy = await page.locator('#calc-jpy').innerText();
report.calcShip = await page.locator('#calc-ship').innerText();
report.calcTax = await page.locator('#calc-tax').innerText();
await page.locator('[data-qty="B000FQMR1O"][data-d="1"]').click();
await page.waitForTimeout(400);
report.calcTotalAfterPlus = await page.locator('#calc-total').innerText();
await page.locator('#calculator').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${outDir}/calc.png` });

// 版面截圖
await page.locator('#products').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: `${outDir}/products.png` });
await page.locator('#routine').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: `${outDir}/routine.png` });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
await page.screenshot({ path: `${outDir}/hero.png` });

// 手機版
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });await mob.goto(file, { waitUntil: 'load' });
await mob.waitForTimeout(1200);
await mob.screenshot({ path: `${outDir}/mobile-hero.png` });
await mob.locator('#live').scrollIntoViewIfNeeded();
await mob.waitForTimeout(1800);
await mob.screenshot({ path: `${outDir}/mobile-live.png` });
report.mobileDocWidth = await mob.evaluate(() => document.documentElement.scrollWidth);
report.mobileViewport = 390;

// ---- 版面幾何檢查 ----
await page.locator('#live').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
report.geometry = await page.evaluate(() => {
  const box = (s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const overlap = (a, b) => !!a && !!b && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const sub = box('.player .subtitle');
  const ctrl = box('.player .controls');
  const wave = box('.player .wave');
  const cap = box('.heroCard .caption');
  const hwave = box('.heroCard .wave');
  const overflow = [];
  document.querySelectorAll('.card .title, .selling .sp b, .tstep .box h4, .subtitle, .dock .info, .bundleCard h3').forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 3) overflow.push(el.className + ':' + el.textContent.slice(0, 18));
  });
  return {
    subtitleOverControls: overlap(sub, ctrl),
    subtitleOverWave: overlap(sub, wave),
    heroCaptionOverWave: overlap(cap, hwave),
    textOverflow: overflow,
  };
});

// 置入商品卡是否會在對應段落出現
await page.locator('.scriptItem').nth(3).click();
await page.waitForTimeout(900);
report.pinnedVisibleOnProductSegment = await page.locator('#pinned').isVisible();
report.pinnedText = (await page.locator('#pinned').innerText()).replace(/\n/g, ' | ');
await page.screenshot({ path: `${outDir}/live-pinned.png` });

console.log(JSON.stringify(report, null, 2));
console.log('\n=== JS ERRORS ===');
console.log(errors.length ? errors.join('\n') : '(none)');
await browser.close();
