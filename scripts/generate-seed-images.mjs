/**
 * Generates deterministic, offline SVG product/category/banner artwork for the demo seed.
 *
 *   node scripts/generate-seed-images.mjs          -> writes into public/seed
 *   node scripts/generate-seed-images.mjs <outDir> -> writes into <outDir>
 *
 * Paths are referenced by seed.ts, so slugs here must match the seed data.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ---------------------------------------------------------------------------
// Catalogue of assets. `kind` selects the illustration; `color` is the primary
// fill; `alt` is the fill used in the second (alternate view) image.
// ---------------------------------------------------------------------------
export const products = [
  { slug: "classic-tee", name: "Classic Cotton Tee", kind: "tee", color: "#1f2937", alt: "#f8fafc", hue: 210 },
  { slug: "slim-fit-shirt", name: "Slim Fit Shirt", kind: "shirt", color: "#3b82f6", alt: "#1d4ed8", hue: 215 },
  { slug: "linen-panjabi", name: "Linen Panjabi", kind: "panjabi", color: "#f3e5c3", alt: "#e9d4a3", hue: 40 },
  { slug: "denim-jacket", name: "Denim Jacket", kind: "jacket", color: "#3b4a8c", alt: "#2b3566", hue: 225 },
  { slug: "floral-kurti", name: "Floral Kurti", kind: "kurti", color: "#ec7aa8", alt: "#d9588d", hue: 335 },
  { slug: "cotton-saree", name: "Cotton Saree", kind: "saree", color: "#2f9e62", alt: "#237a4b", hue: 150 },
  { slug: "kids-cotton-tee", name: "Kids Cotton Tee", kind: "tee", color: "#e23b3b", alt: "#f87171", hue: 0 },
  { slug: "kids-denim-shorts", name: "Kids Denim Shorts", kind: "shorts", color: "#4a7bd0", alt: "#3862ad", hue: 220 },
  { slug: "kids-hoodie", name: "Kids Hoodie", kind: "hoodie", color: "#8a8f99", alt: "#6b7280", hue: 220 },
  { slug: "silver-bracelet", name: "Silver Chain Bracelet", kind: "chain", color: "#c0c6cf", alt: "#a3abb8", hue: 210 },
  { slug: "beaded-bracelet", name: "Beaded Bracelet", kind: "beads", color: "#e23b3b", alt: "#3b82f6", hue: 20 },
  { slug: "pearl-bracelet", name: "Pearl Bracelet", kind: "pearls", color: "#fbf7f0", alt: "#f1e9dc", hue: 40 },
  { slug: "analog-watch", name: "Classic Analog Watch", kind: "analog", color: "#7b4a2a", alt: "#5c3519", hue: 25 },
  { slug: "sports-watch", name: "Digital Sports Watch", kind: "digital", color: "#1f2937", alt: "#374151", hue: 200 },
  { slug: "minimal-watch", name: "Minimal Watch", kind: "minimal", color: "#c0c6cf", alt: "#d9dde3", hue: 210 },
  { slug: "ocean-perfume", name: "Ocean Breeze Perfume", kind: "perfume", color: "#3aa0e0", alt: "#2b7fb8", hue: 200 },
  { slug: "oud-perfume", name: "Royal Oud Perfume", kind: "perfume", color: "#c9962b", alt: "#9f741c", hue: 40 },
  { slug: "citrus-perfume", name: "Citrus Bloom", kind: "perfume", color: "#f2c21b", alt: "#f59e0b", hue: 50 },
  { slug: "canvas-backpack", name: "Canvas Backpack", kind: "backpack", color: "#b5a06a", alt: "#9a8655", hue: 45 },
  { slug: "leather-handbag", name: "Leather Handbag", kind: "handbag", color: "#b8732f", alt: "#8f5620", hue: 30 },
  { slug: "tote-bag", name: "City Tote Bag", kind: "tote", color: "#222222", alt: "#4b5563", hue: 210 },
  // Default URLs pre-filled in the admin "new product" form.
  { slug: "placeholder", name: "New Product", kind: "box", color: "#9ca3af", alt: "#6b7280", hue: 220 },
];

export const categories = [
  { slug: "men", name: "Men", kind: "shirt", color: "#3b82f6", hue: 215 },
  { slug: "women", name: "Women", kind: "kurti", color: "#ec7aa8", hue: 335 },
  { slug: "kids", name: "Kids", kind: "hoodie", color: "#e23b3b", hue: 0 },
  { slug: "bracelets", name: "Bracelets", kind: "beads", color: "#e23b3b", hue: 20 },
  { slug: "watches", name: "Watches", kind: "analog", color: "#7b4a2a", hue: 25 },
  { slug: "perfume", name: "Perfume", kind: "perfume", color: "#3aa0e0", hue: 200 },
  { slug: "bags", name: "Bags", kind: "handbag", color: "#b8732f", hue: 30 },
];

export const banners = [
  { slug: "hero-1", title: "New Season Styles", subtitle: "Men, women and kids collections", hue: 335, kinds: ["shirt", "kurti", "hoodie"] },
  { slug: "hero-2", title: "Accessories Sale", subtitle: "Watches, bracelets and bags", hue: 215, kinds: ["analog", "beads", "handbag"] },
  { slug: "hero-3", title: "Fragrance Picks", subtitle: "Long-lasting perfumes", hue: 45, kinds: ["perfume", "perfume", "perfume"] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Darken a hex colour by `amount` (0..1). */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const outline = "rgba(17,24,39,0.35)";
