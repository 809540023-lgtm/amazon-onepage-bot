import * as OpenCC from 'opencc-js';

import { shippingFor, customsFor, config as getConfig } from './fx.mjs';
import { titleForCard, cleanTitle } from './amazon.mjs';

const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
/** 簡體 → 繁體（台灣用語），Amazon 中文頁面為簡體，台灣市場需要繁體。 */
export const toTW = (text = '') => {
  if (!text) return '';
  try {
    // OpenCC 會把「台湾」轉成「臺灣」，統一成台灣慣用的「台灣」寫法
    return s2tConverter(String(text)).replace(/臺灣/g, '台灣');
  } catch {
    return String(text);
  }
};

const ACCENTS = [
  { name: 'sakura', from: '#ff5e8a', to: '#ff9a6b', glow: '255,94,138' },
  { name: 'matcha', from: '#12b886', to: '#0ea5e9', glow: '18,184,134' },
  { name: 'yuzu', from: '#f59f00', to: '#ff7b54', glow: '245,159,0' },
  { name: 'fuji', from: '#7c5cff', to: '#4cc9f0', glow: '124,92,255' },
  { name: 'ink', from: '#334155', to: '#0f766e', glow: '51,65,85' },
];

const CATEGORY_COPY = {
  卸妝: {
    benefit: '一抹就融妝，連毛孔裡的髒污都不放過',
    sub: '卸妝 × 洗臉一瓶完成，回家只想躺平也能好好保養',
    pain: ['卸妝油沖不乾淨，臉上一直有膜感', '卸完臉緊繃、乾到出細紋', '睫毛膏、防曬怎麼搓都還在'],
    usage: '手乾臉乾時按壓 2～3 下，全臉畫圈按摩 30 秒，加水乳化後沖淨。',
    routine: 1,
  },
  洗面乳: {
    benefit: '每天 60 秒，把毛孔洗到會呼吸',
    sub: '洗後不緊繃的關鍵，是洗掉髒污、留下水分',
    pain: ['洗完臉乾澀緊繃，笑一下都覺得拉扯', 'T 字部位照樣出油，粉刺越長越多', '洗面乳起泡慢，早上根本沒時間'],
    usage: '取適量加水起泡，從額頭、鼻翼、下巴畫圈清潔 30～60 秒後沖淨。',
    routine: 3,
  },
  去角質: {
    benefit: '每週 2 次，把老廢角質溫柔推走',
    sub: '角質代謝順了，後續保養吸收立刻有差',
    pain: ['臉摸起來粗粗的、上妝卡粉', '保養品擦了好像吸收不進去', '鼻翼兩側總有一層洗不掉的粗糙感'],
    usage: '一週 2～3 次，取適量在濕潤臉上輕柔畫圈，避開眼周後徹底沖淨。',
    routine: 4,
  },
  面膜: {
    benefit: '敷 10 分鐘，把水分一次補回來',
    sub: '乾燥、暗沉、臨時要出門的急救首選',
    pain: ['冷氣房待一天，臉乾到緊', '隔天要見人，氣色卻很疲倦'],
    usage: '洗臉後貼上，靜待 10～15 分鐘取下，輕拍至精華吸收。',
    routine: 5,
  },
  化妝水: {
    benefit: '洗完臉的第一步，先把水分補到位',
    sub: '輕拍就能滲透，妝前打底也更服貼',
    pain: ['臉一乾就開始出油', '保養品疊擦太多反而悶'],
    usage: '洗臉後取適量於手心或化妝棉，全臉輕拍至吸收。',
    routine: 5,
  },
  精華液: {
    benefit: '一滴濃縮，把最有感的成分送到肌底',
    sub: '保養程序裡最關鍵的一步，別省',
    pain: ['保養做了很久但看不到變化', '細紋、暗沉一次比一次明顯'],
    usage: '化妝水後取 2～3 滴，由內而外延展至全臉與頸部。',
    routine: 6,
  },
  乳液乳霜: {
    benefit: '最後一道鎖水，把水分關在皮膚裡',
    sub: '保養有鎖住，前面的努力才不會白白流掉',
    pain: ['擦完保養品過一下又乾', '冬天臉頰乾到脫皮'],
    usage: '保養最後一步取適量，由下往上、由內往外輕柔塗抹。',
    routine: 7,
  },
  防曬: {
    benefit: '每天 10 秒，把紫外線擋在門外',
    sub: '不防曬，所有美白與抗老保養都是白做工',
    pain: ['出門一趟臉就泛紅', '防曬黏膩到不想補擦'],
    usage: '早上保養最後一步取足量，均勻塗抹全臉與脖子。',
    routine: 8,
  },
  洗髮護髮: {
    benefit: '洗完頭皮鬆了，髮絲也跟著蓬起來',
    sub: '頭皮養好，髮質自然就會回報你',
    pain: ['下午頭皮就出油塌髮', '染燙後髮尾像稻草'],
    usage: '濕髮後取適量起泡，按摩頭皮後沖淨。',
    routine: 2,
  },
  身體保養: {
    benefit: '洗完澡 3 分鐘內擦上，全身都柔軟',
    sub: '冬天乾癢、手肘粗糙一次處理',
    pain: ['小腿一抓就白白的', '手部粗糙顯老'],
    usage: '沐浴後取適量塗抹全身，特別加強手肘、膝蓋、腳跟。',
    routine: 9,
  },
  口腔護理: {
    benefit: '每天早晚 2 分鐘，把口腔照顧乾淨',
    sub: '牙刷選對了，清潔效率差很多',
    pain: ['牙縫總覺得刷不乾淨', '刷完還是覺得口氣不清爽'],
    usage: '早晚各一次，每次 2 分鐘，輕柔清潔牙面與牙齦交界。',
    routine: 2,
  },
  保健食品: {
    benefit: '每天一包，把外食缺的補回來',
    sub: '成分看得懂，才敢天天吃',
    pain: ['三餐外食，營養根本不均衡', '下午就累、精神很難集中'],
    usage: '依包裝建議每日份量，搭配開水食用。',
    routine: 10,
  },
  生活家電: {
    benefit: '少做一件家事，多留一點時間給自己',
    sub: '日常最值得的投資，就是省下時間的那一種',
    pain: ['家事永遠做不完', '老舊家電耗電又難用'],
    usage: '依說明書安裝後即可使用。',
    routine: 11,
  },
  美妝保養: {
    benefit: '日本人氣好物，台灣同步入手',
    sub: '不用飛日本，也能買到當地藥妝店同款',
    pain: ['想買日本貨卻怕買到假貨', '國際運費算一算就放棄了'],
    usage: '依包裝標示使用。',
    routine: 5,
  },
};

