// ==========================================================================
// EmeraldQuest — SVG Character System (anime-proportional, layerable)
// ==========================================================================
// Each character is built from composable SVG groups. Shop items (clothes,
// hair, ears, accessories) are separate layers that overlay the base.

// ── Shared dimensions ───────────────────────────────────────────────
const CHAR = {
  W: 200, H: 400,
  HEAD_CX: 100, HEAD_CY: 58, HEAD_RX: 32, HEAD_RY: 36,
  NECK_Y: 90,
  SHOULDER_Y: 100, SHOULDER_W: 80,
  TORSO_TOP: 100, TORSO_BOT: 215,
  HIP_Y: 215, HIP_W: 60,
  LEG_TOP: 215, LEG_BOT: 375,
  FOOT_Y: 380,
  ARM_TOP: 105, ARM_BOT: 225,
};

// ── Skin tones ──────────────────────────────────────────────────────
const SKIN = {
  light:   { fill: '#FDDCBD', shadow: '#F0C4A0', outline: '#D4A574' },
  fair:    { fill: '#FDE8D0', shadow: '#F0D4B8', outline: '#D4A88C' },
  warm:    { fill: '#E8B88A', shadow: '#D4A070', outline: '#B8845C' },
  tan:     { fill: '#D4956A', shadow: '#C07C50', outline: '#A06840' },
  brown:   { fill: '#A06030', shadow: '#8C4C20', outline: '#704018' },
  pale:    { fill: '#F5EEF0', shadow: '#E0D0D8', outline: '#C4B0B8' },
};

