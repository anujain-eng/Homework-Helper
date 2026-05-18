// ==========================================================================
// EmeraldQuest — SVG Character System (anime-proportional, layerable)
// ==========================================================================

const CHAR = { W: 200, H: 400 };

const SKIN = {
  light:   { fill: '#FDDCBD', shadow: '#F0C4A0', outline: '#C8956A' },
  fair:    { fill: '#FDE8D0', shadow: '#F0D4B8', outline: '#C89870' },
  warm:    { fill: '#E8B88A', shadow: '#D4A070', outline: '#A07040' },
  tan:     { fill: '#D4956A', shadow: '#C07C50', outline: '#8C5830' },
  brown:   { fill: '#A06030', shadow: '#8C4C20', outline: '#603010' },
  pale:    { fill: '#F8F0F2', shadow: '#E8D8E0', outline: '#C0A8B0' },
};

function svgGradient(id, c1, c2, dir = 'v') {
  const [x2, y2] = dir === 'v' ? [0, 1] : [1, 0];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient>`;
}

// ── Slim anime body ─────────────────────────────────────────────────
function baseBody(skin) {
  const s = SKIN[skin] || SKIN.fair;
  return `
    <g class="char-legs">
      <g class="char-leg-left">
        <path d="M88,248 Q86,290 85,330 Q84,355 86,370"
              fill="none" stroke="${s.fill}" stroke-width="16" stroke-linecap="round"/>
        <path d="M88,248 Q86,290 85,330 Q84,355 86,370"
              fill="none" stroke="${s.outline}" stroke-width="17" stroke-linecap="round" opacity="0.15"/>
        <ellipse cx="86" cy="376" rx="12" ry="5" fill="#2D2D4E"/>
      </g>
      <g class="char-leg-right">
        <path d="M112,248 Q114,290 115,330 Q116,355 114,370"
              fill="none" stroke="${s.fill}" stroke-width="16" stroke-linecap="round"/>
        <path d="M112,248 Q114,290 115,330 Q116,355 114,370"
              fill="none" stroke="${s.outline}" stroke-width="17" stroke-linecap="round" opacity="0.15"/>
        <ellipse cx="114" cy="376" rx="12" ry="5" fill="#2D2D4E"/>
      </g>
    </g>
    <g class="char-torso">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,185 78,200
              Q82,215 85,235 L88,250 L112,250 L115,235
              Q118,215 122,200 Q128,185 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="${s.fill}"/>
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,185 78,200
              Q82,215 85,235 L88,250 L112,250 L115,235
              Q118,215 122,200 Q128,185 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="none" stroke="${s.outline}" stroke-width="1.2" opacity="0.4"/>
    </g>
    <g class="char-arms">
      <g class="char-arm-left">
        <path d="M72,112 Q60,125 52,150 Q46,175 48,200 Q49,210 52,218"
              fill="none" stroke="${s.fill}" stroke-width="12" stroke-linecap="round"/>
        <path d="M72,112 Q60,125 52,150 Q46,175 48,200 Q49,210 52,218"
              fill="none" stroke="${s.outline}" stroke-width="13" stroke-linecap="round" opacity="0.12"/>
        <circle cx="52" cy="220" r="6" fill="${s.fill}"/>
      </g>
      <g class="char-arm-right">
        <path d="M128,112 Q140,125 148,150 Q154,175 152,200 Q151,210 148,218"
              fill="none" stroke="${s.fill}" stroke-width="12" stroke-linecap="round"/>
        <path d="M128,112 Q140,125 148,150 Q154,175 152,200 Q151,210 148,218"
              fill="none" stroke="${s.outline}" stroke-width="13" stroke-linecap="round" opacity="0.12"/>
        <circle cx="148" cy="220" r="6" fill="${s.fill}"/>
      </g>
    </g>`;
}

// ── Pretty anime head ───────────────────────────────────────────────
function baseHead(skin) {
  const s = SKIN[skin] || SKIN.fair;
  return `
    <g class="char-head">
      <ellipse cx="100" cy="55" rx="30" ry="34" fill="${s.fill}"/>
      <ellipse cx="100" cy="55" rx="30" ry="34" fill="none" stroke="${s.outline}" stroke-width="0.8" opacity="0.3"/>
      <path d="M88,86 Q100,92 112,86" fill="${s.fill}" stroke="none"/>
    </g>`;
}

// ── Beautiful anime eyes ────────────────────────────────────────────
function prettyEyes(style, irisColor) {
  const styles = {
    sparkle: `
      <g class="char-face">
        <!-- Left eye -->
        <ellipse cx="86" cy="54" rx="9" ry="10.5" fill="white"/>
        <ellipse cx="86" cy="54" rx="9" ry="10.5" fill="none" stroke="#3D2B4E" stroke-width="1.8"
                 clip-path="inset(0 0 50% 0)"/>
        <ellipse cx="87" cy="56" rx="6.5" ry="7.5" fill="${irisColor}"/>
        <ellipse cx="87" cy="57" rx="4.5" ry="5.5" fill="${irisColor}" opacity="0.7"/>
        <ellipse cx="88" cy="58" rx="3" ry="3.5" fill="#1A1028"/>
        <circle cx="84" cy="51" r="2.5" fill="white"/>
        <circle cx="90" cy="53" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="85" cy="58" r="1" fill="white" opacity="0.5"/>
        <path d="M77,44 Q82,42 92,44" fill="none" stroke="#3D2B4E" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Right eye -->
        <ellipse cx="114" cy="54" rx="9" ry="10.5" fill="white"/>
        <ellipse cx="114" cy="54" rx="9" ry="10.5" fill="none" stroke="#3D2B4E" stroke-width="1.8"
                 clip-path="inset(0 0 50% 0)"/>
        <ellipse cx="113" cy="56" rx="6.5" ry="7.5" fill="${irisColor}"/>
        <ellipse cx="113" cy="57" rx="4.5" ry="5.5" fill="${irisColor}" opacity="0.7"/>
        <ellipse cx="112" cy="58" rx="3" ry="3.5" fill="#1A1028"/>
        <circle cx="116" cy="51" r="2.5" fill="white"/>
        <circle cx="110" cy="53" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="115" cy="58" r="1" fill="white" opacity="0.5"/>
        <path d="M108,44 Q113,42 123,44" fill="none" stroke="#3D2B4E" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Blush -->
        <ellipse cx="76" cy="62" rx="5" ry="3" fill="#FFB0C8" opacity="0.3"/>
        <ellipse cx="124" cy="62" rx="5" ry="3" fill="#FFB0C8" opacity="0.3"/>
        <!-- Nose & mouth -->
        <path d="M99,65 L100,67" stroke="#C8956A" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
        <path d="M95,72 Q100,75 105,72" fill="none" stroke="#E8809A" stroke-width="1.3" stroke-linecap="round"/>
      </g>`,
    fierce: `
      <g class="char-face">
        <path d="M77,48 Q83,46 95,50 L95,62 Q87,66 77,63 Z" fill="white"/>
        <path d="M77,48 Q83,46 95,50" fill="none" stroke="#2D1B3E" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="87" cy="56" rx="5.5" ry="6.5" fill="${irisColor}"/>
        <ellipse cx="87" cy="57" rx="3.5" ry="4.5" fill="#1A1028"/>
        <circle cx="85" cy="53" r="2" fill="white"/>
        <circle cx="89" cy="55" r="1" fill="white" opacity="0.7"/>
        <path d="M105,48 Q111,46 123,50 L123,62 Q115,66 105,63 Z" fill="white"/>
        <path d="M105,48 Q111,46 123,50" fill="none" stroke="#2D1B3E" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="113" cy="56" rx="5.5" ry="6.5" fill="${irisColor}"/>
        <ellipse cx="113" cy="57" rx="3.5" ry="4.5" fill="#1A1028"/>
        <circle cx="115" cy="53" r="2" fill="white"/>
        <circle cx="111" cy="55" r="1" fill="white" opacity="0.7"/>
        <path d="M75,44 Q80,41 94,45" fill="none" stroke="#2D1B3E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M106,45 Q120,41 125,44" fill="none" stroke="#2D1B3E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M99,66 L100,68" stroke="#C8956A" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>
        <path d="M95,73 Q100,75 105,73" fill="none" stroke="#C07080" stroke-width="1.2" stroke-linecap="round"/>
      </g>`,
    cool: `
      <g class="char-face">
        <ellipse cx="86" cy="55" rx="8.5" ry="9" fill="white"/>
        <path d="M77.5,50 Q86,46 94.5,50" fill="none" stroke="#2D2040" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="86" cy="56" rx="5.5" ry="6" fill="${irisColor}"/>
        <ellipse cx="86" cy="57" rx="3.5" ry="4" fill="#1A1028"/>
        <circle cx="84" cy="53" r="2" fill="white"/>
        <circle cx="88" cy="55" r="1.2" fill="white" opacity="0.7"/>
        <ellipse cx="114" cy="55" rx="8.5" ry="9" fill="white"/>
        <path d="M105.5,50 Q114,46 122.5,50" fill="none" stroke="#2D2040" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="114" cy="56" rx="5.5" ry="6" fill="${irisColor}"/>
        <ellipse cx="114" cy="57" rx="3.5" ry="4" fill="#1A1028"/>
        <circle cx="116" cy="53" r="2" fill="white"/>
        <circle cx="112" cy="55" r="1.2" fill="white" opacity="0.7"/>
        <path d="M99,66 L100,68" stroke="#C8956A" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>
        <path d="M96,73 Q100,75.5 104,73" fill="none" stroke="#C08090" stroke-width="1.2" stroke-linecap="round"/>
      </g>`,
    sweet: `
      <g class="char-face">
        <ellipse cx="86" cy="55" rx="9.5" ry="11" fill="white"/>
        <ellipse cx="86" cy="55" rx="9.5" ry="11" fill="none" stroke="#3D2040" stroke-width="1.5"
                 clip-path="inset(0 0 45% 0)"/>
        <ellipse cx="86" cy="57" rx="7" ry="8" fill="${irisColor}"/>
        <ellipse cx="86" cy="58" rx="5" ry="6" fill="${irisColor}" opacity="0.6"/>
        <ellipse cx="87" cy="59" rx="3.5" ry="4" fill="#1A1028"/>
        <circle cx="83" cy="52" r="3" fill="white"/>
        <circle cx="89" cy="54" r="1.8" fill="white" opacity="0.8"/>
        <circle cx="84" cy="60" r="1" fill="white" opacity="0.4"/>
        <ellipse cx="114" cy="55" rx="9.5" ry="11" fill="white"/>
        <ellipse cx="114" cy="55" rx="9.5" ry="11" fill="none" stroke="#3D2040" stroke-width="1.5"
                 clip-path="inset(0 0 45% 0)"/>
        <ellipse cx="114" cy="57" rx="7" ry="8" fill="${irisColor}"/>
        <ellipse cx="114" cy="58" rx="5" ry="6" fill="${irisColor}" opacity="0.6"/>
        <ellipse cx="113" cy="59" rx="3.5" ry="4" fill="#1A1028"/>
        <circle cx="117" cy="52" r="3" fill="white"/>
        <circle cx="111" cy="54" r="1.8" fill="white" opacity="0.8"/>
        <circle cx="116" cy="60" r="1" fill="white" opacity="0.4"/>
        <path d="M79,44 Q83,42 93,44" fill="none" stroke="#3D2040" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M107,44 Q117,42 121,44" fill="none" stroke="#3D2040" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="76" cy="63" rx="6" ry="3.5" fill="#FFB0C8" opacity="0.35"/>
        <ellipse cx="124" cy="63" rx="6" ry="3.5" fill="#FFB0C8" opacity="0.35"/>
        <path d="M99,66 L100,68" stroke="#D0A080" stroke-width="0.7" stroke-linecap="round" opacity="0.4"/>
        <path d="M95,73 Q100,76 105,73" fill="none" stroke="#E87898" stroke-width="1.3" stroke-linecap="round"/>
      </g>`,
  };
  return styles[style] || styles.sparkle;
}

// ═══════════════════════════════════════════════════════════════════
// CHARACTER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const CHARACTER_SVGS = {};

// ── Blaze ───────────────────────────────────────────────────────────
CHARACTER_SVGS.blaze = {
  skin: 'warm',
  eyes: () => prettyEyes('fierce', '#FF6820'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M62,35 Q58,60 56,90 Q55,110 58,130 L65,126 Q62,100 64,70 Q66,50 68,38 Z" fill="#CC2200" opacity="0.6"/>
      <path d="M138,35 Q142,60 144,90 Q145,110 142,130 L135,126 Q138,100 136,70 Q134,50 132,38 Z" fill="#CC2200" opacity="0.6"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M70,20 Q80,10 100,8 Q120,10 130,20
              Q134,28 132,38 Q124,30 100,27 Q76,30 68,38 Q66,28 70,20 Z" fill="#E83000"/>
      <path d="M68,38 Q65,46 60,48 L58,38 Q62,26 70,20 Z" fill="#FF4400"/>
      <path d="M132,38 Q135,46 140,48 L142,38 Q138,26 130,20 Z" fill="#FF4400"/>
      <path d="M78,15 L74,30 L80,26 Z" fill="#FF6620" opacity="0.8"/>
      <path d="M122,15 L126,30 L120,26 Z" fill="#FF6620" opacity="0.8"/>
      <path d="M95,8 L92,22 L98,20 Z" fill="#FFD700" opacity="0.4"/>
      <path d="M105,8 L108,22 L102,20 Z" fill="#FFD700" opacity="0.4"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#1A1020" stroke="#FF4500" stroke-width="0.8" opacity="0.95"/>
      <path d="M78,108 Q100,103 122,108" fill="none" stroke="#FF4500" stroke-width="2"/>
      <path d="M100,108 L100,195" stroke="#FF4500" stroke-width="0.8" opacity="0.4"/>
      <path d="M75,130 L68,140 L76,136 Z" fill="#FF4500" opacity="0.5"/>
      <path d="M125,130 L132,140 L124,136 Z" fill="#FF4500" opacity="0.5"/>
      <circle cx="100" cy="112" r="2.5" fill="#FF4500"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#1A1020" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#1A1020" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <circle cx="48" cy="130" r="2" fill="#FF4500"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="155" cy="145" r="1.5" fill="#FF6600"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0.8s"/></circle>
    </g>`,
};

