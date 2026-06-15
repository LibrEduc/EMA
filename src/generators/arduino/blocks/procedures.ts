/**
 * @packageDocumentation
 * @module Arduino.Generators.Procedures
 * @description Arduino code generators for procedure blocks.
 * @remarks
 * Implements generator functions for the procedures category. Generates Arduino code for procedure blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import type { Block } from "blockly/core";
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
  getVarModels?: () => Blockly.VariableModel[] | null;
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

type ProcedureParamInfo = {
  name: string;
  type: string;
};

function getProcedureParams(block: Block, generator: ArduinoGenerator): ProcedureParamInfo[] {
  const params: ProcedureParamInfo[] = [];
  const procBlock = block as ProcedureBlockLike & {
    argumentVarModels_?: Blockly.VariableModel[];
  };
  const model = procBlock.getProcedureModel?.();

  const varModels = procBlock.getVarModels?.();
  if (Array.isArray(varModels) && varModels.length > 0) {
    for (const modelVar of varModels) {
      const resolvedType = mapBlocklyTypeToArduino(modelVar.getType() || "int");
      params.push({
        name: modelVar.getName(),
        type: resolvedType || "int",
      });
    }
  } else if (model?.getParameters) {
    for (const param of model.getParameters()) {
      const rawName = param.getName();
      const rawTypes = (param as unknown as { getTypes?: () => string[] }).getTypes?.() || [];
      let resolvedType = rawTypes.length > 0 ? mapBlocklyTypeToArduino(rawTypes[0]) : "";
      if (!resolvedType && procBlock.argumentVarModels_) {
        const match = procBlock.argumentVarModels_.find(
          (argModel) => argModel.getName() === rawName,
        );
        if (match) {
          resolvedType = mapBlocklyTypeToArduino(match.getType());
        }
      }
      params.push({
        name: rawName,
        type: resolvedType || "int",
      });
    }
  } else {
    const vars = procBlock.getVars?.();
    if (Array.isArray(vars)) {
      for (const rawName of vars.filter(Boolean)) {
        let resolvedType = "";
        if (procBlock.argumentVarModels_) {
          const match = procBlock.argumentVarModels_.find(
            (argModel) => argModel.getName() === rawName,
          );
          if (match) {
            resolvedType = mapBlocklyTypeToArduino(match.getType());
          }
        }
        params.push({
          name: rawName,
          type: resolvedType || "int",
        });
      }
    }
  }

  if (generator.nameDB_) {
    return params.map((param) => ({
      name: generator.nameDB_!.getName(param.name, Blockly.Names.NameType.VARIABLE),
      type: param.type,
    }));
  }
  return params;
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

/**
 * Generates Arduino code for a procedure with return value.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Function definition code.
 */
export function procedures_defreturn(
  block: Block,
  generator: ArduinoGenerator,
): null {
  // Define a procedure with return value.
  const funcName = getProcedureName(block, generator);
  const params = getProcedureParams(block, generator);
  const args = params.map((param) => `${param.type} ${param.name}`).join(", ");
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
  const localDeclarations = generator.getLocalVariables(block.id);
  if (localDeclarations.length > 0) {
    code += localDeclarations.map((decl) => generator.INDENT + decl).join("\n");
    code += "\n";
  }
  code += branch;
  code += generator.INDENT + "return " + returnValue + ";\n";
  code += "}\n";
  setProcedureDefinition(generator, funcName, code);
  return null;
}

/**
 * Generates Arduino code for a procedure without return value.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Function definition code.
 */
export const procedures_defnoreturn = function (
  block: Block,
  generator: ArduinoGenerator,
): null {
  // Define a procedure with no return value.
  const funcName = getProcedureName(block, generator);
  const params = getProcedureParams(block, generator);
  const args = params.map((param) => `${param.type} ${param.name}`).join(", ");
  const branch = generator.statementToCode(block, "STACK");

  let code = "void " + funcName + "(" + args + ") {\n";
  const localDeclarations = generator.getLocalVariables(block.id);
  if (localDeclarations.length > 0) {
    code += localDeclarations.map((decl) => generator.INDENT + decl).join("\n");
    code += "\n";
  }
  code += branch;
  code += "}\n";
  setProcedureDefinition(generator, funcName, code);
  return null;
};

/**
 * Generates Arduino code for calling a procedure with return value.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Code string with order.
 */
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

/**
 * Generates Arduino code for calling a procedure without return value.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Statement code string.
 */
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

/**
 * Generates Arduino code for if-return blocks.
 * @param block - Blockly block instance.
 * @param generator - Arduino generator instance.
 * @returns Statement code string.
 */
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