// ── Gradient helper ─────────────────────────────────────────────────
function svgGradient(id, color1, color2, angle = 'v') {
  if (angle === 'v') {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>`;
  }
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${color1}"/>
    <stop offset="100%" stop-color="${color2}"/>
  </linearGradient>`;
}

// ── Base body (shared skeleton) ─────────────────────────────────────
function baseBody(skin) {
  const s = SKIN[skin] || SKIN.fair;
  return `
    <g class="char-legs">
      <g class="char-leg-left">
        <path d="M82,215 L78,310 Q76,340 78,370 L88,372 L92,310 Z"
              fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
        <ellipse cx="82" cy="376" rx="14" ry="6" fill="#2A2A4A" stroke="#1A1A3E" stroke-width="1"/>
      </g>
      <g class="char-leg-right">
        <path d="M118,215 L122,310 Q124,340 122,370 L112,372 L108,310 Z"
              fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
        <ellipse cx="118" cy="376" rx="14" ry="6" fill="#2A2A4A" stroke="#1A1A3E" stroke-width="1"/>
      </g>
    </g>
    <g class="char-torso">
      <path d="M65,100 Q60,105 58,130 L56,180 Q58,210 75,218 L125,218 Q142,210 144,180 L142,130 Q140,105 135,100 Z"
            fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
    </g>
    <g class="char-arms">
      <g class="char-arm-left">
        <path d="M65,105 Q50,110 42,140 L38,185 Q36,200 42,210 L52,208 L50,180 Q52,150 58,130 Z"
              fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
        <ellipse cx="44" cy="212" rx="8" ry="7" fill="${s.fill}" stroke="${s.outline}" stroke-width="1"/>
      </g>
      <g class="char-arm-right">
        <path d="M135,105 Q150,110 158,140 L162,185 Q164,200 158,210 L148,208 L150,180 Q148,150 142,130 Z"
              fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
        <ellipse cx="156" cy="212" rx="8" ry="7" fill="${s.fill}" stroke="${s.outline}" stroke-width="1"/>
      </g>
    </g>`;
}

// ── Base head ───────────────────────────────────────────────────────
function baseHead(skin) {
  const s = SKIN[skin] || SKIN.fair;
  return `
    <g class="char-head">
      <ellipse cx="100" cy="58" rx="32" ry="36" fill="${s.fill}" stroke="${s.outline}" stroke-width="1.5"/>
      <path d="M84,90 Q100,98 116,90" fill="${s.fill}" stroke="${s.outline}" stroke-width="1.2"/>
    </g>`;
}

// ── Eye styles ──────────────────────────────────────────────────────
function animeEyes(style, color, sparkle = true) {
  const base = {
    sharp: `
      <g class="char-face">
        <path d="M78,50 Q82,45 92,48 L92,58 Q88,62 78,60 Z" fill="white" stroke="#333" stroke-width="1.2"/>
        <ellipse cx="86" cy="54" rx="5" ry="6" fill="${color}"/>
        <ellipse cx="87" cy="52" rx="2" ry="2.5" fill="#111"/>
        ${sparkle ? '<circle cx="89" cy="50" r="1.5" fill="white"/>' : ''}
        <path d="M108,50 Q112,45 122,48 L122,58 Q118,62 108,60 Z" fill="white" stroke="#333" stroke-width="1.2"/>
        <ellipse cx="114" cy="54" rx="5" ry="6" fill="${color}"/>
        <ellipse cx="113" cy="52" rx="2" ry="2.5" fill="#111"/>
        ${sparkle ? '<circle cx="116" cy="50" r="1.5" fill="white"/>' : ''}
        <path d="M76,46 L92,44" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <path d="M108,44 L124,46" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <path d="M95,68 Q100,72 105,68" stroke="#D06080" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>`,
    gentle: `
      <g class="char-face">
        <ellipse cx="85" cy="54" rx="9" ry="10" fill="white" stroke="#444" stroke-width="1.2"/>
        <ellipse cx="86" cy="55" rx="5.5" ry="6.5" fill="${color}"/>
        <ellipse cx="87" cy="53" rx="2.5" ry="3" fill="#222"/>
        ${sparkle ? '<circle cx="89" cy="51" r="2" fill="white"/><circle cx="84" cy="56" r="1" fill="white" opacity="0.6"/>' : ''}
        <ellipse cx="115" cy="54" rx="9" ry="10" fill="white" stroke="#444" stroke-width="1.2"/>
        <ellipse cx="114" cy="55" rx="5.5" ry="6.5" fill="${color}"/>
        <ellipse cx="113" cy="53" rx="2.5" ry="3" fill="#222"/>
        ${sparkle ? '<circle cx="116" cy="51" r="2" fill="white"/><circle cx="112" cy="56" r="1" fill="white" opacity="0.6"/>' : ''}
        <path d="M80,44 Q85,42 92,44" stroke="#555" stroke-width="1.5" fill="none"/>
        <path d="M108,44 Q115,42 120,44" stroke="#555" stroke-width="1.5" fill="none"/>
        <path d="M95,70 Q100,73 105,70" stroke="#E87C9E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="76" cy="60" rx="5" ry="3" fill="#FFB0C0" opacity="0.35"/>
        <ellipse cx="124" cy="60" rx="5" ry="3" fill="#FFB0C0" opacity="0.35"/>
      </g>`,
    fierce: `
      <g class="char-face">
        <path d="M76,52 Q80,46 92,50 L91,58 Q86,62 76,59 Z" fill="white" stroke="#333" stroke-width="1.3"/>
        <ellipse cx="85" cy="54" rx="5" ry="5.5" fill="${color}"/>
        <ellipse cx="86" cy="53" rx="2.5" ry="2.8" fill="#111"/>
        ${sparkle ? '<circle cx="88" cy="51" r="1.5" fill="white"/>' : ''}
        <path d="M108,52 Q112,46 124,50 L123,58 Q118,62 108,59 Z" fill="white" stroke="#333" stroke-width="1.3"/>
        <ellipse cx="115" cy="54" rx="5" ry="5.5" fill="${color}"/>
        <ellipse cx="114" cy="53" rx="2.5" ry="2.8" fill="#111"/>
        ${sparkle ? '<circle cx="117" cy="51" r="1.5" fill="white"/>' : ''}
        <path d="M74,44 L93,48" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M107,48 L126,44" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M94,68 L100,66 L106,68" stroke="#888" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>`,
    cool: `
      <g class="char-face">
        <path d="M77,50 Q82,47 93,50 L92,57 Q87,61 77,59 Z" fill="white" stroke="#333" stroke-width="1.2"/>
        <ellipse cx="86" cy="53.5" rx="4.5" ry="5" fill="${color}"/>
        <ellipse cx="87" cy="52" rx="2" ry="2.5" fill="#111"/>
        ${sparkle ? '<circle cx="89" cy="50" r="1.5" fill="white"/>' : ''}
        <path d="M107,50 Q112,47 123,50 L122,57 Q117,61 107,59 Z" fill="white" stroke="#333" stroke-width="1.2"/>
        <ellipse cx="114" cy="53.5" rx="4.5" ry="5" fill="${color}"/>
        <ellipse cx="113" cy="52" rx="2" ry="2.5" fill="#111"/>
        ${sparkle ? '<circle cx="116" cy="50" r="1.5" fill="white"/>' : ''}
        <path d="M75,46 L93,46" stroke="#444" stroke-width="2" stroke-linecap="round"/>
        <path d="M107,46 L125,46" stroke="#444" stroke-width="2" stroke-linecap="round"/>
        <path d="M96,68 Q100,71 104,68" stroke="#999" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>`,
  };
  return base[style] || base.gentle;
}

// ═══════════════════════════════════════════════════════════════════
// CHARACTER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const CHARACTER_SVGS = {};

// ── Blaze — Fiery red hair, flame armor ─────────────────────────────
CHARACTER_SVGS.blaze = {
  skin: 'warm',
  eyes: () => animeEyes('sharp', '#FF6600'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,30 Q65,80 55,120 L60,115 Q68,75 72,40 Z" fill="#CC2200" opacity="0.7"/>
      <path d="M140,30 Q135,80 145,120 L140,115 Q132,75 128,40 Z" fill="#CC2200" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,22 Q75,12 85,15 L82,35 Q76,38 70,32 Z" fill="url(#blaze-hair)"/>
      <path d="M85,15 Q100,8 115,15 L118,28 Q100,22 82,35 Z" fill="url(#blaze-hair)"/>
      <path d="M115,15 Q125,12 132,22 L130,32 Q124,38 118,28 Z" fill="url(#blaze-hair)"/>
      <path d="M70,32 Q68,40 66,35 L60,20 Q65,14 68,22 Z" fill="#FF4400"/>
      <path d="M130,32 Q132,40 134,35 L140,20 Q135,14 132,22 Z" fill="#FF4400"/>
      <path d="M90,10 Q100,2 110,10 L108,20 Q100,15 92,20 Z" fill="#FF6600" opacity="0.8"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M65,100 Q60,105 58,130 L56,180 Q58,210 75,218 L125,218 Q142,210 144,180 L142,130 Q140,105 135,100 Z"
            fill="#1A1A2E" stroke="#FF4500" stroke-width="1"/>
      <path d="M70,110 L60,130 L70,125 Z" fill="#FF4500" opacity="0.6"/>
      <path d="M130,110 L140,130 L130,125 Z" fill="#FF4500" opacity="0.6"/>
      <path d="M75,218 L80,280 L72,282 L68,220 Z" fill="#1A1A2E" stroke="#FF4500" stroke-width="0.8"/>
      <path d="M125,218 L120,280 L128,282 L132,220 Z" fill="#1A1A2E" stroke="#FF4500" stroke-width="0.8"/>
      <line x1="100" y1="105" x2="100" y2="180" stroke="#FF4500" stroke-width="1" opacity="0.5"/>
      <circle cx="100" cy="108" r="3" fill="#FF4500"/>
      <path d="M80,100 Q100,95 120,100" fill="none" stroke="#FF4500" stroke-width="1.5"/>
      <path d="M58,178 Q100,195 142,178" fill="none" stroke="#FF4500" stroke-width="0.8" opacity="0.4"/>
    </g>`,
  defs: () => `
    ${svgGradient('blaze-hair', '#FF6600', '#CC2200')}`,
  flair: () => `
    <g class="char-flair" opacity="0.5">
      <circle cx="50" cy="130" r="2" fill="#FF4500">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="155" cy="150" r="1.5" fill="#FF6600">
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
    </g>`,
};

// ── Luna — Silver hair, moonlight robes ─────────────────────────────
CHARACTER_SVGS.luna = {
  skin: 'pale',
  eyes: () => animeEyes('gentle', '#8888CC'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M62,45 Q58,100 52,180 Q48,220 55,260 L65,255 Q60,200 62,140 Q64,100 68,55 Z"
            fill="url(#luna-hair)" opacity="0.85"/>
      <path d="M138,45 Q142,100 148,180 Q152,220 145,260 L135,255 Q140,200 138,140 Q136,100 132,55 Z"
            fill="url(#luna-hair)" opacity="0.85"/>
      <path d="M68,55 Q80,85 75,180 Q72,230 78,280 L88,275 Q82,220 85,160 Q88,100 80,55 Z"
            fill="#D0D0E8" opacity="0.5"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,22 Q80,14 100,12 Q120,14 132,22 L130,42 Q120,35 100,32 Q80,35 70,42 Z"
            fill="url(#luna-hair)"/>
      <path d="M70,42 Q72,50 68,55 L62,45 Q64,35 68,22 Z" fill="#C0C0E0"/>
      <path d="M130,42 Q128,50 132,55 L138,45 Q136,35 132,22 Z" fill="#C0C0E0"/>
      <path d="M82,32 Q85,38 78,48 L75,42 Q78,35 82,32 Z" fill="#D8D8F0" opacity="0.7"/>
      <path d="M118,32 Q115,38 122,48 L125,42 Q122,35 118,32 Z" fill="#D8D8F0" opacity="0.7"/>
      <circle cx="105" cy="20" r="4" fill="none" stroke="#E0E0FF" stroke-width="0.8" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M65,100 Q60,105 56,135 L54,180 Q56,212 75,220 L125,220 Q144,212 146,180 L148,135 Q140,105 135,100 Z"
            fill="url(#luna-robe)" stroke="#8080B0" stroke-width="1"/>
      <path d="M75,220 Q85,240 80,310 Q78,340 70,370 L130,370 Q122,340 120,310 Q115,240 125,220 Z"
            fill="url(#luna-robe)" stroke="#8080B0" stroke-width="0.8"/>
      <path d="M80,100 Q100,96 120,100" fill="none" stroke="#C0C0FF" stroke-width="2"/>
      <circle cx="100" cy="110" r="4" fill="#C0C0FF" stroke="#9090CC" stroke-width="0.8"/>
      <path d="M90,130 Q100,135 110,130" fill="none" stroke="#A0A0D0" stroke-width="0.8" opacity="0.6"/>
      <path d="M88,160 Q100,165 112,160" fill="none" stroke="#A0A0D0" stroke-width="0.8" opacity="0.4"/>
      <path d="M95,195 L100,200 L105,195" fill="none" stroke="#C0C0FF" stroke-width="0.8" opacity="0.5"/>
    </g>`,
  defs: () => `
    ${svgGradient('luna-hair', '#E0E0F5', '#B0B0D5')}
    ${svgGradient('luna-robe', '#2A2A5E', '#1A1A4E')}`,
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <circle cx="130" cy="25" r="3" fill="#E0E0FF">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="160" r="1.5" fill="#C0C0FF">
        <animate attributeName="opacity" values="0;0.6;0" dur="4s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>`,
};

// ── Rosé — Pink & gold, K-pop idol ──────────────────────────────────
CHARACTER_SVGS.rose = {
  skin: 'fair',
  eyes: () => animeEyes('gentle', '#DD6699'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,48 Q55,100 50,160 Q48,200 52,240 L62,235 Q58,190 60,140 Q62,90 66,50 Z"
            fill="url(#rose-hair)" opacity="0.8"/>
      <path d="M140,48 Q145,100 150,160 Q152,200 148,240 L138,235 Q142,190 140,140 Q138,90 134,50 Z"
            fill="url(#rose-hair)" opacity="0.8"/>
      <path d="M78,60 Q75,120 70,200 Q68,230 72,260 L82,255 Q78,220 80,170 Q82,110 84,60 Z"
            fill="#FFB0C8" opacity="0.5"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,20 Q82,10 100,9 Q118,10 132,20 L130,40 Q118,32 100,30 Q82,32 70,40 Z"
            fill="url(#rose-hair)"/>
      <path d="M70,40 Q68,48 64,52 L60,48 Q62,36 68,20 Z" fill="#FF90B0"/>
      <path d="M130,40 Q132,48 136,52 L140,48 Q138,36 132,20 Z" fill="#FF90B0"/>
      <path d="M80,30 Q82,36 78,45 L76,40 Z" fill="#FFC0D5" opacity="0.6"/>
      <path d="M120,30 Q118,36 122,45 L124,40 Z" fill="#FFC0D5" opacity="0.6"/>
      <path d="M95,14 Q100,11 105,14 L104,22 Q100,20 96,22 Z" fill="#FFD0E0" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M68,100 Q62,108 60,130 L62,165 Q68,170 100,172 Q132,170 138,165 L140,130 Q138,108 132,100 Z"
            fill="url(#rose-jacket)" stroke="#DD8899" stroke-width="1"/>
      <path d="M72,172 Q85,175 100,176 Q115,175 128,172 L132,220 Q120,230 100,232 Q80,230 68,220 Z"
            fill="url(#rose-skirt)" stroke="#DD8899" stroke-width="0.8"/>
      <path d="M80,100 Q100,95 120,100" fill="none" stroke="#FFD700" stroke-width="2"/>
      <path d="M95,105 L100,170 L105,105" fill="none" stroke="#FFD700" stroke-width="1.2"/>
      <circle cx="100" cy="108" r="3" fill="#FFD700" stroke="#CCA800" stroke-width="0.8"/>
      <path d="M68,220 L65,290 Q64,320 60,370 L75,372 L78,320 Q80,280 80,232 Z"
            fill="#FDE8D0" stroke="#D4A88C" stroke-width="0.8"/>
      <path d="M132,220 L135,290 Q136,320 140,370 L125,372 L122,320 Q120,280 120,232 Z"
            fill="#FDE8D0" stroke="#D4A88C" stroke-width="0.8"/>
      <path d="M62,162 Q100,170 138,162" fill="none" stroke="#FFD700" stroke-width="0.8" opacity="0.5"/>
    </g>`,
  defs: () => `
    ${svgGradient('rose-hair', '#FFB6C1', '#FF8AAA')}
    ${svgGradient('rose-jacket', '#FFB6C1', '#FF90A8')}
    ${svgGradient('rose-skirt', '#FFCCD5', '#FFB0C0')}`,
  flair: () => `
    <g class="char-flair" opacity="0.5">
      <text x="45" y="120" font-size="8" fill="#FFD700" opacity="0.6">✦</text>
      <text x="150" y="100" font-size="6" fill="#FFD700" opacity="0.4">✦</text>
      <text x="55" y="200" font-size="5" fill="#FFB6C1" opacity="0.5">✦</text>
    </g>`,
};

// ── Jinx — Neon pink streetwear ─────────────────────────────────────
CHARACTER_SVGS.jinx = {
  skin: 'light',
  eyes: () => animeEyes('fierce', '#FF1493'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M55,40 Q50,80 48,130 L58,125 Q56,80 60,45 Z" fill="#FF69B4" opacity="0.7"/>
      <path d="M145,40 Q150,80 152,130 L142,125 Q144,80 140,45 Z" fill="#FF69B4" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,18 Q80,8 100,6 Q120,8 134,18 L132,38 Q120,28 100,26 Q80,28 68,38 Z" fill="#FF69B4"/>
      <path d="M68,38 Q65,48 60,50 L55,40 Q58,30 66,18 Z" fill="#FF1493"/>
      <path d="M132,38 Q135,48 140,50 L145,40 Q142,30 134,18 Z" fill="#FF1493"/>
      <path d="M78,26 Q76,36 72,44 L70,38 Z" fill="#FF91CC" opacity="0.7"/>
      <path d="M122,26 Q124,36 128,44 L130,38 Z" fill="#FF91CC" opacity="0.7"/>
      <path d="M90,12 L88,30 L92,28 Z" fill="#FF69B4" opacity="0.8"/>
      <path d="M110,12 L112,30 L108,28 Z" fill="#FF69B4" opacity="0.8"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
            fill="#2A2A2A" stroke="#FF69B4" stroke-width="1.2"/>
      <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#2A2A2A" stroke="#FF69B4" stroke-width="0.8"/>
      <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#2A2A2A" stroke="#FF69B4" stroke-width="0.8"/>
      <path d="M80,120 L120,120" stroke="#FF69B4" stroke-width="1.5"/>
      <path d="M85,140 L115,140" stroke="#FF1493" stroke-width="1" opacity="0.5"/>
      <text x="88" y="115" font-size="10" fill="#FF69B4" font-family="sans-serif" font-weight="bold">JNX</text>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <rect x="48" y="140" width="3" height="3" fill="#FF69B4" transform="rotate(45,49.5,141.5)"/>
      <rect x="152" y="120" width="2" height="2" fill="#FF1493" transform="rotate(45,153,121)"/>
    </g>`,
};

// ── Shadow — Dark purple aura, hooded cloak ─────────────────────────
CHARACTER_SVGS.shadow = {
  skin: 'light',
  eyes: () => animeEyes('cool', '#8B5CF6'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,40 Q55,70 52,110 L62,105 Q60,70 64,42 Z" fill="#2D1B69" opacity="0.8"/>
      <path d="M140,40 Q145,70 148,110 L138,105 Q140,70 136,42 Z" fill="#2D1B69" opacity="0.8"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M65,20 Q80,10 100,8 Q120,10 135,20 L133,45 Q120,35 100,33 Q80,35 67,45 Z" fill="#2D1B69"/>
      <path d="M67,45 Q64,52 60,55 L55,42 Q58,30 65,20 Z" fill="#1A0E40"/>
      <path d="M133,45 Q136,52 140,55 L145,42 Q142,30 135,20 Z" fill="#1A0E40"/>
      <path d="M85,28 L82,45 L88,42 Z" fill="#3D2B79" opacity="0.6"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M50,95 Q55,90 70,98 L65,100 Q60,105 56,140 L52,200 Q54,240 60,300 Q58,340 50,380
              L150,380 Q142,340 140,300 Q146,240 148,200 L144,140 Q140,105 135,100 L130,98 Q145,90 150,95
              Q148,85 135,80 Q100,75 65,80 Q52,85 50,95 Z"
            fill="#1A0E40" stroke="#483D8B" stroke-width="1"/>
      <path d="M65,80 Q100,75 135,80 Q140,90 135,100 Q100,95 65,100 Q60,90 65,80 Z"
            fill="#2D1B69" stroke="#483D8B" stroke-width="0.8"/>
      <path d="M100,100 L100,200" stroke="#483D8B" stroke-width="0.8" opacity="0.4"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.3">
      <circle cx="45" cy="200" r="15" fill="none" stroke="#8B5CF6" stroke-width="0.5">
        <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>`,
};

// ── Nova — Galaxy hair, star armor ──────────────────────────────────
CHARACTER_SVGS.nova = {
  skin: 'fair',
  eyes: () => animeEyes('gentle', '#9370DB'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M58,42 Q52,100 48,170 Q46,210 50,240 L62,235 Q58,200 60,150 Q62,90 66,48 Z"
            fill="url(#nova-hair)" opacity="0.8"/>
      <path d="M142,42 Q148,100 152,170 Q154,210 150,240 L138,235 Q142,200 140,150 Q138,90 134,48 Z"
            fill="url(#nova-hair)" opacity="0.8"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,18 Q82,8 100,6 Q118,8 134,18 L132,40 Q118,30 100,28 Q82,30 68,40 Z" fill="url(#nova-hair)"/>
      <path d="M68,40 Q66,50 62,54 L58,42 Q60,30 66,18 Z" fill="#6A3CC9"/>
      <path d="M132,40 Q134,50 138,54 L142,42 Q140,30 134,18 Z" fill="#6A3CC9"/>
      <circle cx="78" cy="22" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="120" cy="18" r="1" fill="white" opacity="0.5"/>
      <circle cx="95" cy="12" r="1" fill="white" opacity="0.6"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M65,100 Q60,108 58,135 L56,180 Q58,212 75,218 L125,218 Q142,212 144,180 L142,135 Q140,108 135,100 Z"
            fill="#2A1B5E" stroke="#9370DB" stroke-width="1"/>
      <path d="M75,218 L78,290 Q76,330 72,370 L88,372 L86,330 Q88,280 85,218 Z"
            fill="#2A1B5E" stroke="#9370DB" stroke-width="0.8"/>
      <path d="M125,218 L122,290 Q124,330 128,370 L112,372 L114,330 Q112,280 115,218 Z"
            fill="#2A1B5E" stroke="#9370DB" stroke-width="0.8"/>
      <circle cx="100" cy="135" r="5" fill="#9370DB" opacity="0.6"/>
      <circle cx="100" cy="135" r="2" fill="white" opacity="0.8"/>
      <text x="86" y="175" font-size="6" fill="#B8A0E8" opacity="0.5">★</text>
      <text x="110" y="155" font-size="5" fill="#B8A0E8" opacity="0.4">★</text>
    </g>`,
  defs: () => `${svgGradient('nova-hair', '#9370DB', '#6A3CC9')}`,
  flair: () => `
    <g class="char-flair" opacity="0.5">
      <circle cx="48" cy="180" r="1.5" fill="#B8A0E8">
        <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>`,
};

// ── Kai — Ice demon hunter, blue highlights ─────────────────────────
CHARACTER_SVGS.kai = {
  skin: 'light',
  eyes: () => animeEyes('cool', '#00BFFF'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M58,38 Q54,65 52,95 L62,90 Q60,65 64,42 Z" fill="#0088CC" opacity="0.6"/>
      <path d="M142,38 Q146,65 148,95 L138,90 Q140,65 136,42 Z" fill="#0088CC" opacity="0.6"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,18 Q82,10 100,8 Q118,10 134,18 L130,38 Q118,28 100,26 Q82,28 70,38 Z" fill="#1E90FF"/>
      <path d="M70,38 Q68,46 64,50 L58,38 Q62,28 66,18 Z" fill="#0070DD"/>
      <path d="M130,38 Q132,46 136,50 L142,38 Q138,28 134,18 Z" fill="#0070DD"/>
      <path d="M86,20 L84,36 L90,32 Z" fill="#40A0FF" opacity="0.7"/>
      <path d="M114,20 L116,36 L110,32 Z" fill="#40A0FF" opacity="0.7"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
            fill="#1A2A4A" stroke="#00BFFF" stroke-width="1"/>
      <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#1A2A4A" stroke="#00BFFF" stroke-width="0.8"/>
      <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#1A2A4A" stroke="#00BFFF" stroke-width="0.8"/>
      <path d="M75,105 L80,100 Q100,96 120,100 L125,105" fill="none" stroke="#00BFFF" stroke-width="1.5"/>
      <path d="M90,130 L110,130" stroke="#4DC9FF" stroke-width="0.8" opacity="0.5"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.3">
      <text x="150" y="110" font-size="8" fill="#00BFFF">❄</text>
    </g>`,
};

// ── Viper — Green snake-themed ──────────────────────────────────────
CHARACTER_SVGS.viper = {
  skin: 'tan',
  eyes: () => animeEyes('fierce', '#32CD32'),
  defaultHair: () => `<g class="char-hair-back"></g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,18 Q82,8 100,7 Q118,8 134,18 L132,35 Q118,26 100,24 Q82,26 68,35 Z" fill="#228B22"/>
      <path d="M68,35 Q65,42 62,44 L58,35 Q62,26 66,18 Z" fill="#1A6B1A"/>
      <path d="M132,35 Q135,42 138,44 L142,35 Q138,26 134,18 Z" fill="#1A6B1A"/>
      <path d="M90,14 Q95,20 88,30 Z" fill="#32CD32" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
            fill="#1A3A1A" stroke="#32CD32" stroke-width="1"/>
      <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#1A3A1A" stroke="#32CD32" stroke-width="0.8"/>
      <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#1A3A1A" stroke="#32CD32" stroke-width="0.8"/>
      <path d="M70,120 Q80,115 90,120 Q100,125 110,120 Q120,115 130,120" fill="none" stroke="#32CD32" stroke-width="1.2"/>
      <path d="M75,150 Q90,145 105,150 Q120,155 135,150" fill="none" stroke="#228B22" stroke-width="0.8" opacity="0.5"/>
    </g>`,
  defs: () => '',
  flair: () => '',
};

// ── Storm — Electric blue, lightning ────────────────────────────────
CHARACTER_SVGS.storm = {
  skin: 'warm',
  eyes: () => animeEyes('sharp', '#1E90FF'),
  defaultHair: () => `<g class="char-hair-back"></g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M65,18 Q80,6 100,5 Q120,6 135,18 L132,42 Q118,30 100,28 Q82,30 68,42 Z" fill="#1E90FF"/>
      <path d="M68,42 Q65,48 60,50 L56,38 Q60,26 65,18 Z" fill="#0070DD"/>
      <path d="M132,42 Q135,48 140,50 L144,38 Q140,26 135,18 Z" fill="#0070DD"/>
      <path d="M92,10 L88,28 L96,24 Z" fill="#4DB8FF" opacity="0.7"/>
      <path d="M108,10 L112,28 L104,24 Z" fill="#4DB8FF" opacity="0.7"/>
      <path d="M80,15 L76,32 L84,28 Z" fill="#3DA0FF" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
            fill="#1A2040" stroke="#1E90FF" stroke-width="1"/>
      <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#1A2040" stroke="#1E90FF" stroke-width="0.8"/>
      <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#1A2040" stroke="#1E90FF" stroke-width="0.8"/>
      <path d="M85,110 L82,125 L90,120 L88,140 L95,130" stroke="#FFD700" stroke-width="1.5" fill="none"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <path d="M152,95 L150,105 L155,100 L153,112" stroke="#FFD700" stroke-width="1" fill="none">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
      </path>
    </g>`,
};

// ── Sakura — Cherry blossom theme ───────────────────────────────────
CHARACTER_SVGS.sakura = {
  skin: 'fair',
  eyes: () => animeEyes('gentle', '#E75480'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,45 Q56,100 52,170 Q50,210 54,250 L64,245 Q60,200 62,150 Q64,90 68,50 Z"
            fill="#FFB7C5" opacity="0.75"/>
      <path d="M140,45 Q144,100 148,170 Q150,210 146,250 L136,245 Q140,200 138,150 Q136,90 132,50 Z"
            fill="#FFB7C5" opacity="0.75"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="#FFB7C5"/>
      <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#FF9EB5"/>
      <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#FF9EB5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M60,98 Q56,105 54,135 L52,190 Q54,220 65,228 L80,232 Q90,234 100,235 Q110,234 120,232 L135,228
              Q146,220 148,190 L146,135 Q144,105 140,98 Z"
            fill="#FFE8EE" stroke="#FFB7C5" stroke-width="1"/>
      <path d="M80,232 Q90,240 100,242 Q110,240 120,232 L125,370 L75,370 Z"
            fill="#FFE8EE" stroke="#FFB7C5" stroke-width="0.8"/>
      <path d="M60,98 Q100,90 140,98 L138,105 Q100,98 62,105 Z" fill="#FFB7C5"/>
      <path d="M100,105 L100,235" stroke="#FFB7C5" stroke-width="0.8" opacity="0.4"/>
      <text x="92" y="140" font-size="8" fill="#FFB7C5" opacity="0.5">✿</text>
      <text x="105" y="180" font-size="6" fill="#FFB7C5" opacity="0.4">✿</text>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <text x="42" y="130" font-size="8" fill="#FFB7C5">✿</text>
      <text x="155" y="160" font-size="6" fill="#FFB7C5">✿</text>
    </g>`,
};

// ── Phoenix — Wings of fire ─────────────────────────────────────────
CHARACTER_SVGS.phoenix = {
  skin: 'warm',
  eyes: () => animeEyes('fierce', '#FF6347'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M55,35 Q48,60 45,90 L58,85 Q55,60 60,40 Z" fill="#FF4500" opacity="0.7"/>
      <path d="M145,35 Q152,60 155,90 L142,85 Q145,60 140,40 Z" fill="#FF4500" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M65,16 Q80,6 100,4 Q120,6 135,16 L132,38 Q118,26 100,24 Q82,26 68,38 Z" fill="#FF6347"/>
      <path d="M68,38 Q64,46 58,48 L55,35 Q58,24 65,16 Z" fill="#FF4500"/>
      <path d="M132,38 Q136,46 142,48 L145,35 Q142,24 135,16 Z" fill="#FF4500"/>
      <path d="M88,10 L85,25 L92,22 Z" fill="#FF8C69" opacity="0.7"/>
      <path d="M112,10 L115,25 L108,22 Z" fill="#FF8C69" opacity="0.7"/>
      <path d="M100,6 L98,18 L102,18 Z" fill="#FFD700" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
            fill="#3A1A0A" stroke="#FF6347" stroke-width="1"/>
      <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#3A1A0A" stroke="#FF4500" stroke-width="0.8"/>
      <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#3A1A0A" stroke="#FF4500" stroke-width="0.8"/>
      <path d="M80,100 Q100,95 120,100" fill="none" stroke="#FFD700" stroke-width="1.5"/>
      <path d="M95,140 L100,145 L105,140" fill="#FF6347" opacity="0.5"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.35">
      <path d="M40,130 Q30,100 38,70" fill="none" stroke="#FF6347" stroke-width="2" opacity="0.3"/>
      <path d="M160,130 Q170,100 162,70" fill="none" stroke="#FF6347" stroke-width="2" opacity="0.3"/>
    </g>`,
};

// ── Frost — White/ice blue, crystal weapons ─────────────────────────
CHARACTER_SVGS.frost = {
  skin: 'pale',
  eyes: () => animeEyes('cool', '#87CEEB'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,42 Q56,80 54,120 L64,115 Q62,78 66,46 Z" fill="#B0E0E6" opacity="0.7"/>
      <path d="M140,42 Q144,80 146,120 L136,115 Q138,78 134,46 Z" fill="#B0E0E6" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,18 Q82,8 100,6 Q118,8 134,18 L132,40 Q118,30 100,28 Q82,30 68,40 Z" fill="#B0E0E6"/>
      <path d="M68,40 Q66,48 62,52 L58,42 Q60,30 66,18 Z" fill="#87CEEB"/>
      <path d="M132,40 Q134,48 138,52 L142,42 Q140,30 134,18 Z" fill="#87CEEB"/>
      <path d="M85,15 L82,30 L88,28 Z" fill="#D4F1F9" opacity="0.6"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M65,100 Q60,108 58,135 L56,180 Q58,212 75,220 L125,220 Q142,212 144,180 L142,135 Q140,108 135,100 Z"
            fill="#E8F4F8" stroke="#87CEEB" stroke-width="1"/>
      <path d="M75,220 Q85,235 80,310 Q78,340 72,370 L128,370 Q122,340 120,310 Q115,235 125,220 Z"
            fill="#D4ECF2" stroke="#87CEEB" stroke-width="0.8"/>
      <path d="M80,100 Q100,96 120,100" fill="none" stroke="#87CEEB" stroke-width="2"/>
      <circle cx="100" cy="110" r="3" fill="#87CEEB" opacity="0.7"/>
      <path d="M92,145 L100,140 L108,145 L100,150 Z" fill="#B0E0E6" opacity="0.5"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.3">
      <text x="48" y="155" font-size="7" fill="#87CEEB">❄</text>
      <text x="148" y="130" font-size="5" fill="#B0E0E6">❄</text>
    </g>`,
};

// ═══════════════════════════════════════════════════════════════════
// SHOP ITEM SVG LAYERS
// ═══════════════════════════════════════════════════════════════════

const CLOTHES_SVGS = {};
const HAIR_SVGS = {};
const EARS_SVGS = {};
const ACCESSORY_SVGS = {};

// ── Clothes ─────────────────────────────────────────────────────────
CLOTHES_SVGS.outfit_armor = () => `
  <g class="char-clothes">
    <path d="M62,98 Q56,106 54,135 L52,180 Q56,214 75,220 L125,220 Q144,214 148,180 L146,135 Q144,106 138,98 Z"
          fill="#4A4A5A" stroke="#888" stroke-width="1.5"/>
    <path d="M62,98 Q100,88 138,98 L135,108 Q100,100 65,108 Z" fill="#666" stroke="#888" stroke-width="0.8"/>
    <path d="M75,220 L78,290 Q76,330 72,370 L88,372 L86,330 Q88,280 85,220 Z" fill="#4A4A5A" stroke="#666" stroke-width="0.8"/>
    <path d="M125,220 L122,290 Q124,330 128,370 L112,372 L114,330 Q112,280 115,220 Z" fill="#4A4A5A" stroke="#666" stroke-width="0.8"/>
    <path d="M95,108 L100,180 L105,108" fill="none" stroke="#888" stroke-width="1"/>
    <rect x="92" y="100" width="16" height="16" rx="2" fill="#666" stroke="#888" stroke-width="0.8"/>
    <path d="M96,104 L100,112 L104,104" fill="#888" opacity="0.6"/>
  </g>`;

CLOTHES_SVGS.outfit_stage = () => `
  <g class="char-clothes">
    <path d="M64,98 Q58,106 56,135 L56,175 Q60,195 80,200 L120,200 Q140,195 144,175 L144,135 Q142,106 136,98 Z"
          fill="#6A0DAD" stroke="#B040FF" stroke-width="1.2"/>
    <path d="M80,200 Q90,210 100,212 Q110,210 120,200 L130,370 L70,370 Z"
          fill="#5A0D9D" stroke="#B040FF" stroke-width="0.8"/>
    <path d="M64,98 Q100,90 136,98" fill="none" stroke="#FFD700" stroke-width="2"/>
    <circle cx="100" cy="106" r="4" fill="#FFD700"/>
    <path d="M80,140 L120,140" stroke="#B040FF" stroke-width="0.8" opacity="0.5"/>
    <text x="82" y="165" font-size="10" fill="#FFD700" opacity="0.5">★</text>
  </g>`;

CLOTHES_SVGS.outfit_casual = () => `
  <g class="char-clothes">
    <path d="M66,100 Q60,108 58,135 L58,185 Q62,210 78,218 L122,218 Q138,210 142,185 L142,135 Q140,108 134,100 Z"
          fill="#3A7CA5" stroke="#2A6080" stroke-width="1"/>
    <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#2A4A6A" stroke="#1A3A5A" stroke-width="0.8"/>
    <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#2A4A6A" stroke="#1A3A5A" stroke-width="0.8"/>
    <path d="M80,100 Q100,96 120,100" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
  </g>`;

CLOTHES_SVGS.outfit_school = () => `
  <g class="char-clothes">
    <path d="M66,100 Q60,108 58,135 L58,180 Q62,210 80,218 L120,218 Q138,210 142,180 L142,135 Q140,108 134,100 Z"
          fill="white" stroke="#ddd" stroke-width="1"/>
    <path d="M80,218 Q90,225 100,227 Q110,225 120,218 L125,310 L75,310 Z"
          fill="#1A1A3E" stroke="#333" stroke-width="0.8"/>
    <path d="M80,100 Q100,96 120,100" fill="none" stroke="#1A1A3E" stroke-width="2"/>
    <path d="M95,100 L100,130 L105,100" fill="#CC0000" opacity="0.8"/>
    <line x1="100" y1="130" x2="100" y2="218" stroke="#ddd" stroke-width="0.5"/>
  </g>`;

CLOTHES_SVGS.outfit_royal = () => `
  <g class="char-clothes">
    <path d="M55,95 Q58,88 70,96 L65,100 Q60,108 56,140 L52,200 Q56,240 62,300 Q60,340 55,380
            L145,380 Q140,340 138,300 Q144,240 148,200 L144,140 Q140,108 135,100 L130,96 Q142,88 145,95
            Q144,82 130,78 Q100,72 70,78 Q56,82 55,95 Z"
          fill="#8B0000" stroke="#FFD700" stroke-width="1.5"/>
    <path d="M70,78 Q100,72 130,78 Q135,88 130,100 Q100,95 70,100 Q65,88 70,78 Z"
          fill="#AA2222" stroke="#FFD700" stroke-width="0.8"/>
    <path d="M100,100 L100,200" stroke="#FFD700" stroke-width="1" opacity="0.4"/>
    <circle cx="100" cy="105" r="4" fill="#FFD700"/>
  </g>`;

CLOTHES_SVGS.outfit_ninja = () => `
  <g class="char-clothes">
    <path d="M66,100 Q60,108 58,135 L58,180 Q62,212 78,218 L122,218 Q138,212 142,180 L142,135 Q140,108 134,100 Z"
          fill="#1A1A1A" stroke="#333" stroke-width="1"/>
    <path d="M78,218 L80,310 L72,312 L68,220 Z" fill="#1A1A1A" stroke="#333" stroke-width="0.8"/>
    <path d="M122,218 L120,310 L128,312 L132,220 Z" fill="#1A1A1A" stroke="#333" stroke-width="0.8"/>
    <path d="M60,130 Q100,140 140,130" fill="none" stroke="#CC0000" stroke-width="3"/>
    <path d="M70,160 Q100,170 130,160" fill="none" stroke="#CC0000" stroke-width="1.5" opacity="0.4"/>
  </g>`;

CLOTHES_SVGS.outfit_sparkle = () => `
  <g class="char-clothes">
    <path d="M64,98 Q58,106 56,135 L56,175 Q60,195 80,200 L120,200 Q140,195 144,175 L144,135 Q142,106 136,98 Z"
          fill="#E8D0F0" stroke="#C8A0E0" stroke-width="1"/>
    <path d="M80,200 Q90,215 100,218 Q110,215 120,200 L130,370 L70,370 Z"
          fill="#D8C0E8" stroke="#C8A0E0" stroke-width="0.8"/>
    <path d="M64,98 Q100,90 136,98" fill="none" stroke="#E8D0F0" stroke-width="2"/>
    <text x="80" y="140" font-size="6" fill="#FFD700" opacity="0.6">✦</text>
    <text x="110" y="160" font-size="5" fill="#FFD700" opacity="0.5">✦</text>
    <text x="92" y="180" font-size="7" fill="#FFD700" opacity="0.4">✦</text>
  </g>`;

// ── Hair ─────────────────────────────────────────────────────────────
HAIR_SVGS.hair_pink = {
  back: () => `<g class="char-hair-back">
    <path d="M60,45 Q55,110 50,180 L62,175 Q58,110 64,48 Z" fill="#FF69B4" opacity="0.7"/>
    <path d="M140,45 Q145,110 150,180 L138,175 Q142,110 136,48 Z" fill="#FF69B4" opacity="0.7"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="#FF69B4"/>
    <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#FF1493"/>
    <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#FF1493"/>
  </g>`
};

HAIR_SVGS.hair_blue = {
  back: () => `<g class="char-hair-back">
    <path d="M60,45 Q55,110 50,180 L62,175 Q58,110 64,48 Z" fill="#4169E1" opacity="0.7"/>
    <path d="M140,45 Q145,110 150,180 L138,175 Q142,110 136,48 Z" fill="#4169E1" opacity="0.7"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="#4169E1"/>
    <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#2850C0"/>
    <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#2850C0"/>
  </g>`
};

HAIR_SVGS.hair_silver = {
  back: () => `<g class="char-hair-back">
    <path d="M60,45 Q55,110 50,190 L62,185 Q58,110 64,48 Z" fill="#C0C0D0" opacity="0.75"/>
    <path d="M140,45 Q145,110 150,190 L138,185 Q142,110 136,48 Z" fill="#C0C0D0" opacity="0.75"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="#D0D0E0"/>
    <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#B0B0C0"/>
    <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#B0B0C0"/>
  </g>`
};

HAIR_SVGS.hair_rainbow = {
  back: () => `<g class="char-hair-back">
    <path d="M60,45 Q55,110 50,190 L62,185 Q58,110 64,48 Z" fill="url(#rainbow-hair-g)" opacity="0.75"/>
    <path d="M140,45 Q145,110 150,190 L138,185 Q142,110 136,48 Z" fill="url(#rainbow-hair-g)" opacity="0.75"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="url(#rainbow-hair-g)"/>
    <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#FF6B6B"/>
    <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#6BCB77"/>
  </g>`,
  defs: () => `<linearGradient id="rainbow-hair-g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF6B6B"/><stop offset="25%" stop-color="#FFD93D"/>
    <stop offset="50%" stop-color="#6BCB77"/><stop offset="75%" stop-color="#4D96FF"/>
    <stop offset="100%" stop-color="#9B59B6"/>
  </linearGradient>`
};

HAIR_SVGS.hair_galaxy = {
  back: () => `<g class="char-hair-back">
    <path d="M58,42 Q52,110 48,200 L62,195 Q58,110 64,46 Z" fill="url(#galaxy-hair-g)" opacity="0.8"/>
    <path d="M142,42 Q148,110 152,200 L138,195 Q142,110 136,46 Z" fill="url(#galaxy-hair-g)" opacity="0.8"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M66,18 Q82,8 100,6 Q118,8 134,18 L132,40 Q118,28 100,26 Q82,28 68,40 Z" fill="url(#galaxy-hair-g)"/>
    <path d="M68,40 Q66,48 62,52 L58,42 Q60,30 66,18 Z" fill="#2A0A4A"/>
    <path d="M132,40 Q134,48 138,52 L142,42 Q140,30 134,18 Z" fill="#2A0A4A"/>
    <circle cx="78" cy="22" r="1" fill="white" opacity="0.7"/>
    <circle cx="120" cy="16" r="0.8" fill="white" opacity="0.5"/>
    <circle cx="110" cy="32" r="0.6" fill="white" opacity="0.6"/>
  </g>`,
  defs: () => `<linearGradient id="galaxy-hair-g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1A0A3E"/><stop offset="30%" stop-color="#4A1A8E"/>
    <stop offset="60%" stop-color="#8A2AAE"/><stop offset="100%" stop-color="#2A1A5E"/>
  </linearGradient>`
};

HAIR_SVGS.hair_long = {
  back: () => `<g class="char-hair-back">
    <path d="M62,45 Q58,120 55,220 L65,215 Q60,120 66,48 Z" fill="#4A3020" opacity="0.8"/>
    <path d="M138,45 Q142,120 145,220 L135,215 Q140,120 134,48 Z" fill="#4A3020" opacity="0.8"/>
    <path d="M75,55 Q72,140 68,240 L78,235 Q76,130 80,58 Z" fill="#5A4030" opacity="0.5"/>
    <path d="M125,55 Q128,140 132,240 L122,235 Q124,130 120,58 Z" fill="#5A4030" opacity="0.5"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,40 Q118,30 100,28 Q82,30 69,40 Z" fill="#5A4030"/>
    <path d="M69,40 Q67,48 63,52 L60,45 Q62,32 67,20 Z" fill="#4A3020"/>
    <path d="M131,40 Q133,48 137,52 L140,45 Q138,32 133,20 Z" fill="#4A3020"/>
  </g>`
};

HAIR_SVGS.hair_ponytail = {
  back: () => `<g class="char-hair-back">
    <path d="M108,25 Q130,30 135,50 Q140,80 135,140 L125,135 Q130,80 125,50 Q120,35 108,30 Z"
          fill="#6A4030" opacity="0.8"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M67,20 Q82,10 100,8 Q118,10 133,20 L131,38 Q118,28 100,26 Q82,28 69,38 Z" fill="#6A4030"/>
    <path d="M69,38 Q67,44 65,46 L62,40 Q64,30 67,20 Z" fill="#5A3020"/>
    <path d="M131,38 Q133,44 135,46 L138,40 Q136,30 133,20 Z" fill="#5A3020"/>
    <circle cx="118" cy="25" r="5" fill="#FF69B4" opacity="0.7"/>
  </g>`
};

HAIR_SVGS.hair_short = {
  back: () => `<g class="char-hair-back"></g>`,
  front: () => `<g class="char-hair-front">
    <path d="M66,20 Q82,10 100,8 Q118,10 134,20 L132,38 Q118,30 100,28 Q82,30 68,38 Z" fill="#2A2A2A"/>
    <path d="M68,38 Q66,42 65,44 L62,38 Q64,28 66,20 Z" fill="#1A1A1A"/>
    <path d="M132,38 Q134,42 135,44 L138,38 Q136,28 134,20 Z" fill="#1A1A1A"/>
  </g>`
};

// ── Ears ─────────────────────────────────────────────────────────────
EARS_SVGS.ears_bunny = () => `<g class="char-ears">
  <ellipse cx="82" cy="10" rx="6" ry="22" fill="#FFB0C0" stroke="#E090A0" stroke-width="1" transform="rotate(-8,82,10)"/>
  <ellipse cx="82" cy="10" rx="3" ry="16" fill="#FFC8D8" transform="rotate(-8,82,10)"/>
  <ellipse cx="118" cy="10" rx="6" ry="22" fill="#FFB0C0" stroke="#E090A0" stroke-width="1" transform="rotate(8,118,10)"/>
  <ellipse cx="118" cy="10" rx="3" ry="16" fill="#FFC8D8" transform="rotate(8,118,10)"/>
</g>`;

EARS_SVGS.ears_cat = () => `<g class="char-ears">
  <polygon points="72,28 65,0 85,18" fill="#555" stroke="#444" stroke-width="1"/>
  <polygon points="74,24 68,4 82,18" fill="#FFB0B0" opacity="0.6"/>
  <polygon points="128,28 135,0 115,18" fill="#555" stroke="#444" stroke-width="1"/>
  <polygon points="126,24 132,4 118,18" fill="#FFB0B0" opacity="0.6"/>
</g>`;

EARS_SVGS.ears_fox = () => `<g class="char-ears">
  <polygon points="72,26 62,-2 88,16" fill="#FF8C00" stroke="#CC7000" stroke-width="1"/>
  <polygon points="74,22 66,2 84,16" fill="#FFD700" opacity="0.4"/>
  <polygon points="128,26 138,-2 112,16" fill="#FF8C00" stroke="#CC7000" stroke-width="1"/>
  <polygon points="126,22 134,2 116,16" fill="#FFD700" opacity="0.4"/>
</g>`;

EARS_SVGS.ears_bear = () => `<g class="char-ears">
  <circle cx="72" cy="24" r="10" fill="#8B6B4A" stroke="#6A5030" stroke-width="1"/>
  <circle cx="72" cy="24" r="5" fill="#A08060"/>
  <circle cx="128" cy="24" r="10" fill="#8B6B4A" stroke="#6A5030" stroke-width="1"/>
  <circle cx="128" cy="24" r="5" fill="#A08060"/>
</g>`;

EARS_SVGS.ears_wolf = () => `<g class="char-ears">
  <polygon points="70,28 60,-5 88,14" fill="#808080" stroke="#666" stroke-width="1"/>
  <polygon points="73,24 64,0 85,14" fill="#A0A0A0" opacity="0.4"/>
  <polygon points="130,28 140,-5 112,14" fill="#808080" stroke="#666" stroke-width="1"/>
  <polygon points="127,24 136,0 115,14" fill="#A0A0A0" opacity="0.4"/>
</g>`;

EARS_SVGS.ears_deer = () => `<g class="char-ears">
  <path d="M75,22 L70,5 L65,-10 M70,5 L60,0" fill="none" stroke="#8B6B4A" stroke-width="3" stroke-linecap="round"/>
  <path d="M125,22 L130,5 L135,-10 M130,5 L140,0" fill="none" stroke="#8B6B4A" stroke-width="3" stroke-linecap="round"/>
</g>`;

EARS_SVGS.ears_panda = () => `<g class="char-ears">
  <circle cx="72" cy="24" r="11" fill="#1A1A1A"/>
  <circle cx="72" cy="24" r="5" fill="#333"/>
  <circle cx="128" cy="24" r="11" fill="#1A1A1A"/>
  <circle cx="128" cy="24" r="5" fill="#333"/>
</g>`;

EARS_SVGS.ears_tiger = () => `<g class="char-ears">
  <polygon points="72,26 62,-2 88,16" fill="#FF8C00" stroke="#CC6600" stroke-width="1"/>
  <polygon points="74,22 66,2 84,16" fill="#1A1A1A" opacity="0.4"/>
  <line x1="70" y1="12" x2="78" y2="16" stroke="#1A1A1A" stroke-width="1.5"/>
  <polygon points="128,26 138,-2 112,16" fill="#FF8C00" stroke="#CC6600" stroke-width="1"/>
  <polygon points="126,22 134,2 116,16" fill="#1A1A1A" opacity="0.4"/>
  <line x1="130" y1="12" x2="122" y2="16" stroke="#1A1A1A" stroke-width="1.5"/>
</g>`;

EARS_SVGS.ears_unicorn = () => `<g class="char-ears">
  <polygon points="100,0 94,22 106,22" fill="url(#unicorn-horn-g)" stroke="#E8C0FF" stroke-width="0.8"/>
  <line x1="96" y1="16" x2="104" y2="16" stroke="#D0A0E0" stroke-width="0.5"/>
  <line x1="97" y1="10" x2="103" y2="10" stroke="#D0A0E0" stroke-width="0.5"/>
  <line x1="98" y1="5" x2="102" y2="5" stroke="#D0A0E0" stroke-width="0.5"/>
</g>`;

// ── Accessories ─────────────────────────────────────────────────────
ACCESSORY_SVGS.acc_sunglasses = () => `<g class="char-accessory">
  <rect x="74" y="48" width="20" height="12" rx="3" fill="#1A1A1A" opacity="0.85"/>
  <rect x="106" y="48" width="20" height="12" rx="3" fill="#1A1A1A" opacity="0.85"/>
  <line x1="94" y1="54" x2="106" y2="54" stroke="#1A1A1A" stroke-width="1.5"/>
  <line x1="74" y1="54" x2="68" y2="50" stroke="#1A1A1A" stroke-width="1.5"/>
  <line x1="126" y1="54" x2="132" y2="50" stroke="#1A1A1A" stroke-width="1.5"/>
</g>`;

ACCESSORY_SVGS.acc_headband = () => `<g class="char-accessory">
  <path d="M68,35 Q100,28 132,35" fill="none" stroke="#FFD700" stroke-width="3"/>
  <circle cx="100" cy="30" r="4" fill="#FFD700"/>
  <text x="97" y="33" font-size="6" fill="#FF6B9D">✦</text>
</g>`;

ACCESSORY_SVGS.acc_earrings = () => `<g class="char-accessory">
  <circle cx="68" cy="68" r="3" fill="#FFD700" stroke="#CCA800" stroke-width="0.5"/>
  <circle cx="132" cy="68" r="3" fill="#FFD700" stroke="#CCA800" stroke-width="0.5"/>
</g>`;

ACCESSORY_SVGS.acc_sword = () => `<g class="char-accessory">
  <rect x="156" y="130" width="4" height="70" rx="1" fill="#B0B0C0" stroke="#888" stroke-width="0.8"/>
  <rect x="150" y="200" width="16" height="6" rx="2" fill="#8B6B4A" stroke="#6A5030" stroke-width="0.8"/>
  <rect x="154" y="206" width="8" height="18" rx="2" fill="#6A5030"/>
  <polygon points="158,130 155,125 161,125" fill="#D0D0E0"/>
</g>`;

ACCESSORY_SVGS.acc_staff = () => `<g class="char-accessory">
  <rect x="156" y="100" width="4" height="120" rx="2" fill="#8B6B4A" stroke="#6A5030" stroke-width="0.8"/>
  <circle cx="158" cy="95" r="8" fill="none" stroke="#9370DB" stroke-width="1.5"/>
  <circle cx="158" cy="95" r="4" fill="#9370DB" opacity="0.6">
    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
  </circle>
</g>`;

ACCESSORY_SVGS.acc_bow = () => `<g class="char-accessory">
  <path d="M158,100 Q148,150 158,200" fill="none" stroke="#8B6B4A" stroke-width="3"/>
  <line x1="158" y1="100" x2="158" y2="200" stroke="#C0C0C0" stroke-width="0.8"/>
</g>`;

ACCESSORY_SVGS.acc_daggers = () => `<g class="char-accessory">
  <rect x="34" y="195" width="3" height="30" rx="1" fill="#B0B0C0" transform="rotate(15,35,210)"/>
  <rect x="160" y="195" width="3" height="30" rx="1" fill="#B0B0C0" transform="rotate(-15,161,210)"/>
</g>`;

ACCESSORY_SVGS.acc_wings = () => `<g class="char-accessory" opacity="0.6">
  <path d="M55,120 Q25,100 15,70 Q20,90 30,105 Q20,80 18,50 Q25,75 35,95 Q30,70 32,40 Q38,70 42,100 L55,115 Z"
        fill="#E8E8FF" stroke="#C0C0E0" stroke-width="0.8"/>
  <path d="M145,120 Q175,100 185,70 Q180,90 170,105 Q180,80 182,50 Q175,75 165,95 Q170,70 168,40 Q162,70 158,100 L145,115 Z"
        fill="#E8E8FF" stroke="#C0C0E0" stroke-width="0.8"/>
</g>`;

ACCESSORY_SVGS.acc_crown = () => `<g class="char-accessory">
  <path d="M78,20 L75,6 L85,14 L92,2 L100,14 L108,2 L115,14 L125,6 L122,20 Z"
        fill="#FFD700" stroke="#CCA800" stroke-width="1"/>
  <circle cx="92" cy="16" r="2" fill="#FF4444"/>
  <circle cx="100" cy="12" r="2" fill="#4444FF"/>
  <circle cx="108" cy="16" r="2" fill="#44CC44"/>
</g>`;

ACCESSORY_SVGS.acc_necklace = () => `<g class="char-accessory">
  <path d="M80,85 Q90,95 100,98 Q110,95 120,85" fill="none" stroke="#FFD700" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="4" fill="#50C878" stroke="#FFD700" stroke-width="1"/>
</g>`;

// ═══════════════════════════════════════════════════════════════════
// MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════════════════════════

function renderCharacterSVG(characterId, equippedItems = {}, options = {}) {
  const charDef = CHARACTER_SVGS[characterId];
  if (!charDef) return '<svg viewBox="0 0 200 400"><text x="60" y="200" fill="white" font-size="16">?</text></svg>';

  const size = options.size || 'full';
  const anim = options.animation || 'idle';

  const skin = charDef.skin || 'fair';

  // Determine which layers to use (equipped items override defaults)
  const hairDef = equippedItems.hair && HAIR_SVGS[equippedItems.hair]
    ? HAIR_SVGS[equippedItems.hair]
    : null;
  const clothesFn = equippedItems.clothes && CLOTHES_SVGS[equippedItems.clothes]
    ? CLOTHES_SVGS[equippedItems.clothes]
    : charDef.defaultClothes;
  const earsFn = equippedItems.ears && EARS_SVGS[equippedItems.ears]
    ? EARS_SVGS[equippedItems.ears]
    : null;
  const accessoryFn = equippedItems.accessory && ACCESSORY_SVGS[equippedItems.accessory]
    ? ACCESSORY_SVGS[equippedItems.accessory]
    : null;

  // Build defs
  let defs = charDef.defs ? charDef.defs() : '';
  if (hairDef && hairDef.defs) defs += hairDef.defs();
  // Unicorn horn gradient
  if (equippedItems.ears === 'ears_unicorn') {
    defs += svgGradient('unicorn-horn-g', '#FFD700', '#E8C0FF');
  }

  // Assemble SVG
  const hairBack = hairDef ? hairDef.back() : charDef.defaultHair();
  const hairFront = hairDef ? hairDef.front() : charDef.defaultHairFront();

  const svg = `<svg viewBox="0 0 200 400" class="char-svg char-svg--${anim} char-svg--${size}"
    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>${defs}</defs>
    <g class="char-body-group">
      ${charDef.flair ? charDef.flair() : ''}
      ${hairBack}
      ${baseBody(skin)}
      ${clothesFn()}
      ${baseHead(skin)}
      ${charDef.eyes()}
      ${hairFront}
      ${earsFn ? earsFn() : ''}
      ${accessoryFn ? accessoryFn() : ''}
    </g>
  </svg>`;

  return svg;
}

// ── Helper: get character mini-preview (for grids) ──────────────────
function renderCharacterMini(characterId) {
  return renderCharacterSVG(characterId, {}, { size: 'mini', animation: 'idle' });
}
