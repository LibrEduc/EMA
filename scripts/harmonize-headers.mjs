/**
 * Harmonise les en-têtes source vers le format CONVENTIONS.md :
 *   @packageDocumentation (+ @module / @description / @author / @version / @since)
 *   puis @license GPL compact.
 *
 * Usage:
 *   node scripts/harmonize-headers.mjs              # BD-v3 + Factory overlay
 *   node scripts/harmonize-headers.mjs --ucblockly  # fill missing µcBlockly headers only
 *   node scripts/harmonize-headers.mjs --all-three
 *
 * See docs/CONVENTIONS.md.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ucRoot = path.resolve(__dirname, "..");
const bdRoot = path.resolve(ucRoot, "../BlocklyDuino/BlocklyDuino-v3");
const facRoot = path.resolve(ucRoot, "../BlocklyDuino/BlocklyDuinoFactory-v3");

const AUTHOR = "scanet\\@libreduc.cc (Sébastien Canet)";

const LICENSE_UCB = `/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`;

const LICENSE_BDUINO = `/**
 * @license
 * Copyright 2026 ASTUCE (Sébastien Canet) / BlocklyDuino
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`;

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", "dist", "build", ".git", "upstream"].includes(e.name))
      continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) acc.push(p);
  }
  return acc;
}

function toModuleName(relPosix, prefix) {
  const noExt = relPosix.replace(/\.tsx?$/, "");
  const parts = noExt.split("/").filter((p) => p && p !== "index");
  const segs = parts.map((p) =>
    p
      .split(/[_-]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(""),
  );
  return [prefix, ...segs].filter(Boolean).join(".") || prefix;
}

function sentenceFromBasename(base) {
  const words = base
    .replace(/\.tsx?$/, "")
    .split(/[_-]/)
    .filter(Boolean);
  if (!words.length) return "Module.";
  const label = words.join(" ");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} module.`;
}

function extractExistingDescription(head) {
  const m =
    head.match(/@description\s+([^\n*]+)/) ||
    head.match(/\/\*\*\s*\n \* ([^@*][^\n]*)/);
  if (!m) return null;
  const t = m[1].trim();
  if (/^@/.test(t) || t.length < 8) return null;
  return t.replace(/\s+/g, " ");
}

function stripLeadingDocAndLicense(content) {
  let s = content.replace(/^\uFEFF/, "");
  // Remove consecutive leading /** ... */ blocks (packageDoc, license, orphan prose)
  let guard = 0;
  while (guard++ < 6) {
    const m = s.match(/^(\s*\/\*\*[\s\S]*?\*\/\s*)/);
    if (!m) break;
    const block = m[1];
    if (
      /@packageDocumentation|@license|SPDX-License-Identifier|Copyright/.test(
        block,
      ) ||
      (/^\/\*\*\s*\n \* [A-Za-zÀ-ÿ]/.test(block.trimStart()) &&
        !/@param|@returns|@example/.test(block))
    ) {
      // Keep function-level docs: if block has @param near a following export, stop
      const rest = s.slice(m[1].length);
      if (
        /@param|@returns/.test(block) &&
        /^\s*(export\s+)?(async\s+)?function|^\s*export\s+(const|class|type|interface)/.test(
          rest,
        )
      ) {
        break;
      }
      s = rest;
      continue;
    }
    break;
  }
  return s;
}

function buildPackageDoc(moduleName, description) {
  return `/**
 * @packageDocumentation
 * @module ${moduleName}
 * @description ${description}
 * @author ${AUTHOR}
 * @version 1.0.0
 * @since 1.0.0
 */`;
}

function processFile(filePath, { srcRoot, modulePrefix, licenseBlock }) {
  const rel = path.relative(srcRoot, filePath).replace(/\\/g, "/");
  const raw = fs.readFileSync(filePath, "utf8");
  const head = raw.slice(0, 1200);

  // Already fully shaped?
  const hasPkg = /@packageDocumentation/.test(head);
  const hasLic = /@license/.test(head) && /SPDX-License-Identifier:\s*GPL-3\.0-or-later/.test(head);

  let description =
    extractExistingDescription(head) ||
    sentenceFromBasename(path.basename(filePath));
  // Prefer existing module remark lines for BD/Factory short prose headers
  if (!hasPkg) {
    const prose = head.match(
      /\/\*\*\s*\n((?: \* (?!@)[^\n]*\n)+) \*\//,
    );
    if (prose) {
      const lines = prose[1]
        .split(/\n/)
        .map((l) => l.replace(/^ \* ?/, "").trim())
        .filter(Boolean);
      if (lines[0] && lines[0].length > 12) description = lines[0];
    }
  } else {
    const d = head.match(/@description\s+([^\n]+)/);
    if (d) description = d[1].trim();
  }

  const moduleName = toModuleName(rel, modulePrefix);
  const body = stripLeadingDocAndLicense(raw);
  const next =
    buildPackageDoc(moduleName, description) +
    "\n\n" +
    licenseBlock +
    "\n\n" +
    body.replace(/^\s*\n+/, "");

  if (next !== raw) {
    fs.writeFileSync(filePath, next);
    return true;
  }
  // If already has both but wrong order / missing fields — still rewrite when missing pkg
  if (!hasPkg || !hasLic) {
    fs.writeFileSync(filePath, next);
    return true;
  }
  return false;
}

const only = process.argv.includes("--all-three")
  ? "all"
  : process.argv.includes("--ucblockly")
    ? "uc"
    : "apps"; // default: BlocklyDuino-v3 + Factory overlay only

function runTarget(label, srcRoot, modulePrefix, licenseBlock, mode) {
  const files = walk(srcRoot);
  let n = 0;
  for (const f of files) {
    const head = fs.readFileSync(f, "utf8").slice(0, 800);
    // µcBlockly: only fill missing packageDocumentation (preserve rich headers)
    if (mode === "uc-fill") {
      if (/@packageDocumentation/.test(head) && /@license/.test(head)) continue;
    }
    if (processFile(f, { srcRoot, modulePrefix, licenseBlock })) n++;
  }
  console.log(`${label}: ${n}/${files.length} headers updated`);
}

if (only === "all" || only === "uc") {
  runTarget(
    "µcBlockly src",
    path.join(ucRoot, "src"),
    "UcBlockly",
    LICENSE_UCB,
    "uc-fill",
  );
}
if (only === "all" || only === "apps") {
  runTarget(
    "BlocklyDuino-v3 src",
    path.join(bdRoot, "src"),
    "BlocklyDuino",
    LICENSE_BDUINO,
    "apps",
  );
  runTarget(
    "Factory overlay",
    path.join(facRoot, "overlay"),
    "Factory.Overlay",
    LICENSE_BDUINO,
    "apps",
  );
}
console.log("done");