// ── Luna ────────────────────────────────────────────────────────────
CHARACTER_SVGS.luna = {
  skin: 'pale',
  eyes: () => prettyEyes('sparkle', '#8888CC'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M64,38 Q58,80 54,140 Q50,190 52,240 Q53,260 56,270
              L66,266 Q62,240 60,190 Q58,140 62,80 Q64,60 68,42 Z" fill="#D0D0EA" opacity="0.75"/>
      <path d="M136,38 Q142,80 146,140 Q150,190 148,240 Q147,260 144,270
              L134,266 Q138,240 140,190 Q142,140 138,80 Q136,60 132,42 Z" fill="#D0D0EA" opacity="0.75"/>
      <path d="M78,50 Q74,100 70,170 Q68,210 72,250
              L80,246 Q76,200 78,150 Q80,100 82,54 Z" fill="#E0E0F5" opacity="0.4"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M70,18 Q82,8 100,6 Q118,8 130,18
              Q134,28 132,40 Q120,30 100,28 Q80,30 68,40 Q66,28 70,18 Z" fill="#D8D8F0"/>
      <path d="M68,40 Q66,48 62,52 L60,42 Q63,30 70,18 Z" fill="#C0C0E0"/>
      <path d="M132,40 Q134,48 138,52 L140,42 Q137,30 130,18 Z" fill="#C0C0E0"/>
      <path d="M80,26 Q82,34 78,42 L76,38 Z" fill="#E8E8FF" opacity="0.5"/>
      <path d="M120,26 Q118,34 122,42 L124,38 Z" fill="#E8E8FF" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#1E1848"/>
      <path d="M78,108 Q100,103 122,108" fill="none" stroke="#A0A0E0" stroke-width="1.5"/>
      <circle cx="100" cy="112" r="3" fill="#C0C0FF" opacity="0.7"/>
      <path d="M85,250 Q90,270 88,310 Q86,340 82,370 L118,370 Q114,340 112,310 Q110,270 115,250 Z"
            fill="#1E1848" opacity="0.9"/>
      <path d="M72,108 Q60,115 52,150 Q46,175 48,200 Q49,210 52,218"
            fill="none" stroke="#1E1848" stroke-width="12" stroke-linecap="round"/>
      <path d="M128,112 Q140,115 148,150 Q154,175 152,200 Q151,210 148,218"
            fill="none" stroke="#1E1848" stroke-width="12" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.35">
      <circle cx="132" cy="22" r="3" fill="#E0E0FF"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="3.5s" repeatCount="indefinite"/></circle>
      <circle cx="48" cy="180" r="1.5" fill="#C0C0FF"><animate attributeName="opacity" values="0;0.5;0" dur="4s" repeatCount="indefinite" begin="1.2s"/></circle>
    </g>`,
};

// ── Rosé ────────────────────────────────────────────────────────────
CHARACTER_SVGS.rose = {
  skin: 'fair',
  eyes: () => prettyEyes('sweet', '#E0609A'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M62,38 Q56,80 52,140 Q50,185 52,220 Q53,240 56,250
              L66,246 Q62,220 60,180 Q58,130 62,75 Q64,55 68,42 Z" fill="#FF90B5" opacity="0.7"/>
      <path d="M138,38 Q144,80 148,140 Q150,185 148,220 Q147,240 144,250
              L134,246 Q138,220 140,180 Q142,130 138,75 Q136,55 132,42 Z" fill="#FF90B5" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M70,18 Q82,8 100,6 Q118,8 130,18
              Q134,26 132,38 Q120,28 100,26 Q80,28 68,38 Q66,26 70,18 Z" fill="#FFB0CA"/>
      <path d="M68,38 Q66,46 62,50 L60,40 Q63,28 70,18 Z" fill="#FF90B0"/>
      <path d="M132,38 Q134,46 138,50 L140,40 Q137,28 130,18 Z" fill="#FF90B0"/>
      <path d="M82,22 Q84,30 80,38 L78,34 Z" fill="#FFD0E0" opacity="0.5"/>
      <path d="M118,22 Q116,30 120,38 L122,34 Z" fill="#FFD0E0" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M74,108 Q70,118 68,135 Q67,150 70,162 L78,168
              Q85,172 100,174 Q115,172 122,168 L130,162 Q133,150 132,135 Q130,118 126,108 Z"
            fill="#FFB8D0" stroke="#E890A8" stroke-width="0.8"/>
      <path d="M78,168 Q85,175 100,177 Q115,175 122,168
              L128,240 Q118,252 100,254 Q82,252 72,240 Z"
            fill="#FFCCD8" stroke="#E890A8" stroke-width="0.6"/>
      <path d="M78,108 Q100,103 122,108" fill="none" stroke="#FFD700" stroke-width="2"/>
      <path d="M96,108 L100,168 L104,108" fill="none" stroke="#FFD700" stroke-width="1"/>
      <circle cx="100" cy="112" r="2.5" fill="#FFD700"/>
      <path d="M72,108 Q60,115 52,150 Q46,175 48,200 Q49,210 52,218"
            fill="none" stroke="#FFB8D0" stroke-width="11" stroke-linecap="round"/>
      <path d="M128,112 Q140,115 148,150 Q154,175 152,200 Q151,210 148,218"
            fill="none" stroke="#FFB8D0" stroke-width="11" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <text x="44" y="125" font-size="7" fill="#FFD700">✦</text>
      <text x="150" y="108" font-size="5" fill="#FFD700">✦</text>
    </g>`,
};

// ── Jinx ────────────────────────────────────────────────────────────
CHARACTER_SVGS.jinx = {
  skin: 'light',
  eyes: () => prettyEyes('fierce', '#FF1493'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M58,36 Q54,60 52,90 Q51,110 54,125 L63,122 Q60,100 60,75 Q62,55 64,40 Z" fill="#FF69B4" opacity="0.6"/>
      <path d="M142,36 Q146,60 148,90 Q149,110 146,125 L137,122 Q140,100 140,75 Q138,55 136,40 Z" fill="#FF69B4" opacity="0.6"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q136,26 134,38 Q122,28 100,26 Q78,28 66,38 Q64,26 68,16 Z" fill="#FF69B4"/>
      <path d="M66,38 Q63,46 58,48 L56,36 Q60,24 68,16 Z" fill="#FF1493"/>
      <path d="M134,38 Q137,46 142,48 L144,36 Q140,24 132,16 Z" fill="#FF1493"/>
      <path d="M82,14 L78,30 L84,26 Z" fill="#FF91CC" opacity="0.7"/>
      <path d="M118,14 L122,30 L116,26 Z" fill="#FF91CC" opacity="0.7"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#1A1A1A" stroke="#FF69B4" stroke-width="0.8"/>
      <path d="M80,125 L120,125" stroke="#FF69B4" stroke-width="1.5"/>
      <path d="M85,140 L115,140" stroke="#FF1493" stroke-width="0.8" opacity="0.4"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#1A1A1A" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#1A1A1A" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => '',
};

// ── Shadow ──────────────────────────────────────────────────────────
CHARACTER_SVGS.shadow = {
  skin: 'light',
  eyes: () => prettyEyes('cool', '#8B5CF6'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,35 Q56,55 54,80 Q53,95 56,110 L64,107 Q62,85 62,65 Q64,48 66,38 Z" fill="#1A0E40" opacity="0.7"/>
      <path d="M140,35 Q144,55 146,80 Q147,95 144,110 L136,107 Q138,85 138,65 Q136,48 134,38 Z" fill="#1A0E40" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q136,28 134,40 Q122,30 100,27 Q78,30 66,40 Q64,28 68,16 Z" fill="#2D1B69"/>
      <path d="M66,40 Q63,48 58,52 L56,40 Q60,26 68,16 Z" fill="#1A0E40"/>
      <path d="M134,40 Q137,48 142,52 L144,40 Q140,26 132,16 Z" fill="#1A0E40"/>
      <path d="M86,18 L83,34 L88,30 Z" fill="#3D2B79" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M55,100 Q58,92 72,104 Q68,115 66,135 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,258 Q90,290 86,330 Q84,350 78,380
              L122,380 Q116,350 114,330 Q110,290 112,258 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,135 Q132,115 128,104
              Q142,92 145,100 Q148,90 140,82 Q120,74 100,72 Q80,74 60,82 Q52,90 55,100 Z"
            fill="#1A0E40" stroke="#483D8B" stroke-width="0.8"/>
      <path d="M72,82 Q100,74 128,82 Q132,90 128,104 Q100,98 72,104 Q68,90 72,82 Z"
            fill="#2D1B69" stroke="#483D8B" stroke-width="0.6"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.25">
      <circle cx="46" cy="180" r="12" fill="none" stroke="#8B5CF6" stroke-width="0.5">
        <animate attributeName="r" values="10;16;10" dur="3.5s" repeatCount="indefinite"/>
      </circle>
    </g>`,
};

// ── Nova ────────────────────────────────────────────────────────────
CHARACTER_SVGS.nova = {
  skin: 'fair',
  eyes: () => prettyEyes('sparkle', '#9370DB'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,36 Q54,80 50,140 Q48,185 50,230 Q51,250 54,260
              L64,256 Q60,230 58,180 Q56,130 60,75 Q62,55 66,40 Z" fill="#7B48C8" opacity="0.7"/>
      <path d="M140,36 Q146,80 150,140 Q152,185 150,230 Q149,250 146,260
              L136,256 Q140,230 142,180 Q144,130 140,75 Q138,55 134,40 Z" fill="#7B48C8" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q136,26 134,38 Q122,28 100,26 Q78,28 66,38 Q64,26 68,16 Z" fill="#9370DB"/>
      <path d="M66,38 Q63,46 58,50 L56,38 Q60,24 68,16 Z" fill="#7B48C8"/>
      <path d="M134,38 Q137,46 142,50 L144,38 Q140,24 132,16 Z" fill="#7B48C8"/>
      <circle cx="78" cy="18" r="1.2" fill="white" opacity="0.6"/>
      <circle cx="120" cy="12" r="0.8" fill="white" opacity="0.5"/>
      <circle cx="108" cy="28" r="0.6" fill="white" opacity="0.4"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#2A1B5E" stroke="#9370DB" stroke-width="0.8"/>
      <circle cx="100" cy="140" r="4" fill="#9370DB" opacity="0.5"/>
      <circle cx="100" cy="140" r="2" fill="white" opacity="0.6"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#2A1B5E" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#2A1B5E" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.4">
      <circle cx="46" cy="165" r="1.2" fill="#B8A0E8"><animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/></circle>
    </g>`,
};

// ── Kai ─────────────────────────────────────────────────────────────
CHARACTER_SVGS.kai = {
  skin: 'light',
  eyes: () => prettyEyes('cool', '#00BFFF'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M60,34 Q56,50 54,70 Q53,82 56,95 L64,92 Q62,75 62,58 Q64,44 66,38 Z" fill="#0080CC" opacity="0.5"/>
      <path d="M140,34 Q144,50 146,70 Q147,82 144,95 L136,92 Q138,75 138,58 Q136,44 134,38 Z" fill="#0080CC" opacity="0.5"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q135,26 132,36 Q120,27 100,25 Q80,27 68,36 Q65,26 68,16 Z" fill="#1E90FF"/>
      <path d="M68,36 Q66,42 62,45 L60,36 Q62,25 68,16 Z" fill="#0070DD"/>
      <path d="M132,36 Q134,42 138,45 L140,36 Q138,25 132,16 Z" fill="#0070DD"/>
      <path d="M86,14 L84,28 L88,26 Z" fill="#40A8FF" opacity="0.6"/>
      <path d="M114,14 L116,28 L112,26 Z" fill="#40A8FF" opacity="0.6"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#142840" stroke="#00BFFF" stroke-width="0.8"/>
      <path d="M78,108 Q100,103 122,108" fill="none" stroke="#00BFFF" stroke-width="1.5"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#142840" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#142840" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => '',
};

// ── Viper ───────────────────────────────────────────────────────────
CHARACTER_SVGS.viper = {
  skin: 'tan',
  eyes: () => prettyEyes('fierce', '#32CD32'),
  defaultHair: () => `<g class="char-hair-back"></g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q134,24 132,32 Q120,24 100,22 Q80,24 68,32 Q66,24 68,16 Z" fill="#228B22"/>
      <path d="M68,32 Q66,38 62,40 L60,32 Q62,22 68,16 Z" fill="#1A6B1A"/>
      <path d="M132,32 Q134,38 138,40 L140,32 Q138,22 132,16 Z" fill="#1A6B1A"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#1A3A1A" stroke="#32CD32" stroke-width="0.8"/>
      <path d="M72,125 Q85,120 98,125 Q111,130 124,125" fill="none" stroke="#32CD32" stroke-width="1"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#1A3A1A" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#1A3A1A" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => '',
};

// ── Storm ───────────────────────────────────────────────────────────
CHARACTER_SVGS.storm = {
  skin: 'warm',
  eyes: () => prettyEyes('fierce', '#1E90FF'),
  defaultHair: () => `<g class="char-hair-back"></g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,14 Q82,4 100,2 Q118,4 134,14
              Q138,24 135,36 Q122,26 100,24 Q78,26 65,36 Q62,24 66,14 Z" fill="#1E90FF"/>
      <path d="M65,36 Q62,42 58,44 L56,34 Q58,22 66,14 Z" fill="#0070DD"/>
      <path d="M135,36 Q138,42 142,44 L144,34 Q142,22 134,14 Z" fill="#0070DD"/>
      <path d="M82,10 L78,26 L84,22 Z" fill="#4DB8FF" opacity="0.6"/>
      <path d="M118,10 L122,26 L116,22 Z" fill="#4DB8FF" opacity="0.6"/>
      <path d="M100,4 L98,18 L102,18 Z" fill="#80D0FF" opacity="0.4"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#14203E" stroke="#1E90FF" stroke-width="0.8"/>
      <path d="M86,115 L83,128 L89,124 L87,138 L93,130" stroke="#FFD700" stroke-width="1.2" fill="none"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#14203E" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#14203E" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.35">
      <path d="M150,90 L148,100 L153,96 L151,108" stroke="#FFD700" stroke-width="1" fill="none">
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/>
      </path>
    </g>`,
};

// ── Sakura ──────────────────────────────────────────────────────────
CHARACTER_SVGS.sakura = {
  skin: 'fair',
  eyes: () => prettyEyes('sweet', '#E75480'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M62,38 Q56,80 52,140 Q50,180 52,220 Q53,240 56,250
              L66,246 Q62,210 60,160 Q58,110 62,70 Q64,52 68,42 Z" fill="#FFB7C5" opacity="0.7"/>
      <path d="M138,38 Q144,80 148,140 Q150,180 148,220 Q147,240 144,250
              L134,246 Q138,210 140,160 Q142,110 138,70 Q136,52 132,42 Z" fill="#FFB7C5" opacity="0.7"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M70,18 Q82,8 100,6 Q118,8 130,18
              Q134,26 132,38 Q120,28 100,26 Q80,28 68,38 Q66,26 70,18 Z" fill="#FFB7C5"/>
      <path d="M68,38 Q66,46 62,50 L60,40 Q63,28 70,18 Z" fill="#FF9EB5"/>
      <path d="M132,38 Q134,46 138,50 L140,40 Q137,28 130,18 Z" fill="#FF9EB5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,118 66,135 Q65,148 68,160 L78,165
              Q88,170 100,172 Q112,170 122,165 L132,160 Q135,148 134,135 Q132,118 128,108 Z"
            fill="#FFF0F3" stroke="#FFB7C5" stroke-width="0.8"/>
      <path d="M78,165 Q88,172 100,174 Q112,172 122,165
              L128,260 Q118,272 100,274 Q82,272 72,260 Z"
            fill="#FFE8EE" stroke="#FFB7C5" stroke-width="0.6"/>
      <path d="M72,108 Q100,100 128,108" fill="none" stroke="#FFB7C5" stroke-width="1.5"/>
      <text x="93" y="145" font-size="7" fill="#FFB7C5" opacity="0.5">✿</text>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.35">
      <text x="42" y="130" font-size="7" fill="#FFB7C5">✿</text>
      <text x="152" y="155" font-size="5" fill="#FFB7C5">✿</text>
    </g>`,
};

// ── Phoenix ─────────────────────────────────────────────────────────
CHARACTER_SVGS.phoenix = {
  skin: 'warm',
  eyes: () => prettyEyes('fierce', '#FF5030'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M58,32 Q54,50 52,72 Q51,85 54,98 L63,95 Q60,78 60,60 Q62,44 64,36 Z" fill="#FF4500" opacity="0.6"/>
      <path d="M142,32 Q146,50 148,72 Q149,85 146,98 L137,95 Q140,78 140,60 Q138,44 136,36 Z" fill="#FF4500" opacity="0.6"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M66,14 Q82,4 100,2 Q118,4 134,14
              Q138,24 135,36 Q122,26 100,23 Q78,26 65,36 Q62,24 66,14 Z" fill="#FF5030"/>
      <path d="M65,36 Q62,42 57,44 L55,34 Q58,22 66,14 Z" fill="#FF3000"/>
      <path d="M135,36 Q138,42 143,44 L145,34 Q142,22 134,14 Z" fill="#FF3000"/>
      <path d="M84,8 L80,24 L86,20 Z" fill="#FF7040" opacity="0.7"/>
      <path d="M116,8 L120,24 L114,20 Z" fill="#FF7040" opacity="0.7"/>
      <path d="M100,3 L98,16 L102,16 Z" fill="#FFD700" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
              Q82,210 85,230 L88,250 L112,250 L115,230
              Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
            fill="#2A1008" stroke="#FF5030" stroke-width="0.8"/>
      <path d="M78,108 Q100,103 122,108" fill="none" stroke="#FFD700" stroke-width="1.5"/>
      <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#2A1008" stroke-width="16" stroke-linecap="round"/>
      <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#2A1008" stroke-width="16" stroke-linecap="round"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.25">
      <path d="M42,125 Q32,100 38,72" fill="none" stroke="#FF5030" stroke-width="1.5"/>
      <path d="M158,125 Q168,100 162,72" fill="none" stroke="#FF5030" stroke-width="1.5"/>
    </g>`,
};

// ── Frost ───────────────────────────────────────────────────────────
CHARACTER_SVGS.frost = {
  skin: 'pale',
  eyes: () => prettyEyes('cool', '#70C8E8'),
  defaultHair: () => `
    <g class="char-hair-back">
      <path d="M62,36 Q56,60 54,90 Q53,108 56,120 L65,117 Q62,100 62,75 Q64,52 68,40 Z" fill="#B0E0E6" opacity="0.6"/>
      <path d="M138,36 Q144,60 146,90 Q147,108 144,120 L135,117 Q138,100 138,75 Q136,52 132,40 Z" fill="#B0E0E6" opacity="0.6"/>
    </g>`,
  defaultHairFront: () => `
    <g class="char-hair-front">
      <path d="M68,16 Q82,6 100,4 Q118,6 132,16
              Q136,26 134,38 Q122,28 100,26 Q78,28 66,38 Q64,26 68,16 Z" fill="#C8E8F0"/>
      <path d="M66,38 Q63,46 58,50 L56,38 Q60,24 68,16 Z" fill="#90D0E0"/>
      <path d="M134,38 Q137,46 142,50 L144,38 Q140,24 132,16 Z" fill="#90D0E0"/>
      <path d="M85,12 L82,26 L88,23 Z" fill="#E0F4F8" opacity="0.5"/>
    </g>`,
  defaultClothes: () => `
    <g class="char-clothes">
      <path d="M72,108 Q68,118 66,135 Q65,148 68,160 L78,165
              Q88,170 100,172 Q112,170 122,165 L132,160 Q135,148 134,135 Q132,118 128,108 Z"
            fill="#E8F4F8" stroke="#90D0E0" stroke-width="0.8"/>
      <path d="M78,165 Q88,172 100,174 Q112,172 122,165
              L128,260 Q118,272 100,274 Q82,272 72,260 Z"
            fill="#D8ECF2" stroke="#90D0E0" stroke-width="0.6"/>
      <path d="M72,108 Q100,100 128,108" fill="none" stroke="#90D0E0" stroke-width="1.5"/>
      <circle cx="100" cy="115" r="3" fill="#90D0E0" opacity="0.5"/>
      <path d="M92,148 L100,143 L108,148 L100,153 Z" fill="#B0E0E6" opacity="0.4"/>
    </g>`,
  defs: () => '',
  flair: () => `
    <g class="char-flair" opacity="0.3">
      <text x="46" y="152" font-size="7" fill="#90D0E0">❄</text>
      <text x="148" y="125" font-size="5" fill="#B0E0E6">❄</text>
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
    <path d="M72,108 Q68,118 66,135 Q65,150 68,162 Q72,178 78,192
            Q82,208 85,228 L88,250 L112,250 L115,228
            Q118,208 122,192 Q128,178 132,162 Q135,150 134,135 Q132,118 128,108 Z"
          fill="#4A4A5E" stroke="#8888AA" stroke-width="1.2"/>
    <path d="M72,108 Q100,100 128,108 L126,116 Q100,108 74,116 Z" fill="#5A5A6E" stroke="#8888AA" stroke-width="0.6"/>
    <rect x="92" y="108" width="16" height="14" rx="2" fill="#5A5A6E" stroke="#8888AA" stroke-width="0.6"/>
    <path d="M96,112 L100,118 L104,112" fill="#8888AA" opacity="0.5"/>
    <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#4A4A5E" stroke-width="16" stroke-linecap="round"/>
    <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#4A4A5E" stroke-width="16" stroke-linecap="round"/>
  </g>`;

CLOTHES_SVGS.outfit_stage = () => `
  <g class="char-clothes">
    <path d="M74,108 Q70,118 68,135 Q67,148 70,160 L78,166
            Q88,170 100,172 Q112,170 122,166 L130,160 Q133,148 132,135 Q130,118 126,108 Z"
          fill="#6A0DAD" stroke="#B040FF" stroke-width="0.8"/>
    <path d="M78,166 Q88,173 100,175 Q112,173 122,166
            L128,260 Q118,272 100,274 Q82,272 72,260 Z"
          fill="#5A0D9D" stroke="#B040FF" stroke-width="0.6"/>
    <path d="M74,108 Q100,100 126,108" fill="none" stroke="#FFD700" stroke-width="2"/>
    <circle cx="100" cy="112" r="3" fill="#FFD700"/>
    <text x="87" y="155" font-size="8" fill="#FFD700" opacity="0.5">★</text>
  </g>`;

CLOTHES_SVGS.outfit_casual = () => `
  <g class="char-clothes">
    <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
            Q82,210 85,230 L88,250 L112,250 L115,230
            Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
          fill="#3A7CA5" stroke="#2A6080" stroke-width="0.8"/>
    <path d="M78,108 Q100,103 122,108" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.4"/>
    <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#2A4A6A" stroke-width="16" stroke-linecap="round"/>
    <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#2A4A6A" stroke-width="16" stroke-linecap="round"/>
  </g>`;

CLOTHES_SVGS.outfit_school = () => `
  <g class="char-clothes">
    <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,178 78,186 L122,186
            Q128,178 132,168 Q135,155 134,140 Q132,120 128,108 Z"
          fill="white" stroke="#ddd" stroke-width="0.8"/>
    <path d="M78,186 Q88,192 100,194 Q112,192 122,186
            L126,300 L74,300 Z" fill="#1A1A3E" stroke="#333" stroke-width="0.6"/>
    <path d="M78,108 Q100,103 122,108" fill="none" stroke="#1A1A3E" stroke-width="2"/>
    <path d="M95,108 L100,135 L105,108" fill="#CC0000" opacity="0.7"/>
  </g>`;

CLOTHES_SVGS.outfit_royal = () => `
  <g class="char-clothes">
    <path d="M55,100 Q60,92 72,104 Q68,118 66,138 Q65,155 68,168 Q72,182 78,195
            Q82,210 85,230 L88,258 Q90,290 86,330 Q84,350 78,380
            L122,380 Q116,350 114,330 Q110,290 112,258 L115,230
            Q118,210 122,195 Q128,182 132,168 Q135,155 134,138 Q132,118 128,104
            Q140,92 145,100 Q148,88 138,80 Q120,72 100,70 Q80,72 62,80 Q52,88 55,100 Z"
          fill="#8B0000" stroke="#FFD700" stroke-width="1.2"/>
    <circle cx="100" cy="108" r="3" fill="#FFD700"/>
  </g>`;

CLOTHES_SVGS.outfit_ninja = () => `
  <g class="char-clothes">
    <path d="M72,108 Q68,120 66,140 Q65,155 68,168 Q72,182 78,195
            Q82,210 85,230 L88,250 L112,250 L115,230
            Q118,210 122,195 Q128,182 132,168 Q135,155 134,140 Q132,120 128,108 Z"
          fill="#1A1A1A" stroke="#333" stroke-width="0.8"/>
    <path d="M66,140 Q100,150 134,140" fill="none" stroke="#CC0000" stroke-width="2.5"/>
    <path d="M88,250 Q86,290 85,330 Q84,355 86,370" fill="none" stroke="#1A1A1A" stroke-width="16" stroke-linecap="round"/>
    <path d="M112,250 Q114,290 115,330 Q116,355 114,370" fill="none" stroke="#1A1A1A" stroke-width="16" stroke-linecap="round"/>
  </g>`;

CLOTHES_SVGS.outfit_sparkle = () => `
  <g class="char-clothes">
    <path d="M74,108 Q70,118 68,135 Q67,148 70,160 L78,166
            Q88,170 100,172 Q112,170 122,166 L130,160 Q133,148 132,135 Q130,118 126,108 Z"
          fill="#E8D0F0" stroke="#C8A0E0" stroke-width="0.8"/>
    <path d="M78,166 Q88,173 100,175 Q112,173 122,166
            L128,260 Q118,272 100,274 Q82,272 72,260 Z"
          fill="#D8C0E8" stroke="#C8A0E0" stroke-width="0.6"/>
    <text x="82" y="140" font-size="6" fill="#FFD700" opacity="0.6">✦</text>
    <text x="112" y="155" font-size="5" fill="#FFD700" opacity="0.5">✦</text>
    <text x="94" y="168" font-size="5" fill="#FFD700" opacity="0.4">✦</text>
  </g>`;

// ── Hair ─────────────────────────────────────────────────────────────
function makeHair(color1, color2) {
  return {
    back: () => `<g class="char-hair-back">
      <path d="M62,38 Q56,80 52,140 Q50,180 52,215 L64,211 Q60,170 58,130 Q56,80 62,50 Z" fill="${color1}" opacity="0.7"/>
      <path d="M138,38 Q144,80 148,140 Q150,180 148,215 L136,211 Q140,170 142,130 Q144,80 138,50 Z" fill="${color1}" opacity="0.7"/>
    </g>`,
    front: () => `<g class="char-hair-front">
      <path d="M70,18 Q82,8 100,6 Q118,8 130,18 Q134,26 132,38 Q120,28 100,26 Q80,28 68,38 Q66,26 70,18 Z" fill="${color1}"/>
      <path d="M68,38 Q66,46 62,50 L60,40 Q63,28 70,18 Z" fill="${color2}"/>
      <path d="M132,38 Q134,46 138,50 L140,40 Q137,28 130,18 Z" fill="${color2}"/>
    </g>`
  };
}

HAIR_SVGS.hair_pink = makeHair('#FF69B4', '#FF1493');
HAIR_SVGS.hair_blue = makeHair('#4169E1', '#2850C0');
HAIR_SVGS.hair_silver = makeHair('#C8C8DC', '#A0A0B8');
HAIR_SVGS.hair_long = makeHair('#5A4030', '#3A2818');
HAIR_SVGS.hair_ponytail = {
  back: () => `<g class="char-hair-back">
    <path d="M110,24 Q130,28 134,48 Q138,75 134,120 L126,117 Q130,75 126,48 Q122,32 108,28 Z" fill="#6A4030" opacity="0.75"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M70,18 Q82,8 100,6 Q118,8 130,18 Q133,26 130,36 Q120,27 100,25 Q80,27 70,36 Q67,26 70,18 Z" fill="#6A4030"/>
    <path d="M70,36 Q68,42 64,44 L62,36 Q64,26 70,18 Z" fill="#5A3020"/>
    <path d="M130,36 Q132,42 136,44 L138,36 Q136,26 130,18 Z" fill="#5A3020"/>
    <circle cx="118" cy="22" r="4" fill="#FF69B4" opacity="0.6"/>
  </g>`
};
HAIR_SVGS.hair_short = {
  back: () => `<g class="char-hair-back"></g>`,
  front: () => `<g class="char-hair-front">
    <path d="M68,16 Q82,8 100,6 Q118,8 132,16 Q135,24 132,33 Q120,25 100,23 Q80,25 68,33 Q65,24 68,16 Z" fill="#2A2A2A"/>
    <path d="M68,33 Q66,37 64,38 L62,32 Q64,24 68,16 Z" fill="#1A1A1A"/>
    <path d="M132,33 Q134,37 136,38 L138,32 Q136,24 132,16 Z" fill="#1A1A1A"/>
  </g>`
};

HAIR_SVGS.hair_rainbow = {
  back: () => `<g class="char-hair-back">
    <path d="M62,38 Q56,80 52,140 Q50,180 52,215 L64,211 Q60,170 58,130 Q56,80 62,50 Z" fill="url(#rainbow-hair-g)" opacity="0.7"/>
    <path d="M138,38 Q144,80 148,140 Q150,180 148,215 L136,211 Q140,170 142,130 Q144,80 138,50 Z" fill="url(#rainbow-hair-g)" opacity="0.7"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M70,18 Q82,8 100,6 Q118,8 130,18 Q134,26 132,38 Q120,28 100,26 Q80,28 68,38 Q66,26 70,18 Z" fill="url(#rainbow-hair-g)"/>
    <path d="M68,38 Q66,46 62,50 L60,40 Q63,28 70,18 Z" fill="#FF6B6B"/>
    <path d="M132,38 Q134,46 138,50 L140,40 Q137,28 130,18 Z" fill="#6BCB77"/>
  </g>`,
  defs: () => `<linearGradient id="rainbow-hair-g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF6B6B"/><stop offset="25%" stop-color="#FFD93D"/>
    <stop offset="50%" stop-color="#6BCB77"/><stop offset="75%" stop-color="#4D96FF"/>
    <stop offset="100%" stop-color="#9B59B6"/>
  </linearGradient>`
};

HAIR_SVGS.hair_galaxy = {
  back: () => `<g class="char-hair-back">
    <path d="M60,36 Q54,80 50,150 Q48,195 50,235 L62,231 Q58,185 56,140 Q54,80 60,50 Z" fill="url(#galaxy-hair-g)" opacity="0.75"/>
    <path d="M140,36 Q146,80 150,150 Q152,195 150,235 L138,231 Q142,185 144,140 Q146,80 140,50 Z" fill="url(#galaxy-hair-g)" opacity="0.75"/>
  </g>`,
  front: () => `<g class="char-hair-front">
    <path d="M68,16 Q82,6 100,4 Q118,6 132,16 Q136,26 134,38 Q122,28 100,26 Q78,28 66,38 Q64,26 68,16 Z" fill="url(#galaxy-hair-g)"/>
    <path d="M66,38 Q63,46 58,50 L56,38 Q60,24 68,16 Z" fill="#1A0A3E"/>
    <path d="M134,38 Q137,46 142,50 L144,38 Q140,24 132,16 Z" fill="#1A0A3E"/>
    <circle cx="78" cy="18" r="1" fill="white" opacity="0.6"/>
    <circle cx="120" cy="12" r="0.7" fill="white" opacity="0.5"/>
    <circle cx="108" cy="30" r="0.5" fill="white" opacity="0.4"/>
  </g>`,
  defs: () => `<linearGradient id="galaxy-hair-g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1A0A3E"/><stop offset="30%" stop-color="#4A1A8E"/>
    <stop offset="60%" stop-color="#8A2AAE"/><stop offset="100%" stop-color="#2A1A5E"/>
  </linearGradient>`
};

// ── Ears ─────────────────────────────────────────────────────────────
EARS_SVGS.ears_bunny = () => `<g class="char-ears">
  <ellipse cx="82" cy="5" rx="5.5" ry="20" fill="#FFB8C8" stroke="#E8A0B0" stroke-width="0.8" transform="rotate(-8,82,5)"/>
  <ellipse cx="82" cy="5" rx="3" ry="14" fill="#FFD0DC" transform="rotate(-8,82,5)"/>
  <ellipse cx="118" cy="5" rx="5.5" ry="20" fill="#FFB8C8" stroke="#E8A0B0" stroke-width="0.8" transform="rotate(8,118,5)"/>
  <ellipse cx="118" cy="5" rx="3" ry="14" fill="#FFD0DC" transform="rotate(8,118,5)"/>
</g>`;

EARS_SVGS.ears_cat = () => `<g class="char-ears">
  <polygon points="73,24 67,0 86,16" fill="#555" stroke="#444" stroke-width="0.8"/>
  <polygon points="75,20 70,4 83,16" fill="#FFB8B8" opacity="0.5"/>
  <polygon points="127,24 133,0 114,16" fill="#555" stroke="#444" stroke-width="0.8"/>
  <polygon points="125,20 130,4 117,16" fill="#FFB8B8" opacity="0.5"/>
</g>`;

EARS_SVGS.ears_fox = () => `<g class="char-ears">
  <polygon points="73,22 64,-2 87,14" fill="#FF8C00" stroke="#CC7000" stroke-width="0.8"/>
  <polygon points="75,18 68,2 84,14" fill="#FFD700" opacity="0.35"/>
  <polygon points="127,22 136,-2 113,14" fill="#FF8C00" stroke="#CC7000" stroke-width="0.8"/>
  <polygon points="125,18 132,2 116,14" fill="#FFD700" opacity="0.35"/>
</g>`;

EARS_SVGS.ears_bear = () => `<g class="char-ears">
  <circle cx="73" cy="20" r="9" fill="#8B6B4A" stroke="#6A5030" stroke-width="0.8"/>
  <circle cx="73" cy="20" r="4.5" fill="#A88060"/>
  <circle cx="127" cy="20" r="9" fill="#8B6B4A" stroke="#6A5030" stroke-width="0.8"/>
  <circle cx="127" cy="20" r="4.5" fill="#A88060"/>
</g>`;

EARS_SVGS.ears_wolf = () => `<g class="char-ears">
  <polygon points="72,24 62,-4 87,12" fill="#707070" stroke="#555" stroke-width="0.8"/>
  <polygon points="74,20 66,0 84,12" fill="#909090" opacity="0.4"/>
  <polygon points="128,24 138,-4 113,12" fill="#707070" stroke="#555" stroke-width="0.8"/>
  <polygon points="126,20 134,0 116,12" fill="#909090" opacity="0.4"/>
</g>`;

EARS_SVGS.ears_deer = () => `<g class="char-ears">
  <path d="M76,20 L72,4 L68,-10 M72,4 L62,0" fill="none" stroke="#8B6B4A" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M124,20 L128,4 L132,-10 M128,4 L138,0" fill="none" stroke="#8B6B4A" stroke-width="2.5" stroke-linecap="round"/>
</g>`;

EARS_SVGS.ears_panda = () => `<g class="char-ears">
  <circle cx="73" cy="20" r="10" fill="#1A1A1A"/>
  <circle cx="73" cy="20" r="4.5" fill="#2D2D2D"/>
  <circle cx="127" cy="20" r="10" fill="#1A1A1A"/>
  <circle cx="127" cy="20" r="4.5" fill="#2D2D2D"/>
</g>`;

EARS_SVGS.ears_tiger = () => `<g class="char-ears">
  <polygon points="73,22 64,-2 87,14" fill="#FF8C00" stroke="#CC6600" stroke-width="0.8"/>
  <line x1="71" y1="10" x2="78" y2="14" stroke="#1A1A1A" stroke-width="1.2"/>
  <polygon points="127,22 136,-2 113,14" fill="#FF8C00" stroke="#CC6600" stroke-width="0.8"/>
  <line x1="129" y1="10" x2="122" y2="14" stroke="#1A1A1A" stroke-width="1.2"/>
</g>`;

EARS_SVGS.ears_unicorn = () => `<g class="char-ears">
  <polygon points="100,-4 94,18 106,18" fill="url(#unicorn-horn-g)" stroke="#E0C0FF" stroke-width="0.6"/>
  <line x1="96" y1="12" x2="104" y2="12" stroke="#D0A0E0" stroke-width="0.5" opacity="0.6"/>
  <line x1="97" y1="6" x2="103" y2="6" stroke="#D0A0E0" stroke-width="0.5" opacity="0.6"/>
</g>`;

// ── Accessories ─────────────────────────────────────────────────────
ACCESSORY_SVGS.acc_sunglasses = () => `<g class="char-accessory">
  <rect x="75" y="49" width="18" height="11" rx="3" fill="#1A1A1A" opacity="0.85"/>
  <rect x="107" y="49" width="18" height="11" rx="3" fill="#1A1A1A" opacity="0.85"/>
  <line x1="93" y1="54" x2="107" y2="54" stroke="#1A1A1A" stroke-width="1.2"/>
  <line x1="75" y1="54" x2="70" y2="50" stroke="#1A1A1A" stroke-width="1.2"/>
  <line x1="125" y1="54" x2="130" y2="50" stroke="#1A1A1A" stroke-width="1.2"/>
</g>`;

ACCESSORY_SVGS.acc_headband = () => `<g class="char-accessory">
  <path d="M68,30 Q100,24 132,30" fill="none" stroke="#FFD700" stroke-width="2.5"/>
  <circle cx="100" cy="26" r="3.5" fill="#FFD700"/>
  <text x="97" y="29" font-size="5" fill="#FF6B9D">✦</text>
</g>`;

ACCESSORY_SVGS.acc_earrings = () => `<g class="char-accessory">
  <circle cx="70" cy="72" r="2.5" fill="#FFD700" stroke="#CCA800" stroke-width="0.5"/>
  <circle cx="130" cy="72" r="2.5" fill="#FFD700" stroke="#CCA800" stroke-width="0.5"/>
</g>`;

ACCESSORY_SVGS.acc_sword = () => `<g class="char-accessory">
  <rect x="154" y="130" width="3.5" height="65" rx="1" fill="#B8B8D0" stroke="#8888AA" stroke-width="0.6"/>
  <rect x="148" y="195" width="14" height="5" rx="2" fill="#8B6B4A"/>
  <rect x="152" y="200" width="6" height="15" rx="2" fill="#6A5030"/>
  <polygon points="155.75,130 153,125 158.5,125" fill="#D8D8E8"/>
</g>`;

ACCESSORY_SVGS.acc_staff = () => `<g class="char-accessory">
  <rect x="154" y="95" width="3.5" height="115" rx="1.5" fill="#7A5530"/>
  <circle cx="155.75" cy="90" r="7" fill="none" stroke="#9370DB" stroke-width="1.5"/>
  <circle cx="155.75" cy="90" r="3.5" fill="#9370DB" opacity="0.5">
    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
  </circle>
</g>`;

ACCESSORY_SVGS.acc_bow = () => `<g class="char-accessory">
  <path d="M156,95 Q146,145 156,195" fill="none" stroke="#8B6B4A" stroke-width="2.5"/>
  <line x1="156" y1="95" x2="156" y2="195" stroke="#C0C0C0" stroke-width="0.6"/>
</g>`;

ACCESSORY_SVGS.acc_daggers = () => `<g class="char-accessory">
  <rect x="36" y="200" width="2.5" height="25" rx="1" fill="#B8B8D0" transform="rotate(12,37,212)"/>
  <rect x="158" y="200" width="2.5" height="25" rx="1" fill="#B8B8D0" transform="rotate(-12,159,212)"/>
</g>`;

ACCESSORY_SVGS.acc_wings = () => `<g class="char-accessory" opacity="0.55">
  <path d="M55,125 Q28,105 18,72 Q24,90 32,102 Q22,80 20,52 Q28,76 36,94 Q30,70 34,42 Q40,72 44,100 L55,118 Z"
        fill="#E8E8FF" stroke="#C0C0E8" stroke-width="0.6"/>
  <path d="M145,125 Q172,105 182,72 Q176,90 168,102 Q178,80 180,52 Q172,76 164,94 Q170,70 166,42 Q160,72 156,100 L145,118 Z"
        fill="#E8E8FF" stroke="#C0C0E8" stroke-width="0.6"/>
</g>`;

ACCESSORY_SVGS.acc_crown = () => `<g class="char-accessory">
  <path d="M80,16 L77,2 L87,10 L93,-2 L100,10 L107,-2 L113,10 L123,2 L120,16 Z"
        fill="#FFD700" stroke="#CCA800" stroke-width="0.8"/>
  <circle cx="93" cy="12" r="1.8" fill="#FF4444"/>
  <circle cx="100" cy="8" r="1.8" fill="#4488FF"/>
  <circle cx="107" cy="12" r="1.8" fill="#44CC44"/>
</g>`;

ACCESSORY_SVGS.acc_necklace = () => `<g class="char-accessory">
  <path d="M82,86 Q90,94 100,96 Q110,94 118,86" fill="none" stroke="#FFD700" stroke-width="1.2"/>
  <circle cx="100" cy="98" r="3.5" fill="#50C878" stroke="#FFD700" stroke-width="0.8"/>
</g>`;

// ═══════════════════════════════════════════════════════════════════
// MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════════════════════════

function renderCharacterSVG(characterId, equippedItems = {}, options = {}) {
  const charDef = CHARACTER_SVGS[characterId];
  if (!charDef) return '<svg viewBox="0 0 200 400"><text x="70" y="200" fill="#888" font-size="14">?</text></svg>';

  const size = options.size || 'full';
  const anim = options.animation || 'idle';
  const skin = charDef.skin || 'fair';

  const hairDef = equippedItems.hair && HAIR_SVGS[equippedItems.hair] ? HAIR_SVGS[equippedItems.hair] : null;
  const clothesFn = equippedItems.clothes && CLOTHES_SVGS[equippedItems.clothes] ? CLOTHES_SVGS[equippedItems.clothes] : charDef.defaultClothes;
  const earsFn = equippedItems.ears && EARS_SVGS[equippedItems.ears] ? EARS_SVGS[equippedItems.ears] : null;
  const accessoryFn = equippedItems.accessory && ACCESSORY_SVGS[equippedItems.accessory] ? ACCESSORY_SVGS[equippedItems.accessory] : null;

  let defs = '';
  if (hairDef && hairDef.defs) defs += hairDef.defs();
  if (equippedItems.ears === 'ears_unicorn') defs += svgGradient('unicorn-horn-g', '#FFD700', '#E8C0FF');

  const hairBack = hairDef ? hairDef.back() : charDef.defaultHair();
  const hairFront = hairDef ? hairDef.front() : charDef.defaultHairFront();

  return `<svg viewBox="0 0 200 400" class="char-svg char-svg--${anim} char-svg--${size}"
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
}

function renderCharacterMini(characterId) {
  return renderCharacterSVG(characterId, {}, { size: 'mini', animation: 'idle' });
}
