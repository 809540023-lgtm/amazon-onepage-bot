import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = path.join(ROOT, 'data');
// 輸出到 docs/，可直接用 GitHub Pages（main 分支 /docs）發佈
export const SITE_DIR = path.join(ROOT, 'docs');

let configCache = null;
export function config() {
  if (!configCache) {
    configCache = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
  }
  return configCache;
}

const fxCachePath = () => path.join(DATA_DIR, 'fx.json');

/** 取得 JPY→TWD 匯率，優先讀快取，過期才打 API，失敗則用設定檔預設值。 */
export async function getRate({ force = false } = {}) {
  const cfg = config().fx;
  let cached = null;
  try {
    cached = JSON.parse(fs.readFileSync(fxCachePath(), 'utf8'));
  } catch {}
  const fresh =
    cached && Date.now() - new Date(cached.fetchedAt).getTime() < cfg.cacheHours * 3600 * 1000;
  if (cached && fresh && !force) return cached;

  try {
    const res = await fetch(cfg.apiUrl, { headers: { accept: 'application/json' } });
    const json = await res.json();
    const twd = json?.rates?.TWD;
    if (!twd) throw new Error('回應缺少 TWD 匯率');
    const out = {
      pair: 'JPY/TWD',
      rate: Number(twd),
      source: cfg.apiUrl,
      updatedAt: json.time_last_update_utc ?? null,
      fetchedAt: new Date().toISOString(),
      fallback: false,
    };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(fxCachePath(), JSON.stringify(out, null, 2));
    return out;
  } catch (err) {
    const out = cached ?? {
      pair: 'JPY/TWD',
      rate: cfg.fallbackJpyToTwd,
      source: 'config.json 預設值',
      updatedAt: null,
      fetchedAt: new Date().toISOString(),
      fallback: true,
      error: String(err.message || err),
    };
    out.fallback = true;
    return out;
  }
}

const weightFromSpecs = (p) => {
  const minKg = config().shipping.minItemWeightKg ?? 0.3;
  const raw = p.specs?.重量 || p.specs?.['商品の重量'] || '';
  let kg = null;
  const k = /([\d.]+)\s*kg/i.exec(raw);
  if (k) kg = Number(k[1]);
  if (kg === null) {
    const g = /([\d.]+)\s*(?:g|克|グラム)/i.exec(raw);
    if (g) kg = Number(g[1]) / 1000;
  }
  // Amazon 的重量欄位常是內容物淨重或錯誤值，過小者以包裝後最低重量計算
  if (!Number.isFinite(kg) || kg < minKg) return minKg;
  return Math.round(kg * 1000) / 1000;
};

/** 單一商品：國際運費（含基本費、件數費、重量費） */
export function shippingFor(product, quantity = 1) {
  const ship = config().shipping;
  const kg = weightFromSpecs(product) ?? ship.defaultItemWeightKg;
  return Math.round(ship.baseTwd + ship.perItemTwd * quantity + kg * ship.perKgTwd * quantity);
}

/** 關稅 + 營業稅估算（台灣進口郵包免稅門檻） */
export function customsFor(goodsTwd, shippingTwd) {
  const cus = config().customs;
  const dutiable = goodsTwd + shippingTwd;
  if (dutiable <= cus.dutyFreeLimitTwd) return { dutyTwd: 0, vatTwd: 0, customsTwd: 0, taxFree: true, dutiable };
  const dutyTwd = Math.round(dutiable * cus.dutyRate);
  const vatTwd = Math.round((dutiable + dutyTwd) * cus.vatRate);
  return { dutyTwd, vatTwd, customsTwd: dutyTwd + vatTwd, taxFree: false, dutiable };
}

/**
 * 計算台灣到手價：商品日幣 → 台幣 + 國際運費 + 關稅預估。
 * 所有費用皆為估算，實際以 Amazon 結帳頁為準。
 */
export function priceBreakdown(product, fxRate, quantity = 1) {
  const unitJpy = product.priceJpy ?? 0;
  const jpyTotal = unitJpy * quantity;
  const goodsTwd = Math.round(jpyTotal * fxRate);
  const shippingTwd = shippingFor(product, quantity);
  const { dutyTwd, vatTwd, customsTwd, taxFree } = customsFor(goodsTwd, shippingTwd);
  const landedTwd = goodsTwd + shippingTwd + customsTwd;

  return {
    quantity,
    unitJpy,
    jpyTotal,
    goodsTwd,
    shippingTwd,
    dutyTwd,
    vatTwd,
    customsTwd,
    landedTwd,
    perUnitTwd: Math.round(landedTwd / quantity),
    weightKg: weightFromSpecs(product),
    taxFree,
    dutyFreeLimitTwd: config().customs.dutyFreeLimitTwd,
  };
}

export const fmtTwd = (n) => `NT$${Math.round(n).toLocaleString('zh-TW')}`;
export const fmtJpy = (n) => `¥${Math.round(n).toLocaleString('ja-JP')}`;
