/**
 * @license GPL-3.0-or-later
 * Unit tests for Arduino generators.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import { ArduinoGenerator } from "../src/generators/arduino/arduino_generator";
import { controls_forEach } from "../src/generators/arduino/blocks/loops";
import { controls_switch } from "../src/generators/arduino/blocks/logic";
import { Array_with } from "../src/generators/arduino/blocks/array";
import { math_number } from "../src/generators/arduino/blocks/math";
import { resolveArduinoScalarVariableType } from "../src/generators/arduino/block_types";
import {
  getListVariableOutputCheck,
  inferConnectedValueType,
} from "../src/categories/blockly/shared";
import {
  isArrayAssignmentValueBlock,
  isArrayValueBlock,
} from "../src/generators/arduino/variable_scope";
import {
  LIST_VARIABLE_TYPE,
  tagVariableAsList,
} from "../src/generators/arduino/variable_utils";
import type { Block } from "blockly/core";

test("controls_switch sans branche default ne génère pas default:", () => {
  const generator = new ArduinoGenerator();
  generator.getVariableName = (name: string) => name;
  generator.valueToCode = (_block, name) => (name === "CASE0" ? "1" : "");
  generator.statementToCode = (block, name) =>
    name === "DO0" ? "  pinMode(LED_BUILTIN, OUTPUT);\n" : "";
  const block = {
    casebreakCount_: 0,
    getFieldValue: (name: string) => (name === "SWVAR" ? "mode" : ""),
    getInputTargetBlock: () => null,
  } as unknown as Block;
  const code = controls_switch(block, generator);
  assert.match(code, /switch \(mode\)/);
  assert.match(code, /case 1:/);
  assert.doesNotMatch(code, /default:/);
});

test("controls_switch avec branche default génère default:", () => {
  const generator = new ArduinoGenerator();
  generator.getVariableName = (name: string) => name;
  generator.valueToCode = (_block, name) => (name === "CASE0" ? "0" : "");
  generator.statementToCode = (block, name) => {
    if (name === "DO0") return "  digitalWrite(LED_BUILTIN, HIGH);\n";
    if (name === "DEFAULT") return "  digitalWrite(LED_BUILTIN, LOW);\n";
    return "";
  };
  const block = {
    casebreakCount_: 0,
    getFieldValue: (name: string) => (name === "SWVAR" ? "valeur" : ""),
    getInputTargetBlock: (name: string) => (name === "DEFAULT" ? {} : null),
  } as unknown as Block;
  const code = controls_switch(block, generator);
  assert.match(code, /default:\n  digitalWrite\(LED_BUILTIN, LOW\)/);
});

test("Array_with sans éléments ne génère pas int item[] = {0, 0}", () => {
  const generator = new ArduinoGenerator();
  generator.getVariableName = (name: string) => name;
  const block = {
    getFieldValue: (name: string) => (name === "VAR" ? "item" : ""),
    getInput: (name: string) => (name === "ADD0" ? {} : null),
    getInputTargetBlock: () => null,
  } as unknown as Block;
  const code = Array_with(block, generator);
  assert.match(code, /connect values to determine list type/i);
  assert.doesNotMatch(code, /\{0,\s*0\}/);
  assert.doesNotMatch(code, /int item\[\]/);
});

test("math_number génère un littéral entier", () => {
  const block = {
    getFieldValue: (name: string) => (name === "NUM" ? "42" : ""),
  } as Block;
  const [code] = math_number(block);
  assert.equal(code, "42");
});

test("controls_forEach génère une boucle indexée sur sizeof", () => {
  const generator = new ArduinoGenerator();
  generator.getVariableName = (name: string) => name;
  generator.statementToCode = () => "  digitalWrite(LED_BUILTIN, HIGH);\n";
  generator.addLoopTrap = (branch: string) => branch;

  const block = {
    getFieldValue: (name: string) => {
      if (name === "VAR") return "element";
      if (name === "LIST") return "myList";
      return "";
    },
  } as Block;

  const code = controls_forEach(block, generator);
  assert.match(code, /sizeof\(myList\) \/ sizeof\(myList\[0\]\)/);
  assert.match(code, /element = myList\[/);
  assert.match(code, /digitalWrite\(LED_BUILTIN, HIGH\)/);
  assert.doesNotMatch(code, /auto \w+ =/);
});

test("getListVariableOutputCheck expose __NO_TYPE__ pour les variables list", () => {
  assert.equal(getListVariableOutputCheck(), "__NO_TYPE__");
});

test("isArrayValueBlock reconnaît les littéraux de liste", () => {
  assert.equal(isArrayValueBlock({ type: "Array_list_literal" } as Block), true);
  assert.equal(isArrayValueBlock({ type: "Array_list_3" } as Block), true);
  assert.equal(isArrayValueBlock({ type: "math_number" } as Block), false);
  assert.equal(isArrayValueBlock(null), false);
});

test("isArrayAssignmentValueBlock inclut variables_local + littéral", () => {
  const literal = { type: "Array_list_literal" } as Block;
  const local = {
    type: "variables_local",
    getInputTargetBlock: (name: string) => (name === "VALUE" ? literal : null),
  } as unknown as Block;
  assert.equal(isArrayAssignmentValueBlock(literal), true);
  assert.equal(isArrayAssignmentValueBlock(local), true);
  assert.equal(isArrayAssignmentValueBlock({ type: "math_number" } as Block), false);
});

test("resolveArduinoScalarVariableType ignore le type Blockly list", () => {
  assert.equal(resolveArduinoScalarVariableType("list"), null);
  assert.equal(resolveArduinoScalarVariableType("int"), "int");
  assert.equal(resolveArduinoScalarVariableType("__NO_TYPE__"), null);
});

test("tagVariableAsList et inferConnectedValueType sur workspace Blockly", () => {
  const workspace = new Blockly.Workspace();
  const variable = workspace.getVariableMap().createVariable("maListe", LIST_VARIABLE_TYPE);
  tagVariableAsList(variable);
  assert.equal(variable.getType(), LIST_VARIABLE_TYPE);

  const literal = { type: "Array_list_literal" } as Block;
  assert.equal(inferConnectedValueType(literal), LIST_VARIABLE_TYPE);

  workspace.dispose();
});
