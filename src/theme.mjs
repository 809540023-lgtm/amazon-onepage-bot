export const theme = /* css */ `
:root{
  --bg:#fff9f7; --bg-2:#f6f7ff; --ink:#191624; --ink-2:#3d3648; --muted:#7a7288;
  --line:rgba(25,22,36,.09); --card:#ffffff; --glass:rgba(255,255,255,.72);
  --pink:#ff5e8a; --coral:#ff9a6b; --gold:#f5a524; --mint:#12b886; --violet:#7c5cff;
  --dark:#0e0c16; --dark-2:#171426;
  --shadow-s:0 2px 10px rgba(25,22,36,.06);
  --shadow-m:0 12px 34px -12px rgba(25,22,36,.18);
  --shadow-l:0 40px 80px -30px rgba(25,22,36,.32);
  --r-s:12px; --r-m:18px; --r-l:26px;
  --max:1180px;
  --font:"Noto Sans TC","PingFang TC","Hiragino Sans","Microsoft JhengHei",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --display:"Zen Maru Gothic","Noto Sans TC","PingFang TC","Hiragino Maru Gothic ProN",var(--font);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{
  margin:0;background:
    radial-gradient(1200px 600px at 12% -8%,rgba(255,94,138,.16),transparent 60%),
    radial-gradient(900px 500px at 92% 4%,rgba(124,92,255,.14),transparent 62%),
    radial-gradient(800px 600px at 50% 100%,rgba(18,184,134,.10),transparent 60%),
    linear-gradient(180deg,var(--bg),var(--bg-2));
  color:var(--ink);font-family:var(--font);line-height:1.75;letter-spacing:.01em;
  overflow-x:hidden;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:var(--display);line-height:1.28;margin:0;letter-spacing:-.01em}
p{margin:0}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
.wrap{width:100%;max-width:var(--max);margin:0 auto;padding:0 22px}
.section{padding:82px 0}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--pink);background:rgba(255,94,138,.10);border:1px solid rgba(255,94,138,.22);
  padding:7px 14px;border-radius:999px}
.h2{font-size:clamp(26px,4.2vw,42px);margin:16px 0 12px}
.lead{color:var(--muted);font-size:16px;max-width:62ch}
.grad{background:linear-gradient(100deg,var(--pink),var(--coral) 45%,var(--gold));
  -webkit-background-clip:text;background-clip:text;color:transparent}

/* ---------- 跑馬燈 ---------- */
.topbar{background:linear-gradient(90deg,#1b1630,#2a1b3d 40%,#3a1c33);color:#fff;font-size:12.5px;
  overflow:hidden;white-space:nowrap;position:relative;z-index:60}
.topbar .track{display:inline-flex;gap:44px;padding:9px 0;animation:marquee 34s linear infinite}
.topbar span{opacity:.92;font-weight:600}
.topbar b{color:#ffd6e3}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------- 導覽列 ---------- */
.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(16px) saturate(150%);
  background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(255,255,255,.62));border-bottom:1px solid var(--line)}
.nav .inner{display:flex;align-items:center;gap:18px;height:66px}
.brand{display:flex;align-items:center;gap:11px;font-family:var(--display);font-weight:800;font-size:17px}
.brand .dot{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--pink),var(--coral));
  box-shadow:0 6px 18px -6px rgba(255,94,138,.9);display:grid;place-items:center;font-size:15px}
.nav .links{display:flex;gap:4px;margin-left:auto}
.nav .links a{padding:9px 13px;border-radius:999px;font-size:14px;font-weight:600;color:var(--ink-2)}
.nav .links a:hover{background:rgba(25,22,36,.05)}
.live-dot{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;color:#fff;
  background:linear-gradient(90deg,#ff2d55,#ff5e8a);padding:7px 13px;border-radius:999px;
  box-shadow:0 8px 20px -8px rgba(255,45,85,.9)}
.live-dot i{width:7px;height:7px;border-radius:50%;background:#fff;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}

/* ---------- Hero ---------- */
.hero{padding:74px 0 40px;position:relative}
.hero .grid{display:grid;grid-template-columns:1.08fr .92fr;gap:54px;align-items:center}
.hero h1{font-size:clamp(32px,5.4vw,58px);margin:18px 0 18px}
.hero .lead{font-size:17px}
.stats{display:flex;gap:30px;flex-wrap:wrap;margin:30px 0 4px}
.stats .s{min-width:96px}
.stats b{display:block;font-family:var(--display);font-size:26px;line-height:1.2}
.stats small{color:var(--muted);font-size:12.5px;font-weight:600;letter-spacing:.04em}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.btn{display:inline-flex;align-items:center;gap:9px;padding:14px 24px;border-radius:999px;font-weight:800;font-size:15px;
  transition:transform .18s ease,box-shadow .25s ease;border:1px solid transparent}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:linear-gradient(135deg,var(--pink),var(--coral));color:#fff;
  box-shadow:0 16px 34px -14px rgba(255,94,138,.95)}
.btn-dark{background:var(--ink);color:#fff;box-shadow:var(--shadow-m)}
.btn-ghost{background:rgba(255,255,255,.8);border-color:var(--line);box-shadow:var(--shadow-s)}
.btn-sm{padding:10px 17px;font-size:13.5px}

/* Hero 直播卡 */
.heroCard{position:relative;border-radius:var(--r-l);padding:22px;background:var(--glass);
  border:1px solid rgba(255,255,255,.85);box-shadow:var(--shadow-l);backdrop-filter:blur(14px)}
.heroCard .stage{position:relative;border-radius:20px;overflow:hidden;
  background:radial-gradient(120% 120% at 30% 0%,#2b2247,#120f1f 70%);aspect-ratio:4/3.15}
.heroCard .badge-live{position:absolute;top:12px;left:12px;z-index:3;display:flex;gap:8px;align-items:center}
.heroCard .viewers{position:absolute;top:12px;right:12px;z-index:3;font-size:11.5px;font-weight:700;color:#fff;
  background:rgba(0,0,0,.42);padding:5px 11px;border-radius:999px;backdrop-filter:blur(6px)}
.heroCard .caption{position:absolute;bottom:12px;left:12px;right:12px;z-index:3;font-size:13px;font-weight:700;color:#fff;
  background:rgba(0,0,0,.5);backdrop-filter:blur(8px);padding:9px 13px;border-radius:12px;
  border-left:3px solid var(--pink)}
.heroCard .meta{display:flex;align-items:center;gap:12px;margin-top:16px}
.heroCard .meta .nm{font-weight:800;font-family:var(--display)}
.heroCard .meta small{color:var(--muted);font-size:12.5px;display:block;font-weight:600}

/* ---------- 頭像 ---------- */
.avatar{width:100%;height:100%;display:block}
.avatarWrap{position:absolute;inset:0;display:grid;place-items:center}
.avatarWrap svg{height:104%;width:auto;filter:drop-shadow(0 24px 40px rgba(0,0,0,.45))}
.avatarWrap .bob{animation:bob 4.2s ease-in-out infinite;transform-origin:50% 100%}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-9px) rotate(.5deg)}}
.avatarWrap .hairBack{animation:sway 5.6s ease-in-out infinite;transform-origin:50% 20%}
@keyframes sway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.6deg)}}
.avatarWrap .eye{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5.4s infinite}
.avatarWrap .eye.r{animation-delay:.06s}
@keyframes blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.06)}}
.avatarWrap .mouth{transform-origin:50% 50%;transform-box:fill-box}
.avatarWrap.speaking .mouth{animation:talk .32s ease-in-out infinite}
@keyframes talk{0%,100%{transform:scale(1,1)}35%{transform:scale(1.18,1.7)}70%{transform:scale(.9,.5)}}
.avatarWrap.speaking .glow{opacity:1}
.avatarWrap .glow{opacity:.35;transition:opacity .3s}
.wave{position:absolute;left:50%;bottom:12%;transform:translateX(-50%);display:flex;gap:4px;align-items:flex-end;height:34px}
.wave i{width:4px;border-radius:3px;background:linear-gradient(180deg,var(--pink),var(--violet));height:8px;opacity:.55}
.avatarWrap.speaking ~ .wave i,.speaking .wave i{animation:eq .9s ease-in-out infinite;opacity:.95}
.wave i:nth-child(2){animation-delay:.1s}.wave i:nth-child(3){animation-delay:.2s}
.wave i:nth-child(4){animation-delay:.3s}.wave i:nth-child(5){animation-delay:.15s}
.wave i:nth-child(6){animation-delay:.25s}.wave i:nth-child(7){animation-delay:.05s}
@keyframes eq{0%,100%{height:8px}50%{height:32px}}
.player .wave{left:auto;right:20px;bottom:auto;top:58px;transform:none;height:26px}
.heroCard .wave{left:auto;right:18px;bottom:66px;transform:none}
.heroCard .wave i{animation:eq 1.5s ease-in-out infinite;opacity:.85}

/* ---------- 商品卡 ---------- */
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:44px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-l);overflow:hidden;
  box-shadow:var(--shadow-m);display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow-l)}
.card .media{position:relative;background:linear-gradient(160deg,#fff,#f7f4ff);padding:16px;border-bottom:1px solid var(--line)}
.card .media .main{aspect-ratio:1;border-radius:16px;overflow:hidden;background:#fff;display:grid;place-items:center}
.card .media .main img{width:100%;height:100%;object-fit:contain;transition:transform .5s ease}
.card:hover .media .main img{transform:scale(1.06)}
.thumbs{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:2px}
.thumbs button{flex:0 0 46px;height:46px;border-radius:11px;overflow:hidden;background:#fff;border:2px solid transparent;
  box-shadow:var(--shadow-s);padding:3px}
.thumbs button.on{border-color:var(--pink)}
.thumbs img{width:100%;height:100%;object-fit:contain}
.rank{position:absolute;top:14px;left:14px;z-index:2;font-size:11.5px;font-weight:900;letter-spacing:.06em;
  color:#fff;background:linear-gradient(135deg,var(--pink),var(--coral));padding:6px 12px;border-radius:999px;
  box-shadow:0 10px 24px -10px rgba(255,94,138,.95)}
.tags-top{position:absolute;top:14px;right:14px;z-index:2;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.chip{font-size:11px;font-weight:800;background:rgba(255,255,255,.92);border:1px solid var(--line);
  padding:5px 10px;border-radius:999px;color:var(--ink-2);backdrop-filter:blur(6px)}
.card .body{padding:20px;display:flex;flex-direction:column;gap:13px;flex:1}
.brandrow{display:flex;align-items:center;gap:9px;font-size:12.5px;font-weight:800;color:var(--muted)}
.brandrow .b{color:var(--ink);font-family:var(--display);font-size:14px}
.title{font-size:16.5px;font-weight:800;line-height:1.45}
.stars{color:var(--gold);font-size:13.5px;letter-spacing:1px}
.rate{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);font-weight:600}
.pricebox{background:linear-gradient(135deg,rgba(255,94,138,.07),rgba(245,165,36,.07));
  border:1px dashed rgba(255,94,138,.32);border-radius:16px;padding:13px 15px}
.pricebox .row{display:flex;align-items:baseline;gap:10px;justify-content:space-between}
.pricebox .jpy{color:var(--muted);font-size:13px;text-decoration:line-through}
.pricebox .twd{font-family:var(--display);font-size:27px;font-weight:800;color:var(--pink)}
.pricebox .sub{font-size:11.5px;color:var(--muted);margin-top:3px;font-weight:600}
.selling{display:flex;flex-direction:column;gap:10px}
.selling .sp{display:flex;gap:10px;font-size:13.5px;align-items:flex-start}
.selling .sp .ic{flex:0 0 22px;text-align:center;font-size:15px}
.selling .sp b{display:block;font-size:13.5px}
.selling .sp span{color:var(--muted);font-size:12.5px;line-height:1.6}
.specrow{display:flex;flex-wrap:wrap;gap:7px}
.specrow .s{font-size:11.5px;background:rgba(25,22,36,.045);padding:5px 10px;border-radius:9px;color:var(--ink-2);
  font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card .actions{margin-top:auto;display:flex;flex-direction:column;gap:9px}

/* ---------- 組合流程 ---------- */
.routine{margin-top:44px;display:grid;grid-template-columns:1.15fr .85fr;gap:30px;align-items:start}
.timeline{position:relative;padding-left:0}
.tstep{display:grid;grid-template-columns:64px 1fr;gap:16px;position:relative;padding-bottom:22px}
.tstep:not(:last-child)::before{content:"";position:absolute;left:31px;top:64px;bottom:0;width:2px;
  background:linear-gradient(180deg,rgba(255,94,138,.5),rgba(124,92,255,.16))}
.tstep .num{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;font-family:var(--display);
  font-weight:800;font-size:19px;color:#fff;box-shadow:var(--shadow-m);position:relative;z-index:1}
.tstep .box{background:var(--card);border:1px solid var(--line);border-radius:var(--r-m);padding:16px;display:flex;gap:14px;
  box-shadow:var(--shadow-s);align-items:center}
.tstep .box img{width:74px;height:74px;object-fit:contain;background:linear-gradient(160deg,#fff,#f6f4ff);border-radius:14px;padding:5px}
.tstep .box .role{font-size:11.5px;font-weight:900;letter-spacing:.08em;color:var(--pink)}
.tstep .box h4{font-size:15px;margin:4px 0 3px}
.tstep .box p{font-size:12.5px;color:var(--muted)}
.tstep .box .p{margin-left:auto;text-align:right;white-space:nowrap}
.tstep .box .p b{font-family:var(--display);font-size:17px;display:block}
.tstep .box .p small{font-size:11.5px;color:var(--muted)}
.bundleCard{background:linear-gradient(160deg,#211a35,#151024 60%);color:#fff;border-radius:var(--r-l);padding:26px;
  box-shadow:var(--shadow-l);position:sticky;top:88px;overflow:hidden}
.bundleCard::after{content:"";position:absolute;width:280px;height:280px;border-radius:50%;right:-120px;top:-120px;
  background:radial-gradient(circle,rgba(255,94,138,.45),transparent 70%)}
.bundleCard .badge{font-size:11.5px;font-weight:900;letter-spacing:.1em;color:#ffd6e3}
.bundleCard h3{font-size:23px;margin:9px 0 16px}
.bline{display:flex;justify-content:space-between;font-size:13.5px;padding:9px 0;border-bottom:1px dashed rgba(255,255,255,.16);
  color:rgba(255,255,255,.82)}
.bline.total{border:0;font-size:15px;font-weight:800;color:#fff;padding-top:15px}
.bline .big{font-family:var(--display);font-size:30px;color:#ffe0ea}
.bline .save{color:#7ff0c0}
.bundleCard .note{font-size:12px;color:rgba(255,255,255,.62);margin:14px 0 18px;line-height:1.7}
.bundleCard .btn{width:100%;justify-content:center}

/* ---------- 直播間 ---------- */
.liveSection{background:linear-gradient(180deg,#0c0a14,#151027 55%,#0c0a14);color:#fff;padding:88px 0;
  position:relative;overflow:hidden}
.liveSection::before{content:"";position:absolute;inset:0;
  background:radial-gradient(900px 420px at 20% 8%,rgba(255,94,138,.22),transparent 60%),
  radial-gradient(700px 420px at 88% 78%,rgba(124,92,255,.22),transparent 62%);pointer-events:none}
.liveSection .eyebrow{background:rgba(255,45,85,.16);border-color:rgba(255,45,85,.4);color:#ff8fa8}
.liveSection .lead{color:rgba(255,255,255,.66)}
.liveLayout{display:grid;grid-template-columns:1.55fr 1fr;gap:22px;margin-top:38px;position:relative;z-index:1}
.playerWrap{background:#000;border-radius:var(--r-l);overflow:hidden;border:1px solid rgba(255,255,255,.10);
  box-shadow:var(--shadow-l)}
.player{position:relative;aspect-ratio:16/9;background:
  radial-gradient(120% 100% at 24% 0%,#33265a,#100d1c 62%),linear-gradient(0deg,#0b0912,#0b0912)}
.player .pin{position:absolute;top:14px;left:14px;z-index:6;display:flex;gap:9px;align-items:center}
.player .pin .lb{display:inline-flex;align-items:center;gap:7px;background:#ff2d55;color:#fff;font-size:11.5px;font-weight:900;
  padding:6px 12px;border-radius:6px;letter-spacing:.06em}
.player .pin .lb i{width:7px;height:7px;border-radius:50%;background:#fff;animation:pulse 1.3s infinite}
.player .pin .cc{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.8);background:rgba(0,0,0,.45);
  padding:6px 11px;border-radius:6px;backdrop-filter:blur(6px)}
.player .viewers{position:absolute;top:14px;right:14px;z-index:6;display:flex;align-items:center;gap:8px;font-size:12px;
  font-weight:700;color:#fff;background:rgba(0,0,0,.46);padding:6px 12px;border-radius:999px;backdrop-filter:blur(6px)}
.player .viewers i{color:#ff8fa8}
.player .subtitle{position:absolute;left:50%;bottom:74px;transform:translateX(-50%);z-index:7;max-width:82%;text-align:center;
  background:rgba(8,6,14,.78);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);
  padding:12px 20px;border-radius:14px;font-size:16px;font-weight:700;line-height:1.6;
  box-shadow:0 20px 40px -20px rgba(0,0,0,.9);transition:opacity .35s ease,transform .35s ease}
.player .subtitle.fade{opacity:0;transform:translateX(-50%) translateY(10px)}
.player .subtitle .who{display:block;font-size:11px;font-weight:900;letter-spacing:.1em;color:#ff8fa8;margin-bottom:4px}
.player .pinned{position:absolute;left:14px;right:14px;bottom:74px;z-index:5;display:none}
.player .controls{position:absolute;left:0;right:0;bottom:0;z-index:8;display:flex;align-items:center;gap:12px;
  padding:12px 16px;background:linear-gradient(0deg,rgba(0,0,0,.86),transparent)}
.player .controls .bar{flex:1;height:4px;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden;cursor:pointer}
.player .controls .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--pink),var(--coral))}
.player .controls button{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#fff;
  background:rgba(255,255,255,.12);font-size:14px;transition:background .2s}
.player .controls button:hover{background:rgba(255,255,255,.24)}
.player .controls .t{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums}
.player .hearts{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
.player .hearts span{position:absolute;bottom:80px;font-size:20px;animation:floatUp 3.6s linear forwards;opacity:0}
@keyframes floatUp{0%{opacity:0;transform:translateY(0) scale(.6)}12%{opacity:1}100%{opacity:0;transform:translateY(-300px) scale(1.25)}}

.chatBox{background:#141020;border:1px solid rgba(255,255,255,.10);border-radius:var(--r-l);display:flex;flex-direction:column;
  overflow:hidden;box-shadow:var(--shadow-l)}
.chatBox .head{padding:14px 17px;border-bottom:1px solid rgba(255,255,255,.09);display:flex;align-items:center;gap:9px;
  font-size:13px;font-weight:800}
.chatBox .head small{margin-left:auto;color:rgba(255,255,255,.5);font-weight:600;font-size:11.5px}
.chatList{flex:1;min-height:330px;max-height:420px;overflow-y:auto;padding:14px 17px;display:flex;flex-direction:column;gap:11px}
.chatList::-webkit-scrollbar{width:6px}
.chatList::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:3px}
.msg{display:flex;gap:10px;font-size:13px;animation:slideIn .4s ease both}
@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1}}
.msg .av{flex:0 0 28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;color:#fff}
.msg .tx{color:rgba(255,255,255,.9);line-height:1.55}
.msg .tx b{color:#ffb3c8;font-weight:800;margin-right:6px}
.msg.sys .tx{color:#ffe08a;font-weight:700}
.msg.me .tx b{color:#8fe3ff}
.chatInput{display:flex;gap:9px;padding:13px 15px;border-top:1px solid rgba(255,255,255,.09)}
.chatInput input{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:999px;
  padding:11px 16px;color:#fff;font-size:13.5px;outline:none}
.chatInput input:focus{border-color:rgba(255,94,138,.6)}
.chatInput input::placeholder{color:rgba(255,255,255,.38)}
.chatInput button{background:linear-gradient(135deg,var(--pink),var(--coral));color:#fff;border-radius:999px;padding:0 20px;
  font-weight:800;font-size:13.5px}
.liveStats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px;position:relative;z-index:1}
.liveStats .c{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);border-radius:var(--r-m);padding:16px;
  text-align:center}
.liveStats b{font-family:var(--display);font-size:24px;display:block}
.liveStats small{font-size:11.5px;color:rgba(255,255,255,.55);font-weight:700;letter-spacing:.05em}
.script{margin-top:34px;position:relative;z-index:1}
.script h3{font-size:19px;margin-bottom:14px}
.scriptList{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.scriptItem{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:var(--r-m);padding:14px 16px;
  display:flex;gap:12px;font-size:13px;color:rgba(255,255,255,.8);transition:.25s}
.scriptItem.on{background:rgba(255,94,138,.14);border-color:rgba(255,94,138,.5);color:#fff}
.scriptItem .t{font-weight:900;color:#ff8fa8;font-size:11.5px;flex:0 0 42px;font-variant-numeric:tabular-nums;padding-top:2px}
.scriptItem b{display:block;font-size:12.5px;color:#fff;margin-bottom:2px}

/* ---------- 試算器 ---------- */
.calc{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:38px;align-items:start}
.calcForm{background:var(--card);border:1px solid var(--line);border-radius:var(--r-l);padding:24px;box-shadow:var(--shadow-m)}
.calcRow{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px dashed var(--line)}
.calcRow:last-of-type{border:0}
.calcRow img{width:52px;height:52px;object-fit:contain;background:#faf8ff;border-radius:12px;padding:4px}
.calcRow .nm{flex:1;font-size:13.5px;font-weight:700;line-height:1.5}
.calcRow .jp{font-size:11.5px;color:var(--muted);font-weight:600;display:block}
.qty{display:flex;align-items:center;gap:2px;background:rgba(25,22,36,.05);border-radius:999px;padding:4px}
.qty button{width:30px;height:30px;border-radius:50%;font-weight:900;background:#fff;box-shadow:var(--shadow-s)}
.qty span{min-width:30px;text-align:center;font-weight:800;font-size:14px}
.invoice{background:linear-gradient(165deg,#1d1730,#120e1f);color:#fff;border-radius:var(--r-l);padding:26px;
  box-shadow:var(--shadow-l);position:sticky;top:88px}
.invoice h3{font-size:19px;margin-bottom:6px}
.invoice .sub{font-size:12px;color:rgba(255,255,255,.55);margin-bottom:18px}
.inv{display:flex;justify-content:space-between;font-size:13.5px;padding:10px 0;color:rgba(255,255,255,.82);
  border-bottom:1px dashed rgba(255,255,255,.14)}
.inv:last-of-type{border:0}
.inv.total{font-weight:800;color:#fff;font-size:15px;align-items:flex-end}
.inv.total .v{font-family:var(--display);font-size:32px;color:#ffe0ea;line-height:1}
.inv .v{font-variant-numeric:tabular-nums}
.inv .free{color:#7ff0c0;font-weight:800}
.banner{margin-top:16px;font-size:11.5px;line-height:1.7;color:rgba(255,255,255,.6);background:rgba(255,255,255,.06);
  border-radius:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1)}

/* ---------- FAQ ---------- */
.faq{margin-top:36px;display:grid;gap:12px}
.qa{background:var(--card);border:1px solid var(--line);border-radius:var(--r-m);overflow:hidden;box-shadow:var(--shadow-s)}
.qa summary{padding:17px 20px;font-weight:800;font-size:15px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:12px}
.qa summary::-webkit-details-marker{display:none}
.qa summary::after{content:"＋";margin-left:auto;font-weight:900;color:var(--pink);transition:transform .25s}
.qa[open] summary::after{content:"－";transform:rotate(180deg)}
.qa .a{padding:0 20px 19px;color:var(--muted);font-size:14px;line-height:1.85}

/* ---------- Footer ---------- */
footer{background:#100d19;color:rgba(255,255,255,.62);padding:56px 0 120px;font-size:13px}
footer .fgrid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:30px}
footer h4{color:#fff;font-size:14px;margin-bottom:12px}
footer a{display:block;padding:4px 0;color:rgba(255,255,255,.62)}
footer a:hover{color:#fff}
footer .disc{margin-top:30px;padding-top:22px;border-top:1px solid rgba(255,255,255,.1);font-size:11.5px;line-height:1.9;
  color:rgba(255,255,255,.42)}

/* ---------- 浮動購物車 ---------- */
.dock{position:fixed;left:50%;bottom:20px;transform:translate(-50%,140%);z-index:80;width:min(720px,calc(100% - 32px));
  background:linear-gradient(135deg,#1c1630,#251a35);color:#fff;border-radius:20px;padding:14px 18px;display:flex;
  align-items:center;gap:16px;box-shadow:var(--shadow-l);border:1px solid rgba(255,255,255,.12);transition:transform .4s cubic-bezier(.2,.9,.2,1)}
.dock.on{transform:translate(-50%,0)}
.dock .ic{font-size:22px}
.dock .info{flex:1;font-size:12.5px;color:rgba(255,255,255,.72);font-weight:600}
.dock .info b{display:block;font-size:15px;color:#fff;font-family:var(--display)}
.dock .btn{padding:11px 20px;font-size:13.5px}
.dock .clear{font-size:12px;color:rgba(255,255,255,.5);text-decoration:underline;padding:6px}
.toast{position:fixed;left:50%;top:80px;transform:translate(-50%,-24px);z-index:90;background:var(--ink);color:#fff;
  padding:12px 20px;border-radius:999px;font-size:13.5px;font-weight:700;box-shadow:var(--shadow-l);opacity:0;
  pointer-events:none;transition:.35s}
.toast.on{opacity:1;transform:translate(-50%,0)}
.floatLive{position:fixed;right:20px;bottom:20px;z-index:70;display:flex;align-items:center;gap:9px;padding:12px 18px;
  border-radius:999px;background:linear-gradient(135deg,#ff2d55,#ff5e8a);color:#fff;font-weight:800;font-size:13.5px;
  box-shadow:0 18px 40px -14px rgba(255,45,85,.95)}
.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1)}
.reveal.in{opacity:1;transform:none}

@media (max-width:1000px){
  .hero .grid,.routine,.liveLayout,.calc,footer .fgrid{grid-template-columns:1fr}
  .grid3{grid-template-columns:1fr 1fr}
  .nav .links{display:none}
  .liveStats{grid-template-columns:1fr 1fr}
  .bundleCard,.invoice{position:static}
}
@media (max-width:680px){
  .grid3{grid-template-columns:1fr}
  .section{padding:58px 0}
  .hero{padding:44px 0 20px}
  .stats{gap:20px}
  .player .subtitle{font-size:13.5px;bottom:64px;padding:10px 14px}
  .chatList{min-height:240px}
  .dock{flex-wrap:wrap}
  .floatLive{right:14px;bottom:88px}
}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
