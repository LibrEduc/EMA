/**
 * @license GPL-3.0-or-later
 * Unit tests for Instances / FieldInstance infrastructure.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import {
  FieldInstance,
  Instances,
  allInstancesOf,
  convertToUniqueName,
  convertToUniqueNameBlock,
  findInstanceNameCollision,
  findVariableNameCollision,
  generateUniqueName,
  isInstancePresent,
  registerUcBlocklyInstances,
  renameInstance,
} from "../src/instances";
import { mergeInstanceMessages } from "../src/instances/messages";
import { patchVariableMapCreateVariable } from "../src/blockly_patches";

function defineTestBlocks(): void {
  registerUcBlocklyInstances();
  mergeInstanceMessages("en");

  Blockly.Blocks["test_instance_attach"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new FieldInstance("Servo", "SERVO", false, true, true),
        "NAME",
      );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    },
  };
  Blockly.Blocks["test_instance_use"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        new FieldInstance("Servo", "SERVO", false, true, true),
        "NAME",
      );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    },
  };
}

test("generateUniqueName starts at i on empty workspace", () => {
  const workspace = new Blockly.Workspace();
  assert.equal(generateUniqueName(workspace), "i");
  workspace.dispose();
});

test("allInstancesOf lists FieldInstance names by type", () => {
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("brasGauche");
  const use = workspace.newBlock("test_instance_use");
  use.getField("NAME")?.setValue("brasGauche");

  assert.deepEqual(allInstancesOf("Servo", workspace).sort(), ["brasGauche"]);
  assert.deepEqual(Instances.allInstances(workspace), ["brasGauche"]);
  workspace.dispose();
});

test("isInstancePresent detects config block from usage block", () => {
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("SERVO");
  const use = workspace.newBlock("test_instance_use");
  use.getField("NAME")?.setValue("SERVO");

  assert.equal(isInstancePresent("SERVO", "Servo", use), true);
  assert.equal(isInstancePresent("missing", "Servo", use), false);
  workspace.dispose();
});

test("renameInstance renames all matching fields", () => {
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("oldName");
  const use = workspace.newBlock("test_instance_use");
  use.getField("NAME")?.setValue("oldName");

  renameInstance("oldName", "newName", "Servo", workspace);

  assert.equal(attach.getFieldValue("NAME"), "newName");
  assert.equal(use.getFieldValue("NAME"), "newName");
  workspace.dispose();
});

test("convertToUniqueNameBlock suffixes when name already used", () => {
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  const first = workspace.newBlock("test_instance_attach");
  first.getField("NAME")?.setValue("servo");
  const second = workspace.newBlock("test_instance_attach");
  const unique = convertToUniqueNameBlock("servo", second);
  assert.equal(unique, "servo_1");
  workspace.dispose();
});

test("convertToUniqueName suffixes when variable already uses the name", () => {
  registerUcBlocklyInstances();
  const workspace = new Blockly.Workspace();
  workspace.getVariableMap().createVariable("SERVO", "");
  const unique = convertToUniqueName("SERVO", workspace);
  assert.equal(unique, "SERVO_1");
  workspace.dispose();
});

test("findVariableNameCollision / findInstanceNameCollision are reciprocal", () => {
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  workspace.getVariableMap().createVariable("item", "");
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("SERVO");

  assert.equal(findVariableNameCollision("item", workspace), "item");
  assert.equal(findVariableNameCollision("ITEM", workspace), "item");
  assert.equal(findVariableNameCollision("SERVO", workspace), null);
  assert.equal(findInstanceNameCollision("SERVO", workspace), "SERVO");
  assert.equal(findInstanceNameCollision("servo", workspace), "SERVO");
  assert.equal(findInstanceNameCollision("item", workspace), null);
  workspace.dispose();
});

test("VariableMap.createVariable auto-suffixes on instance collision", () => {
  registerUcBlocklyInstances();
  const workspace = new Blockly.Workspace();
  patchVariableMapCreateVariable(workspace);
  defineTestBlocks();
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("SERVO");
  const variable = workspace.getVariableMap().createVariable("SERVO", "");
  assert.equal(variable.getName(), "SERVO_1");
  workspace.dispose();
});

test("VariableMap.renameVariable alerts and keeps name on instance collision", () => {
  registerUcBlocklyInstances();
  mergeInstanceMessages("en");
  const workspace = new Blockly.Workspace();
  patchVariableMapCreateVariable(workspace);
  defineTestBlocks();
  const attach = workspace.newBlock("test_instance_attach");
  attach.getField("NAME")?.setValue("SERVO");
  const variable = workspace.getVariableMap().createVariable("item", "");

  let alerted = "";
  const originalAlert = Blockly.dialog.alert;
  Blockly.dialog.alert = (message, _callback) => {
    alerted = String(message);
    // Do not invoke callback (would re-open rename prompt).
  };
  try {
    workspace.getVariableMap().renameVariable(variable, "SERVO");
    assert.equal(variable.getName(), "item");
    assert.match(alerted, /SERVO/);
  } finally {
    Blockly.dialog.alert = originalAlert;
  }
  workspace.dispose();
});

test("Block.prototype.getInstances is installed", () => {
  registerUcBlocklyInstances();
  defineTestBlocks();
  const workspace = new Blockly.Workspace();
  const block = workspace.newBlock("test_instance_attach");
  block.getField("NAME")?.setValue("X");
  const withApi = block as Blockly.Block & {
    getInstances?: (t?: string) => string[];
  };
  assert.ok(typeof withApi.getInstances === "function");
  assert.deepEqual(withApi.getInstances!("Servo"), ["X"]);
  workspace.dispose();
});
