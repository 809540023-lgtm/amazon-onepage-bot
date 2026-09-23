#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { scrapeProduct, parseAsin, productUrl } from './src/amazon.mjs';
import { buildSiteModel } from './src/copywriter.mjs';
import { renderSite } from './src/render.mjs';
import { getRate, priceBreakdown, config, ROOT, DATA_DIR, SITE_DIR, fmtTwd, fmtJpy } from './src/fx.mjs';

const CATALOG = path.join(DATA_DIR, 'catalog.json');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const targets = args.filter((a) => !a.startsWith('--'));

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  pink: (s) => `\x1b[38;5;205m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

const loadCatalog = () => {
  try {
    return JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  } catch {
    return { updatedAt: null, products: [] };
  }
};

const saveCatalog = (catalog) => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  catalog.updatedAt = new Date().toISOString();
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
};

async function scrapeAll(urls, { quiet = false } = {}) {
  const out = [];
  for (const u of urls) {
    const asin = parseAsin(u);
    if (!asin) {
      console.log(`${C.red('✗')} 無法解析 ASIN：${u}`);
      continue;
    }
    try {
      if (!quiet) process.stdout.write(`${C.dim('…')} 抓取 ${asin} `);
      const p = await scrapeProduct(u);
      if (!quiet) {
        console.log(
          `${C.green('✓')} ${p.title.slice(0, 34)} ${C.dim(`| ${p.priceJpy ? fmtJpy(p.priceJpy) : '無價格'} | ${p.rating ?? '-'}★ (${p.reviews ?? 0})`)}`,
        );
      }
      out.push(p);
    } catch (err) {
      console.log(`${C.red('✗')} ${asin} 失敗：${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 900));
  }
  return out;
}

async function build(catalog, { open = false, noSingle = false } = {}) {
  if (!catalog.products.length) {
    console.log(C.yellow('目錄是空的，先貼上至少一個日本 Amazon 商品網址。'));
    console.log(C.dim('用法：node generate.mjs "https://www.amazon.co.jp/dp/B000FQMR1O"'));
    return null;
  }
  const fx = await getRate();
  const model = buildSiteModel(catalog.products, fx, { priceBreakdown, config });

  fs.mkdirSync(SITE_DIR, { recursive: true });
  const html = renderSite(model);
  const indexFile = path.join(SITE_DIR, 'index.html');
  fs.writeFileSync(indexFile, html);
  fs.writeFileSync(path.join(SITE_DIR, 'data.json'), JSON.stringify(model, null, 2));

  console.log('');
  console.log(C.b(`🌸 一頁式網站已產生：${model.products.length} 件商品`));
  console.log(`   ${C.dim('檔案')}   ${indexFile}`);
  console.log(`   ${C.dim('匯率')}   1 JPY = ${fx.rate.toFixed(4)} TWD${fx.fallback ? C.yellow('（預設值）') : ''}`);
  console.log(`   ${C.dim('合購價')} ${fmtTwd(model.bundle.finalTwd)}（分開買 ${fmtTwd(model.bundle.singleLandedTwd)}，省 ${fmtTwd(model.bundle.savedTwd)}）`);
  console.log(`   ${C.dim('直播')}   ${model.stream.segments.length} 段 / ${Math.floor(model.stream.duration / 60)} 分 ${model.stream.duration % 60} 秒`);
  for (const p of model.products) {
    console.log(`   ${C.pink('•')} ${p.content.shortName.slice(0, 30)} ${C.dim(fmtJpy(p.priceJpy) + ' → ' + fmtTwd(p.price.perUnitTwd))}`);
  }

  // 每件商品同時輸出一份「單品專用」一頁式網站，方便單獨投放
  if (!noSingle) {
    const dir = path.join(SITE_DIR, 'p');
    fs.mkdirSync(dir, { recursive: true });
    for (const p of model.products) {
      const singleModel = buildSiteModel([p], fx, { priceBreakdown });
      fs.writeFileSync(path.join(dir, `${p.asin}.html`), renderSite(singleModel));
    }
    console.log(`   ${C.dim('單品頁')} ${dir}/*.html（每件商品各一份）`);
  }

  fs.writeFileSync(
    path.join(SITE_DIR, 'index.json'),
    JSON.stringify(
      model.products.map((p) => ({ asin: p.asin, title: p.content.titleTW, url: p.url, single: `p/${p.asin}.html` })),
      null,
      2,
    ),
  );

  if (open) execFile('open', [indexFile], () => {});
  return { indexFile, model };
}

async function main() {
  if (flags.has('--help') || flags.has('-h')) {
    console.log(`
${C.b('日本 Amazon → 台灣一頁式銷售網站產生器')}

${C.b('用法')}
  node generate.mjs <商品網址或 ASIN> [更多網址...]     加入商品並重新產生一頁式網站
  node generate.mjs --rebuild                          只用現有資料重新產生網站
  node generate.mjs --refresh                          重新抓取目錄裡所有商品的即時價格
  node generate.mjs --list                             列出目錄中的商品
  node generate.mjs --open                             產生後自動用瀏覽器打開
  node generate.mjs --no-single                        不額外輸出各商品的單品頁

${C.b('範例')}
  node generate.mjs "https://www.amazon.co.jp/dp/B000FQMR1O"
  node generate.mjs "https://www.amazon.co.jp/-/zh/dp/B08R6ZHZHV?ref=fed_asin_title" --open

${C.dim('設定檔：config.json（運費、關稅、匯率、AI 生徒名稱）')}
`);
    return;
  }

  const catalog = loadCatalog();

  if (flags.has('--list')) {
    if (!catalog.products.length) return console.log(C.yellow('目錄是空的。'));
    console.log(C.b(`目錄共 ${catalog.products.length} 件商品：`));
    catalog.products.forEach((p, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${C.pink(p.asin)} ${p.title.slice(0, 42)} ${C.dim(`| ${p.priceJpy ? fmtJpy(p.priceJpy) : '-'}`)}`);
    });
    return;
  }

  if (flags.has('--refresh')) {
    const urls = catalog.products.map((p) => p.url);
    if (!urls.length) return console.log(C.yellow('目錄是空的，沒有東西可以更新。'));
    console.log(C.dim(`重新抓取 ${urls.length} 件商品…`));
    const fresh = await scrapeAll(urls);
    const map = new Map(fresh.map((p) => [p.asin, p]));
    catalog.products = catalog.products.map((p) => (map.has(p.asin) ? { ...p, ...map.get(p.asin) } : p));
    saveCatalog(catalog);
    return build(catalog, { open: flags.has('--open') });
  }

  // 預設：加入新商品（已存在的話更新資料）
  if (targets.length) {
    console.log(C.dim(`抓取 ${targets.length} 個商品頁面…`));
    const scraped = await scrapeAll(targets);
    const map = new Map(catalog.products.map((p) => [p.asin, p]));
    for (const p of scraped) map.set(p.asin, { ...map.get(p.asin), ...p });
    catalog.products = [...map.values()];
    saveCatalog(catalog);
  } else if (!flags.has('--rebuild') && !flags.has('--open')) {
    console.log(C.yellow('沒有指定商品網址。'));
    console.log(C.dim('用法：node generate.mjs "https://www.amazon.co.jp/dp/XXXXXXXXXX"'));
    console.log(C.dim('說明：node generate.mjs --help'));
  }

  await build(catalog, { open: flags.has('--open'), noSingle: flags.has('--no-single') });
}

main().catch((err) => {
  console.error(C.red('產生失敗：'), err.message);
  if (process.env.DEBUG) console.error(err);
  process.exitCode = 1;
});
