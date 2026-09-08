/**
 * Normalize license headers + fix known erroneous auto-JSDoc across the 3 projects.
 *
 * Usage (from µcBlockly root): node scripts/fix-docs-and-licenses.mjs
 */
import fs from "fs";
import path from "path";

const ASTUCE_UCB = `/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`;

const ASTUCE_BDUINO = `/**
 * @license
 * Copyright 2026 ASTUCE (Sébastien Canet) / BlocklyDuino
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`;

const VERBOSE_GPL_RE =
  /\/\*\*\s*\n(?: \*[^\n]*\n)*? \* @license\s*\n \* Copyright \(C\) 2023-2026 ASTUCE \(Sébastien Canet microcompany\)\s*\n \*\s*\n \* This program is free software:[\s\S]*?SPDX-License-Identifier: GPL-3\.0-or-later\s*\n(?: \*\s*\n \* Hacker Mode[\s\S]*?SPDX-License-Identifier: Apache-2\.0\s*\n)? \*\/\s*/;

const MODIFICATIONS_GPL_RE =
  /\/\*\*\s*\n \* @license\s*\n \* Modifications copyright \(C\) 2023-2024 ASTUCE \(Sébastien Canet microcompany\)\s*\n \*\s*\n \* This program is free software:[\s\S]*?SPDX-License-Identifier: GPL-3\.0-or-later\s*\n \*\/\s*/;

const SHORT_LICENSE_IN_PACKAGE_RE =
  /^(\/\*\*[\s\S]*?@packageDocumentation[\s\S]*?)( \* @license GPL-3\.0-or-later\s*\n)/m;

const HACKER_POLLUTION_RE =
  /\n \*\s*\n \* Hacker Mode block\/category palette \(Apache-2\.0, Google LLC 2023\):\s*\n \* SPDX-License-Identifier: Apache-2\.0\s*/;

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (
      ["node_modules", "build", "dist", "upstream", "graphify-out", ".git"].includes(
        e.name,
      )
    )
      continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(e.name) && !e.name.endsWith(".d.ts"))
      acc.push(p);
  }
  return acc;
}

function ensureLeadingLicense(content, licenseBlock) {
  if (/@license/.test(content.slice(0, 800)) || /SPDX-License-Identifier/.test(content.slice(0, 800))) {
    return content;
  }
  // Keep shebang if any
  if (content.startsWith("#!")) {
    const nl = content.indexOf("\n");
    return content.slice(0, nl + 1) + "\n" + licenseBlock + "\n" + content.slice(nl + 1);
  }
  return licenseBlock + "\n\n" + content.replace(/^\uFEFF/, "");
}

function collapseUcBlocklyLicenses(content, filePath) {
  let s = content;
  const base = path.basename(filePath);
  const isHacker = base === "theme_hackermode.ts";

  // Remove erroneous "Modifications copyright" duplicate blocks
  s = s.replace(MODIFICATIONS_GPL_RE, "");

  // Remove Hacker Mode pollution except in theme_hackermode.ts
  if (!isHacker) {
    s = s.replace(HACKER_POLLUTION_RE, "\n");
  }

  // Replace verbose GPL blocks with compact ASTUCE license
  if (VERBOSE_GPL_RE.test(s)) {
    const compact = isHacker
      ? `/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * Hacker Mode palette derived from Google LLC theme-hackermode (Apache-2.0).
 * SPDX-License-Identifier: GPL-3.0-or-later
 */\n\n`
      : `${ASTUCE_UCB}\n\n`;
    s = s.replace(VERBOSE_GPL_RE, compact);
  }

  // If packageDocumentation still has orphan @license GPL-3.0-or-later line, drop it
  // (SPDX lives in the compact block)
  s = s.replace(SHORT_LICENSE_IN_PACKAGE_RE, "$1");

  // Collapse any remaining long "This program is free software" GPL headers
  // (allow blank line before closing */)
  s = s.replace(
    /\/\*\*\s*\n \* @license\s*\n \* Copyright \(C\) 2023-2026 ASTUCE \(Sébastien Canet microcompany\)\s*\n \*\s*\n \* This program is free software:[\s\S]*?SPDX-License-Identifier: GPL-3\.0-or-later\s*\n(?:\s*\n)?\s*\*\/\s*/g,
    `${ASTUCE_UCB}\n\n`,
  );

  return s;
}

