/**
 * @packageDocumentation Configuration for standard Blockly blocks
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";

/**
 * Configure standard Blockly blocks to work with our type system
 * This should be called after Blockly is loaded
 */
export function configureStandardBlocks(): void {
  // Note: controls_if already uses 'Boolean' which is correct for Blockly
  // We map 'bool' to 'Boolean' in getBlockType of variables_get_dynamic
  // So controls_if will accept our variables with type 'bool' (mapped to 'Boolean')
  // No need to modify controls_if - it already uses 'Boolean' correctly

  type LogicCompareDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    __typedConfigured?: boolean;
  };
  const logicCompareDef = Blockly.Blocks["logic_compare"] as LogicCompareDef | undefined;
  if (logicCompareDef && !logicCompareDef.__typedConfigured) {
    logicCompareDef.__typedConfigured = true;
    const originalInit = logicCompareDef.init;
    logicCompareDef.init = function(this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const numberChecks = ["int", "float"];
      const inputA = this.getInput("A");
      const inputB = this.getInput("B");
      inputA?.connection?.setCheck(numberChecks);
      inputB?.connection?.setCheck(numberChecks);
    };
  }

  type ProcedureBlockDef = Blockly.Block & {
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    getBlockType?: (this: Blockly.Block) => string | null;
    __typedConfigured?: boolean;
  };

  const toInternalType = (rawType: string | string[] | null | undefined): string | null => {
    if (!rawType) return null;
    if (Array.isArray(rawType)) {
      return rawType.length > 0 ? toInternalType(rawType[0]) : null;
    }
    if (rawType === "__NO_TYPE__" || rawType === "null" || rawType === "undefined") {
      return null;
    }
    if (rawType === "Boolean") return "bool";
    if (rawType === "Number") return "int";
    if (rawType === "String") return "string";
    return rawType;
  };

  const getBlockOutputType = (block: Blockly.Block | null): string | null => {
    if (!block) return null;
    if (block.type === "variables_get_dynamic" || block.type === "variables_get") {
      const variableId = block.getFieldValue?.("VAR");
      if (variableId && block.workspace) {
        const variable = block.workspace.getVariableMap().getVariableById(variableId);
        const varType = variable?.getType();
        if (varType) {
          return toInternalType(varType) || varType;
        }
      }
    }
    const blockDef = block as Blockly.Block & { getBlockType?: () => string | null };
    if (blockDef.getBlockType) {
      return toInternalType(blockDef.getBlockType());
    }
    const outputCheck = block.outputConnection?.getCheck();
    return toInternalType(outputCheck as string | string[] | null | undefined);
  };

  type ProcedureModel = {
    getReturnTypes?: () => string[] | null;
    setReturnTypes?: (types: string[] | null) => unknown;
  };

  type ProcedureBlock = Blockly.Block & {
    getProcedureModel?: () => ProcedureModel | null;
  };

  const getProcedureModel = (block: Blockly.Block): ProcedureModel | null => {
    const procBlock = block as ProcedureBlock;
    const model = procBlock.getProcedureModel?.();
    if (model) return model;
    const name = block.getFieldValue?.("NAME");
    if (!name || !block.workspace) return null;
    const defBlock = Blockly.Procedures.getDefinition(name, block.workspace) as ProcedureBlock | null;
    return defBlock?.getProcedureModel?.() || null;
  };

  const getProcedureReturnType = (block: Blockly.Block): string | null => {
    const name = block.getFieldValue?.("NAME");
    if (name && block.workspace) {
      const defBlock = Blockly.Procedures.getDefinition(name, block.workspace);
      const returnBlock = defBlock?.getInputTargetBlock?.("RETURN");
      const inferred = getBlockOutputType(returnBlock || null);
      if (inferred) {
        return inferred;
      }
    }

    const model = getProcedureModel(block);
    const returnTypes: string[] | null | undefined = model?.getReturnTypes?.();
    if (!returnTypes || returnTypes.length === 0) {
      // Default to int to match generator fallback when no return type is set.
      return "int";
    }
    if (returnTypes.includes("bool")) return "bool";
    if (returnTypes.includes("float")) return "float";
    if (returnTypes.includes("int")) return "int";
    if (returnTypes.includes("string")) return "string";
    if (returnTypes.includes("char")) return "char";
    return toInternalType(returnTypes[0]) || "int";
  };

  const defReturn = Blockly.Blocks["procedures_defreturn"] as ProcedureBlockDef | undefined;
  if (defReturn && !defReturn.__typedConfigured) {
    defReturn.__typedConfigured = true;
    const originalOnchange = defReturn.onchange;
    defReturn.onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (event.type === Blockly.Events.UI || event.type === Blockly.Events.FINISHED_LOADING) {
        return;
      }
      if (event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        return;
      }
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field" &&
        (event as Blockly.Events.BlockChange).name === "NAME"
      ) {
        return;
      }
      const model = getProcedureModel(this);
      if (!model || typeof model.setReturnTypes !== "function") {
        return;
      }
      const returnBlock = this.getInputTargetBlock("RETURN");
      const inferredType = getBlockOutputType(returnBlock);
      if (!inferredType) {
        return;
      }
      const currentTypes: string[] | null | undefined = model.getReturnTypes?.();
      if (currentTypes && currentTypes.length === 1 && currentTypes[0] === inferredType) {
        return;
      }
      model.setReturnTypes([inferredType]);
    };
  }

  const callReturn = Blockly.Blocks["procedures_callreturn"] as ProcedureBlockDef | undefined;
  if (callReturn && !callReturn.__typedConfigured) {
    callReturn.__typedConfigured = true;
    callReturn.getBlockType = function(this: Blockly.Block): string | null {
      return getProcedureReturnType(this);
    };
  }

  console.log("✅ Blocs standards configurés (logic_compare restreint à int/float)");
}