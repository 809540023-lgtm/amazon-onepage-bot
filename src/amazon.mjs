import { fetchText, isBotWall } from './http.mjs';

const MARKET = { host: 'www.amazon.co.jp', currency: 'JPY' };

export function parseAsin(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[A-Z0-9]{10}$/i.test(s)) return s.toUpperCase();
  const patterns = [
    /\/(?:dp|gp\/product|gp\/aw\/d|ASIN)\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/([A-Z0-9]{10})(?:[/?]|$)/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

export function productUrl(asin) {
  return `https://${MARKET.host}/dp/${asin}`;
}

function decodeEntities(str = '') {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

export function stripTags(html = '') {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const first = (str, re) => {
  const m = str.match(re);
  return m ? m[1] : null;
};

function pickPriceJpy(html) {
  const blocks = [
    /id="corePriceDisplay_desktop_feature_div"[\s\S]{0,6000}?<\/div><\/div><\/div>/,
    /id="corePrice_feature_div"[\s\S]{0,4000}?<\/div><\/div>/,
    /id="apex_desktop"[\s\S]{0,8000}?<\/div><\/div>/,
    /id="buybox"[\s\S]{0,12000}?<\/div><\/div>/,
  ];
  for (const re of blocks) {
    const m = html.match(re);
    if (!m) continue;
    const whole = first(m[0], /class="a-price-whole">([\d,]+)/);
    if (whole) return Number(whole.replace(/[^\d]/g, ''));
    const off = first(m[0], /class="a-offscreen">\s*(?:JP[¥￥]|￥)\s*([\d,]+)/);
    if (off) return Number(off.replace(/[^\d]/g, ''));
  }
  const off = first(html, /class="a-offscreen">\s*(?:JP[¥￥]|￥)\s*([\d,]+)/);
  if (off) return Number(off.replace(/[^\d]/g, ''));
  const whole = first(html, /class="a-price-whole">([\d,]+)/);
  return whole ? Number(whole.replace(/[^\d]/g, '')) : null;
}

function pickListPriceJpy(html) {
  const m = html.match(/basisPrice[\s\S]{0,600}?(?:basisPrice|a-text-price)[^>]*>\s*(?:JP[¥￥]|￥)?\s*([\d,]{2,})/);
  return m ? Number(m[1].replace(/[^\d]/g, '')) : null;
}

function pickImages(html) {
  const urls = new Set();
  const push = (u) => {
    if (!u) return;
    const clean = u.replace(/\\u002F/gi, '/');
    if (!/^https:\/\/m\.media-amazon\.com\/images\/I\//.test(clean)) return;
    if (/_SS\d+_|_SX\d+_|_SY\d+_|_US\d+_/.test(clean)) return;
    urls.add(clean.split('._AC_')[0] + '._AC_SL1200_.jpg');
  };
  for (const m of html.matchAll(/"hiRes":"(https:[^"]+)"/g)) push(m[1]);
  for (const m of html.matchAll(/"large":"(https:[^"]+)"/g)) push(m[1]);
  push(first(html, /id="landingImage"[^>]*?src="([^"]+)"/));
  push(first(html, /property="og:image"\s+content="([^"]+)"/));
  return [...urls];
}

function pickBullets(html) {
  const out = [];
  const blocks = [
    first(html, /id="feature-bullets"([\s\S]{0,6000}?)<\/ul>/),
    first(html, /id="productFactsDesktopExpander"([\s\S]{0,8000}?)<\/ul>/),
    first(html, /id="visual-rich-product-description-0"([\s\S]{0,6000}?)<\/ul>/),
  ].filter(Boolean);
  for (const block of blocks) {
    for (const m of block.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/g)) {
      const t = stripTags(m[1]);
      if (t && t.length > 1 && !out.includes(t)) out.push(t);
    }
  }
  if (!out.length) {
    const d = first(html, /id="productDescription"([\s\S]{0,4000}?)<\/div>\s*<\/div>/);
    if (d) for (const p of d.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
      const t = stripTags(p[1]);
      if (t.length > 8) out.push(t);
    }
  }
  return out.slice(0, 10);
}

const SPEC_LABEL_MAP = {
  品牌: '品牌', 品牌名: '品牌', 品牌名称: '品牌', ブランド: '品牌', ブランド名: '品牌',
  メーカー: '製造商', 制造商: '製造商', 制造商名称: '製造商', 製造元: '製造商',
  内容量: '容量', 容量: '容量', 商品体积: '容量', 商品の個数: '數量', 入数: '數量',
  商品数量: '數量', 商品包裹数量: '數量',
  原産国: '產地', 原产国: '產地', 生産国: '產地', 製造国: '產地',
  適合膚質: '適合膚質', 适合肤质: '適合膚質', 皮肤类型: '適合膚質',
  商品の重量: '重量', 商品重量: '重量', 重量: '重量',
  梱包サイズ: '包裝尺寸', 包装尺寸: '包裝尺寸', 商品寸法: '商品尺寸',
  'JANコード': 'JAN', ASIN: 'ASIN', 对象年龄: '適用年齡', 対象年齢: '適用年齡',
  '年龄范围（描述）': '適用年齡', 香り: '香味', 香味: '香味',
  产品优势: '商品特色', 商品の特徴: '商品特色', 特殊功能: '主要功效',
  材质特点: '材質', 不含材料类型: '不含成分', 商品形状: '劑型', 用于: '適用部位',
};

function pickSpecs(html) {
  const specs = {};
  // 商品規格表：<span class="a-text-bold">標籤</span></td><td ...><span>值</span>
  const rowRe =
    /<span class="[^"]*a-text-bold[^"]*">\s*([^<]{1,40}?)\s*<\/span>\s*<\/td>\s*<td[^>]*>([\s\S]{0,400}?)<\/td>/g;
  for (const m of html.matchAll(rowRe)) {
    const label = stripTags(m[1]);
    const value = stripTags(m[2]).replace(/^[:：]\s*/, '');
    if (!label || !value || value.length > 140) continue;
    const key = SPEC_LABEL_MAP[label] || label;
    if (specs[key]) continue;
    specs[key] = value.slice(0, 140);
  }
  // 備援：明細項目 <span class="a-text-bold">標籤：</span> 值
  if (Object.keys(specs).length < 2) {
    const altRe = /<span class="a-text-bold[^"]*">\s*([^<]{1,40}?)\s*[:：]\s*<\/span>\s*([\s\S]{0,300}?)<\/span>/g;
    for (const m of html.matchAll(altRe)) {
      const label = stripTags(m[1]);
      const value = stripTags(m[2]);
      if (!label || !value) continue;
      const key = SPEC_LABEL_MAP[label] || label;
      if (!specs[key]) specs[key] = value.slice(0, 140);
    }
  }
  return specs;
}

function pickDescription(html) {
  const block =
    first(html, /<div id="productDescription"[^>]*>([\s\S]{0,6000}?)<\/div>\s*<\/div>/) ||
    first(html, /id="productDescription_feature_div"[\s\S]{0,200}?<div class="a-section">([\s\S]{0,6000}?)<\/div>\s*<\/div>/) ||
    first(html, /id="aplus"[\s\S]{0,20000}?<div class="aplus-v2[\s\S]{0,12000}?<\/div>/);
  if (!block) return null;
  const text = stripTags(block).replace(/\s+/g, ' ').trim();
  return text.length > 30 && !/data-csa-|^\s*\{/.test(text) ? text.slice(0, 1000) : null;
}

function pickRating(html) {
  const t =
    first(html, /id="acrPopover"[^>]*?title="([^"]+)"/) ||
    first(html, /class="a-icon-alt">\s*([\d.]+)\s*(?:颗星|つ星|out of)/i);
  const num = t ? Number((t.match(/[\d.]+/) || [])[0]) : null;
  return Number.isFinite(num) ? num : null;
}

function pickReviewCount(html) {
  const t = first(html, /id="acrCustomerReviewText"[^>]*>([\s\S]{0,60}?)<\/span>/);
  if (!t) return null;
  const num = stripTags(t).replace(/[^\d]/g, '');
  return num ? Number(num) : null;
}

const CATEGORY_RULES = [
  ['卸妝', /卸妆|卸妝|クレンジング|cleansing|makeup remover/i],
  ['去角質', /磨砂|スクラブ|scrub|ピーリング|去角质|去角質|角质护理|角質護理/i],
  ['洗面乳', /洗面|洁面|潔面|洗顔|ウォッシュ|wash|フォーム|foam|ソープ/i],
  ['面膜', /マスク|面膜|パック/i],
  ['化妝水', /化粧水|化妆水|ローション|lotion|トナー/i],
  ['精華液', /美容液|精华|精華|serum|エッセンス|アンプル/i],
  ['乳液乳霜', /乳液|クリーム|cream|emulsion|ミルク/i],
  ['防曬', /日焼け止め|防晒|防曬|uv|サンスクリーン/i],
  ['洗髮護髮', /シャンプー|洗发|洗髮|コンディショナー|トリートメント|ヘア/i],
  ['身體保養', /ボディ|body|ハンドクリーム|ネイル/i],
  ['口腔護理', /歯ブラシ|歯磨き|ハミガキ|口腔|牙膏|牙刷/i],
  ['保健食品', /サプリ|サプリメント|栄養|錠|粒|カプセル|保健|維他命|ビタミン/i],
  ['生活家電', /電動|家電|スチーマー|ドライヤー|シェーバー|掃除機/i],
];

const TAG_RULES = [
  ['毛孔護理', /毛孔|毛穴|ポア|pore/i],
  ['角質護理', /角質|角质|スクラブ|ケラチン|ピーリング|磨砂|ピーリング/i],
  ['保濕', /保湿|保濕|ヒアルロン|セラミド|うるおい|潤い|グリセリン/i],
  ['深層清潔', /泥|クレイ|clay|炭|マッド|洗浄|清洁|清潔/i],
  ['敏感肌友善', /敏感肌|低刺激|無香料|无香料|アルコールフリー|無酒精|无酒精/i],
  ['柑橘果香', /みかん|オレンジ|グレープフルーツ|柑橘|シトラス|レモン|マンダリン|キウイ|猕猴桃/i],
  ['醫美級成分', /ナイアシンアミド|レチノール|ビタミンc|トラネキサム/i],
  ['日本製', /日本製|日本制造|日本产|made in japan|原産国:\s*日本|原产国:\s*日本|原産国:\s*日本国/i],
  ['泡泡質地', /泡|フォーム|泡立て|ムース|foam/i],
  ['植萃成分', /エキス|エッセンス|提取|植物|ハーブ|芦荟|アロエ|緑茶|茶/i],
  ['省時快速', /省時|時短|時短ケア|簡單|簡単|1ステップ|one step/i],
];

const BRAND_MAP = {
  ウテナ: 'Utena',
  クレンジングリサーチ: 'Cleansing Research',
  カネボウ: 'Kanebo',
  資生堂: 'SHISEIDO',
  花王: 'Kao',
  ロート製薬: 'Rohto',
  ロート: 'Rohto',
  小林製薬: '小林製薬',
  コーセー: 'KOSÉ',
  マンダム: 'Mandom',
  ユニリーバ: 'Unilever',
  ライオン: 'Lion',
  サンスター: 'Sunstar',
  大塚製薬: 'Otsuka',
  森永製菓: 'Morinaga',
  明治: 'Meiji',
  ファンケル: 'FANCL',
  オルビス: 'ORBIS',
  ソフィーナ: 'SOFINA',
  ナチュリエ: 'Naturie',
  菊正宗: '菊正宗',
  石澤研究所: '石澤研究所',
  明色化粧品: '明色化粧品',
  肌ラボ: '肌ラボ',
  毛穴撫子: '毛穴撫子',
  ビオレ: 'Biore',
  ニベア: 'NIVEA',
};

function normalizeBrand(raw) {
  if (!raw) return null;
  let b = raw
    .replace(/^(访问|前往|Visit the|Besøg)\s*/i, '')
    .replace(/\s*(品牌旗舰店|ブランドストア|品牌旗艦店|Brand Store|Store|ストア)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!b) return null;
  if (BRAND_MAP[b]) return BRAND_MAP[b];
  const hit = Object.entries(BRAND_MAP).find(([k]) => b.includes(k));
  return hit ? hit[1] : b;
}

function classify(title, bullets) {
  const hay = `${title} ${bullets.join(' ')}`;
  const category = (CATEGORY_RULES.find(([, re]) => re.test(hay)) || ['美妝保養'])[0];
  const tags = TAG_RULES.filter(([, re]) => re.test(hay)).map(([t]) => t);
  return { category, tags };
}

const titleKey = (w) =>
  w
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

export function cleanTitle(raw) {
  const t = raw.replace(/\s+/g, ' ').trim().replace(/^【[^】]*】\s*/, '');
  const used = [];
  const out = [];
  for (const w of t.split(/\s+/)) {
    // 去重鍵忽略括號內容與標點，避免「嘉娜寶(Kanebo) 嘉娜寶」這種重複
    const k = titleKey(w);
    if (!k) continue;
    // 商品標題常把同一組關鍵字重複堆疊（卸妝／泡沫卸妝／泡沫清潔卸妝），
    // 若這個詞的字元已被前面保留的詞涵蓋，就視為重複而略過
    if (used.some((prev) => prev === k || [...k].every((ch) => prev.includes(ch)))) continue;
    used.push(k);
    out.push(w);
  }
  return out.join(' ') || raw.trim();
}

/** 商品卡顯示用短名：過長的日文標題在卡片上會爆版，抓一個合理斷點。 */
export function titleForCard(title, max = 46) {
  if (!title || title.length <= max) return title;
  const cut = title.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.55 ? cut.slice(0, sp) : cut).trim() + '…';
}
export async function scrapeProduct(input) {
  const asin = parseAsin(input);
  if (!asin) throw new Error(`無法從「${input}」解析出 ASIN`);
  const url = productUrl(asin);
  const { text: html, via } = await fetchText(url);
  if (isBotWall(html)) throw new Error(`Amazon 阻擋了請求（${asin}），請稍後再試`);

  const rawTitle =
    first(html, /id="productTitle"[^>]*>([\s\S]*?)<\/span>/) ||
    first(html, /<meta name="title" content="([^"]+)"/) ||
    first(html, /property="og:title"\s+content="([^"]+)"/) ||
    '';
  const title = stripTags(rawTitle);
  if (!title) throw new Error(`找不到商品標題（${asin}），頁面結構可能已變更`);

  const brand = normalizeBrand(
    stripTags(
      first(html, /id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/) ||
        first(html, /class="po-brand"[\s\S]{0,200}?<span[^>]*>([^<]+)<\/span>/) ||
        '',
    ),
  );

  const bullets = pickBullets(html);
  const { category, tags } = classify(title, bullets);
  const priceJpy = pickPriceJpy(html);
  const images = pickImages(html).slice(0, 6);
  if (!images.length) images.push(`https://m.media-amazon.com/images/P/${asin}.jpg`);

  return {
    asin,
    url,
    source: MARKET.host,
    title,
    brand,
    priceJpy,
    listPriceJpy: pickListPriceJpy(html),
    rating: pickRating(html),
    reviews: pickReviewCount(html),
    images,
    hero: images[0],
    bullets,
    description: pickDescription(html),
    specs: pickSpecs(html),
    category,
    tags: tags.length ? tags : [category],
    availability: /在庫あり|現在有貨|In Stock|通常在庫|在庫あり。|在庫切れ/i.test(html) ? 'in_stock' : 'unknown',
    scrapedAt: new Date().toISOString(),
    fetchVia: via,
  };
}
