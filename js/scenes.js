// Escenas pixel-art orixinais en SVG (160×120, proporción 4:3).

const R = (x, y, w, h, c, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${extra}/>`;

// Xerador pseudoaleatorio determinista (as escenas non cambian entre visitas).
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function svg(content, cls = "") {
  return `<svg class="scene-svg ${cls}" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">
  <defs>
    <pattern id="dither" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#000" opacity=".35"/><rect x="1" y="1" width="1" height="1" fill="#000" opacity=".35"/></pattern>
    <pattern id="ditherL" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#fff" opacity=".25"/><rect x="1" y="1" width="1" height="1" fill="#fff" opacity=".25"/></pattern>
  </defs>
  ${content}
</svg>`;
}

// Bandas de ceo con dithering entre cores
function sky(bands) {
  let out = "";
  bands.forEach(([y, h, c], i) => {
    out += R(0, y, 160, h, c);
    if (i > 0) out += R(0, y, 160, 2, bands[i - 1][2], 'opacity=".5"');
  });
  return out;
}

function stars(n, maxY, seed = 7) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * 160), y = Math.floor(r() * maxY);
    out += R(x, y, 1, 1, r() > 0.7 ? "#fff6c4" : "#c8d4ff", `class="star" style="animation-delay:${(r() * 3).toFixed(2)}s"`);
  }
  return out;
}

function moon(cx, cy, r, cls = "") {
  let out = `<g class="moon ${cls}">`;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y));
    out += R(cx - w, cy + y, w * 2, 1, "#f3ecc8");
  }
  out += R(cx - r * 0.4, cy - r * 0.3, r * 0.3, r * 0.3, "#d8cfa4");
  out += R(cx + r * 0.2, cy + r * 0.1, r * 0.4, r * 0.3, "#d8cfa4");
  out += R(cx - r * 0.1, cy + r * 0.5, r * 0.2, r * 0.2, "#d8cfa4");
  out += "</g>";
  return out;
}

function heart(x, y, c = "#ff6f91", s = 1) {
  const px = [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [4, 4], [3, 5]];
  return `<g class="heart">${px.map(([a, b]) => R(x + a * s, y + b * s, s, s, c)).join("")}</g>`;
}

// ---------------- ESCENAS ----------------

export function title() {
  return svg(`
    ${sky([[0, 40, "#0b0820"], [40, 30, "#1c1240"], [70, 30, "#3a1f5c"], [100, 20, "#5c2a6b"]])}
    ${stars(70, 100, 3)}
    ${R(0, 108, 160, 12, "#140c2a")}
    ${heart(76, 96, "#ff6f91", 1)}
  `, "title-scene");
}

export function tower() {
  let t = "";
  // Torre: corpo
  t += R(48, 30, 18, 58, "#cdb68a") + R(60, 30, 6, 58, "#a48f66");
  // franxas diagonais (rampa exterior)
  for (let i = 0; i < 6; i++) t += R(48, 34 + i * 9, 6, 2, "#a48f66") + R(54, 36 + i * 9, 6, 2, "#b8a276");
  // ventás
  [40, 52, 64, 76].forEach((y, i) => (t += R(i % 2 ? 58 : 52, y, 2, 3, "#3a2c1a")));
  // remate
  t += R(46, 26, 22, 4, "#e0cc9e") + R(46, 29, 22, 1, "#8c7752");
  t += R(52, 16, 10, 10, "#b8a276") + R(54, 18, 6, 6, "#ffe9a0", 'class="lantern"');
  t += R(53, 12, 8, 4, "#8c7752") + R(56, 9, 2, 3, "#8c7752");
  return svg(`
    ${sky([[0, 20, "#2b1b4a"], [20, 16, "#5a2d6b"], [36, 14, "#a8456b"], [50, 12, "#e2795a"], [62, 10, "#f6b35b"]])}
    ${stars(14, 22, 11)}
    ${R(112, 60, 18, 2, "#ffd27a")}${R(110, 62, 22, 4, "#ffc35a")}${R(108, 66, 26, 6, "#ffb347")}
    ${R(0, 72, 160, 48, "#1d3d6b")}
    ${R(104, 74, 34, 1, "#ffb347")}${R(110, 77, 22, 1, "#e2795a")}${R(114, 80, 14, 1, "#a8456b")}
    ${R(10, 92, 30, 1, "#3d6aa3")}${R(120, 100, 26, 1, "#3d6aa3")}${R(70, 110, 30, 1, "#3d6aa3")}
    ${R(0, 84, 110, 36, "#3b5a2a")}${R(0, 80, 90, 4, "#3b5a2a")}${R(0, 78, 70, 2, "#4c7036")}${R(90, 84, 30, 6, "#2f4a22")}
    ${R(0, 84, 110, 36, "url(#dither)")}
    ${R(70, 92, 50, 28, "#5e4a3a")}${R(100, 96, 30, 24, "#4a3a2e")}
    ${t}
    <g class="couple">
      ${R(86, 70, 3, 3, "#1a1026")}${R(85, 73, 5, 8, "#1a1026")}${R(85, 81, 2, 5, "#1a1026")}${R(88, 81, 2, 5, "#1a1026")}
      ${R(92, 69, 3, 4, "#1a1026")}${R(91, 73, 5, 7, "#1a1026")}${R(90, 79, 7, 3, "#1a1026")}${R(91, 82, 2, 4, "#1a1026")}${R(94, 82, 2, 4, "#1a1026")}
      ${R(90, 75, 2, 2, "#1a1026")}
    </g>
    ${heart(87, 60, "#ff6f91", 1)}
  `);
}

export function newYork() {
  const r = rng(42);
  let b = "";
  let x = 0;
  while (x < 160) {
    const w = 10 + Math.floor(r() * 14);
    const hgt = 30 + Math.floor(r() * 50);
    const col = r() > 0.5 ? "#1f2440" : "#272c4d";
    b += R(x, 96 - hgt, w, hgt, col);
    for (let wy = 96 - hgt + 3; wy < 92; wy += 4)
      for (let wx = x + 2; wx < x + w - 2; wx += 3)
        if (r() > 0.55) b += R(wx, wy, 1, 2, r() > 0.3 ? "#ffd86b" : "#9fd0ff");
    x += w;
  }
  // rañaceos con agulla
  b += R(70, 20, 14, 76, "#2e3459") + R(73, 12, 8, 8, "#2e3459") + R(76, 2, 2, 10, "#9aa1af");
  for (let wy = 24; wy < 92; wy += 4) b += R(72, wy, 1, 2, "#ffd86b") + R(76, wy, 1, 2, "#ffd86b") + R(80, wy, 1, 2, "#ffd86b");
  return svg(`
    ${sky([[0, 30, "#070a22"], [30, 30, "#121845"], [60, 40, "#262a63"]])}
    ${stars(30, 40, 5)}
    ${moon(140, 14, 6)}
    <g class="skyline">${b}</g>
    ${R(0, 96, 160, 24, "#2a2a33")}${R(0, 96, 160, 2, "#4a4a55")}
    ${[8, 40, 72, 104, 136].map((sx) => R(sx, 108, 14, 2, "#e8d36a")).join("")}
    <g class="suitcase">
      ${R(16, 84, 22, 18, "#8e3b2e")}${R(16, 84, 22, 2, "#b5523f")}${R(23, 80, 8, 2, "#3a1a12")}${R(23, 80, 2, 4, "#3a1a12")}${R(29, 80, 2, 4, "#3a1a12")}
      ${R(26, 84, 2, 18, "#6a2b20")}${R(18, 102, 3, 2, "#111")}${R(33, 102, 3, 2, "#111")}
      ${R(30, 88, 6, 4, "#f2e6c8")}
    </g>
    <g class="taxi">
      ${R(92, 88, 46, 10, "#f4c430")}${R(100, 80, 28, 8, "#f4c430")}${R(103, 82, 10, 6, "#9fd0ff")}${R(115, 82, 10, 6, "#9fd0ff")}
      ${R(108, 77, 12, 3, "#222")}${R(110, 78, 8, 1, "#f4c430")}
      ${R(92, 92, 46, 2, "#222")}${R(94, 98, 8, 6, "#111")}${R(126, 98, 8, 6, "#111")}${R(96, 100, 4, 2, "#777")}${R(128, 100, 4, 2, "#777")}
      ${R(136, 89, 2, 3, "#ffefa0")}${R(92, 89, 2, 3, "#ff5040")}
    </g>
  `);
}

export function maldives() {
  let palm = "";
  [[22, 100], [23, 92], [24, 84], [26, 76], [28, 68], [30, 60]].forEach(([x, y]) => (palm += R(x, y - 8, 4, 9, "#6b4a2e") + R(x + 3, y - 8, 1, 9, "#4a321e")));
  const leaves = [[14, 48, 18, 3], [8, 51, 10, 3], [30, 48, 18, 3], [44, 51, 8, 3], [20, 44, 22, 4], [24, 40, 8, 4], [10, 54, 4, 4], [48, 54, 4, 4]];
  leaves.forEach(([x, y, w, h]) => (palm += R(x, y, w, h, "#1f5a3a") + R(x, y, w, 1, "#2f7a4f")));
  palm += R(29, 72, 6, 5, "#3a2a18") + R(30, 73, 4, 3, "#ff6f91");
  return svg(`
    ${sky([[0, 30, "#050a1e"], [30, 25, "#0c1a40"], [55, 15, "#1a2a5a"]])}
    ${stars(50, 60, 19)}
    ${moon(118, 26, 12, "big")}
    ${R(0, 70, 160, 30, "#0f2c55")}
    ${R(0, 70, 160, 30, "url(#dither)")}
    <g class="reflection">${[74, 78, 82, 86, 90, 94].map((y, i) => R(112 - i, y, 12 + i * 2, 1, "#f3ecc8", `opacity="${(0.8 - i * 0.1).toFixed(2)}"`)).join("")}</g>
    <g class="bungalow">
      ${R(70, 62, 4, 14, "#3a2a18")}${R(98, 62, 4, 14, "#3a2a18")}${R(84, 62, 4, 14, "#3a2a18")}
      ${R(66, 60, 40, 3, "#6b4a2e")}${R(70, 50, 32, 10, "#8a6a44")}${R(80, 53, 6, 7, "#ffd86b")}${R(90, 53, 6, 4, "#ffd86b")}
      ${R(66, 46, 40, 4, "#c8a35a")}${R(70, 42, 32, 4, "#b08a48")}${R(76, 38, 20, 4, "#9a7a3a")}${R(82, 35, 8, 3, "#8a6a34")}
    </g>
    ${R(0, 96, 160, 24, "#8f7d55")}${R(0, 96, 160, 2, "#a8946a")}${R(0, 96, 160, 24, "url(#dither)")}
    <g class="palm">${palm}</g>
    <g class="bottle">${R(58, 104, 10, 4, "#2f7a4f")}${R(68, 105, 3, 2, "#2f7a4f")}${R(71, 105, 1, 2, "#8a6a44")}${R(60, 105, 5, 2, "#f2e6c8")}</g>
  `);
}

// Pazo de Mondoi: cerimonia ao aire libre, no campo, nun día de verán.
export function pazo() {
  // Pazo de granito ao fondo
  let p = "";
  p += R(96, 36, 58, 30, "#cdbf9f") + R(96, 36, 58, 2, "#e2d6ba") + R(150, 36, 4, 30, "#a89a7c");
  p += R(94, 30, 62, 6, "#a4472f") + R(96, 28, 58, 2, "#8a3a26");
  p += R(104, 20, 16, 16, "#cdbf9f") + R(102, 16, 20, 4, "#a4472f") + R(116, 20, 4, 16, "#a89a7c");
  p += R(110, 24, 4, 6, "#3a2c1a");
  [100, 124, 134, 144].forEach((x) => (p += R(x, 42, 5, 7, "#3a2c1a") + R(x, 42, 5, 1, "#e2d6ba")));
  [100, 144].forEach((x) => (p += R(x, 54, 5, 8, "#3a2c1a")));
  p += R(122, 52, 10, 14, "#5e4532") + R(126, 52, 2, 14, "#3a2c1a");
  p += R(110, 50, 6, 6, "#a89a7c") + R(112, 51, 2, 3, "#d9a521");
  p += R(98, 28, 3, 2, "#cdbf9f") + R(149, 28, 3, 2, "#cdbf9f");
  // Árbores
  let t = "";
  [[2, 34, 22], [16, 40, 18], [140, 44, 20]].forEach(([x, y, w]) => {
    t += R(x + w / 2 - 2, y + w - 4, 4, 14, "#5e4532");
    t += R(x, y + 4, w, w - 6, "#2f6b3a") + R(x + 3, y, w - 6, 4, "#2f6b3a") + R(x + 2, y + 4, w - 8, 3, "#3f8a4a");
  });
  // Arco floral
  let a = "";
  a += R(56, 30, 4, 62, "#8c6a44") + R(100, 30, 4, 62, "#8c6a44");
  a += R(60, 22, 40, 4, "#8c6a44") + R(58, 26, 4, 4, "#8c6a44") + R(98, 26, 4, 4, "#8c6a44");
  const flowers = [[54, 36], [58, 46], [54, 58], [58, 70], [98, 40], [102, 52], [98, 64], [102, 76], [62, 20], [70, 18], [78, 18], [86, 18], [94, 20], [58, 26], [100, 26]];
  flowers.forEach(([x, y], i) => (a += R(x, y, 4, 4, i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#ff9fb6" : "#ffd86b") + R(x + 4, y + 1, 2, 2, "#3f8a4a")));
  // Cadeiras a ambos lados do corredor
  let c = "";
  [[96, 0], [104, 1], [112, 2]].forEach(([y, i]) => {
    for (let k = 0; k < 4; k++) {
      const off = i * 2;
      c += R(14 + k * 10 - off, y, 7, 2, "#f2ede0") + R(14 + k * 10 - off, y - 5, 2, 5, "#f2ede0");
      c += R(110 + k * 10 + off, y, 7, 2, "#f2ede0") + R(115 + k * 10 + off, y - 5, 2, 5, "#f2ede0");
    }
  });
  return svg(`
    ${sky([[0, 24, "#6fb8f0"], [24, 20, "#8fcaf5"], [44, 24, "#bfe3fa"]])}
    ${R(18, 10, 22, 4, "#ffffff", 'class="cloud"')}${R(22, 7, 12, 3, "#ffffff", 'class="cloud"')}
    ${R(118, 6, 26, 4, "#ffffff", 'class="cloud"')}${R(124, 3, 14, 3, "#ffffff", 'class="cloud"')}
    ${R(0, 56, 160, 12, "#5f8f4a")}${R(0, 54, 60, 4, "#5f8f4a")}${R(110, 52, 50, 6, "#5f8f4a")}
    ${t}
    ${p}
    ${R(0, 66, 160, 54, "#6fae4f")}${R(0, 66, 160, 54, "url(#dither)")}
    ${[74, 84, 100, 114].map((y) => R(0, y, 160, 1, "#82c25e")).join("")}
    ${R(70, 66, 20, 54, "#c9b48a")}${R(66, 100, 28, 20, "#c9b48a")}${R(70, 66, 20, 54, "url(#ditherL)")}
    ${a}
    ${c}
  `);
}

export function hotel() {
  return svg(`
    ${R(0, 0, 160, 86, "#c9a77c")}${R(0, 0, 160, 86, "url(#dither)")}
    ${R(0, 84, 160, 36, "#6b4a2e")}${R(0, 84, 160, 2, "#4a321e")}
    ${[96, 104, 112].map((y) => R(0, y, 160, 1, "#5a3e26")).join("")}
    <g class="window">
      ${R(104, 14, 44, 38, "#f2e6c8")}${R(107, 17, 38, 32, "#7ec8ff")}
      ${R(107, 38, 38, 11, "#1d5a8f")}
      ${R(118, 30, 16, 8, "#6b5a4a")}${R(122, 26, 8, 4, "#6b5a4a")}${R(124, 24, 4, 2, "#ffffff")}${R(112, 34, 6, 4, "#6b5a4a")}${R(134, 34, 8, 4, "#6b5a4a")}
      ${R(126, 17, 2, 32, "#f2e6c8")}${R(107, 32, 38, 2, "#f2e6c8")}
      ${R(98, 12, 6, 44, "#8e3b2e")}${R(148, 12, 6, 44, "#8e3b2e")}
    </g>
    <g class="lamp">${R(90, 66, 12, 18, "#5a3e26")}${R(94, 56, 4, 10, "#333")}${R(90, 48, 12, 8, "#ffe9a0")}</g>
    <g class="bed">
      ${R(10, 48, 72, 20, "#5a3e26")}${R(10, 48, 72, 3, "#7a5a3a")}
      ${R(12, 64, 76, 24, "#f4f1ea")}${R(12, 64, 76, 2, "#ffffff")}${R(12, 86, 76, 4, "#d8d2c4")}
      ${R(16, 58, 20, 8, "#ffffff")}${R(52, 58, 20, 8, "#ffffff")}
      ${R(12, 72, 76, 2, "#8bb4d8")}
      ${R(58, 78, 4, 3, "#9c5a3a", 'class="stain"')}${R(61, 80, 2, 2, "#9c5a3a", 'class="stain"')}
      ${R(10, 88, 4, 8, "#3a2a18")}${R(84, 88, 4, 8, "#3a2a18")}
    </g>
  `);
}

export function fullMoon() {
  return svg(`
    ${sky([[0, 40, "#04081a"], [40, 40, "#0b1438"], [80, 40, "#15214f"]])}
    ${stars(60, 90, 23)}
    ${moon(80, 48, 30, "giant")}
    ${R(20, 40, 30, 3, "#2a3566", 'class="cloud"')}${R(24, 37, 18, 3, "#2a3566", 'class="cloud"')}
    ${R(110, 64, 34, 3, "#2a3566", 'class="cloud"')}${R(116, 61, 18, 3, "#2a3566", 'class="cloud"')}
    ${R(0, 98, 160, 22, "#070a18")}
    ${R(6, 88, 22, 10, "#070a18")}${R(10, 84, 6, 4, "#070a18")}${R(40, 92, 30, 6, "#070a18")}${R(96, 86, 24, 12, "#070a18")}${R(130, 90, 26, 8, "#070a18")}
    ${R(100, 90, 2, 2, "#ffd86b")}${R(108, 90, 2, 2, "#ffd86b")}${R(14, 92, 2, 2, "#ffd86b")}
  `);
}

export function archive() {
  let cab = "";
  [8, 56, 104].forEach((x, ci) => {
    cab += R(x, 20, 46, 80, "#6b5a46") + R(x, 20, 46, 2, "#8c7a62") + R(x + 44, 20, 2, 80, "#4a3e30");
    [26, 50, 74].forEach((y) => (cab += R(x + 4, y, 38, 20, "#857158") + R(x + 18, y + 8, 10, 3, "#d9a521") + R(x + 14, y + 3, 18, 3, "#f2e6c8")));
  });
  return svg(`
    ${R(0, 0, 160, 120, "#2b2620")}${R(0, 0, 160, 120, "url(#dither)")}
    ${R(0, 100, 160, 20, "#1c1813")}
    ${cab}
    ${R(76, 4, 8, 8, "#ffe9a0", 'class="lantern"')}${R(79, 0, 2, 4, "#333")}
  `);
}

export function vault() {
  return svg(`
    ${R(0, 0, 160, 120, "#1d1f26")}
    ${[0, 16, 32, 48, 64, 80].map((y) => R(0, y, 160, 1, "#2a2d36")).join("")}
    ${[0, 20, 40, 60, 80, 100, 120, 140].map((x) => R(x, 0, 1, 96, "#2a2d36")).join("")}
    ${R(0, 96, 160, 24, "#121318")}${R(0, 96, 160, 2, "#3b3f4a")}
    ${R(20, 10, 6, 6, "#ffe9a0", 'class="lantern"')}${R(134, 10, 6, 6, "#ffe9a0", 'class="lantern"')}
  `);
}

// Gonzalo e Tania en pixel-art (inspirados nunha foto súa: non son retratos).
// Gonzalo: pelo rizado, barba, lentes de sol redondas e camisa de raias.
const GONZALO_MAP = [
  "....hhhhhh....",
  "..hhhHhhHhhh..",
  ".hhHhhhhhhHhh.",
  ".hhhssssssshh.",
  "hhhggggsgggghh",
  "hhhglggsglgghh",
  ".hhssssSssshh.",
  ".hhbsssssssbh.",
  ".hhbbmmmmmbbh.",
  "..hbbbbbbbbbh.",
  "...bbbbbbbb...",
  "....ssssss....",
  "..wkwkwkwkwk..",
  ".kwkwkwkwkwkw.",
  "awkwkwkwkwkwka",
  "akwkwkwkwkwkwa",
  "awkwkwkwkwkwka",
  ".kwkwkwkwkwkw.",
  "..pppppppppp..",
  "..pppp..pppp..",
  "..pppp..pppp..",
  "..pppp..pppp..",
  ".KKKKK..KKKKK."
];
const GONZALO_COLORS = { h: "#2a1a10", H: "#4a3020", s: "#e8b48f", S: "#c99070", g: "#111111", l: "#5a5f6a", b: "#2a1a10", m: "#f2ede0", w: "#efeae0", k: "#1a1a1a", a: "#e8b48f", p: "#2b2e3a", K: "#111111" };

// Tania: sombreiro de palla, pelo longo castaño, lentes ovaladas e top negro.
const TANIA_MAP = [
  "...tttttttt...",
  "..tTtTtTtTtt..",
  ".tttttttttttt.",
  ".TTTTTTTTTTTT.",
  "..rrssssssrr..",
  "..rglgsglgrr..",
  "..rssssssssr..",
  "..rsssmmsssr..",
  ".rrrsssssssrr.",
  ".rrr..ss..rrr.",
  ".rrkkkkkkkkrr.",
  ".rakkkkkkkkar.",
  ".rakkkkkkkkar.",
  "..akkkkkkkka..",
  "...kkkkkkkk...",
  "...pppppppp...",
  "...ppp..ppp...",
  "...ppp..ppp...",
  "...ppp..ppp...",
  "..KKKK..KKKK.."
];
const TANIA_COLORS = { t: "#d2ad72", T: "#a8834a", r: "#5a3a24", s: "#f0c4a0", g: "#3a3030", l: "#7a6a62", m: "#b5525a", k: "#161616", a: "#f0c4a0", p: "#2b3a5a", K: "#3a2a20" };

function spritePixels(map, colors, dx = 0, dy = 0) {
  let px = "";
  map.forEach((row, y) =>
    row.split("").forEach((ch, x) => {
      if (ch !== ".") px += R(x + dx, y + dy, 1, 1, colors[ch]);
    })
  );
  return px;
}

export function gonzaloSprite() {
  return `<svg class="npc-svg" viewBox="0 0 14 23" shape-rendering="crispEdges" role="img" aria-label="Gonzalo, en versión pixel-art">${spritePixels(GONZALO_MAP, GONZALO_COLORS)}</svg>`;
}

export function taniaSprite() {
  return `<svg class="npc-svg" viewBox="0 0 14 20" shape-rendering="crispEdges" role="img" aria-label="Tania, en versión pixel-art">${spritePixels(TANIA_MAP, TANIA_COLORS)}</svg>`;
}

// Os dous xuntos (Tania á esquerda, Gonzalo á dereita, coma na foto).
export function coupleSprite() {
  return `<svg class="npc-svg couple-svg" viewBox="0 0 28 23" shape-rendering="crispEdges" role="img" aria-label="Tania e Gonzalo, en versión pixel-art">${spritePixels(TANIA_MAP, TANIA_COLORS, 0, 3)}${spritePixels(GONZALO_MAP, GONZALO_COLORS, 13, 0)}</svg>`;
}

export function npcRoom() {
  return svg(`
    ${sky([[0, 50, "#140c2a"], [50, 50, "#24164a"]])}
    ${stars(30, 60, 31)}
    ${R(0, 96, 160, 24, "#3a2a4a")}${R(0, 96, 160, 2, "#5c4a7a")}
    ${R(16, 30, 20, 26, "#5c4a7a")}${R(18, 32, 16, 22, "#ffd86b", 'class="lantern"')}
    ${R(124, 30, 20, 26, "#5c4a7a")}${R(126, 32, 16, 22, "#9fd0ff", 'class="lantern"')}
  `);
}

// Salón con sofá e televisor de concurso (capítulo Friends)
export function livingRoom() {
  let bricks = "";
  for (let y = 0; y < 70; y += 6) for (let x = (y / 6) % 2 ? -6 : 0; x < 160; x += 12) bricks += R(x, y, 11, 5, "#a8563f");
  return svg(`
    ${R(0, 0, 160, 72, "#8e4634")}${bricks}${R(0, 0, 160, 72, "url(#dither)")}
    ${R(96, 8, 54, 34, "#3a2a18")}${R(98, 10, 50, 30, "#9fd0ff")}${R(98, 28, 50, 12, "#6b7f99")}${R(122, 10, 2, 30, "#3a2a18")}${R(98, 24, 50, 2, "#3a2a18")}
    ${R(0, 72, 160, 48, "#6b4a2e")}${[80, 90, 102, 114].map((y) => R(0, y, 160, 1, "#5a3e26")).join("")}
    <g class="tv">
      ${R(8, 30, 52, 40, "#2b2e36")}${R(8, 30, 52, 2, "#4a4f5b")}${R(12, 34, 44, 30, "#0b1a33")}
      ${R(16, 70, 6, 6, "#2b2e36")}${R(46, 70, 6, 6, "#2b2e36")}${R(50, 64, 3, 3, "#c94a4a")}${R(44, 64, 3, 3, "#7ad1a8")}
    </g>
    <g class="couch">
      ${R(70, 60, 76, 14, "#d9772b")}${R(70, 60, 76, 2, "#f0954a")}${R(66, 66, 8, 24, "#c4661f")}${R(142, 66, 8, 24, "#c4661f")}
      ${R(72, 74, 72, 12, "#e5853a")}${R(72, 74, 72, 2, "#f6a25e")}${R(96, 74, 1, 12, "#c4661f")}${R(120, 74, 1, 12, "#c4661f")}
      ${R(70, 86, 76, 4, "#a8551a")}${R(72, 90, 4, 4, "#3a2a18")}${R(140, 90, 4, 4, "#3a2a18")}
    </g>
    <g class="table">${R(78, 96, 56, 4, "#5e4532")}${R(82, 100, 4, 10, "#5e4532")}${R(126, 100, 4, 10, "#5e4532")}
      ${R(90, 90, 6, 6, "#f2ede0")}${R(96, 92, 2, 2, "#f2ede0")}${R(110, 90, 6, 6, "#f2ede0")}${R(116, 92, 2, 2, "#f2ede0")}${R(91, 89, 4, 1, "#5e3a1a")}${R(111, 89, 4, 1, "#5e3a1a")}</g>
  `, "living-scene");
}

// O xuízo das lentellas
export function court() {
  return svg(`
    ${R(0, 0, 160, 120, "#5e4532")}
    ${[0, 20, 40, 60, 80, 100, 120, 140].map((x) => R(x, 0, 1, 84, "#4a3626")).join("")}
    ${R(0, 84, 160, 36, "#3a2a18")}${R(0, 84, 160, 2, "#7a5a3a")}
    ${R(60, 6, 40, 14, "#d9a521")}${R(64, 9, 32, 8, "#b8860b")}${R(78, 2, 4, 4, "#d9a521")}
    <g class="bench">${R(40, 40, 80, 30, "#7a5a3a")}${R(40, 40, 80, 3, "#9c7a52")}${R(44, 46, 72, 20, "#6b4a2e")}
      ${R(98, 34, 14, 4, "#3a2a18")}${R(103, 30, 4, 4, "#3a2a18")}</g>
    <g class="witness">${R(124, 56, 30, 28, "#7a5a3a")}${R(124, 56, 30, 2, "#9c7a52")}
      ${R(134, 42, 8, 8, "#f0c39b")}${R(133, 40, 10, 3, "#3b2414")}${R(132, 50, 12, 8, "#2d6fb3")}${R(135, 45, 1, 1, "#111")}${R(139, 45, 1, 1, "#111")}</g>
    <g class="accused">
      ${R(10, 76, 30, 4, "#3a2a18")}${R(12, 80, 4, 12, "#3a2a18")}${R(34, 80, 4, 12, "#3a2a18")}
      ${R(12, 62, 26, 14, "#8a8f9a")}${R(10, 60, 30, 3, "#a9aeb8")}${R(6, 64, 6, 2, "#8a8f9a")}${R(38, 64, 6, 2, "#8a8f9a")}
      ${R(14, 58, 22, 3, "#8a5a2a")}${R(16, 57, 2, 1, "#6b3a1a")}${R(22, 57, 2, 1, "#6b3a1a")}${R(28, 57, 2, 1, "#6b3a1a")}${R(20, 56, 3, 1, "#c94a4a")}
      ${R(18, 66, 3, 3, "#ffffff")}${R(29, 66, 3, 3, "#ffffff")}${R(19, 67, 2, 2, "#111", 'class="eye"')}${R(30, 67, 2, 2, "#111", 'class="eye"')}${R(22, 72, 6, 1, "#3a3f4a")}
    </g>
    <g class="gymbag">${R(56, 92, 26, 12, "#2b2e36")}${R(56, 92, 26, 2, "#4a4f5b")}${R(64, 88, 10, 4, "none")}${R(63, 88, 2, 4, "#111")}${R(73, 88, 2, 4, "#111")}${R(63, 87, 12, 2, "#111")}${R(66, 97, 6, 3, "#7ad1a8")}</g>
    <g class="towel">${R(100, 104, 34, 4, "#7fc4ea", 'opacity=".7"')}${R(96, 106, 42, 3, "#7fc4ea", 'opacity=".5"')}${R(104, 96, 14, 8, "#f2ede0")}${R(104, 99, 14, 1, "#c94a4a")}</g>
  `, "court-scene");
}

// O Coliseum da Coruña, noite de partido
export function coliseum() {
  const r = rng(77);
  let crowd = "";
  for (let y = 22; y < 62; y += 4)
    for (let x = 2; x < 158; x += 4) {
      const c = ["#d9d9e8", "#2d6fb3", "#f2e6c8", "#5a6a9a", "#ffd86b", "#c94a4a"][Math.floor(r() * 6)];
      if (r() > 0.15) crowd += R(x, y, 2, 2, c);
    }
  let lights = "";
  [16, 48, 112, 144].forEach((x) => (lights += R(x, 2, 10, 4, "#fff6c4", 'class="lantern"') + R(x + 4, 6, 2, 4, "#555")));
  return svg(`
    ${R(0, 0, 160, 120, "#14162a")}
    ${lights}
    ${R(0, 18, 160, 46, "#1f2440")}${crowd}
    ${R(0, 62, 160, 4, "#2d6fb3")}${R(20, 62, 30, 4, "#f2e6c8")}${R(110, 62, 30, 4, "#f2e6c8")}
    ${R(0, 66, 160, 54, "#c98b4a")}${R(0, 66, 160, 54, "url(#ditherL)")}
    ${[74, 86, 100].map((y) => R(0, y, 160, 1, "#b0773d")).join("")}
    ${R(0, 92, 160, 1, "#ffffff")}${R(78, 66, 2, 54, "#ffffff")}
    ${R(104, 72, 56, 1, "#ffffff")}${R(104, 72, 1, 30, "#ffffff")}${R(104, 101, 56, 1, "#ffffff")}${R(104, 80, 56, 14, "#2d6fb3", 'opacity=".55"')}
    <g class="hoop">
      ${R(148, 30, 4, 50, "#9aa1af")}${R(136, 32, 16, 2, "#9aa1af")}
      ${R(130, 22, 4, 26, "#ffffff")}${R(129, 30, 1, 10, "#c94a4a")}
      ${R(118, 40, 12, 2, "#ff6a1f")}${R(119, 42, 1, 6, "#f2f2f2")}${R(122, 42, 1, 7, "#f2f2f2")}${R(125, 42, 1, 7, "#f2f2f2")}${R(128, 42, 1, 6, "#f2f2f2")}${R(120, 47, 8, 1, "#f2f2f2")}
    </g>
    <g class="scoreboard-mini">${R(62, 4, 36, 12, "#000")}${R(64, 6, 32, 8, "#101a10")}${R(66, 8, 4, 4, "#7ad1a8")}${R(72, 8, 4, 4, "#7ad1a8")}${R(84, 8, 4, 4, "#ffd86b")}${R(90, 8, 4, 4, "#ffd86b")}</g>
    <g class="ball">${R(40, 82, 6, 6, "#e36a1f")}${R(42, 82, 2, 6, "#5a2a0a")}${R(40, 84, 6, 2, "#5a2a0a", 'opacity=".6"')}</g>
  `, "coliseum-scene");
}

// Aldán, Rías Baixas
export function aldan() {
  return svg(`
    ${sky([[0, 22, "#78c2f0"], [22, 18, "#9fd4f5"], [40, 12, "#cbe9fb"]])}
    ${R(20, 10, 20, 3, "#ffffff", 'class="cloud"')}${R(110, 14, 24, 3, "#ffffff", 'class="cloud"')}
    ${R(0, 44, 160, 8, "#4e7a4a")}${R(30, 40, 60, 6, "#4e7a4a")}${R(100, 42, 40, 4, "#5f8f5a")}
    ${R(0, 52, 160, 30, "#2f7fb0")}${R(0, 52, 160, 30, "url(#dither)")}
    ${[56, 62, 70, 76].map((y, i) => R(10 + i * 30, y, 18, 1, "#7fc4ea")).join("")}
    <g class="boats">
      ${R(30, 62, 14, 3, "#f2ede0")}${R(32, 65, 10, 2, "#c94a4a")}${R(36, 56, 1, 6, "#5e4532")}
      ${R(70, 70, 12, 3, "#2d6fb3")}${R(72, 73, 8, 2, "#f2ede0")}
    </g>
    ${R(0, 82, 160, 38, "#e3cf98")}${R(0, 82, 160, 2, "#f2e6c8")}${R(0, 82, 160, 38, "url(#dither)")}
    <g class="house-aldan">
      ${R(6, 58, 40, 30, "#f4f1ea")}${R(4, 54, 44, 4, "#a4472f")}${R(10, 50, 32, 4, "#a4472f")}
      ${R(12, 64, 8, 8, "#5e8fb8")}${R(32, 64, 8, 8, "#5e8fb8")}${R(22, 74, 8, 14, "#7a5a3a")}
      ${R(2, 56, 2, 34, "#d9a521")}${R(48, 56, 2, 34, "#d9a521")}${R(2, 66, 48, 1, "#d9a521")}${R(2, 78, 48, 1, "#d9a521")}
    </g>
    <g class="restaurant">
      ${R(104, 60, 52, 28, "#f4f1ea")}${R(102, 56, 56, 4, "#5e4532")}
      ${R(110, 68, 10, 10, "#ffd86b")}${R(140, 68, 10, 10, "#ffd86b")}${R(124, 70, 10, 18, "#2d6fb3")}
      ${R(108, 48, 44, 8, "#5e4532")}${R(110, 50, 40, 4, "#3a2a18")}
      ${R(112, 90, 10, 3, "#5e4532", 'class="fallen-sign"')}${R(126, 92, 14, 3, "#5e4532", 'class="fallen-sign"')}
    </g>
  `, "aldan-scene");
}

export { heart };
