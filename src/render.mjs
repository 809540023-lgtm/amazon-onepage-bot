import { theme } from './theme.mjs';
import { clientScript } from './client.mjs';
import { avatarSvg } from './avatar.mjs';
import { fmtTwd, fmtJpy } from './fx.mjs';

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const jsonForScript = (obj) =>
  JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, (m) => `\\u${m.charCodeAt(0).toString(16)}`);

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const stars = (r) => {
  const full = Math.round(r || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

function clientData(model) {
  return {
    fx: model.fx,
    shippingCfg: model.shippingCfg,
    customsCfg: model.customsCfg,
    ai: model.ai,
    marketing: model.marketing,
    stats: model.stats,
    bundle: model.bundle,
    stream: model.stream,
    products: model.products.map((p) => ({
      asin: p.asin,
      url: p.url,
      title: p.content.titleTW,
      hero: p.hero,
      priceJpy: p.priceJpy,
      weightKg: p.price.weightKg,
      price: { perUnitTwd: p.price.perUnitTwd, landedTwd: p.price.landedTwd, shippingTwd: p.price.shippingTwd, goodsTwd: p.price.goodsTwd },
      content: { shortName: p.content.shortName, brand: p.content.brand, accent: p.content.accent },
    })),
  };
}

function productCard(p, i) {
  const c = p.content;
  return `
<article class="card reveal" id="p-${esc(p.asin)}">
  <div class="media" data-gallery>
    <span class="rank">熱銷 NO.${p.rank ?? i + 1}</span>
    <div class="tags-top">${p.tags.slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <div class="main"><img src="${esc(p.hero)}" alt="${esc(c.titleTW)}" loading="lazy" style="transition:opacity .13s"></div>
    <div class="thumbs">
      ${p.images.map((src, k) => `<button class="${k === 0 ? 'on' : ''}" data-src="${esc(src)}" aria-label="檢視第 ${k + 1} 張圖"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}
    </div>
  </div>
  <div class="body">
    <div class="brandrow">🇯🇵 <span class="b">${esc(c.brand)}</span> · ${esc(p.category)}</div>
    <h3 class="title" title="${esc(c.titleTW)}">${esc(c.titleCard)}</h3>
    <div class="rate"><span class="stars">${c.stars}</span> ${p.rating ?? '—'} · ${(p.reviews ?? 0).toLocaleString('zh-TW')} 則日本評價</div>
    <div class="pricebox">
      <div class="row">
        <span class="jpy">日本 ${p.priceJpy ? fmtJpy(p.priceJpy) : '—'}</span>
        <span class="twd">${fmtTwd(p.price.perUnitTwd)}</span>
      </div>
      <div class="sub">商品本體約 ${fmtTwd(p.price.goodsTwd)} · 單獨購買國際運費 ${fmtTwd(p.price.shippingTwd)}${p.price.customsTwd ? ' · 含稅估算 ' + fmtTwd(p.price.customsTwd) : ' · 未達免稅門檻'} · 合購可攤平運費</div>
    </div>
    <div class="selling">
      ${c.sellingPoints.slice(0, 4).map((s) => `<div class="sp"><span class="ic">${s.icon}</span><div><b>${esc(s.title)}</b><span>${esc(s.desc)}</span></div></div>`).join('')}
    </div>
    ${c.specs.length ? `<div class="specrow">${c.specs.map((s) => `<span class="s" title="${esc(s.key)}：${esc(s.value)}">${esc(s.key)}：${esc(s.value)}</span>`).join('')}</div>` : ''}
    <div class="actions">
      <button class="btn btn-primary" data-add="${esc(p.asin)}">加入清單</button>
      <a class="btn btn-ghost btn-sm" href="${esc(p.url)}" target="_blank" rel="nofollow sponsored noopener">前往日本 Amazon ↗</a>
    </div>
  </div>
</article>`;
}

export function renderSite(model) {
  const { marketing, ai, stats, bundle, fx } = model;
  const hero = model.products[0];
  const stream = model.stream;
  const avatar = avatarSvg();
  const pageTitle = `${marketing.brand} · AI 生徒${ai.personaName}的日本藥妝選物台｜${stats.products} 項日本藥妝搞定日常保養`;

  return `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="日本 Amazon 熱銷藥妝直送台灣，${stats.products} 款嚴選、AI 生徒 ${esc(ai.personaName)} 直播開箱，附台灣到手價含運費關稅試算。">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${stats.products} 款日本熱銷商品，台灣到手價一次算給你。">
<meta property="og:image" content="${esc(hero.hero)}">
<meta name="theme-color" content="#ff5e8a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Zen+Maru+Gothic:wght@700;900&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
<style>${theme}</style>
</head>
<body>

<div class="topbar">
  <div class="track">
    ${Array.from({ length: 2 }).map(() => `
    <span>🇯🇵 <b>日本 Amazon 原裝直送</b> 台灣</span>
    <span>🔴 AI 生徒 <b>${esc(ai.personaName)}</b> 24H 選物直播中</span>
    <span>🛒 三件組合一起結帳 <b>只算一次國際運費</b></span>
    <span>💴 匯率 1 JPY = ${fx.rate.toFixed(4)} TWD（${esc(fx.updatedAt ? fmtDate(fx.updatedAt) : '本地快取')}）</span>`).join('')}
  </div>
</div>

<header class="nav">
  <div class="wrap inner">
    <div class="brand"><span class="dot">🌸</span>${esc(marketing.brand)}</div>
    <nav class="links">
      <a href="#products">熱銷三強</a>
      <a href="#routine">三件組合</a>
      <a href="#live">AI 直播間</a>
      <a href="#calculator">運費試算</a>
      <a href="#faq">常見問題</a>
    </nav>
    <a class="live-dot" href="#live"><i></i>LIVE</a>
  </div>
</header>

<!-- ================= HERO ================= -->
<section class="hero wrap">
  <div class="grid">
    <div>
      <span class="eyebrow">✦ 日本 Amazon 直送選物</span>
      <h1>台灣人最愛的日本藥妝，<br><span class="grad">AI 生徒幫你挑、幫你算。</span></h1>
      <p class="lead">這一頁把 ${stats.products} 款日本藥妝熱銷商品放在一起：日本原價、台灣到手價（含國際運費與關稅試算）、真實評價，還有 AI 生徒 ${esc(ai.personaName)} 的直播開箱。點一下就能直接跳去日本 Amazon 下單。</p>
      <div class="stats">
        <div class="s"><b>${stats.products}</b><small>嚴選商品</small></div>
        <div class="s"><b>${stats.ratingAvg.toFixed(1)}</b><small>平均評價星等</small></div>
        <div class="s"><b>${stats.reviewsTotal.toLocaleString('zh-TW')}</b><small>累積日本評價</small></div>
        <div class="s"><b>${bundle.savedTwd ? fmtTwd(bundle.savedTwd) : '免運'}</b><small>組合最高省下</small></div>
      </div>
      <div class="cta-row">
        <a class="btn btn-primary" href="#live">▶ 進入 AI 直播間</a>
        <a class="btn btn-dark" href="#products">看熱銷三強</a>
        <button class="btn btn-ghost" data-share>分享這一頁</button>
      </div>
    </div>

    <div class="heroCard">
      <div class="stage">
        <div class="badge-live"><span class="live-dot"><i></i>LIVE</span></div>
        <div class="avatarWrap" id="heroAvatar">${avatar}</div>
        <div class="wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
        <div class="caption">「${esc(hero.content.headline)}」</div>
      </div>
      <div class="meta">
        <div class="av" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ff5e8a,#7c5cff);display:grid;place-items:center;font-weight:900;color:#fff">葵</div>
        <div>
          <div class="nm">${esc(ai.personaName)} <span class="chip" style="margin-left:6px">AI 生徒</span></div>
          <small>${esc(ai.personaRole)} · 每天 20:00 開播</small>
        </div>
        <a class="btn btn-primary btn-sm" href="#live" style="margin-left:auto">觀看</a>
      </div>
    </div>
  </div>
</section>

<!-- ================= 商品 ================= -->
<section class="section wrap" id="products">
  <div class="reveal">
    <span class="eyebrow">熱銷 TOP ${stats.products}</span>
    <h2 class="h2">這一季，台灣人<span class="grad">最常回購</span>的日本藥妝</h2>
    <p class="lead">資料直接抓自日本 Amazon 商品頁（標題、價格、評價、圖片皆為即時擷取），並依累積評價數排序。價格以日幣標示，同時附上含國際運費與關稅的台灣到手價試算。</p>
  </div>
  <div class="grid3">
    ${model.products.map(productCard).join('')}
  </div>
</section>

<!-- ================= 三件組合 ================= -->
${model.products.length > 1 ? `
<section class="section wrap" id="routine">
  <div class="reveal">
    <span class="eyebrow">串聯三件 · 一套流程</span>
    <h2 class="h2">不是三瓶分開買，而是<span class="grad">一套完整的保養順序</span></h2>
    <p class="lead">把三瓶排進每天的步驟裡，才知道為什麼要照這個順序：先卸、再洗、最後代謝。三件一起結帳只算一次國際運費。</p>
  </div>

  <div class="routine">
    <div class="timeline reveal">
      ${bundle.steps.map((s) => `
      <div class="tstep">
        <div class="num" style="background:linear-gradient(135deg,${s.accent.from},${s.accent.to})">${s.step}</div>
        <div class="box">
          <img src="${esc(s.image)}" alt="${esc(s.name)}" loading="lazy">
          <div>
            <div class="role">${esc(s.role)}</div>
            <h4>${esc(s.brand)} · ${esc(s.name)}</h4>
            <p>${esc(s.why)}</p>
          </div>
          <div class="p">
            <b>${fmtTwd(s.priceTwd)}</b>
            <small>日本 ${s.priceJpy ? fmtJpy(s.priceJpy) : '—'}</small>
          </div>
        </div>
      </div>`).join('')}
    </div>

    <aside class="bundleCard reveal">
      <div class="badge">🛒 三件一起帶最划算</div>
      <h3>卸妝 → 洗臉 → 代謝角質<br>一次買齊</h3>
      <div class="bline"><span>日本商品總額</span><span>${fmtJpy(bundle.jpyTotal)}</span></div>
      <div class="bline"><span>商品金額（台幣）</span><span>${fmtTwd(bundle.goodsTotalTwd)}</span></div>
      <div class="bline"><span>三件分開買（各含運費）</span><span>${fmtTwd(bundle.singleLandedTwd)}</span></div>
      <div class="bline"><span>合購只收一次運費</span><span class="save">+ ${fmtTwd(bundle.bundleShipTwd)}</span></div>
      <div class="bline total"><span>合購到手價<small style="display:block;font-size:11.5px;color:rgba(255,255,255,.55);font-weight:600">比單買省下 ${fmtTwd(bundle.savedTwd)}</small></span><span class="big">${fmtTwd(bundle.finalTwd)}</span></div>
      <p class="note">${esc(bundle.savingsBreakdown)} ${esc(bundle.note)} 實際售價、運費與稅金一律以 Amazon 結帳頁顯示為準，本頁數字為估算參考。</p>
      <button class="btn btn-primary" id="bundleAdd">一次買齊 ${bundle.count} 件</button>
      <div style="display:flex;gap:8px;margin-top:10px">
        ${bundle.steps.map((s) => `<a class="btn btn-ghost btn-sm" style="flex:1;justify-content:center;white-space:nowrap" href="${esc(s.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(s.brand)} ↗</a>`).join('')}
      </div>
    </aside>
  </div>
</section>
` : ''}

<!-- ================= AI 直播間 ================= -->
<section class="liveSection" id="live">
  <div class="wrap">
    <div class="reveal">
      <span class="eyebrow">🔴 LIVE NOW · AI 生徒影音直播模擬</span>
      <h2 class="h2" style="color:#fff">${esc(ai.personaName)} 的直播間：<span class="grad">${stats.products} 項商品開箱中</span></h2>
      <p class="lead">這是模擬的 YouTube 直播畫面：AI 生徒會依照腳本逐句講解、字幕同步跑，講到哪一瓶，播放器裡就會跳出售價。按「🔇」可以用瀏覽器語音朗讀，真的聽到她說話。聊天室是你跟 AI 生徒的對話，你問什麼她都會依商品資料回答。</p>
    </div>

    <div class="liveLayout">
      <div class="playerWrap" id="playerWrap">
        <div class="player" id="player">
          <div class="pin">
            <span class="lb"><i></i>LIVE</span>
            <span class="cc">CC 中文字幕（自動）</span>
          </div>
          <div class="avatarWrap" id="avatarBox">${avatar}</div>
          <div class="wave" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
          <div class="hearts" id="hearts"></div>
          <div class="pinned" id="pinned"></div>
          <div class="subtitle" id="subtitle"><span class="who">${esc(ai.personaName)} · ${esc(ai.personaRole)}</span>準備開播中…</div>
          <div class="controls">
            <button id="playBtn" title="播放 / 暫停">▶</button>
            <button id="skipBtn" title="下一段">⏭</button>
            <div class="bar" id="progress"><i id="progressBar"></i></div>
            <span class="t" id="timeLabel">00:00 / ${String(Math.floor(stream.duration / 60)).padStart(2, '0')}:${String(stream.duration % 60).padStart(2, '0')}</span>
            <button id="ttsBtn" title="開啟 AI 語音（用瀏覽器語音朗讀）">🔇</button>
            <button id="fsBtn" title="全螢幕">⛶</button>
          </div>
        </div>
      </div>

      <div class="chatBox">
        <div class="head">💬 直播聊天室 <small>即時 · ${esc(ai.personaName)} 會回你</small></div>
        <div class="chatList" id="chatList"></div>
        <form class="chatInput" id="chatForm">
          <input id="chatInput" maxlength="80" placeholder="問 ${esc(ai.personaName)}：敏感肌可以用嗎？">
          <button type="submit">送出</button>
        </form>
      </div>
    </div>

    <div class="liveStats">
      <div class="c"><b>${stream.segments.length}</b><small>直播段落</small></div>
      <div class="c"><b>${Math.floor(stream.duration / 60)}:${String(stream.duration % 60).padStart(2, '0')}</b><small>節目長度</small></div>
    </div>

    <div class="script reveal">
      <h3>📜 直播腳本時間表（點任一則是直接跳播）</h3>
      <div class="scriptList">
        ${stream.segments.map((s, i) => `
        <div class="scriptItem">
          <span class="t">${String(Math.floor(stream.segments.slice(0, i).reduce((a, x) => a + x.dur, 0) / 60)).padStart(2, '0')}:${String(stream.segments.slice(0, i).reduce((a, x) => a + x.dur, 0) % 60).padStart(2, '0')}</span>
          <div><b>${s.pin ? '🛒 商品置入' : s.mood === 'excited' ? '🔥 帶動氣氛' : '🎓 教學段落'}</b>${esc(s.text.slice(0, 46))}…</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<!-- ================= 試算器 ================= -->
<section class="section wrap" id="calculator">
  <div class="reveal">
    <span class="eyebrow">台灣到手價試算</span>
    <h2 class="h2">日幣標價之外，<span class="grad">你還得付多少？</span></h2>
    <p class="lead">調整數量，立刻看到商品金額、國際運費、關稅與營業稅的估算明細。匯率為即時日幣匯率，運費依重量與件數估算。</p>
  </div>

  <div class="calc">
    <div class="calcForm reveal">
      ${model.products.map((p) => `
      <div class="calcRow">
        <img src="${esc(p.hero)}" alt="" loading="lazy">
        <div class="nm">${esc(p.content.shortName)}<span class="jp">日本 ${p.priceJpy ? fmtJpy(p.priceJpy) : '—'} · 約 ${p.price.weightKg.toFixed(2)}kg</span></div>
        <div class="qty">
          <button data-qty="${esc(p.asin)}" data-d="-1" aria-label="減少">−</button>
          <span id="calc-qty-${esc(p.asin)}">0</span>
          <button data-qty="${esc(p.asin)}" data-d="1" aria-label="增加">＋</button>
        </div>
      </div>`).join('')}
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn-dark btn-sm" id="calc-fill">帶入三件組合</button>
        <a class="btn btn-ghost btn-sm" href="#products">回到商品區</a>
      </div>
    </div>

    <aside class="invoice reveal">
      <h3>💴 台灣到手價明細</h3>
      <div class="sub" id="calc-hint">調整左側數量，這裡會即時計算。</div>
      <div class="inv"><span>日本商品總額</span><span class="v" id="calc-jpy">¥0</span></div>
      <div class="inv"><span>商品金額（台幣）</span><span class="v" id="calc-goods">NT$0</span></div>
      <div class="inv"><span>國際運費估算</span><span class="v" id="calc-ship">NT$0</span></div>
      <div class="inv"><span>關稅 + 營業稅估算</span><span class="v" id="calc-tax">免稅</span></div>
      <div class="inv total"><span>預估到手總價</span><span class="v" id="calc-total">NT$0</span></div>
      <div class="banner">完稅價格未達 NT$${model.customsCfg.dutyFreeLimitTwd.toLocaleString('zh-TW')} 免稅；超過部分以關稅 ${Math.round(model.customsCfg.dutyRate * 100)}% + 營業稅 ${Math.round(model.customsCfg.vatRate * 100)}% 估算。實際稅額由海關認定，運費依 Amazon 實際收取為準。</div>
    </aside>
  </div>
</section>

<!-- ================= FAQ ================= -->
<section class="section wrap" id="faq">
  <div class="reveal">
    <span class="eyebrow">常見問題</span>
    <h2 class="h2">下單前，大家最想問的 <span class="grad">5 件事</span></h2>
  </div>
  <div class="faq reveal">
    ${model.products[0].content.faq.map((f) => `
    <details class="qa"><summary>${esc(f.q)}</summary><div class="a">${esc(f.a)}</div></details>`).join('')}
    <details class="qa"><summary>為什麼這一頁會有 AI 生徒直播？</summary>
      <div class="a">這一頁是用「日本 Amazon 商品網址 → 一頁式銷售網站」的產生器自動做出來的。AI 生徒 ${esc(ai.personaName)} 的直播畫面、字幕與聊天室都是模擬呈現，用來示範商品在直播情境下怎麼被介紹；實際開播時把同樣的腳本搬進 OBS／YouTube 直播即可。</div>
    </details>
    <details class="qa"><summary>價格什麼時候會變？</summary>
      <div class="a">日本 Amazon 價格與庫存會隨時間變動。本頁資料擷取時間為 ${fmtDate(model.generatedAt)}，若與 Amazon 頁面不同，一律以 Amazon 結帳頁為準。重新執行產生器即可更新。</div>
    </details>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <div class="brand" style="color:#fff"><span class="dot">🌸</span>${esc(marketing.brand)}</div>
        <p style="margin-top:12px;line-height:1.9">用一個網址，做出一頁能賣的網站。<br>每次貼上日本 Amazon 商品連結，就會自動更新這一頁。</p>
      </div>
      <div>
        <h4>本頁商品</h4>
        ${model.products.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.content.shortName.slice(0, 26))} ↗</a>`).join('')}
      </div>
      <div>
        <h4>頁面資訊</h4>
        <a href="#products">熱銷三強</a>
        <a href="#routine">三件組合</a>
        <a href="#live">AI 直播間</a>
        <a href="#calculator">運費試算</a>
        <a href="#" data-share>分享這一頁</a>
      </div>
    </div>
    <div class="disc">
      免責聲明：本頁為商品資訊整理與導購頁面，商品售價、庫存、運費與稅金一律以 Amazon.co.jp 結帳頁面為準，本頁試算數字僅供參考。
      所有商品圖片與商標版權屬於原品牌與 Amazon 所有。ASIN：${model.products.map((p) => esc(p.asin)).join('、')} ·
      資料擷取：${fmtDate(model.generatedAt)} · 匯率：1 JPY = ${fx.rate.toFixed(4)} TWD${fx.fallback ? '（預設值）' : ''} ·
      本頁由 amazon-onepage-bot 自動產生。
    </div>
  </div>
</footer>

<div class="dock" id="dock">
  <span class="ic">🛒</span>
  <div class="info" id="dockInfo"></div>
  <button class="clear" id="dockClear">清空</button>
  <button class="btn btn-primary" id="dockBuy">前往 Amazon 結帳</button>
</div>
<a class="floatLive" href="#live">🔴 <span>LIVE</span></a>
<div class="toast" id="toast"></div>

<script type="application/json" id="site-data">${jsonForScript(clientData(model))}</script>
<script>${clientScript}</script>
</body>
</html>`;
}