function fixDoubleSpacedFile(content) {
  // factory_about / factory_ui_messages: every line followed by blank
  if (!/^\s*\/\*\*\s*\n\s*\n\s*\* @license/.test(content)) {
    // also detect general double-spacing of whole file start
    if (!content.includes("\n\n * @license\n\n")) return content;
  }
  // Collapse sequences of blank lines inside the first license block and
  // reduce "line\n\nline" pattern for the whole file carefully:
  // User file is entirely double-spaced — collapse pairs.
  const lines = content.split(/\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    // skip following empty line if current is non-empty and next is empty and next+1 is non-empty
    // or systematically: if line empty and previous was kept empty already, skip
  }
  // Simpler: remove blank lines that sit between two non-blank lines when pattern is pervasive
  let collapsed = content.replace(/\r\n/g, "\n");
  // If more than 40% of lines are empty in first 80 lines, treat as double-spaced file
  const head = collapsed.split(/\n/).slice(0, 80);
  const emptyRatio = head.filter((l) => l.trim() === "").length / head.length;
  if (emptyRatio > 0.35) {
    collapsed = collapsed
      .split(/\n/)
      .filter((l, idx, arr) => {
        if (l.trim() !== "") return true;
        // keep a single blank between blocks: drop empty if previous kept was empty
        const prev = arr.slice(0, idx).reverse().find((x) => true);
        // filter consecutive empties later
        return true;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    // Actually remove every other blank: convert "\n\n" between code lines to "\n"
    // For double-spaced files: non-empty, empty, non-empty, empty...
    const raw = collapsed.split(/\n/);
    const fixed = [];
    for (let i = 0; i < raw.length; i++) {
      if (raw[i].trim() === "" && i > 0 && i + 1 < raw.length && raw[i - 1].trim() !== "" && raw[i + 1].trim() !== "") {
        // skip interstitial blank that doubles the file
        continue;
      }
      fixed.push(raw[i]);
    }
    collapsed = fixed.join("\n").replace(/\n{3,}/g, "\n\n");
  }
  return collapsed;
}

function fixKnownJsdoc(content, filePath) {
  let s = content;
  const base = filePath.replace(/\\/g, "/");

  if (base.endsWith("workspace_codegen.ts")) {
    s = s.replace(
      /\/\*\*\s*\n \* Workspace To Code\.\s*\n \* @param workspace - Blockly workspace\.\s*\n \* @param language - Language code \(e\.g\. `fr`, `en`\)\.\s*\n \* @returns Result string\.\s*\n \*\//,
      `/**
 * Generate sketch source for the workspace.
 * @param workspace - Blockly workspace.
 * @param language - Codegen language (\`arduino\` or \`micropython\`).
 * @returns Generated source code.
 */`,
    );
  }

  if (base.endsWith("code_language.ts")) {
    s = s.replace(/\* Is Code Language\./g, "* Whether the value is a supported codegen language.");
    s = s.replace(
      /\* @param value - Value to set\.\s*\n \* @returns Operation result\./g,
      "* @param value - Candidate language id.\n * @returns True when the value is `arduino` or `micropython`.",
    );
    s = s.replace(/\* @returns Result string\./g, "* @returns Monaco language id (`cpp` or `micropython`).");
  }

  if (base.endsWith("registry.ts") && base.includes("extensions")) {
    s = s.replace(/\* Get Loaded Extensions\./g, "* Return all currently loaded extension packs.");
    s = s.replace(/\* Get Loaded Extension\./g, "* Return one loaded extension pack by id.");
  }

  if (base.endsWith("project_file.ts") && base.includes("BlocklyDuino-v3")) {
    s = s.replace(
      /\* @param now - `now` value\./g,
      "* @param now - Optional timestamp used to build a unique filename.",
    );
  }

  if (base.endsWith("shell_theme.ts")) {
    s = s.replace(/\* Is Shell Theme Mode\./g, "* Whether the value is a shell theme mode.");
    s = s.replace(
      /\* @param value - Value to set\.\s*\n \* @returns Operation result\./g,
      "* @param value - Candidate theme mode.\n * @returns True when the value is a known shell theme.",
    );
    s = s.replace(
      /\* Resolve Effective Shell Theme\.\s*\n \* @param[\s\S]*?@returns Operation result\./,
      (m) =>
        m
          .replace("* Resolve Effective Shell Theme.", "* Resolve the effective shell theme (`light` or `dark`).")
          .replace("* @returns Operation result.", "* @returns Effective shell theme."),
    );
  }

  // Generic tautological param cleanup (safe-ish)
  s = s.replace(
    /@param ([A-Za-z_][\w]*) - `\1` value\./g,
    "@param $1 - The `$1` argument.",
  );

  return s;
}

function fixServoLicense(content) {
  return content.replace(
    /SPDX-License-Identifier: Apache-2\.0/,
    "SPDX-License-Identifier: GPL-3.0-or-later",
  );
}

function processUcBlockly() {
  const roots = [
    "F:/Logiciels/Arduino_graphique/µcBlockly/src",
    "F:/Logiciels/Arduino_graphique/µcBlockly/extensions",
  ];
  let n = 0;
  for (const root of roots) {
    for (const f of walk(root)) {
      let s = fs.readFileSync(f, "utf8");
      const orig = s;
      if (f.includes(`${path.sep}extensions${path.sep}servo${path.sep}`) && f.endsWith(".js")) {
        s = fixServoLicense(s);
      }
      if (f.includes(`${path.sep}extensions${path.sep}servo${path.sep}`) && /\.ts$/.test(f)) {
        s = ensureLeadingLicense(s, ASTUCE_UCB);
      }
      if (f.includes(`${path.sep}src${path.sep}`)) {
        s = collapseUcBlocklyLicenses(s, f);
      }
      s = fixKnownJsdoc(s, f);
      if (s !== orig) {
        fs.writeFileSync(f, s);
        n++;
      }
    }
  }
  console.log("µcBlockly files updated:", n);
}

function processBduino() {
  const root = "F:/Logiciels/Arduino_graphique/BlocklyDuino/BlocklyDuino-v3/src";
  let n = 0;
  for (const f of walk(root)) {
    let s = fs.readFileSync(f, "utf8");
    const orig = s;
    if (f.endsWith(".d.ts")) continue;
    s = ensureLeadingLicense(s, ASTUCE_BDUINO);
    s = fixKnownJsdoc(s, f);
    if (s !== orig) {
      fs.writeFileSync(f, s);
      n++;
    }
  }
  console.log("BlocklyDuino-v3 files updated:", n);
}

function processFactory() {
  const root =
    "F:/Logiciels/Arduino_graphique/BlocklyDuino/BlocklyDuinoFactory-v3/overlay";
  let n = 0;
  for (const f of walk(root)) {
    let s = fs.readFileSync(f, "utf8");
    const orig = s;
    if (f.endsWith("factory_about.ts") || f.endsWith("factory_ui_messages.ts")) {
      s = fixDoubleSpacedFile(s);
    }
    if (/\.(ts|js)$/.test(f) && !f.endsWith(".d.ts")) {
      s = ensureLeadingLicense(s, ASTUCE_BDUINO);
    }
    s = fixKnownJsdoc(s, f);
    if (s !== orig) {
      fs.writeFileSync(f, s);
      n++;
    }
  }
  console.log("Factory overlay files updated:", n);
}

processUcBlockly();
processBduino();
processFactory();
console.log("done");