const OUTLINE_ATTRS = `stroke="${outline}" stroke-width="4" stroke-linejoin="round"`;

// ---------------------------------------------------------------------------
// Illustrations. Each renders into a 400x400 local box and returns SVG markup.
// ---------------------------------------------------------------------------
const shapes = {
  tee(c) {
    const d = shade(c, 0.25);
    return `
      <path d="M100 60 L160 30 Q200 72 240 30 L300 60 L350 140 L290 170 L290 370 L110 370 L110 170 L50 140 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M160 30 Q200 72 240 30 Q200 100 160 30 Z" fill="${d}" opacity="0.6"/>
      <line x1="110" y1="170" x2="110" y2="370" stroke="${d}" stroke-width="3" opacity="0.4"/>
      <line x1="290" y1="170" x2="290" y2="370" stroke="${d}" stroke-width="3" opacity="0.4"/>`;
  },
  shirt(c) {
    const d = shade(c, 0.3);
    const buttons = [140, 180, 220, 260, 300, 340].map((y) => `<circle cx="200" cy="${y}" r="5" fill="${d}"/>`).join("");
    return `
      <path d="M110 70 L170 40 L200 80 L230 40 L290 70 L340 150 L285 175 L285 370 L115 370 L115 175 L60 150 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M170 40 L200 115 L230 40 L200 80 Z" fill="${d}"/>
      <line x1="200" y1="115" x2="200" y2="370" stroke="${d}" stroke-width="3"/>
      <rect x="225" y="160" width="40" height="45" fill="none" stroke="${d}" stroke-width="3"/>
      ${buttons}`;
  },
  panjabi(c) {
    const d = shade(c, 0.3);
    return `
      <path d="M120 60 L175 35 Q200 62 225 35 L280 60 L330 150 L280 170 L280 390 L120 390 L120 170 L70 150 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="188" y="62" width="24" height="110" rx="4" fill="none" stroke="${d}" stroke-width="3"/>
      ${[85, 110, 135, 160].map((y) => `<circle cx="200" cy="${y}" r="4" fill="${d}"/>`).join("")}
      <line x1="120" y1="330" x2="120" y2="390" stroke="${d}" stroke-width="5"/>
      <line x1="280" y1="330" x2="280" y2="390" stroke="${d}" stroke-width="5"/>
      <path d="M140 230 L260 230" stroke="${d}" stroke-width="2" opacity="0.5"/>`;
  },
  jacket(c) {
    const d = shade(c, 0.35);
    const l = shade(c, 0.1);
    return `
      <path d="M100 70 L160 40 L200 110 L240 40 L300 70 L350 160 L295 180 L295 370 L105 370 L105 180 L50 160 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M160 40 L200 110 L185 200 L150 110 Z" fill="${d}"/>
      <path d="M240 40 L200 110 L215 200 L250 110 Z" fill="${d}"/>
      <line x1="200" y1="110" x2="200" y2="370" stroke="${d}" stroke-width="4"/>
      <rect x="125" y="150" width="50" height="40" rx="4" fill="${l}" stroke="${d}" stroke-width="3"/>
      <rect x="225" y="150" width="50" height="40" rx="4" fill="${l}" stroke="${d}" stroke-width="3"/>
      <rect x="105" y="330" width="190" height="40" fill="${d}" opacity="0.7"/>
      ${[220, 260, 300].map((y) => `<circle cx="214" cy="${y}" r="6" fill="#d4a017"/>`).join("")}`;
  },
  kurti(c) {
    const d = shade(c, 0.3);
    const flowers = [
      [150, 200], [250, 230], [190, 290], [245, 340], [140, 330], [210, 150],
    ]
      .map(([x, y]) => `
        <g transform="translate(${x} ${y})">
          ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos((a * Math.PI) / 180) * 9}" cy="${Math.sin((a * Math.PI) / 180) * 9}" r="7" fill="#fff" opacity="0.85"/>`).join("")}
          <circle r="5" fill="#f2c21b"/>
        </g>`)
      .join("");
    return `
      <path d="M130 60 L175 35 Q200 65 225 35 L270 60 L320 140 L275 160 L300 390 L100 390 L125 160 L80 140 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M175 35 Q200 65 225 35 Q200 110 175 35 Z" fill="${d}"/>
      ${flowers}
      <path d="M110 375 L290 375" stroke="${d}" stroke-width="6"/>`;
  },
  saree(c) {
    const d = shade(c, 0.3);
    const pleats = [120, 150, 180, 210, 240, 270].map((x) => `<line x1="${x}" y1="70" x2="${x}" y2="350" stroke="${d}" stroke-width="2" opacity="0.6"/>`).join("");
    return `
      <rect x="80" y="50" width="240" height="340" rx="10" fill="${c}" ${OUTLINE_ATTRS}/>
      ${pleats}
      <path d="M80 50 L320 50 L320 170 Q200 230 80 110 Z" fill="${shade(c, 0.15)}"/>
      <rect x="80" y="350" width="240" height="40" fill="#d4a017"/>
      <rect x="80" y="360" width="240" height="4" fill="#fff" opacity="0.6"/>
      <rect x="80" y="376" width="240" height="4" fill="#fff" opacity="0.6"/>
      <rect x="300" y="50" width="20" height="340" fill="#d4a017"/>`;
  },
  shorts(c) {
    const d = shade(c, 0.3);
    return `
      <path d="M110 60 L290 60 L310 260 L215 260 L200 170 L185 260 L90 260 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="110" y="60" width="180" height="26" fill="${d}"/>
      <path d="M120 95 Q150 130 145 170" stroke="${d}" stroke-width="3" fill="none"/>
      <path d="M280 95 Q250 130 255 170" stroke="${d}" stroke-width="3" fill="none"/>
      <line x1="200" y1="86" x2="200" y2="170" stroke="${d}" stroke-width="3"/>
      <circle cx="200" cy="73" r="5" fill="#d4a017"/>`;
  },
  hoodie(c) {
    const d = shade(c, 0.3);
    return `
      <path d="M110 90 L290 90 L345 180 L290 200 L290 370 L110 370 L110 200 L55 180 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M135 95 Q200 -10 265 95 Q200 60 135 95 Z" fill="${d}" ${OUTLINE_ATTRS}/>
      <path d="M160 95 Q200 50 240 95 Q200 130 160 95 Z" fill="${shade(c, 0.5)}"/>
      <rect x="145" y="270" width="110" height="70" rx="12" fill="${d}" opacity="0.6"/>
      <line x1="185" y1="110" x2="180" y2="200" stroke="#fff" stroke-width="4"/>
      <line x1="215" y1="110" x2="220" y2="200" stroke="#fff" stroke-width="4"/>`;
  },
  chain(c) {
    const d = shade(c, 0.35);
    const links = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const x = 200 + Math.cos(a) * 125, y = 200 + Math.sin(a) * 125;
      links.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="22" ry="12" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="${i % 2 ? c : d}" stroke-width="9"/>`);
    }
    return `<circle cx="200" cy="200" r="125" fill="none" stroke="${d}" stroke-width="2" opacity="0.4"/>${links.join("")}
      <rect x="310" y="185" width="30" height="30" rx="6" fill="${c}" stroke="${d}" stroke-width="3"/>`;
  },
  beads(c, alt) {
    const palette = [c, "#f2c21b", alt ?? "#3b82f6", "#2f9e62", "#ec7aa8", "#f59e0b"];
    const beads = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const x = 200 + Math.cos(a) * 130, y = 200 + Math.sin(a) * 130;
      const col = palette[i % palette.length];
      beads.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="24" fill="${col}" ${OUTLINE_ATTRS}/><circle cx="${(x - 7).toFixed(1)}" cy="${(y - 8).toFixed(1)}" r="6" fill="#fff" opacity="0.6"/>`);
    }
    return `<circle cx="200" cy="200" r="130" fill="none" stroke="#6b7280" stroke-width="3"/>${beads.join("")}`;
  },
  pearls(c) {
    const pearls = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const x = 200 + Math.cos(a) * 130, y = 200 + Math.sin(a) * 130;
      pearls.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="${c}" stroke="#c9b89a" stroke-width="3"/><circle cx="${(x - 7).toFixed(1)}" cy="${(y - 8).toFixed(1)}" r="7" fill="#fff"/>`);
    }
    return `<circle cx="200" cy="200" r="130" fill="none" stroke="#b8a888" stroke-width="3"/>${pearls.join("")}
      <circle cx="200" cy="330" r="12" fill="#d4a017" stroke="#9f741c" stroke-width="3"/>`;
  },
  analog(c) {
    const d = shade(c, 0.3);
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r1 = i % 3 === 0 ? 60 : 68, r2 = 76;
      ticks.push(`<line x1="${(200 + Math.cos(a) * r1).toFixed(1)}" y1="${(200 + Math.sin(a) * r1).toFixed(1)}" x2="${(200 + Math.cos(a) * r2).toFixed(1)}" y2="${(200 + Math.sin(a) * r2).toFixed(1)}" stroke="#374151" stroke-width="${i % 3 === 0 ? 4 : 2}"/>`);
    }
    return `
      <rect x="160" y="10" width="80" height="130" rx="14" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="160" y="260" width="80" height="130" rx="14" fill="${c}" ${OUTLINE_ATTRS}/>
      ${[40, 60, 80, 100, 300, 320, 340, 360].map((y) => `<line x1="175" y1="${y}" x2="225" y2="${y}" stroke="${d}" stroke-width="2"/>`).join("")}
      <rect x="170" y="330" width="60" height="14" rx="4" fill="#d4a017"/>
      <circle cx="200" cy="200" r="98" fill="#d4a017" ${OUTLINE_ATTRS}/>
      <circle cx="200" cy="200" r="84" fill="#fffdf7"/>
      ${ticks.join("")}
      <line x1="200" y1="200" x2="200" y2="150" stroke="#111827" stroke-width="5" stroke-linecap="round"/>
      <line x1="200" y1="200" x2="240" y2="220" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <line x1="200" y1="200" x2="175" y2="245" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"/>
      <circle cx="200" cy="200" r="5" fill="#111827"/>
      <rect x="298" y="190" width="14" height="20" rx="3" fill="#d4a017"/>`;
  },
  digital(c) {
    const d = shade(c, 0.4);
    return `
      <rect x="150" y="10" width="100" height="120" rx="14" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="150" y="270" width="100" height="120" rx="14" fill="${c}" ${OUTLINE_ATTRS}/>
      ${[35, 55, 75, 95, 305, 325, 345, 365].map((y) => `<line x1="165" y1="${y}" x2="235" y2="${y}" stroke="${d}" stroke-width="2"/>`).join("")}
      <rect x="120" y="110" width="160" height="180" rx="30" fill="${shade(c, 0.15)}" ${OUTLINE_ATTRS}/>
      <rect x="140" y="135" width="120" height="110" rx="12" fill="#0f172a"/>
      <rect x="148" y="143" width="104" height="94" rx="8" fill="#1f2937"/>
      <text x="200" y="200" text-anchor="middle" font-family="'Courier New',monospace" font-weight="bold" font-size="34" fill="#4ade80">10:08</text>
      <text x="200" y="225" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#9ca3af">SAT 24</text>
      <rect x="276" y="150" width="14" height="24" rx="3" fill="#ef4444"/>
      <rect x="276" y="225" width="14" height="24" rx="3" fill="${d}"/>
      <rect x="110" y="150" width="14" height="24" rx="3" fill="${d}"/>`;
  },
  minimal(c) {
    const d = shade(c, 0.3);
    const mesh = [];
    for (let y = 20; y < 135; y += 8) mesh.push(`<line x1="166" y1="${y}" x2="234" y2="${y}" stroke="${d}" stroke-width="1.5" opacity="0.7"/>`);
    for (let y = 270; y < 385; y += 8) mesh.push(`<line x1="166" y1="${y}" x2="234" y2="${y}" stroke="${d}" stroke-width="1.5" opacity="0.7"/>`);
    return `
      <rect x="164" y="10" width="72" height="130" rx="8" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="164" y="260" width="72" height="130" rx="8" fill="${c}" ${OUTLINE_ATTRS}/>
      ${mesh.join("")}
      <circle cx="200" cy="200" r="96" fill="${c}" ${OUTLINE_ATTRS}/>
      <circle cx="200" cy="200" r="88" fill="#ffffff"/>
      <circle cx="200" cy="124" r="3" fill="#111827"/>
      <circle cx="276" cy="200" r="3" fill="#111827"/>
      <circle cx="200" cy="276" r="3" fill="#111827"/>
      <circle cx="124" cy="200" r="3" fill="#111827"/>
      <line x1="200" y1="200" x2="200" y2="140" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
      <line x1="200" y1="200" x2="252" y2="230" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="200" cy="200" r="4" fill="#111827"/>
      <rect x="296" y="192" width="10" height="16" rx="2" fill="${d}"/>`;
  },
  perfume(c) {
    const d = shade(c, 0.35);
    return `
      <rect x="168" y="30" width="64" height="70" rx="8" fill="${d}" ${OUTLINE_ATTRS}/>
      <rect x="180" y="40" width="10" height="50" rx="4" fill="#fff" opacity="0.35"/>
      <rect x="184" y="100" width="32" height="34" fill="#d4a017" stroke="${outline}" stroke-width="3"/>
      <rect x="110" y="130" width="180" height="250" rx="34" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="110" y="130" width="180" height="250" rx="34" fill="url(#glass)"/>
      <rect x="128" y="150" width="18" height="200" rx="9" fill="#fff" opacity="0.35"/>
      <rect x="148" y="222" width="104" height="76" rx="8" fill="#fffdf7" stroke="${d}" stroke-width="2"/>
      <text x="200" y="252" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#374151">RNS</text>
      <text x="200" y="278" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="2" fill="#6b7280">EAU DE PARFUM</text>`;
  },
  backpack(c) {
    const d = shade(c, 0.35);
    return `
      <rect x="120" y="100" width="36" height="200" rx="14" fill="${d}"/>
      <rect x="244" y="100" width="36" height="200" rx="14" fill="${d}"/>
      <path d="M160 100 Q200 50 240 100" stroke="${d}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <rect x="100" y="90" width="200" height="290" rx="44" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M110 180 Q200 150 290 180" stroke="${d}" stroke-width="4" fill="none" stroke-dasharray="8 6"/>
      <rect x="140" y="240" width="120" height="110" rx="22" fill="${shade(c, 0.12)}" ${OUTLINE_ATTRS}/>
      <path d="M150 262 Q200 250 250 262" stroke="${d}" stroke-width="4" fill="none" stroke-dasharray="8 6"/>
      <rect x="190" y="150" width="20" height="30" rx="4" fill="${d}"/>`;
  },
  handbag(c) {
    const d = shade(c, 0.35);
    return `
      <path d="M135 165 Q200 40 265 165" stroke="${d}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M80 165 L320 165 L350 380 L50 380 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M80 165 L320 165 L312 235 L88 235 Z" fill="${d}"/>
      <path d="M50 380 L350 380 L344 340 L56 340 Z" fill="${shade(c, 0.18)}"/>
      <circle cx="200" cy="245" r="16" fill="#d4a017" stroke="${outline}" stroke-width="3"/>
      <rect x="194" y="232" width="12" height="26" rx="4" fill="#9f741c"/>
      <line x1="88" y1="300" x2="312" y2="300" stroke="${d}" stroke-width="3" opacity="0.5"/>`;
  },
  tote(c) {
    const d = shade(c, 0.35);
    return `
      <path d="M140 150 C140 60 260 60 260 150" stroke="${d}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M90 150 L310 150 L330 380 L70 380 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <rect x="90" y="150" width="220" height="22" fill="${d}"/>
      <path d="M150 150 C150 110 250 110 250 150" stroke="#fff" stroke-width="6" fill="none" opacity="0.4"/>
      <text x="200" y="285" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="40" fill="#fff" opacity="0.9">RNS</text>
      <rect x="110" y="310" width="180" height="4" fill="#fff" opacity="0.5"/>`;
  },
  box(c) {
    const d = shade(c, 0.3);
    return `
      <path d="M200 60 L340 130 L340 290 L200 360 L60 290 L60 130 Z" fill="${c}" ${OUTLINE_ATTRS}/>
      <path d="M200 60 L340 130 L200 200 L60 130 Z" fill="${shade(c, 0.05)}" opacity="0.8"/>
      <path d="M200 200 L340 130 L340 290 L200 360 Z" fill="${d}"/>
      <line x1="200" y1="200" x2="200" y2="360" stroke="${outline}" stroke-width="3"/>
      <path d="M130 95 L270 165 L270 230 L130 160 Z" fill="#fff" opacity="0.5"/>`;
  },
};

