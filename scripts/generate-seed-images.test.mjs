import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  products,
  categories,
  banners,
  kinds,
  shade,
  buildAssets,
  renderProduct,
  writeAssets,
} from "./generate-seed-images.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedSource = fs.readFileSync(path.join(repoRoot, "seed.ts"), "utf8");

/** Every `/seed/...svg` path referenced by seed.ts, with `${p.slug}` templates expanded. */
function seedImagePaths() {
  const literal = [...seedSource.matchAll(/"\/seed\/([^"]+\.svg)"/g)].map((m) => m[1]);
  const templated = [...seedSource.matchAll(/`\/seed\/products\/\$\{p\.slug\}-(\d)\.svg`/g)].map((m) => m[1]);
  const productSlugs = [...seedSource.matchAll(/slug: "([a-z0-9-]+)", name: "[^"]+", description/g)].map((m) => m[1]);
  const expanded = templated.flatMap((n) => productSlugs.map((slug) => `products/${slug}-${n}.svg`));
  return new Set([...literal, ...expanded]);
}

test("every image path used by seed.ts is generated", () => {
  const generated = new Set(buildAssets().map((a) => a.file.split(path.sep).join("/")));
  const missing = [...seedImagePaths()].filter((p) => !generated.has(p));
  assert.deepEqual(missing, [], `seed.ts references images the generator does not produce: ${missing.join(", ")}`);
});

test("admin new-product form placeholders are generated", () => {
  const generated = new Set(buildAssets().map((a) => a.file.split(path.sep).join("/")));
  assert.ok(generated.has("products/placeholder-1.svg"));
  assert.ok(generated.has("products/placeholder-2.svg"));
});

test("every catalogue entry uses a known illustration kind", () => {
  for (const p of products) assert.ok(kinds.includes(p.kind), `${p.slug}: unknown kind ${p.kind}`);
  for (const c of categories) assert.ok(kinds.includes(c.kind), `${c.slug}: unknown kind ${c.kind}`);
  for (const b of banners) for (const k of b.kinds) assert.ok(kinds.includes(k), `${b.slug}: unknown kind ${k}`);
});

test("rendered output is well-formed SVG with no unresolved template values", () => {
  for (const { file, svg } of buildAssets()) {
    assert.ok(svg.startsWith("<svg xmlns=\"http://www.w3.org/2000/svg\""), `${file}: missing svg root`);
    assert.ok(svg.trimEnd().endsWith("</svg>"), `${file}: unterminated svg`);
    assert.doesNotMatch(svg, /undefined|NaN|\[object Object\]/, `${file}: unresolved value in output`);
    // Hex colours must be exactly 3 or 6 digits.
    assert.doesNotMatch(svg, /fill="#(?:[0-9a-f]{0,2}|[0-9a-f]{4,5}|[0-9a-f]{7,})"/i, `${file}: malformed hex colour`);
  }
});

test("alternate view differs from primary view", () => {
  for (const p of products) {
    assert.notEqual(renderProduct(p, 1), renderProduct(p, 2), `${p.slug}: views are identical`);
    assert.match(renderProduct(p, 2), /Alt view/);
  }
});

test("shade darkens and clamps", () => {
  assert.equal(shade("#ffffff", 0.5), "#808080");
  assert.equal(shade("#000000", 0.5), "#000000");
  assert.equal(shade("#3b82f6", 0), "#3b82f6");
});

test("writeAssets writes every file to disk", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rns-seed-images-"));
  try {
    const n = writeAssets(dir);
    const files = [];
    for (const sub of ["products", "categories", "banners"]) {
      for (const f of fs.readdirSync(path.join(dir, sub))) files.push(`${sub}/${f}`);
    }
    assert.equal(files.length, n);
    assert.equal(n, products.length * 2 + categories.length + banners.length);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
