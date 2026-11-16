import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public", "media");
mkdirSync(dest, { recursive: true });

const sources = [
  path.join(root, "node_modules", "blockly", "media"),
  path.join(root, "vendor", "ucBlockly", "public", "media"),
];

for (const src of sources) {
  if (!existsSync(src)) {
    console.warn(`[copy-media] skip missing: ${src}`);
    continue;
  }
  cpSync(src, dest, { recursive: true });
  console.log(`[copy-media] copied ${src} → ${dest}`);
}