export const kinds = Object.keys(shapes);

const defs = (hue, alt = false) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},45%,${alt ? 90 : 95}%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 25) % 360},40%,${alt ? 78 : 84}%)"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.12"/>
    </linearGradient>
    <radialGradient id="spot" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="hsl(${hue},40%,30%)" flood-opacity="0.25"/>
    </filter>
  </defs>`;

const brandMark = (x, y) => `<text x="${x}" y="${y}" font-family="Georgia,serif" font-weight="bold" font-size="28" fill="#8b1a4a" opacity="0.8">RNS</text>`;

/**
 * Render an 800x1000 product image.
 * @param {typeof products[number]} p
 * @param {1|2} view
 */
export function renderProduct(p, view = 1) {
  const draw = shapes[p.kind];
  if (!draw) throw new Error(`Unknown illustration kind "${p.kind}" for ${p.slug}`);
  const alt = view === 2;
  const fill = alt ? p.alt : p.color;
  const rot = alt ? -8 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  ${defs(p.hue, alt)}
  <rect width="800" height="1000" fill="url(#bg)"/>
  <circle cx="400" cy="440" r="${alt ? 320 : 290}" fill="url(#spot)"/>
  ${alt ? `<circle cx="400" cy="440" r="250" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>` : ""}
  <g transform="translate(400 440) rotate(${rot}) scale(1.1) translate(-200 -200)" filter="url(#shadow)">
    ${draw(fill, p.alt)}
  </g>
  ${brandMark(40, 70)}
  ${alt ? `<rect x="620" y="40" width="140" height="40" rx="20" fill="#111827" opacity="0.75"/><text x="690" y="67" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#fff">Alt view</text>` : ""}
  <text x="400" y="870" text-anchor="middle" font-family="Georgia,serif" font-size="46" fill="#1f2937">${esc(p.name)}</text>
  <text x="400" y="915" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" letter-spacing="4" fill="#6b7280">${esc(p.slug.toUpperCase().replace(/-/g, " "))}</text>
