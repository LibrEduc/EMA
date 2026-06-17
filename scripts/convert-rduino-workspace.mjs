#!/usr/bin/env node
/**
 * Convertit une sauvegarde Blockly@rduino (XML / .B@) en workspace JSON µcBlockly.
 *
 * Usage :
 *   npm run convert-rduino -- <fichier-entree> [fichier-sortie.json]
 *   node scripts/convert-rduino-workspace.mjs examples/blink.xml out.json
 *
 * Entrée : .xml, .B@ ou tout fichier XML Blockly@rduino (export « enregistrer projet »).
 * Sortie : JSON chargeable via « Ouvrir » dans µcBlockly (workspace.json).
 *
 * Limites :
 * - Blocs extensions (Grove, mBot, TechnoZone, etc.) sans entrée dans la table de
 *   correspondance sont conservés sous leur nom d'origine (peuvent ne pas charger).
 * - Les blocs « définitions » orange (base_define_bloc) sont dépliés en blocs racine.
 * - Les piles sans setup/loop sont enveloppées dans board_base_setup_loop (corps loop).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { convertRduinoXmlToUcbJson } from "./lib/rduino-xml-to-ucb-json.mjs";

function printUsage() {
  console.log(`Usage: node scripts/convert-rduino-workspace.mjs <input.xml|.B@> [output.json]

Convertit une sauvegarde Blockly@rduino en workspace JSON µcBlockly.

Options via variables d'environnement :
  UCB_NO_WRAP=1   Ne pas envelopper les blocs orphelins dans setup/loop
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