const TAG_COPY = {
  毛孔護理: { icon: '🫧', title: '針對毛孔護理', desc: '鼻翼、下巴這些最容易粗糙的地方，洗完觸感明顯變平滑。' },
  角質護理: { icon: '✨', title: '溫和代謝角質', desc: '帶走表層老廢角質，後續保養擦上去更有感。' },
  深層清潔: { icon: '🌋', title: '礦泥深層吸附', desc: '吸附多餘皮脂與髒污，洗完的清爽感可以撐比較久。' },
  保濕: { icon: '💧', title: '洗後不緊繃', desc: '保濕成分留住水分，摸起來是柔軟的，不是乾乾的那種乾淨。' },
  敏感肌友善: { icon: '🕊️', title: '低刺激配方', desc: '無酒精、低刺激設計，敏感肌也能安心天天用。' },
  柑橘果香: { icon: '🍊', title: '柑橘系清新香', desc: '洗完像做了一場果香 SPA，心情跟著輕盈起來。' },
  醫美級成分: { icon: '🔬', title: '話題成分添加', desc: '日本討論度高的保養成分直接加進去，不是只有香氣。' },
  日本製: { icon: '🇯🇵', title: '日本製造原裝', desc: '日本當地藥妝店同步販售的原裝版本，不是來路不明的平行輸入。' },
  泡泡質地: { icon: '☁️', title: '按壓就是綿密泡沫', desc: '不用手忙腳亂搓泡泡，一按直接上臉，早上省下好幾分鐘。' },
  植萃成分: { icon: '🌿', title: '植萃成分加持', desc: '蘆薈、綠茶、果實萃取等植物成分，溫和但洗得乾淨。' },
  省時快速: { icon: '⏱️', title: '一瓶省下兩步驟', desc: '卸妝加洗臉一次完成，加班回家也願意好好保養。' },
};

const pickCategoryCopy = (category) => CATEGORY_COPY[category] ?? CATEGORY_COPY['美妝保養'];

