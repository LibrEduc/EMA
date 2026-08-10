import assert from "node:assert/strict";
import { test } from "node:test";
import * as Blockly from "blockly";
import "blockly/blocks";
import { setVariableType } from "../src/generators/arduino/variable_utils.ts";
import { math_change } from "../src/generators/arduino/blocks/math.ts";
import { ArduinoGenerator } from "../src/generators/arduino/arduino_generator.ts";
import {
  isMathChangeCompatibleVariableType,
  resolveMathChangeVariableId,
} from "../src/categories/blockly/shared_numeric.ts";
import {
  getTypeMismatchWarningText,
  inferRequiredNumericTypeForVariable,
  shouldSkipVariableChange,
} from "../src/categories/blockly/shared.ts";
import type { Block } from "blockly/core";

/**
 * Minimal math_change registration for tests (avoids importing field-slider via math.ts).
 */
const ensureMathChangeBlock = (): void => {
  Blockly.Blocks["math_change"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VAR")
        .setCheck(["Number", "int", "float", "long"])
        .appendField("change");
      this.appendValueInput("DELTA").setCheck(["Number", "int", "float"]);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      const variableId = resolveMathChangeVariableId(this);
      if (!variableId || !this.workspace) {
        return;
      }
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      const varType = variable.getType();
      if (!isMathChangeCompatibleVariableType(varType)) {
        const varConnection = this.getInput("VAR")?.connection;
        if (varConnection?.isConnected()) {
          varConnection.disconnect();
        }
        this.setWarningText(
          getTypeMismatchWarningText(
            varType,
            inferRequiredNumericTypeForVariable(this.workspace, variableId) || "int",
          ),
        );
      }
    },
  };
};

const loadMathChangeWorkspace = (): {
  workspace: Blockly.Workspace;
  change: Blockly.Block;
  variableId: string;
} => {
  ensureMathChangeBlock();
  const workspace = new Blockly.Workspace();
  const variable = workspace.getVariableMap().createVariable("toto");
  Blockly.serialization.workspaces.load(
    {
      variables: [
        {
          name: "toto",
          id: variable.getId(),
          type: variable.getType(),
        },
      ],
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: "math_change",
            id: "chg",
            x: 0,
            y: 0,
            inputs: {
              VAR: {
                block: {
                  type: "variables_get",
                  id: "get",
                  fields: { VAR: { id: variable.getId() } },
                },
              },
              DELTA: {
                shadow: {
                  type: "math_number",
                  id: "delta",
                  fields: { NUM: 1 },
                },
              },
            },
          },
        ],
      },
    },
    workspace,
  );
  const change = workspace.getBlockById("chg");
  assert.ok(change);
  return { workspace, change, variableId: variable.getId() };
};

test("math_change VAR input only accepts numeric checks", () => {
  ensureMathChangeBlock();
  const workspace = new Blockly.Workspace();
  const change = workspace.newBlock("math_change");
  assert.deepEqual(change.getInput("VAR")?.connection?.getCheck(), [
    "Number",
    "int",
    "float",
    "long",
  ]);
  workspace.dispose();
});

test("isMathChangeCompatibleVariableType rejects String", () => {
  assert.equal(isMathChangeCompatibleVariableType("String"), false);
  assert.equal(isMathChangeCompatibleVariableType("string"), false);
  assert.equal(isMathChangeCompatibleVariableType("int"), true);
  assert.equal(isMathChangeCompatibleVariableType("__NO_TYPE__"), true);
});

test("math_change onchange disconnects non-numeric variable", () => {
  const { workspace, change, variableId } = loadMathChangeWorkspace();
  const variable = workspace.getVariableMap().getVariableById(variableId);
  assert.ok(variable);
  setVariableType(variable, "string");
  assert.ok(change.getInput("VAR")?.connection?.isConnected());
  change.onchange?.(
    new Blockly.Events.BlockChange(change, "field", "VAR", null, null),
  );
  assert.equal(change.getInput("VAR")?.connection?.isConnected(), false);
  workspace.dispose();
});

test("math_change generator skips String += delta", () => {
  const { workspace, change, variableId } = loadMathChangeWorkspace();
  const variable = workspace.getVariableMap().getVariableById(variableId);
  assert.ok(variable);
  setVariableType(variable, "string");
  const generator = new ArduinoGenerator();
  generator.valueToCode = (_block, name) => {
    if (name === "VAR" || name === "NAME") {
      return "toto";
    }
    if (name === "DELTA") {
      return "1";
    }
    return "";
  };
  const code = math_change(change as Block, generator);
  assert.equal(code, "");
  workspace.dispose();
});
