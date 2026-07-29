#!/usr/bin/env node
/**
 * Converts a Blockly@rduino save (XML / .B@) into a µcBlockly workspace JSON.
 *
 * Usage:
 *   npm run convert-rduino -- <input-file> [output-file.json]
 *   node scripts/convert-rduino-workspace.mjs examples/blink.xml out.json
 *
 * Input: .xml, .B@, or any Blockly@rduino XML file (“save project” export).
 * Output: JSON loadable via “Open” in µcBlockly (workspace.json).
 *
 * Limits:
 * - Extension blocks (Grove, mBot, TechnoZone, etc.) with no entry in the
 *   mapping table are kept under their original name (may fail to load).
 * - Orange “definitions” blocks (base_define_bloc) are flattened into root blocks.
 * - Stacks without setup/loop are wrapped in board_base_setup_loop (loop body).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { convertRduinoXmlToUcbJson } from "./lib/rduino-xml-to-ucb-json.mjs";

function printUsage() {
  console.log(`Usage: node scripts/convert-rduino-workspace.mjs <input.xml|.B@> [output.json]

Converts a Blockly@rduino save into a µcBlockly workspace JSON.

Options via environment variables:
  UCB_NO_WRAP=1   Do not wrap orphan blocks in setup/loop
`);
}

const args = process.argv.slice(2).filter((a) => a !== "--");
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const inputPath = resolve(args[0]);
const outputPath = resolve(
  args[1] ?? inputPath.replace(/\.(xml|B@)$/i, "") + ".ucb.json",
);

let xmlText;
try {
  xmlText = readFileSync(inputPath, "utf8");
} catch (err) {
  console.error(`Impossible de lire ${inputPath}:`, err.message);
  process.exit(1);
}

const wrapOrphans = process.env.UCB_NO_WRAP !== "1";

let result;
try {
  result = convertRduinoXmlToUcbJson(xmlText, { wrapOrphans });
} catch (err) {
  console.error("Échec de la conversion :", err.message);
  process.exit(1);
}

writeFileSync(outputPath, JSON.stringify(result.workspace, null, 2), "utf8");

console.log(`✅ Converti : ${basename(inputPath)} → ${basename(outputPath)}`);
console.log(`   Blocs : ${result.report.blockCount}`);
if (result.metadata.toolbox) {
  console.log(`   Toolbox d'origine : ${result.metadata.toolbox}`);
}
if (result.report.unmappedBlockTypes.length > 0) {
  console.log(
    `   ⚠ Types non mappés (${result.report.unmappedBlockTypes.length}) : ${result.report.unmappedBlockTypes.slice(0, 8).join(", ")}${result.report.unmappedBlockTypes.length > 8 ? "…" : ""}`,
  );
}
if (result.report.skippedBlockTypes.length > 0) {
  console.log(
    `   ⊘ Ignorés : ${[...new Set(result.report.skippedBlockTypes)].join(", ")}`,
  );
}
for (const w of result.report.warnings) {
  console.log(`   ℹ ${w}`);
}