function ratingStars(rating) {
  if (!rating) return '★★★★☆';
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

function cleanSpecNoise(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

const SPEC_PRIORITY = ['容量', '適合膚質', '產地', '不含成分', '香味', '劑型', '主要功效', '適用部位'];

function highlightSpecs(product) {
  const out = [];
  for (const key of SPEC_PRIORITY) {
    const raw = cleanSpecNoise(product.specs?.[key] ?? '');
    if (!raw || raw.length < 2 || /^\d+$/.test(raw)) continue;
    if (key === '主要功效' && raw.length > 22) continue;
    out.push({ key, value: toTW(raw).slice(0, 26) });
    if (out.length >= 6) break;
  }
  return out;
}

/** 產生單一商品的行銷內容（標題、賣點、FAQ、直播台詞）。 */
export function buildProductContent(product, index = 0) {
  const cc = pickCategoryCopy(product.category);
  const accent = ACCENTS[index % ACCENTS.length];
  // 標題清洗放在這裡（而不是快取檔），調整規則後直接重建即可生效
  const titleTW = toTW(cleanTitle(product.title || ''));
  const brand = toTW(product.brand || '日本選物');
  const titleCard = titleForCard(titleTW, 46);
  const shortName = titleForCard(titleTW, 34);

  const sellingPoints = [];
  for (const tag of product.tags) {
    const c = TAG_COPY[tag];
    if (c && !sellingPoints.some((s) => s.title === c.title)) sellingPoints.push({ ...c });
    if (sellingPoints.length >= 3) break;
  }
  // 官方商品說明與功效（Amazon 規格表內的文案，比包裝尺寸更有銷售力）
  const feature = cleanSpecNoise(product.specs?.商品特色 || '');
  if (feature.length > 12) {
    sellingPoints.push({
      icon: '📝',
      title: '日本官方商品說明',
      desc: toTW(feature).replace(/。$/, '').slice(0, 120) + '。',
    });
  }
  const effect = cleanSpecNoise(product.specs?.主要功效 || '');
  if (effect.length > 4) {
    sellingPoints.push({ icon: '✅', title: '主要功效', desc: toTW(effect).slice(0, 110) });
  }
  sellingPoints.push({ icon: '🧴', title: '這樣用最有感', desc: toTW(cc.usage) });
  for (const raw of product.bullets) {
    if (sellingPoints.length >= 5) break;
    const b = toTW(cleanSpecNoise(raw));
    if (b.length < 8 || b.length > 110) continue;
    // 規格型條列（尺寸、容量、產地…）已在規格 chips 呈現，不重複當賣點
    if (/^(風格|规格|規格|包裝尺寸|包裝重量|內容量|内容量|原產國|原产国|商品尺寸|商品の重量|適合膚質|适合肤质|原材料|品牌名稱|品牌名|製造商名稱|製造元|商品重量|成分|材質|適用|対象)/.test(b)) continue;
    if (/^(風格|規格)[:：]/.test(b)) continue;
    sellingPoints.push({ icon: '📌', title: '日本包裝標示', desc: b });
  }
  if (product.rating && product.reviews) {
    sellingPoints.push({
      icon: '⭐',
      title: `日本亞馬遜 ${product.rating} 星好評`,
      desc: `累積 ${product.reviews.toLocaleString('zh-TW')} 則評價，是日本藥妝架上回購率名列前茅的定番商品。`,
    });
  }

  const specs = highlightSpecs(product);
  const audience = [
    `${product.tags.includes('敏感肌友善') ? '敏感肌、換季容易泛紅的人' : '想找一瓶洗完不緊繃的人'}`,
    `${cc.routine <= 2 ? '每天都要化妝、需要快速卸除的人' : '保養有在做，但覺得效果卡住的人'}`,
    '想買日本原裝、又不想自己處理國際運費的人',
  ];

  const faq = [
    { q: '運費怎麼算？多久會到？', a: '本頁提供台灣到手價試算，已含國際運費預估。實際費率與配送時間以 Amazon 結帳頁顯示為準，一般約 4～10 個工作天。' },
    { q: '會被收關稅嗎？', a: '台灣進口郵包完稅價格在新台幣 2,000 元以下通常免稅；超過的部分會產生關稅與營業稅，本頁試算已預先估算，實際金額以海關認定為準。' },
    { q: '是正品嗎？', a: `商品直接由日本 Amazon（${product.source}）出貨，ASIN ${product.asin}，與日本當地藥妝店同步販售。` },
    { q: '這瓶適合我嗎？', a: `${cc.pain[0]}——如果你也有同樣的困擾，這瓶就是為你準備的。` },
    { q: '有效期限與保存方式？', a: '日本原裝出貨，保存期限依包裝標示。建議放置陰涼處、避免陽光直射，開封後盡早使用完畢。' },
  ];

  const priceLine = product.priceJpy ? `日本定價 ¥${product.priceJpy.toLocaleString('ja-JP')}` : '日本熱銷中';
  const proofLine = product.rating ? `${product.rating} 星、${product.reviews?.toLocaleString('zh-TW')} 則評價` : '日本藥妝長銷款';

  const liveIntro = [
    `接下來這瓶，日本當地 ${priceLine}，${proofLine}。`,
    `${cc.benefit}——這句話不是廣告詞，是這瓶的實際設計目的。`,
    `它的關鍵字是「${product.tags.slice(0, 3).join('・')}」，${cc.pain[0]}的人真的要試。`,
    `評分 ${product.rating ?? '—'} 星、${product.reviews?.toLocaleString('zh-TW') ?? '—'} 則評價，留言區很多人是回購第二次。`,
    `用法很簡單：${cc.usage}`,
    `如果你有「${cc.pain[1] ?? cc.pain[0]}」這種狀況，先把它加入清單，等等組合價更划算。`,
  ];

  return {
    asin: product.asin,
    accent,
    brand,
    titleTW,
    titleCard,
    shortName,
    headline: cc.benefit,
    subhead: cc.sub,
    painPoints: cc.pain.map(toTW),
    sellingPoints: sellingPoints.slice(0, 5),
    specs,
    audience: audience.map(toTW),
    usage: cc.usage,
    faq: faq.map((f) => ({ q: toTW(f.q), a: toTW(f.a) })),
    stars: ratingStars(product.rating),
    priceLine,
    proofLine,
    routine: cc.routine,
    liveIntro: liveIntro.map(toTW),
  };
}

/** 台灣觀眾聊天室語料，讓直播間看起來像真的有觀眾。 */
export const CHAT_POOL = [
  { u: '小豬_0921', m: '這瓶我已經回購第三次了 👍' },
  { u: 'Kiki_TW', m: '主播今天的聲音好清醒 哈' },
  { u: '阿宏', m: '+1  我要兩瓶' },
  { u: 'Mia✿', m: '想問一下 敏感肌可以用嗎？' },
  { u: '小葵的學生', m: '這價格比我上次去日本買還便宜…' },
  { u: '台北林太太', m: '已下單 等收貨 🤍' },
  { u: 'Hank', m: '運費怎麼算？直送台灣嗎' },
  { u: 'Yuki', m: '泥漿那瓶洗完真的不乾 推' },
  { u: '小安', m: '組合價是多少呀' },
  { u: 'Chiao', m: '直播間的資訊欄有連結嗎' },
  { u: '柚子', m: '泡沫卸妝那瓶超省時間 上班族救星' },
  { u: 'Peter_Lin', m: '會有關稅嗎？' },
  { u: '美妝控', m: '這個牌子日本藥妝店常缺貨欸' },
  { u: '小綠', m: '主播可以再示範一次用法嗎' },
  { u: 'Amy', m: '買了 3 件組 一次解決 🙌' },
  { u: '老王', m: '第一次跟直播 想試試看' },
  { u: 'Nina', m: '洗臉那瓶我用一年了 很穩' },
  { u: 'QQ糖', m: '可以刷卡嗎？' },
  { u: 'Ken', m: '三瓶一起買真的比較省運費' },
  { u: '小美', m: '已加入購物車 🛒' },
];

const now = () => new Date().toISOString();

/** 組出整頁模型：商品內容 + 價格試算 + 三件組合 + 直播腳本。 */
export function buildSiteModel(products, fx, { priceBreakdown } = {}) {
  const cfg = getConfig();
  // 依日本 Amazon 累積評價數排序，讓「熱銷 NO.1」有真實依據
  const ranked = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  const withPrices = ranked.map((p, i) => ({
    ...p,
    rank: i + 1,
    content: buildProductContent(p, i),
    price: priceBreakdown(p, fx.rate, 1),
  }));

  // 串聯三個商品：依保養順序排成一套流程
  const routine = [...withPrices].sort((a, b) => a.content.routine - b.content.routine);
  const bundle = routine.map((p, i) => ({
    step: i + 1,
    asin: p.asin,
    brand: p.content.brand,
    name: p.content.shortName,
    role: ROUTINE_LABEL[p.category] || p.category,
    image: p.hero,
    url: p.url,
    why: p.content.subhead,
    priceJpy: p.priceJpy,
    priceTwd: p.price.perUnitTwd,
    accent: p.content.accent,
  }));

  const bundleJpy = withPrices.reduce((s, p) => s + (p.priceJpy ?? 0), 0);
  const singleLandedTwd = withPrices.reduce((s, p) => s + p.price.landedTwd, 0);
  const goodsTotalTwd = withPrices.reduce((s, p) => s + p.price.goodsTwd, 0);
  // 合購真正的省法：三件只付一次國際運費（且關稅的完稅基礎更低）
  const shipCfg = getConfig().shipping;
  const totalWeightKg = withPrices.reduce((s, p) => s + p.price.weightKg, 0);
  const bundleShipTwd = Math.round(
    shipCfg.baseTwd + shipCfg.perItemTwd * withPrices.length + totalWeightKg * shipCfg.perKgTwd,
  );
  const bundleCustoms = customsFor(goodsTotalTwd, bundleShipTwd);
  const bundleLandedTwd = goodsTotalTwd + bundleShipTwd + bundleCustoms.customsTwd;
  const promoDiscountTwd = Math.round(bundleLandedTwd * cfg.marketing.promoDiscountRate);
  const bundleFinalTwd = bundleLandedTwd - promoDiscountTwd;

  const bundleModel = {
    steps: bundle,
    count: withPrices.length,
    jpyTotal: bundleJpy,
    goodsTotalTwd,
    singleLandedTwd,
    bundleShipTwd,
    bundleCustomsTwd: bundleCustoms.customsTwd,
    bundleLandedTwd,
    promoDiscountTwd,
    promoDiscountPercent: Math.round(cfg.marketing.promoDiscountRate * 100),
    savedTwd: Math.max(0, singleLandedTwd - bundleFinalTwd),
    finalTwd: bundleFinalTwd,
    savingsBreakdown: bundleCustoms.taxFree
      ? '三件合併成一張訂單，國際運費只收一次，還穩穩壓在免稅門檻內。'
      : '三件合併成一張訂單，國際運費只收一次；完稅價格超過免稅門檻的部分已含關稅與營業稅估算。',
    note: '所有商品合併成一張訂單結帳，國際運費只計算一次，件數越多平均每件越低。',
    urls: withPrices.map((p) => ({ asin: p.asin, url: p.url, label: p.content.shortName })),
  };

  const stats = {
    products: withPrices.length,
    ratingAvg:
      withPrices.reduce((s, p) => s + (p.rating || 0), 0) / (withPrices.filter((p) => p.rating).length || 1),
    reviewsTotal: withPrices.reduce((s, p) => s + (p.reviews || 0), 0),
    jpyTotal: bundleJpy,
  };

  return {
    generatedAt: now(),
    marketing: cfg.marketing,
    ai: cfg.ai,
    shippingCfg: cfg.shipping,
    customsCfg: cfg.customs,
    fx,
    products: withPrices,
    bundle: bundleModel,
    stats,
    chatPool: CHAT_POOL,
    stream: buildStream(withPrices, bundleModel, cfg),
  };
}

/** 產生 AI 生徒直播節目的完整時間軸（字幕、情緒、置入商品、聊天室事件）。 */
export function buildStream(products, bundle, cfg) {
  const segs = [];
  const n = products.length;
  const cn = ['', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'][n] ?? String(n);
  const label = n > 1 ? `${cn}瓶` : '這瓶';
  const add = (dur, text, mood, extra = {}) =>
    segs.push({
      dur,
      text: toTW(text),
      mood,
      bg1: extra.bg1 || '#33265a',
      bg2: extra.bg2 || '#100d1c',
      pin: extra.pin ?? null,
      chat: extra.chat || [],
    });

  const name = cfg.ai.personaName;
  const p0 = products[0];

  add(7, `哈囉～大家晚安！我是${name}，今天要開箱的是這個月台灣回購率最高的${label}日本藥妝。`, 'excited', {
    bg1: '#46284f',
    chat: [
      { u: '小豬_0921', m: '來了來了 🤍' },
      { u: '台北林太太', m: '今天有什麼好康' },
    ],
  });
  add(
    6,
    n > 2
      ? '順序很重要：先把妝卸乾淨、再洗臉、最後代謝角質。照這個順序用，效果差很多。'
      : '先講重點：用法、用量、還有台灣到手價怎麼算，我一次講清楚。',
    'happy',
    { chat: [{ u: 'Yuki', m: '這順序真的差很多 +1' }] },
  );

  products.forEach((p) => {
    const c = p.content;
    const bg1 = c.accent.from;
    const bg2 = '#140f22';
    add(7, `${c.brand} 的 ${c.shortName}。${c.headline}。`, 'happy', {
      bg1, bg2, pin: p.asin,
      chat: [{ u: '柚子', m: '這瓶我有在用 很推' }],
    });
    add(8, `${c.subhead} 日本定價 ${p.priceJpy ? '¥' + p.priceJpy.toLocaleString('ja-JP') : '—'}，` +
      `台灣到手大概 ${p.price.perUnitTwd ? 'NT$' + p.price.perUnitTwd.toLocaleString('zh-TW') : '依結帳頁'}。`, 'happy', {
      bg1, bg2, pin: p.asin,
      chat: [{ u: 'Chiao', m: '這個價格可以欸' }],
    });
    add(8, `${c.proofLine ? c.proofLine + '，' : ''}${c.painPoints[0]}的人真的要試。用法：${c.usage}`, 'excited', {
      bg1, bg2, pin: p.asin,
      chat: [
        { u: 'Mia✿', m: '想問敏感肌可以嗎' },
        { u: '小安', m: '+1' },
      ],
    });
  });

    add(
    9,
    n > 1
      ? `接下來是重點：這${label}一起用就是一套完整的日常保養流程，` +
        `而且合併成一張訂單結帳，國際運費只收一次，比一件一件買平均下來更省。`
      : '想知道台灣到手價怎麼算？頁面下方有試算器，數量調一下就知道含運費與關稅的總價。',
    'excited',
    {
      bg1: '#5a2a6b',
      bg2: '#140f22',
      chat: [
        { u: 'Ken', m: '一起買真的比較省運費' },
        { u: 'Amy', m: '已下單 🙌' },
      ],
    },
  );
  add(
    7,
    n > 1
      ? `合購到手價 ${bundle.finalTwd ? 'NT$' + bundle.finalTwd.toLocaleString('zh-TW') : ''}，` +
        `比分開買省下 ${bundle.savedTwd ? 'NT$' + bundle.savedTwd.toLocaleString('zh-TW') : '一趟運費'}。` +
        `想入手的話，先按下面的「一次買齊${cn}件」，我把連結都放在資訊欄。`
      : `我把商品連結放在資訊欄，先按下面的按鈕加進清單，等等一起看運費怎麼攤最划算。`,
    'excited',
    {
      bg1: '#2f6b5a',
      bg2: '#0d1a17',
      chat: [
        { u: 'QQ糖', m: '已加入購物車 🛒' },
        { u: '老王', m: '第一次跟直播 想試試看' },
      ],
    },
  );
  add(6, `今天的直播到這邊，${name} 每天同一時間開播。有任何膚況問題都可以在下面留言，我看到都會回。`, 'happy', {
    bg1: '#3a2b6b', bg2: '#100d1c',
    chat: [{ u: 'Nina', m: '謝謝主播 明天見 🤍' }],
  });

  return {
    title: `${name} 的日本藥妝選物台｜${n > 1 ? `${cn}瓶` : '單品'}搞定日常保養`,
    persona: name,
    personaRole: cfg.ai.personaRole,
    duration: segs.reduce((s, x) => s + x.dur, 0),
    segments: segs,
    firstProduct: p0?.asin ?? null,
  };
}

const ROUTINE_LABEL = {
  卸妝: 'STEP 1 · 先把妝卸乾淨',
  洗面乳: '洗臉 · 洗掉殘妝與皮脂',
  去角質: '代謝 · 把老廢角質推走',
  化妝水: '補水 · 打開吸收通道',
  精華液: '濃縮 · 把成分送進去',
  乳液乳霜: '鎖水 · 把水分關起來',
  防曬: '防護 · 白天最後一步',
};

export { ROUTINE_LABEL, ratingStars };