</svg>
`;
}

/**
 * Render an 800x800 category tile.
 * Text-free: the storefront renders the category name as a caption under the tile,
 * so baking it into the image would show it twice.
 */
export function renderCategory(c) {
  const draw = shapes[c.kind];
  if (!draw) throw new Error(`Unknown illustration kind "${c.kind}" for ${c.slug}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="${esc(c.name)}">
  ${defs(c.hue)}
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="400" cy="400" r="300" fill="url(#spot)"/>
  <g transform="translate(400 400) scale(1.25) translate(-200 -200)" filter="url(#shadow)">
    ${draw(c.color)}
  </g>
</svg>
`;
}

/**
 * Render a 1600x600 hero banner.
 * Artwork only: the home page overlays the banner title, subtitle and CTA
 * itself (see app/(store)/page.tsx), so no text is baked in here. Icons sit
 * on the right so they stay clear of that bottom-left overlay.
 */
export function renderBanner(b) {
  const icons = b.kinds
    .map((kind, i) => {
      const draw = shapes[kind];
      if (!draw) throw new Error(`Unknown illustration kind "${kind}" for ${b.slug}`);
      const colours = ["#8b1a4a", "#d4a017", "#1f2937"];
      return `<g transform="translate(${900 + i * 240} 290) rotate(${-6 + i * 6}) scale(0.8) translate(-200 -200)" filter="url(#shadow)">${draw(colours[i % colours.length])}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600" role="img" aria-label="${esc(b.title)}">
  ${defs(b.hue)}
  <rect width="1600" height="600" fill="url(#bg)"/>
  <circle cx="1140" cy="290" r="340" fill="url(#spot)"/>
  <circle cx="300" cy="120" r="180" fill="hsl(${b.hue},50%,88%)" opacity="0.6"/>
  <circle cx="1500" cy="560" r="140" fill="hsl(${(b.hue + 40) % 360},50%,80%)" opacity="0.5"/>
  ${icons}
  ${brandMark(60, 80)}
</svg>
`;
}

/** Build the full list of { file, svg } pairs relative to the seed root. */
export function buildAssets() {
  const out = [];
  for (const p of products) {
    out.push({ file: path.join("products", `${p.slug}-1.svg`), svg: renderProduct(p, 1) });
    out.push({ file: path.join("products", `${p.slug}-2.svg`), svg: renderProduct(p, 2) });
  }
  for (const c of categories) out.push({ file: path.join("categories", `${c.slug}.svg`), svg: renderCategory(c) });
  for (const b of banners) out.push({ file: path.join("banners", `${b.slug}.svg`), svg: renderBanner(b) });
  return out;
}

/** Write all assets under `root`. Returns the number of files written. */
export function writeAssets(root) {
  const assets = buildAssets();
  for (const { file, svg } of assets) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, svg);
  }
  return assets.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), "public", "seed");
  const n = writeAssets(root);
  console.log(`Generated ${n} seed SVG assets in ${path.relative(process.cwd(), root) || "."}/`);
}
