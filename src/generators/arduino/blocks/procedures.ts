/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino code for procedure blocks.
 */

import * as Blockly from "blockly";
import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

type ProcedureParameter = { getName: () => string };
type ProcedureModelLike = {
  getName?: () => string;
  getParameters?: () => ProcedureParameter[];
  getReturnTypes?: () => string[] | null;
};
type ProcedureBlockLike = Block & {
  getProcedureModel?: () => ProcedureModelLike | null;
  getVars?: () => string[] | null;
};

function getProcedureName(
  block: Block,
  generator: ArduinoGenerator,
): string {
  const model = (block as ProcedureBlockLike).getProcedureModel?.();
  const rawName = model?.getName?.() || block.getFieldValue("NAME") || "";
  if (generator.nameDB_) {
    return generator.nameDB_.getName(
      rawName,
      Blockly.Names.NameType.PROCEDURE,
    );
  }
  return rawName;
}

function getProcedureParams(block: Block, generator: ArduinoGenerator): string[] {
  let paramNames: string[] = [];
  const vars = (block as ProcedureBlockLike).getVars?.();
  if (Array.isArray(vars)) {
    paramNames = vars.filter(Boolean);
  } else {
    const model = (block as ProcedureBlockLike).getProcedureModel?.();
    if (model?.getParameters) {
      paramNames = model.getParameters().map((param) => param.getName());
    }
  }

  if (generator.nameDB_) {
    return paramNames.map((name) =>
      generator.nameDB_!.getName(name, Blockly.Names.NameType.VARIABLE),
    );
  }
  return paramNames;
}

function mapBlocklyTypeToArduino(type: string): string {
  if (type === "Boolean" || type === "bool") return "bool";
  if (type === "String" || type === "string") return "String";
  if (type === "Number" || type === "number") return "int";
  return type;
}

function getReturnType(block: Block): string {
  const returnBlock = block.getInputTargetBlock("RETURN");
  if (returnBlock) {
    const blockDef = returnBlock as Blockly.Block & { getBlockType?: () => string | null };
    const rawType = blockDef.getBlockType ? blockDef.getBlockType() : null;
    if (rawType && rawType !== "__NO_TYPE__") {
      return mapBlocklyTypeToArduino(rawType);
    }
    if (returnBlock.type === "variables_get_dynamic" || returnBlock.type === "variables_get") {
      const variableId = returnBlock.getFieldValue("VAR");
      if (variableId && returnBlock.workspace) {
        const variable = returnBlock.workspace.getVariableMap().getVariableById(variableId);
        const varType = variable?.getType();
        if (varType) {
          return mapBlocklyTypeToArduino(varType);
        }
      }
    }
    if (returnBlock.outputConnection) {
      const check = returnBlock.outputConnection.getCheck();
      const checkType = Array.isArray(check) ? check[0] : check;
      if (checkType) {
        return mapBlocklyTypeToArduino(checkType);
      }
    }
  }

  const model = (block as ProcedureBlockLike).getProcedureModel?.();
  const returnTypes: string[] | null | undefined = model?.getReturnTypes?.();
  if (returnTypes && returnTypes.length > 0) {
    if (returnTypes.includes("bool")) return "bool";
    if (returnTypes.includes("float")) return "float";
    if (returnTypes.includes("int")) return "int";
    if (returnTypes.includes("string")) return "String";
    if (returnTypes.includes("char")) return "char";
  }
  return "int";
}

function setProcedureDefinition(
  generator: ArduinoGenerator,
  funcName: string,
  code: string,
): void {
  generator.addUserFunction("function_" + funcName, code);
}

export function procedures_defreturn(
  block: Block,
  generator: ArduinoGenerator,
): null {
  // Define a procedure with return value.
  const funcName = getProcedureName(block, generator);
  const params = getProcedureParams(block, generator);
  const args = params.map((name) => "int " + name).join(", ");
  const branch = generator.statementToCode(block, "STACK");
  let returnValue = generator.valueToCode(block, "RETURN", Order.NONE) || "";
  if (!returnValue) {
    const returnBlock = block.getInputTargetBlock("RETURN");
    if (returnBlock) {
      const generated = generator.blockToCode(returnBlock);
      if (Array.isArray(generated)) {
        returnValue = generated[0];
      } else if (typeof generated === "string") {
        returnValue = generated;
      }
    }
  }
  if (!returnValue) {
    returnValue = "0";
  }
  const returnType = getReturnType(block);

  let code = returnType + " " + funcName + "(" + args + ") {\n";
  code += branch;
  code += generator.INDENT + "return " + returnValue + ";\n";
  code += "}\n";
  setProcedureDefinition(generator, funcName, code);
  return null;
}

export const procedures_defnoreturn = function(
  block: Block,
  generator: ArduinoGenerator,
): null {
  // Define a procedure with no return value.
  const funcName = getProcedureName(block, generator);
  const params = getProcedureParams(block, generator);
  const args = params.map((name) => "int " + name).join(", ");
  const branch = generator.statementToCode(block, "STACK");

  let code = "void " + funcName + "(" + args + ") {\n";
  code += branch;
  code += "}\n";
  setProcedureDefinition(generator, funcName, code);
  return null;
};

export function procedures_callreturn(
  block: Block,
  generator: ArduinoGenerator,
): [string, Order] {
  // Call a procedure with return value.
  const funcName = getProcedureName(block, generator);
  const args: string[] = [];
  for (const input of block.inputList) {
    if (input.name && input.name.startsWith("ARG")) {
      args.push(generator.valueToCode(block, input.name, Order.NONE) || "0");
    }
  }
  const code = funcName + "(" + args.join(", ") + ")";
  return [code, Order.FUNCTION_CALL];
}

export function procedures_callnoreturn(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // Call a procedure with no return value.
  const funcName = getProcedureName(block, generator);
  const args: string[] = [];
  for (const input of block.inputList) {
    if (input.name && input.name.startsWith("ARG")) {
      args.push(generator.valueToCode(block, input.name, Order.NONE) || "0");
    }
  }
  return funcName + "(" + args.join(", ") + ");\n";
}

export function procedures_ifreturn(
  block: Block,
  generator: ArduinoGenerator,
): string {
  // Condition for early return.
  const condition =
    generator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  let code = "if (" + condition + ") {\n";
  if (block.getInput("VALUE")) {
    const value = generator.valueToCode(block, "VALUE", Order.NONE) || "0";
    code += generator.INDENT + "return " + value + ";\n";
  } else {
    code += generator.INDENT + "return;\n";
  }
  code += "}\n";
  return code;
}
