/**
 * @license GPL-3.0-or-later
 * Tests du convertisseur Blockly@rduino → µcBlockly.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { convertRduinoXmlToUcbJson } from "../scripts/lib/rduino-xml-to-ucb-json.mjs";

const RDUINO_EXAMPLES = resolve(
  import.meta.dirname,
  "../../Blockly-at-rduino/examples",
);

test("blink.xml : LED + delay → board_base_* enveloppé dans setup/loop", () => {
  const xml = readFileSync(resolve(RDUINO_EXAMPLES, "blink/blink.xml"), "utf8");
  const { workspace, report } = convertRduinoXmlToUcbJson(xml);
  const top = workspace.blocks.blocks;
  assert.equal(top.length, 1);
  assert.equal(top[0].type, "board_base_setup_loop");
  const loopRoot = top[0].inputs?.LOOP?.block;
  assert.equal(loopRoot?.type, "board_base_inout_buildin_led");
  assert.equal(loopRoot?.fields?.STAT, "HIGH");
  assert.equal(loopRoot?.next?.block?.type, "board_base_time_delay");
  assert.equal(report.blockCount, 7);
  assert.equal(report.unmappedBlockTypes.length, 0);
});

test("analogique.xml : série + loop conservés", () => {
  const xml = readFileSync(
    resolve(RDUINO_EXAMPLES, "analogique/analogique.xml"),
    "utf8",
  );
  const { workspace } = convertRduinoXmlToUcbJson(xml);
  const types = workspace.blocks.blocks.map((b) => b.type);
  assert.ok(types.includes("board_base_loop"));
  const loop = workspace.blocks.blocks.find((b) => b.type === "board_base_loop");
  const chain = loop?.inputs?.LOOP?.block;
  assert.equal(chain?.type, "board_serial_write");
});

test("Starter_Kit_prj7 : setup_loop DO→SETUP et serial_init→board_serial_begin", () => {
  const xml = readFileSync(
    resolve(RDUINO_EXAMPLES, "Starter_Kit/Starter_Kit_prj7/Starter_Kit_prj7.xml"),
    "utf8",
  );
  const { workspace } = convertRduinoXmlToUcbJson(xml);
  const hat = workspace.blocks.blocks.find(
    (b) => b.type === "board_base_setup_loop",
  );
  assert.ok(hat);
  assert.equal(hat.inputs?.SETUP?.block?.type, "board_serial_begin");
  assert.equal(hat.inputs?.SETUP?.block?.fields?.BAUD, "9600");
  assert.ok(workspace.variables.some((v) => v.name === "keyVal"));
});
