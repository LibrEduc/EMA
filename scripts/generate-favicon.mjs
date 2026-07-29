#!/usr/bin/env node
/**
 * Regenerates favicons from public/assets/logo_µcBlockly.png
 * (white background → transparent, multi-size 16/32/48, favicon.ico).
 * Does not modify the source logo file.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const assetsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/assets",
);
const logoPath = path.join(assetsDir, "logo_µcBlockly.png");
const ICON_SIZES = [16, 32, 48];

/**
 * Build a modern ICO (PNG payloads) without the vulnerable to-ico/jimp stack.
 * @param {Buffer[]} pngBuffers
 * @returns {Buffer}
 */
function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = pngBuffers.map((png) => {
    const entry = { png, offset, size: png.length };
    offset += png.length;
    return entry;
  });

  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // ICO type
  out.writeUInt16LE(count, 4);

  entries.forEach((entry, i) => {
    const o = 6 + i * 16;
    // 0 means 256 in classic ICO; our PNGs are 16/32/48 so store the size.
    // Width/height are read from PNG IHDR when possible; fall back to 0.
    let width = 0;
    let height = 0;
    if (
      entry.png.length >= 24 &&
      entry.png[12] === 0x49 &&
      entry.png[13] === 0x48 &&
      entry.png[14] === 0x44 &&
      entry.png[15] === 0x52
    ) {
      width = entry.png.readUInt32BE(16);
      height = entry.png.readUInt32BE(20);
    }
    out.writeUInt8(width >= 256 ? 0 : width, o);
    out.writeUInt8(height >= 256 ? 0 : height, o + 1);
    out.writeUInt8(0, o + 2); // color palette
    out.writeUInt8(0, o + 3); // reserved
    out.writeUInt16LE(1, o + 4); // color planes
    out.writeUInt16LE(32, o + 6); // bits per pixel
    out.writeUInt32LE(entry.size, o + 8);
    out.writeUInt32LE(entry.offset, o + 12);
    entry.png.copy(out, entry.offset);
  });

  return out;
}
/** Uniform white / light-gray background → alpha 0 (does not touch logo colors). */
async function loadWithTransparentBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const hardWhite = 252;
  const softWhite = 235;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= hardWhite && g >= hardWhite && b >= hardWhite) {
      data[i + 3] = 0;
    } else if (r >= softWhite && g >= softWhite && b >= softWhite) {
      const whiteness = Math.min(r, g, b);
      const fade = (whiteness - softWhite) / (hardWhite - softWhite);
      data[i + 3] = Math.round(data[i + 3] * (1 - fade));
    }
  }

  return sharp(data, { raw: { width, height, channels: 4 } });
}

function resizeIcon(base, size) {
  return base
    .clone()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
    .png();
}

async function main() {
  const base = await loadWithTransparentBackground(logoPath);
  const pngBuffers = [];

  for (const size of ICON_SIZES) {
    const buf = await resizeIcon(base, size).toBuffer();
    pngBuffers.push(buf);
    await sharp(buf).toFile(path.join(assetsDir, `favicon-${size}x${size}.png`));
  }

  await resizeIcon(base, 48).toFile(path.join(assetsDir, "favicon.png"));
  await resizeIcon(base, 180).toFile(path.join(assetsDir, "apple-touch-icon.png"));

  writeFileSync(path.join(assetsDir, "favicon.ico"), pngsToIco(pngBuffers));

  console.log(
    `Favicons générés (${ICON_SIZES.join(", ")} px + .ico) dans ${assetsDir}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
