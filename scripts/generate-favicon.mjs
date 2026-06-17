#!/usr/bin/env node
/**
 * Regénère les favicons à partir de public/assets/logo_µcBlockly.png
 * (fond blanc → transparent, multi-tailles 16/32/48, favicon.ico).
 * Ne modifie pas le fichier logo source.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const assetsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/assets",
);
const logoPath = path.join(assetsDir, "logo_µcBlockly.png");
const ICON_SIZES = [16, 32, 48];

/** Fond blanc / gris clair uniforme → alpha 0 (ne touche pas aux couleurs du logo). */
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

  writeFileSync(path.join(assetsDir, "favicon.ico"), await toIco(pngBuffers));

  console.log(
    `Favicons générés (${ICON_SIZES.join(", ")} px + .ico) dans ${assetsDir}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
