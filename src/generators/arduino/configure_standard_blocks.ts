/**
 * @packageDocumentation Configuration for standard Blockly blocks
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";
import { getVariableTypeOptions } from "./block_types";
import { getCompatibleTypesForCheck } from "./block_types_registry";
import { debugLog } from "./debug";
import { setVariableType as setVariableTypeSafe } from "./variable_utils";

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
    updateShape_?: (this: Blockly.Block) => void;
    __typedConfigured?: boolean;
  };
  type ProcedureBlockWithArgs = ProcedureBlockDef & {
    __typedPatched?: boolean;
    argumentVarModels_?: Blockly.VariableModel[];
    getProcedureCall?: () => string;
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
  };

  const getBlocklyMsg = (key: string): string => {
    const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
    return msg || key;
  };

  type VariableWithMutableType = Blockly.IVariableModel<Blockly.IVariableState> & {
    setType?: (type: string) => void;
    type_?: string;
    __ucbManualType?: boolean;
  };

  const setVariableType = (
    variable: Blockly.IVariableModel<Blockly.IVariableState>,
    type: string,
  ): void => {
    const typedVariable = variable as VariableWithMutableType;
    setVariableTypeSafe(variable, type);
    typedVariable.__ucbManualType = true;
  };

  const getBlocklyMsgOr = (key: string, fallback: string): string => {
    const msg = getBlocklyMsg(key);
    return msg === key ? fallback : msg;
  };

  const getVariableTypeLabel = (type: string): string =>
    getBlocklyMsgOr(`VAR_TYPE_${type.toUpperCase()}`, type);

  const getTypeDropdownOptions = (): Blockly.MenuOption[] =>
    getVariableTypeOptions().map((type) => [
      getVariableTypeLabel(type),
      type,
    ] as Blockly.MenuOption);

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
    if (rawType === "char") return "char";
    return rawType;
  };

  const getBlockOutputType = (block: Blockly.Block | null): string | null => {
    if (!block) return null;
    if (block.type === "logic_boolean") {
      return "bool";
    }
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

  const defReturn = Blockly.Blocks["procedures_defreturn"] as ProcedureBlockDef | undefined;
  if (defReturn && !defReturn.__typedConfigured) {
    defReturn.__typedConfigured = true;
    const originalInit = defReturn.init;
    defReturn.init = function(this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const typedBlock = this as ProcedureBlockWithArgs;
      if (typedBlock.__typedPatched) {
        return;
      }
      typedBlock.__typedPatched = true;
      const originalDecompose = this.decompose;
      const originalCompose = this.compose;
      const originalOnchange = this.onchange;
      this.decompose = function(this: Blockly.Block, workspace: Blockly.Workspace): Blockly.Block {
        const container = originalDecompose ? originalDecompose.call(this, workspace) : null;
        if (container) {
          const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
          if (argModels && argModels.length > 0) {
            const typeByName = new Map(argModels.map((model) => [model.getName(), model.getType()]));
            let argBlock = container.getInputTargetBlock("STACK");
            while (argBlock && !argBlock.isInsertionMarker()) {
              const name = argBlock.getFieldValue("NAME");
              const argType = typeByName.get(name);
              if (argType) {
                try {
                  argBlock.setFieldValue(argType, "TYPE");
                } catch {
                  // Ignore if type is not available in dropdown.
                }
              }
              argBlock = argBlock.nextConnection?.targetBlock() || null;
            }
          }
        }
        return container as Blockly.Block;
      };
      this.compose = function(this: Blockly.Block, container: Blockly.Block) {
        if (originalCompose) {
          originalCompose.call(this, container);
        }
        const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
        if (!argModels || argModels.length === 0) {
          return;
        }
        const typeByName = new Map<string, string>();
        let argBlock = container.getInputTargetBlock("STACK");
        while (argBlock && !argBlock.isInsertionMarker()) {
          const name = argBlock.getFieldValue("NAME");
          const argType = argBlock.getFieldValue("TYPE");
          if (name && argType) {
            typeByName.set(name, argType);
          }
          argBlock = argBlock.nextConnection?.targetBlock() || null;
        }
        for (const model of argModels) {
          const argType = typeByName.get(model.getName());
          if (argType && model.getType() !== argType) {
            setVariableType(model, argType);
          }
        }
      };
      this.onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
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
    };
  }

  type TextAppendDef = Blockly.Block & {
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfigured?: boolean;
  };
  const textAppendDef = Blockly.Blocks["text_append"] as TextAppendDef | undefined;
  if (textAppendDef && !textAppendDef.__typedConfigured) {
    textAppendDef.__typedConfigured = true;
    const originalOnchange = textAppendDef.onchange;
    textAppendDef.onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        event.type !== Blockly.Events.VAR_CREATE &&
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE
      ) {
        return;
      }
      const variableId = this.getFieldValue("VAR");
      if (!variableId) {
        return;
      }
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      const varType = variable.getType();
      if (!varType || varType === "__NO_TYPE__") {
        setVariableType(variable, "string");
      }
    };
  }

  const defNoReturn = Blockly.Blocks["procedures_defnoreturn"] as ProcedureBlockDef | undefined;
  if (defNoReturn && !defNoReturn.__typedConfigured) {
    defNoReturn.__typedConfigured = true;
    const originalInit = defNoReturn.init;
    defNoReturn.init = function(this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const typedBlock = this as ProcedureBlockWithArgs;
      if (typedBlock.__typedPatched) {
        return;
      }
      typedBlock.__typedPatched = true;
      const originalDecompose = this.decompose;
      const originalCompose = this.compose;
      this.decompose = function(this: Blockly.Block, workspace: Blockly.Workspace): Blockly.Block {
        const container = originalDecompose ? originalDecompose.call(this, workspace) : null;
        if (container) {
          const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
          if (argModels && argModels.length > 0) {
            const typeByName = new Map(argModels.map((model) => [model.getName(), model.getType()]));
            let argBlock = container.getInputTargetBlock("STACK");
            while (argBlock && !argBlock.isInsertionMarker()) {
              const name = argBlock.getFieldValue("NAME");
              const argType = typeByName.get(name);
              if (argType) {
                try {
                  argBlock.setFieldValue(argType, "TYPE");
                } catch {
                  // Ignore if type is not available in dropdown.
                }
              }
              argBlock = argBlock.nextConnection?.targetBlock() || null;
            }
          }
        }
        return container as Blockly.Block;
      };
      this.compose = function(this: Blockly.Block, container: Blockly.Block) {
        if (originalCompose) {
          originalCompose.call(this, container);
        }
        const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
        if (!argModels || argModels.length === 0) {
          return;
        }
        const typeByName = new Map<string, string>();
        let argBlock = container.getInputTargetBlock("STACK");
        while (argBlock && !argBlock.isInsertionMarker()) {
          const name = argBlock.getFieldValue("NAME");
          const argType = argBlock.getFieldValue("TYPE");
          if (name && argType) {
            typeByName.set(name, argType);
          }
          argBlock = argBlock.nextConnection?.targetBlock() || null;
        }
        for (const model of argModels) {
          const argType = typeByName.get(model.getName());
          if (argType && model.getType() !== argType) {
            setVariableType(model, argType);
          }
        }
      };
    };
  }

  const callReturn = Blockly.Blocks["procedures_callreturn"] as ProcedureBlockDef | undefined;
  if (callReturn && !callReturn.__typedConfigured) {
    callReturn.__typedConfigured = true;
    const originalUpdateShape = callReturn.updateShape_;
    callReturn.updateShape_ = function(this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      const defName = (this as ProcedureBlockWithArgs).getProcedureCall?.();
      if (!defName || !this.workspace) {
        return;
      }
      const defBlock = Blockly.Procedures.getDefinition(defName, this.workspace) as ProcedureBlockWithArgs | null;
      const argModels = defBlock?.argumentVarModels_;
      if (!argModels || argModels.length === 0) {
        return;
      }
      for (let i = 0; i < argModels.length; i += 1) {
        const input = this.getInput(`ARG${i}`);
        const argType = argModels[i]?.getType?.();
        if (input?.connection) {
          input.connection.setCheck(getCompatibleTypesForCheck(argType));
        }
      }
    };
  }

  const callNoReturn = Blockly.Blocks["procedures_callnoreturn"] as ProcedureBlockDef | undefined;
  if (callNoReturn && !callNoReturn.__typedConfigured) {
    callNoReturn.__typedConfigured = true;
    const originalUpdateShape = callNoReturn.updateShape_;
    callNoReturn.updateShape_ = function(this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      const defName = (this as ProcedureBlockWithArgs).getProcedureCall?.();
      if (!defName || !this.workspace) {
        return;
      }
      const defBlock = Blockly.Procedures.getDefinition(defName, this.workspace) as ProcedureBlockWithArgs | null;
      const argModels = defBlock?.argumentVarModels_;
      if (!argModels || argModels.length === 0) {
        return;
      }
      for (let i = 0; i < argModels.length; i += 1) {
        const input = this.getInput(`ARG${i}`);
        const argType = argModels[i]?.getType?.();
        if (input?.connection) {
          input.connection.setCheck(getCompatibleTypesForCheck(argType));
        }
      }
    };
  }

  const mutatorArg = Blockly.Blocks["procedures_mutatorarg"] as ProcedureBlockDef | undefined;
  if (mutatorArg && !mutatorArg.__typedConfigured) {
    mutatorArg.__typedConfigured = true;
    const originalInit = mutatorArg.init;
    mutatorArg.init = function(this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const input = this.inputList[0];
      if (!input || input.fieldRow.some((field) => field.name === "TYPE")) {
        return;
      }
      input
        .appendField(getBlocklyMsg("TYPED_VAR_ARG_TYPE_LABEL"))
        .appendField(new Blockly.FieldDropdown(getTypeDropdownOptions), "TYPE");
    };
  }

  debugLog("✅ Blocs standards configurés (logic_compare restreint à int/float)");
}