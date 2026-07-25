import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as Blockly from "blockly";
import {
  claimVariableDeclaration,
  INSTANCE_VARIABLE_TYPE,
  isInstanceVariableType,
  isVariableDeclarationOwner,
  LIST_DEFAULT_VARIABLE_NAME,
  LIST_VARIABLE_TYPE,
  releaseVariableDeclaration,
} from "../src/generators/arduino/variable_utils.ts";
import {
  isPrimaryListDeclarationBlock,
} from "../src/generators/arduino/block_types_registry.ts";
import { Array_bitmap } from "../src/generators/arduino/blocks/array.ts";
import { ArduinoGenerator } from "../src/generators/arduino/arduino_generator.ts";

describe("list declaration ownership (const-like)", () => {
  it("claimVariableDeclaration blocks a second owner", () => {
    const workspace = new Blockly.Workspace();
    Blockly.Blocks["Array_with"] = {
      init() {
        this.appendDummyInput().appendField(
          new Blockly.FieldVariable("item", undefined, null, LIST_VARIABLE_TYPE),
          "VAR",
        );
      },
    };
    const variable = workspace
      .getVariableMap()
      .createVariable(LIST_DEFAULT_VARIABLE_NAME, LIST_VARIABLE_TYPE);
    const owner = workspace.newBlock("Array_with");
    owner.setFieldValue(variable.getId(), "VAR");
    assert.equal(claimVariableDeclaration(variable, owner.id), "claimed");
    assert.equal(claimVariableDeclaration(variable, owner.id), "already_owner");
    assert.equal(claimVariableDeclaration(variable, "block-b"), "owned_by_other");
    assert.equal(isVariableDeclarationOwner(variable, owner.id), true);
    assert.equal(isVariableDeclarationOwner(variable, "block-b"), false);
    releaseVariableDeclaration(variable, owner.id);
    assert.equal(claimVariableDeclaration(variable, "block-b"), "claimed");
    workspace.dispose();
    delete Blockly.Blocks["Array_with"];
  });

  it("stale owner id is reclaimable after block deletion", () => {
    const workspace = new Blockly.Workspace();
    const variable = workspace
      .getVariableMap()
      .createVariable("item", LIST_VARIABLE_TYPE);
    (variable as { __ucbDeclareBlockId?: string }).__ucbDeclareBlockId =
      "deleted-block";
    assert.equal(claimVariableDeclaration(variable, "fresh"), "claimed");
    workspace.dispose();
  });

  it("only declaration owner emits Array_bitmap code", () => {
    const workspace = new Blockly.Workspace();
    Blockly.Blocks["Array_with"] = {
      init() {
        this.appendDummyInput().appendField(
          new Blockly.FieldVariable("item", undefined, null, LIST_VARIABLE_TYPE),
          "VAR",
        );
      },
    };
    Blockly.Blocks["Array_bitmap"] = {
      init() {
        this.appendDummyInput().appendField(
          new Blockly.FieldVariable("item", undefined, null, LIST_VARIABLE_TYPE),
          "VAR",
        );
      },
    };
    const listVar = workspace
      .getVariableMap()
      .createVariable("item", LIST_VARIABLE_TYPE);
    const withBlock = workspace.newBlock("Array_with");
    withBlock.setFieldValue(listVar.getId(), "VAR");
    claimVariableDeclaration(listVar, withBlock.id);

    const bitmapBlock = workspace.newBlock("Array_bitmap");
    bitmapBlock.setFieldValue(listVar.getId(), "VAR");
    (bitmapBlock as Blockly.Block).getFieldValue = ((name: string) => {
      if (name === "VAR") return listVar.getId();
      if (name === "COLS") return 2;
      if (name === "ROWS") return 2;
      if (name === "BITMAP") return [[0, 1], [1, 0]];
      return null;
    }) as Blockly.Block["getFieldValue"];

    assert.equal(isPrimaryListDeclarationBlock(withBlock), true);
    assert.equal(isPrimaryListDeclarationBlock(bitmapBlock), false);

    const generator = new ArduinoGenerator();
    generator.getVariableName = () => "item";
    let declared = false;
    generator.addArrayDeclaration = () => {
      declared = true;
    };
    generator.addVariable = () => {};
    assert.equal(Array_bitmap(bitmapBlock, generator), "");
    assert.equal(declared, false);

    workspace.dispose();
    delete Blockly.Blocks["Array_with"];
    delete Blockly.Blocks["Array_bitmap"];
  });

  it("exposes instance as a third variable kind", () => {
    assert.equal(isInstanceVariableType(INSTANCE_VARIABLE_TYPE), true);
    assert.equal(isInstanceVariableType(LIST_VARIABLE_TYPE), false);
  });
});
