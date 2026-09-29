/**
 * @license AGPL-3.0-or-later
 * Smoke test: ephemeral "add a block" pipeline (UI + generator + workspaceToCode).
 * Documents the beginner path in docs/TUTORIEL_MICRO_BLOC.md.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import { ArduinoGenerator } from "../src/generators/arduino/arduino_generator";
import { Order } from "../src/generators/arduino/order";
import type { Block } from "blockly/core";

const SMOKE_TYPE = "ucb_smoke_double";
const SMOKE_NUM = "ucb_smoke_number";

test("smoke micro-bloc: définition + générateur → code contient * 2", () => {
  Blockly.Blocks[SMOKE_NUM] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(0), "NUM");
      this.setOutput(true, "Number");
    },
  };
  Blockly.Blocks[SMOKE_TYPE] = {
    init(this: Blockly.Block) {
      this.appendValueInput("NUM").setCheck("Number").appendField("double");
      this.setOutput(true, "Number");
      this.setStyle("math_blocks");
    },
  };

  const generator = new ArduinoGenerator();
  generator.forBlock[SMOKE_NUM] = (block: Block): [string, number] => [
    String(block.getFieldValue("NUM") ?? "0"),
    Order.ATOMIC,
  ];
  generator.forBlock[SMOKE_TYPE] = (
    block: Block,
    gen: ArduinoGenerator,
  ): [string, number] => {
    const num = gen.valueToCode(block, "NUM", Order.NONE) || "0";
    return [`((${num}) * 2)`, Order.MULTIPLICATION];
  };

  const workspace = new Blockly.Workspace();
  generator.init(workspace);

  const block = workspace.newBlock(SMOKE_TYPE);
  const numBlock = workspace.newBlock(SMOKE_NUM);
  numBlock.setFieldValue("21", "NUM");
  block.getInput("NUM")!.connection!.connect(numBlock.outputConnection!);

  const expr = generator.blockToCode(block);
  const code = Array.isArray(expr) ? expr[0] : String(expr);
  assert.match(code, /\* 2/);
  assert.match(code, /21/);

  workspace.dispose();
  delete Blockly.Blocks[SMOKE_TYPE];
  delete Blockly.Blocks[SMOKE_NUM];
});

test("smoke board_profiles: arduino_uno exposé après découpage familles", async () => {
  const { BOARD_PROFILES, DEFAULT_BOARD_ID } = await import(
    "../src/board_profiles/index.ts"
  );
  assert.equal(DEFAULT_BOARD_ID, "none");
  assert.ok(BOARD_PROFILES.arduino_uno);
  assert.equal(BOARD_PROFILES.arduino_uno.description, "Arduino Uno");
  assert.ok(
    (BOARD_PROFILES.arduino_uno.digital as readonly string[]).includes("13"),
  );
  assert.ok(BOARD_PROFILES.esp32);
  assert.ok(BOARD_PROFILES["pi-pico"]);
});
