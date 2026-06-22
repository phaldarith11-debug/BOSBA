// Reproducible PWA icon generator — no external dependencies.
//
// Draws the BOSBA brand mark (white "B" on the brand-red field) at every size
// the PWA needs, and writes raw PNGs into ./public/icons.
//
// Run with:  node scripts/generate-pwa-icons.mjs
//
// Why hand-rolled: the project pins its dependency tree carefully and has no
// image toolchain (sharp/canvas) installed. Encoding a flat RGBA bitmap to PNG
// only needs Node's built-in zlib + a CRC32, so we avoid adding a build dep.

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

const BRAND = [0xe5, 0x1b, 0x1b]; // #e51b1b
const WHITE = [0xff, 0xff, 0xff];

// 5x7 bitmap of the letter "B".
const GLYPH_B = [
  "11110",
  "10001",
  "10001",
  "11110",
  "10001",
  "10001",
  "11110",
];

// ── CRC32 (PNG chunk checksum) ────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Encode an RGBA pixel buffer (size*size*4) as a PNG.
function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Prefix each scanline with filter byte 0 (none).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Build one icon. `maskable` keeps the glyph inside the safe zone (~60% center)
// so platform-applied masks (circles, squircles) never clip it.
function buildIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);

  // Fill background. Full-bleed brand red — required for maskable + iOS, which
  // ignore transparency and expect an opaque square.
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = BRAND[0];
    rgba[i * 4 + 1] = BRAND[1];
    rgba[i * 4 + 2] = BRAND[2];
    rgba[i * 4 + 3] = 0xff;
  }

  // Glyph geometry: fit the 5x7 "B" into a centred box.
  const cols = 5;
  const rows = 7;
  const coverage = maskable ? 0.5 : 0.62; // height fraction of canvas
  const cell = Math.floor((size * coverage) / rows);
  const glyphW = cell * cols;
  const glyphH = cell * rows;
  const offX = Math.floor((size - glyphW) / 2);
  const offY = Math.floor((size - glyphH) / 2);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (GLYPH_B[gy][gx] !== "1") continue;
      for (let py = 0; py < cell; py++) {
        for (let px = 0; px < cell; px++) {
          const x = offX + gx * cell + px;
          const y = offY + gy * cell + py;
          const idx = (y * size + x) * 4;
          rgba[idx] = WHITE[0];
          rgba[idx + 1] = WHITE[1];
          rgba[idx + 2] = WHITE[2];
          rgba[idx + 3] = 0xff;
        }
      }
    }
  }

  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32.png", size: 32 },
];

for (const t of targets) {
  const png = buildIcon(t.size, { maskable: t.maskable });
  writeFileSync(join(OUT_DIR, t.file), png);
  console.log(`wrote public/icons/${t.file} (${png.length} bytes)`);
}

console.log("Done. Replace these with real brand artwork anytime — same filenames.");
