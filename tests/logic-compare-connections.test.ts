import assert from "node:assert/strict";
import { test } from "node:test";
import * as Blockly from "blockly";
import "blockly/blocks";
import { configureStandardBlocks } from "../src/generators/arduino/configure_standard_blocks.ts";

const loadCompare = (
  op: string,
  inputs?: {
    A?: { type: string; fields?: Record<string, string | number> };
    B?: { type: string; fields?: Record<string, string | number> };
  },
): Blockly.Block => {
  configureStandardBlocks();
  const workspace = new Blockly.Workspace();
  const blockInputs: Record<string, unknown> = {};
  if (inputs?.A) {
    blockInputs.A = {
      block: {
        type: inputs.A.type,
        id: "a",
        fields: inputs.A.fields ?? {},
      },
    };
  }
  if (inputs?.B) {
    blockInputs.B = {
      block: {
        type: inputs.B.type,
        id: "b",
        fields: inputs.B.fields ?? {},
      },
    };
  }
  Blockly.serialization.workspaces.load(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: "logic_compare",
            id: "cmp",
            x: 0,
            y: 0,
            fields: { OP: op },
            inputs: blockInputs,
          },
        ],
      },
    },
    workspace,
  );
  const cmp = workspace.getBlockById("cmp");
  assert.ok(cmp);
  // Serialization may not run onchange; trigger sync explicitly.
  cmp.onchange?.(new Blockly.Events.BlockChange(cmp, "field", "OP", op, op));
  return cmp;
};

test("logic_compare LT restricts to Number/int/float", () => {
  const cmp = loadCompare("LT");
  assert.deepEqual(cmp.getInput("A")?.connection?.getCheck(), [
    "Number",
    "int",
    "float",
  ]);
  assert.deepEqual(cmp.getInput("B")?.connection?.getCheck(), [
    "Number",
    "int",
    "float",
  ]);
});

test("logic_compare EQ with no operands accepts any type", () => {
  const cmp = loadCompare("EQ");
  assert.equal(cmp.getInput("A")?.connection?.getCheck(), null);
  assert.equal(cmp.getInput("B")?.connection?.getCheck(), null);
});

test("logic_compare EQ with boolean A constrains B to bool", () => {
  const cmp = loadCompare("EQ", {
    A: { type: "logic_boolean", fields: { BOOL: "TRUE" } },
  });
  assert.equal(cmp.getInputTargetBlock("A")?.type, "logic_boolean");
  const bChecks = cmp.getInput("B")?.connection?.getCheck() ?? [];
  assert.ok(bChecks.includes("Boolean") || bChecks.includes("bool"));
  assert.equal(cmp.getInput("A")?.connection?.getCheck(), null);
});

test("logic_compare EQ keeps matching math_number pair", () => {
  const cmp = loadCompare("EQ", {
    A: { type: "math_number", fields: { NUM: 1 } },
    B: { type: "math_number", fields: { NUM: 2 } },
  });
  assert.equal(cmp.getInputTargetBlock("A")?.type, "math_number");
  assert.equal(cmp.getInputTargetBlock("B")?.type, "math_number");
  const checks = cmp.getInput("A")?.connection?.getCheck() ?? [];
  assert.ok(checks.includes("Number") || checks.includes("int"));
});

test("logic_compare EQ disconnects mismatched B when A is boolean", () => {
  configureStandardBlocks();
  const workspace = new Blockly.Workspace();
  const cmp = workspace.newBlock("logic_compare");
  cmp.setFieldValue("EQ", "OP");
  cmp.onchange?.(new Blockly.Events.BlockChange(cmp, "field", "OP", "EQ", "EQ"));

  const boolBlock = workspace.newBlock("logic_boolean");
  boolBlock.setFieldValue("TRUE", "BOOL");
  cmp.getInput("A")!.connection!.connect(boolBlock.outputConnection!);
  cmp.onchange?.(
    new Blockly.Events.BlockMove(boolBlock),
  );

  assert.equal(cmp.getInputTargetBlock("A")?.type, "logic_boolean");
  const bChecks = cmp.getInput("B")?.connection?.getCheck() ?? [];
  assert.ok(bChecks.includes("Boolean") || bChecks.includes("bool"));

  const numberBlock = workspace.newBlock("math_number");
  numberBlock.setFieldValue(1, "NUM");
  // Force-connect ignoring checks to simulate a stale pair, then sync.
  const bConn = cmp.getInput("B")!.connection!;
  const prevCheck = bConn.getCheck();
  bConn.setCheck(null);
  bConn.connect(numberBlock.outputConnection!);
  bConn.setCheck(prevCheck);
  cmp.onchange?.(new Blockly.Events.BlockMove(numberBlock));

  assert.equal(cmp.getInputTargetBlock("A")?.type, "logic_boolean");
  assert.equal(cmp.getInputTargetBlock("B"), null);
});

test("logic_compare switching EQ bool to LT disconnects non-numeric", () => {
  const cmp = loadCompare("EQ", {
    A: { type: "logic_boolean", fields: { BOOL: "TRUE" } },
  });
  cmp.setFieldValue("LT", "OP");
  cmp.onchange?.(new Blockly.Events.BlockChange(cmp, "field", "OP", "EQ", "LT"));
  assert.equal(cmp.getInputTargetBlock("A"), null);
  assert.deepEqual(cmp.getInput("A")?.connection?.getCheck(), [
    "Number",
    "int",
    "float",
  ]);
});
