/**
 * @license GPL-3.0-or-later
 * Unit tests for Arduino generators.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import { ArduinoGenerator } from "../src/generators/arduino/arduino_generator";
import { controls_forEach } from "../src/generators/arduino/blocks/loops";
import { math_number } from "../src/generators/arduino/blocks/math";
import { getListVariableOutputCheck, inferConnectedValueType, } from "../src/categories/blockly/shared";
import { isArrayAssignmentValueBlock, isArrayValueBlock, } from "../src/generators/arduino/variable_scope";
import { LIST_VARIABLE_TYPE, tagVariableAsList, } from "../src/generators/arduino/variable_utils";
test("math_number génère un littéral entier", () => {
    const block = {
        getFieldValue: (name) => (name === "NUM" ? "42" : ""),
    };
    const [code] = math_number(block);
    assert.equal(code, "42");
});
test("controls_forEach génère une boucle indexée sur sizeof", () => {
    const generator = new ArduinoGenerator();
    generator.getVariableName = (name) => name;
    generator.valueToCode = () => "myList";
    generator.statementToCode = () => "  digitalWrite(LED_BUILTIN, HIGH);\n";
    generator.addLoopTrap = (branch) => branch;
    const block = {
        getFieldValue: (name) => (name === "VAR" ? "element" : ""),
    };
    const code = controls_forEach(block, generator);
    assert.match(code, /auto \w+ = myList;/);
    assert.match(code, /sizeof\(\w+\) \/ sizeof\(\w+\[0\]\)/);
    assert.match(code, /element = \w+\[/);
    assert.match(code, /digitalWrite\(LED_BUILTIN, HIGH\)/);
});
test("getListVariableOutputCheck expose le type Blockly Array", () => {
    assert.deepEqual(getListVariableOutputCheck(), ["Array"]);
});
test("isArrayValueBlock reconnaît les littéraux de liste", () => {
    assert.equal(isArrayValueBlock({ type: "Array_list_literal" }), true);
    assert.equal(isArrayValueBlock({ type: "Array_list_3" }), true);
    assert.equal(isArrayValueBlock({ type: "math_number" }), false);
    assert.equal(isArrayValueBlock(null), false);
});
test("isArrayAssignmentValueBlock inclut variables_local + littéral", () => {
    const literal = { type: "Array_list_literal" };
    const local = {
        type: "variables_local",
        getInputTargetBlock: (name) => (name === "VALUE" ? literal : null),
    };
    assert.equal(isArrayAssignmentValueBlock(literal), true);
    assert.equal(isArrayAssignmentValueBlock(local), true);
    assert.equal(isArrayAssignmentValueBlock({ type: "math_number" }), false);
});
test("tagVariableAsList et inferConnectedValueType sur workspace Blockly", () => {
    const workspace = new Blockly.Workspace();
    const variable = workspace.createVariable("maListe", LIST_VARIABLE_TYPE);
    tagVariableAsList(variable);
    assert.equal(variable.getType(), LIST_VARIABLE_TYPE);
    const literal = { type: "Array_list_literal" };
    assert.equal(inferConnectedValueType(literal), LIST_VARIABLE_TYPE);
    workspace.dispose();
});
