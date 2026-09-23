export const clientScript = /* js */ `
(function () {
  'use strict';
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const twd = (n) => 'NT$' + Math.round(n).toLocaleString('en-US');
  const jpy = (n) => '¥' + Math.round(n).toLocaleString('en-US');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
  }

  /* ---------- 捲動進場 ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
    { threshold: 0.12 },
  );
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------- 商品圖庫 ---------- */
  $$('[data-gallery]').forEach((box) => {
    const main = $('.main img', box);
    $$('.thumbs button', box).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.thumbs button', box).forEach((b) => b.classList.toggle('on', b === btn));
        main.style.opacity = '0';
        setTimeout(() => {
          main.src = btn.dataset.src;
          main.style.opacity = '1';
        }, 130);
      });
    });
  });

  /* ---------- 購物車 ---------- */
  const STORE_KEY = 'onepage-cart-v1';
  const byAsin = Object.fromEntries(DATA.products.map((p) => [p.asin, p]));
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { cart = {}; }

  const dock = $('#dock');
  function cartCount() { return Object.values(cart).reduce((s, n) => s + n, 0); }
  function cartTwd() { return Object.entries(cart).reduce((s, [a, n]) => s + (byAsin[a] ? byAsin[a].price.perUnitTwd * n : 0), 0); }
  function saveCart() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {}
    renderCart();
    syncCalc();
  }
  function addToCart(asin, n) {
    if (!byAsin[asin]) return;
    cart[asin] = clamp((cart[asin] || 0) + (n || 1), 0, 99);
    if (!cart[asin]) delete cart[asin];
    saveCart();
    const p = byAsin[asin];
    toast('已加入：' + p.content.shortName.slice(0, 18) + (cart[asin] > 1 ? ' ×' + cart[asin] : ''));
    pushChat('系統', '🛒 ' + p.content.shortName.slice(0, 22) + ' 加入清單', 'sys');
  }
  function renderCart() {
    const n = cartCount();
    const t = $('#dockInfo');
    if (n > 0) {
      dock.classList.add('on');
      t.innerHTML = '<b>已選 ' + n + ' 件 · 預估到手 ' + twd(cartTwd()) + '</b>' +
        Object.entries(cart).map(([a, c]) => byAsin[a].content.brand + ' ×' + c).join('、');
    } else {
      dock.classList.remove('on');
    }
    $$('[data-add]').forEach((b) => {
      const a = b.dataset.add;
      b.textContent = cart[a] ? '已加入 ' + cart[a] + ' 件 ✓' : b.dataset.label;
    });
  }
  $$('[data-add]').forEach((b) => b.dataset.label = b.textContent);
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => addToCart(b.dataset.add, 1)));
  $('#dockClear').addEventListener('click', () => { cart = {}; saveCart(); toast('已清空清單'); });
  const bundleBtn = $('#bundleAdd');
  if (bundleBtn) bundleBtn.addEventListener('click', () => {
    DATA.bundle.steps.forEach((s) => addToCart(s.asin, 1));
    toast('三件組合已全部加入清單 🛒');
  });
  $('#dockBuy').addEventListener('click', function () {
    const list = Object.keys(cart);
    if (!list.length) return;
    list.forEach((a, i) => {
      const win = window.open(byAsin[a].url, '_blank', 'noopener');
      if (win && i === 0) win.focus();
    });
    toast('已為你開啟 ' + list.length + ' 個 Amazon 商品頁');
    pushChat('系統', '✅ 觀眾 ' + count + ' 送出 ' + list.length + ' 筆訂單連結', 'sys');
  });

  /* ---------- 台灣到手價試算器 ---------- */
  // 與伺服端 priceBreakdown 相同的計算邏輯，讓試算器可以即時反應數量變化
  const SHIP = DATA.shippingCfg, CUS = DATA.customsCfg, RATE = DATA.fx.rate;
  DATA.priceOf = function (p, q) {
    const jpyTotal = (p.priceJpy || 0) * q;
    const goodsTwd = Math.round(jpyTotal * RATE);
    const weightFee = Math.round((p.weightKg || SHIP.defaultItemWeightKg) * SHIP.perKgTwd) * q;
    const shippingTwd = Math.round(SHIP.baseTwd + SHIP.perItemTwd * q + weightFee);
    const dutiable = goodsTwd + shippingTwd;
    const dutyTwd = dutiable > CUS.dutyFreeLimitTwd ? Math.round(dutiable * CUS.dutyRate) : 0;
    const vatTwd = dutiable > CUS.dutyFreeLimitTwd ? Math.round((dutiable + dutyTwd) * CUS.vatRate) : 0;
    return { jpyTotal: jpyTotal, goodsTwd: goodsTwd, shippingTwd: shippingTwd, dutyTwd: dutyTwd, vatTwd: vatTwd,
      customsTwd: dutyTwd + vatTwd, landedTwd: goodsTwd + shippingTwd + dutyTwd + vatTwd };
  };
  const qty = Object.fromEntries(DATA.products.map((p) => [p.asin, 0]));
  function syncCalc() {
    let goods = 0, ship = 0, units = 0, jpyTotal = 0;
    DATA.products.forEach((p) => {
      const q = qty[p.asin];
      const row = $('#calc-qty-' + p.asin);
      if (row) row.textContent = q;
      if (!q) return;
      units += q;
      jpyTotal += (p.priceJpy || 0) * q;
      const b = DATA.priceOf(p, q);
      goods += b.goodsTwd;
      ship += b.shippingTwd;
    });
    const cfg = DATA.customsCfg, sc = DATA.shippingCfg;
    const dutiable = goods + ship;
    const duty = dutiable > cfg.dutyFreeLimitTwd ? Math.round(dutiable * cfg.dutyRate) : 0;
    const vat = dutiable > cfg.dutyFreeLimitTwd ? Math.round((dutiable + duty) * cfg.vatRate) : 0;
    const total = goods + ship + duty + vat;
    $('#calc-jpy').textContent = units ? jpy(jpyTotal) : '¥0';
    $('#calc-goods').textContent = twd(goods);
    $('#calc-ship').textContent = twd(ship);
    $('#calc-tax').innerHTML = duty + vat > 0 ? twd(duty + vat) : '<span class="free">免稅</span>';
    $('#calc-total').textContent = twd(total);
    $('#calc-hint').textContent = units
      ? units + ' 件 · 商品 ' + jpy(jpyTotal) + ' × 匯率 ' + DATA.fx.rate.toFixed(4) + ' · ' +
        (dutiable > cfg.dutyFreeLimitTwd ? '已超過 NT$' + cfg.dutyFreeLimitTwd + ' 免稅門檻，含預估關稅與營業稅' : '未達 NT$' + cfg.dutyFreeLimitTwd + ' 免稅門檻')
      : '調整上方數量即可看到含運費與關稅的台灣到手價。';
  }
  $$('[data-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.qty, d = Number(btn.dataset.d);
      qty[a] = clamp(qty[a] + d, 0, 99);
      syncCalc();
    });
  });
  $('#calc-fill') && $('#calc-fill').addEventListener('click', () => {
    DATA.products.forEach((p) => (qty[p.asin] = 1));
    syncCalc();
    toast('已帶入三件組合');
  });

  /* ---------- 聊天室 ---------- */
  const chatList = $('#chatList');
  const avatarHue = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ',62%,52%)';
  };
  function pushChat(user, msg, kind) {
    const el = document.createElement('div');
    el.className = 'msg' + (kind ? ' ' + kind : '');
    if (kind === 'sys') {
      el.innerHTML = '<div class="av" style="background:linear-gradient(135deg,#ff5e8a,#ff9a6b)">!</div><div class="tx">' + msg + '</div>';
    } else {
      el.innerHTML = '<div class="av" style="background:' + avatarHue(user) + '">' + user.slice(0, 1) + '</div>' +
        '<div class="tx"><b>' + user + '</b>' + msg + '</div>';
    }
    chatList.appendChild(el);
    while (chatList.children.length > 60) chatList.removeChild(chatList.firstChild);
    chatList.scrollTop = chatList.scrollHeight;
  }
  $('#chatForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const input = $('#chatInput');
    const v = input.value.trim();
    if (!v) return;
    pushChat('你', v, 'me');
    input.value = '';
    setTimeout(() => {
      pushChat(DATA.ai.personaName, pickReply(v), '');
    }, 900 + Math.random() * 700);
  });
  const REPLIES = [
    '收到！這瓶直接看頁面上的台灣到手價試算，含國際運費喔 🤍',
    '敏感肌的話可以放心，這瓶是低刺激配方，我自己也每天用。',
    '組合三件一起結帳只算一次國際運費，平均起來省最多！',
    '這是日本 Amazon 直送，出貨都會附上原始包裝，正品沒問題。',
    '超過 NT$2,000 會有關稅，頁面上的試算已經幫你估進去了。',
    '等等我把連結放到資訊欄，記得先加入清單才不會塞車 🛒',
  ];
  function pickReply(q) {
    if (/運費|運費|多少錢|價格|便宜/.test(q)) return '運費已含在頁面上的「台灣到手價」裡，三件一起買只算一次國際運費最划算。';
    if (/關稅|稅/.test(q)) return '完稅價格 NT$2,000 以下免稅，超過的部分我幫你估了關稅＋營業稅在試算表裡。';
    if (/正品|真|假/.test(q)) return '都是日本 Amazon 原裝出貨，ASIN 就在頁面上，可以直接去比對。';
    if (/敏感|過敏/.test(q)) return '這幾款都是低刺激路線，但每個人膚況不同，建議先局部測試。';
    if (/多久|幾天|到貨/.test(q)) return '日本直送台灣通常 4～10 個工作天，實際依 Amazon 結帳頁為準。';
    return REPLIES[Math.floor(Math.random() * REPLIES.length)];
  }

  /* ---------- AI 生徒直播模擬 ---------- */
  const S = DATA.stream;
  let idx = -1, elapsed = 0, playing = false, last = 0, tts = false, spoken = -1;
  const player = $('#player');
  const avatarBox = $('#avatarBox');
  const subEl = $('#subtitle');
  const bar = $('#progressBar');
  const timeEl = $('#timeLabel');
  const pinBox = $('#pinned');
  let count = 1200 + Math.floor(Math.random() * 400);

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    return m + ':' + String(s % 60).padStart(2, '0');
  };
  const segAt = (t) => {
    let acc = 0;
    for (let i = 0; i < S.segments.length; i++) {
      if (t < acc + S.segments[i].dur) return i;
      acc += S.segments[i].dur;
    }
    return S.segments.length - 1;
  };
  const startOf = (i) => S.segments.slice(0, i).reduce((s, x) => s + x.dur, 0);

  function setSegment(i) {
    if (i === idx) return;
    idx = i;
    const seg = S.segments[i];
    subEl.classList.add('fade');
    setTimeout(() => {
      subEl.innerHTML = '<span class="who">' + DATA.ai.personaName + ' · ' + DATA.ai.personaRole + '</span>' + seg.text;
      subEl.classList.remove('fade');
    }, 180);
    player.style.background = 'radial-gradient(120% 100% at 24% 0%,' + seg.bg1 + ',' + seg.bg2 + ' 62%)';
    if (seg.pin && byAsin[seg.pin]) {
      const p = byAsin[seg.pin];
      pinBox.innerHTML =
        '<div class="pinCard" style="display:flex;align-items:center;gap:12px;background:rgba(12,9,20,.86);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px);border-radius:16px;padding:10px 12px">' +
        '<img src="' + p.hero + '" alt="" style="width:52px;height:52px;object-fit:contain;background:#fff;border-radius:12px;padding:3px">' +
        '<div style="flex:1;min-width:0"><div style="font-size:11px;color:#ff8fa8;font-weight:900;letter-spacing:.08em">直播中置入商品</div>' +
        '<div style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.content.shortName + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.72)">' + jpy(p.priceJpy) + ' → 台灣到手 ' + twd(p.price.perUnitTwd) + '</div></div></div>';
      pinBox.style.display = 'block';
    } else {
      pinBox.style.display = 'none';
    }
    $$('.scriptItem').forEach((el, k) => el.classList.toggle('on', k === i));
    (seg.chat || []).forEach((c) => pushChat(c.u, c.m, ''));
    if (seg.mood === 'excited') burst(5);
    avatarBox.classList.add('speaking');
    clearTimeout(setSegment.t);
    setSegment.t = setTimeout(() => avatarBox.classList.remove('speaking'), seg.dur * 1000 - 220);
    speak(seg.text);
  }

  function speak(text) {
    if (!tts || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-TW';
      u.pitch = 1.45;
      u.rate = 1.06;
      u.volume = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function burst(n) {
    const box = $('#hearts');
    const emo = ['❤️', '👍', '🔥', '🤍', '✨', '🛒'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = emo[Math.floor(Math.random() * emo.length)];
      s.style.left = 8 + Math.random() * 84 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.fontSize = 14 + Math.random() * 14 + 'px';
      box.appendChild(s);
      setTimeout(() => s.remove(), 4400);
    }
  }

  function tick(dt) {
    elapsed += dt;
    if (elapsed >= S.duration) elapsed = 0;
    setSegment(segAt(elapsed));
    const pct = (elapsed / S.duration) * 100;
    bar.style.width = pct.toFixed(2) + '%';
    timeEl.textContent = fmt(elapsed) + ' / ' + fmt(S.duration);
  }

  let raf;
  function loop(now) {
    if (!playing) return;
    const dt = (now - last) / 1000;
    last = now;
    if (dt < 1) tick(dt);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (playing) return;
    playing = true;
    last = performance.now();
    $('#playBtn').textContent = '❚❚';
    $$('.wave i').forEach((i) => (i.style.opacity = 1));
    raf = requestAnimationFrame(loop);
    if (idx < 0) setSegment(0);
  }
  function pause() {
    playing = false;
    cancelAnimationFrame(raf);
    $('#playBtn').textContent = '▶';
    avatarBox.classList.remove('speaking');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    $$('.wave i').forEach((i) => (i.style.opacity = 0));
  }
  $('#playBtn').addEventListener('click', () => (playing ? pause() : play()));
  $('#skipBtn').addEventListener('click', () => {
    elapsed = startOf((idx + 1) % S.segments.length);
    setSegment(segAt(elapsed));
  });
  $('#progress').addEventListener('click', function (e) {
    const r = this.getBoundingClientRect();
    elapsed = clamp((e.clientX - r.left) / r.width, 0, 1) * S.duration;
    setSegment(segAt(elapsed));
  });
  $('#ttsBtn').addEventListener('click', function () {
    tts = !tts;
    this.textContent = tts ? '🔊' : '🔇';
    this.title = tts ? '關閉 AI 語音' : '開啟 AI 語音（用瀏覽器語音朗讀）';
    toast(tts ? 'AI 語音已開啟' : 'AI 語音已關閉');
    if (!tts && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (tts && playing) speak(S.segments[idx < 0 ? 0 : idx].text);
  });
  $('#fsBtn').addEventListener('click', () => {
    const el = $('#playerWrap');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
  });
  $$('.scriptItem').forEach((el, i) => {
    el.addEventListener('click', () => {
      elapsed = startOf(i);
      setSegment(i);
      play();
    });
  });

  const viewersEls = $$('[data-viewers]');
  setInterval(() => {
    count = clamp(count + Math.round((Math.random() - 0.42) * 60), 640, 9800);
    viewersEls.forEach((el) => (el.textContent = count.toLocaleString('en-US')));
    $('#liveStatViewers').textContent = count.toLocaleString('en-US');
  }, 2600);
  viewersEls.forEach((el) => (el.textContent = count.toLocaleString('en-US')));

  /* 觀眾隨機留言，讓直播間保持有人的感覺 */
  let ci = 0;
  setInterval(() => {
    if (Math.random() < 0.62) {
      const c = DATA.chatPool[ci++ % DATA.chatPool.length];
      pushChat(c.u, c.m, '');
      if (Math.random() < 0.25) burst(2);
    }
  }, 4200);

  /* 直播開播時間倒數 / 已在線時間 */
  const started = Date.now();
  setInterval(() => {
    const m = Math.floor((Date.now() - started) / 60000);
    $('#liveStatTime').textContent = m + ' 分';
  }, 5000);

  /* ---------- 初始化 ---------- */
  renderCart();
  syncCalc();
  ['這批日本藥妝是這個月回購率最高的三瓶，等等三件一起帶最省運費 🤍',
   '+' + count + ' 人正在線上看，留言區想要哪一瓶先跟我說！'].forEach((m, i) =>
    setTimeout(() => pushChat(DATA.ai.personaName, m, i === 0 ? '' : 'sys'), 400 + i * 1500));

  const streamIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && idx < 0) { setSegment(0); play(); }
      else if (!e.isIntersecting && playing) pause();
    });
  }, { threshold: 0.35 });
  streamIO.observe($('#live'));

  $$('[data-share]').forEach((b) =>
    b.addEventListener('click', async () => {
      const url = location.href;
      try {
        if (navigator.share) await navigator.share({ title: document.title, url });
        else { await navigator.clipboard.writeText(url); toast('已複製網址，快分享給朋友！'); }
      } catch (e) { toast('分享已取消'); }
    }));
})();
`;
