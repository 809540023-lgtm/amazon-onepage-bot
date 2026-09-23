/**
 * AI 生徒「小葵」純 SVG 頭像 —— 不需任何外部圖檔，離線也能顯示。
 * 眨眼、說話嘴型、髮絲擺動全部用 CSS 驅動（見 theme.mjs）。
 */
export function avatarSvg({ id = 'kui' } = {}) {
  return /* html */ `
<svg class="avatar" viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI 生徒 小葵">
  <defs>
    <radialGradient id="${id}-glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#ff5e8a" stop-opacity=".55"/>
      <stop offset="60%" stop-color="#7c5cff" stop-opacity=".16"/>
      <stop offset="100%" stop-color="#7c5cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#59497a"/><stop offset="55%" stop-color="#3b2d55"/><stop offset="100%" stop-color="#241a38"/>
    </linearGradient>
    <linearGradient id="${id}-hair2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6b5891"/><stop offset="100%" stop-color="#3a2c54"/>
    </linearGradient>
    <linearGradient id="${id}-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe8d8"/><stop offset="100%" stop-color="#ffd4bd"/>
    </linearGradient>
    <linearGradient id="${id}-iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8f6bff"/><stop offset="45%" stop-color="#3fa9ff"/><stop offset="100%" stop-color="#1a63cf"/>
    </linearGradient>
    <linearGradient id="${id}-uniform" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfdff"/><stop offset="100%" stop-color="#dfe3f2"/>
    </linearGradient>
    <linearGradient id="${id}-ribbon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff5e8a"/><stop offset="100%" stop-color="#ff9a6b"/>
    </linearGradient>
  </defs>

  <circle class="glow" cx="150" cy="150" r="142" fill="url(#${id}-glow)"/>

  <g class="bob">
    <!-- 後髮 -->
    <g class="hairBack">
      <path d="M150 26c-64 0-106 46-106 112 0 44 8 82 22 110 4-34 4-70 10-98 22 16 50 24 74 24s52-8 74-24c6 28 6 64 10 98 14-28 22-66 22-110C256 72 214 26 150 26z" fill="url(#${id}-hair)"/>
      <!-- 雙馬尾 -->
      <path d="M62 104c-20 30-26 74-18 118 4 16 14 26 26 24-10-46-8-100 8-136z" fill="url(#${id}-hair2)"/>
      <path d="M238 104c20 30 26 74 18 118-4 16-14 26-26 24 10-46 8-100-8-136z" fill="url(#${id}-hair2)"/>
      <path d="M74 208c-10 22-12 44-6 62 8-16 14-32 16-48z" fill="#2b2044" opacity=".85"/>
      <path d="M226 208c10 22 12 44 6 62-8-16-14-32-16-48z" fill="#2b2044" opacity=".85"/>
    </g>

    <!-- 肩膀與制服 -->
    <path d="M150 196c-16 0-30 4-42 10-30 14-50 40-56 74h196c-6-34-26-60-56-74-12-6-26-10-42-10z" fill="url(#${id}-uniform)"/>
    <path d="M110 214c12 12 26 18 40 18s28-6 40-18l-10-10c-9 8-19 12-30 12s-21-4-30-12z" fill="#2f3a63"/>
    <path d="M124 200l26 26 26-26-11-6c-5 6-10 9-15 9s-10-3-15-9z" fill="#26315a"/>
    <path d="M150 226l-16 10 4-14-14-6 16-2 10-14 4 16 16 2-14 8 6 14z" fill="url(#${id}-ribbon)"/>

    <!-- 脖子 / 耳 -->
    <path d="M134 174h32v22c0 8-7 14-16 14s-16-6-16-14z" fill="#f0bda6"/>
    <ellipse cx="91" cy="132" rx="9" ry="13" fill="url(#${id}-skin)"/>
    <ellipse cx="209" cy="132" rx="9" ry="13" fill="url(#${id}-skin)"/>

    <!-- 臉 -->
    <ellipse cx="150" cy="126" rx="60" ry="66" fill="url(#${id}-skin)"/>

    <!-- 前髮 -->
    <path d="M150 44c-42 0-70 26-74 62 6 12 12 18 18 20 2-16 8-30 18-40 4 14 12 24 22 28 0-14 4-26 12-36 8 12 12 24 12 38 10-4 18-14 22-28 10 10 16 24 18 40 6-2 12-8 18-20-4-36-32-62-74-62z" fill="url(#${id}-hair)"/>
    <path d="M96 92c-8 12-12 26-12 40 6-4 12-12 16-22z" fill="url(#${id}-hair2)"/>
    <path d="M204 92c8 12 12 26 12 40-6-4-12-12-16-22z" fill="url(#${id}-hair2)"/>
    <path d="M143 60c-10 12-14 26-12 40 6-10 14-18 24-22z" fill="#6f5c98" opacity=".55"/>

    <!-- 眉毛 -->
    <path d="M104 106c8-6 18-6 26-2" stroke="#4a3a63" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M170 104c8-4 18-4 26 2" stroke="#4a3a63" stroke-width="4" stroke-linecap="round" fill="none"/>

    <!-- 眼睛 -->
    <g class="eye l">
      <ellipse cx="122" cy="138" rx="17" ry="20" fill="#ffffff"/>
      <ellipse cx="122" cy="139" rx="12.5" ry="16" fill="url(#${id}-iris)"/>
      <ellipse cx="122" cy="141" rx="5.5" ry="7" fill="#141024"/>
      <circle cx="126" cy="132" r="4.6" fill="#ffffff" opacity=".95"/>
      <circle cx="118" cy="146" r="2.3" fill="#ffffff" opacity=".7"/>
      <path d="M104 122c10-8 26-8 36 2" stroke="#2d2242" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M104 122c-3-6-4-11-3-15" stroke="#2d2242" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>
    <g class="eye r">
      <ellipse cx="178" cy="138" rx="17" ry="20" fill="#ffffff"/>
      <ellipse cx="178" cy="139" rx="12.5" ry="16" fill="url(#${id}-iris)"/>
      <ellipse cx="178" cy="141" rx="5.5" ry="7" fill="#141024"/>
      <circle cx="182" cy="132" r="4.6" fill="#ffffff" opacity=".95"/>
      <circle cx="174" cy="146" r="2.3" fill="#ffffff" opacity=".7"/>
      <path d="M160 124c10-10 26-10 36-2" stroke="#2d2242" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M196 122c3-6 4-11 3-15" stroke="#2d2242" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>

    <!-- 腮紅 / 鼻 / 嘴 -->
    <ellipse cx="103" cy="158" rx="13" ry="7" fill="#ff8fae" opacity=".42"/>
    <ellipse cx="197" cy="158" rx="13" ry="7" fill="#ff8fae" opacity=".42"/>
    <path d="M150 146c3 0 4 2 3 4l-3 3-3-3c-1-2 0-4 3-4z" fill="#e5a68c"/>
    <ellipse class="mouth" cx="150" cy="165" rx="7.5" ry="4.8" fill="#c2517a"/>
    <path class="mouth-line" d="M143 164c4 5 10 5 14 0" stroke="#b04a70" stroke-width="1.6" fill="none" opacity=".55"/>

    <!-- 耳機（直播裝備） -->
    <path d="M92 124c4-42 32-66 58-66s54 24 58 66" stroke="#2b2338" stroke-width="9" fill="none" stroke-linecap="round"/>
    <rect x="78" y="112" width="22" height="34" rx="10" fill="#3a2f52"/>
    <rect x="200" y="112" width="22" height="34" rx="10" fill="#3a2f52"/>
    <rect x="82" y="118" width="14" height="22" rx="7" fill="#ff5e8a" opacity=".85"/>
    <rect x="204" y="118" width="14" height="22" rx="7" fill="#ff5e8a" opacity=".85"/>
    <path d="M92 138c6 22 20 32 34 34" stroke="#2b2338" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="128" cy="173" r="7" fill="#ff5e8a"/>
    <circle cx="128" cy="173" r="3" fill="#fff" opacity=".85"/>
    <circle cx="150" cy="60" r="6" fill="#7c5cff"/>
    <circle cx="150" cy="60" r="2.6" fill="#fff" opacity=".9"/>
  </g>
</svg>`.trim();
}
