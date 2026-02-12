/**
 * @packageDocumentation
 * @module Arduino.ConfigureStandardBlocks
 * @description Configuration for standard Blockly blocks.
 * @remarks
 * Applies typed-variable behaviors to standard Blockly blocks.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

import * as Blockly from "blockly";
import {
  setVariableTypeAndMarkManual,
} from "../../categories/blockly/shared";
import { getVariableTypeDropdownOptions } from "../../categories/blockly/variables";
import { getCompatibleTypesForCheck } from "./block_types_registry";
import { debugLog } from "./debug";

/**
 * Configure standard Blockly blocks to work with our type system
 * This should be called after Blockly is loaded
 */
/**
 * Applies typed variable behavior to standard Blockly blocks.
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
    logicCompareDef.init = function (this: Blockly.Block) {
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

  type RepeatExtDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfiguredRepeatExt?: boolean;
  };
  const repeatExtDef = Blockly.Blocks["controls_repeat_ext"] as RepeatExtDef | undefined;
  if (repeatExtDef && !repeatExtDef.__typedConfiguredRepeatExt) {
    repeatExtDef.__typedConfiguredRepeatExt = true;
    const originalInit = repeatExtDef.init;
    const originalOnchange = repeatExtDef.onchange;
    repeatExtDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      // Allow standard numeric blocks ("Number") and typed integer variables ("int"),
      // but reject typed float variable getters.
      this.getInput("TIMES")?.connection?.setCheck(["Number", "int"]);
    };
    repeatExtDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
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
      const timesBlock = this.getInputTargetBlock("TIMES");
      if (!timesBlock) {
        this.setWarningText(null);
        return;
      }
      let inferredType: string | null = null;
      if (
        timesBlock.type === "variables_get" ||
        timesBlock.type === "variables_get_dynamic"
      ) {
        const variableId = timesBlock.getFieldValue("VAR");
        inferredType = variableId
          ? timesBlock.workspace?.getVariableMap().getVariableById(variableId)?.getType() || null
          : null;
      } else {
        const typedTimes = timesBlock as Blockly.Block & { getBlockType?: () => string | null };
        inferredType = typedTimes.getBlockType?.() || null;
        if (!inferredType && timesBlock.type === "math_number") {
          const rawNum = timesBlock.getFieldValue("NUM");
          const numericValue = rawNum !== null && rawNum !== undefined ? Number(rawNum) : NaN;
          if (!Number.isNaN(numericValue)) {
            inferredType = Number.isInteger(numericValue) ? "int" : "float";
          }
        }
        if (!inferredType) {
          const outputCheck = timesBlock.outputConnection?.getCheck();
          if (Array.isArray(outputCheck)) {
            inferredType = outputCheck.length > 0 ? outputCheck[0] : null;
          } else {
            inferredType = outputCheck || null;
          }
        }
      }
      if (inferredType !== "int") {
        this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
        this.getInput("TIMES")?.connection?.disconnect();
        return;
      }
      this.setWarningText(null);
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
    __typedPlusMinus?: boolean;
    argumentVarModels_?: Blockly.VariableModel[];
    arguments_?: string[];
    updateParams_?: () => void;
    getProcedureCall?: () => string;
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
    argData_?: { model: Blockly.VariableModel; argId: string }[];
    addVarInput_?: (name: string, argId: string) => void;
  };

  const patchProcedurePlusMinusTypes = function (this: Blockly.Block) {
    const typed = this as ProcedureBlockWithArgs;
    if (typed.__typedPlusMinus) {
      return;
    }
    typed.__typedPlusMinus = true;

    const originalAddVarInput = typed.addVarInput_;
    if (typeof originalAddVarInput === "function") {
      typed.addVarInput_ = function (name: string, argId: string) {
        originalAddVarInput.call(this, name, argId);
        const input = this.getInput(argId);
        if (!input) {
          return;
        }
        const typeFieldName = `${argId}_TYPE`;
        if (input.fieldRow.some((field) => field.name === typeFieldName)) {
          return;
        }
        const dropdown = new Blockly.FieldDropdown(
          getVariableTypeDropdownOptions,
          (value) => {
            const selectedType = value || "int";
            const argDatum = (this as ProcedureBlockWithArgs).argData_?.find(
              (elem) => elem.argId === argId,
            );
            if (argDatum?.model) {
              setVariableTypeAndMarkManual(argDatum.model, selectedType);
              Blockly.Procedures.mutateCallers(this);
            }
            return selectedType;
          },
        );
        const nameIndex = input.fieldRow.findIndex((field) => field.name === argId);
        const insertIndex = nameIndex >= 0 ? nameIndex + 1 : input.fieldRow.length;
        input.insertFieldAt(insertIndex, dropdown, typeFieldName);

        const argDatum = (this as ProcedureBlockWithArgs).argData_?.find(
          (elem) => elem.argId === argId,
        );
        const modelType = argDatum?.model?.getType?.() || "";
        const currentType = modelType && modelType !== "__NO_TYPE__" ? modelType : "int";
        dropdown.setValue(currentType);
      };
    }

    if (typed.argData_ && typed.argData_.length > 0) {
      for (const argDatum of typed.argData_) {
        const argId = argDatum.argId;
        const input = this.getInput(argId);
        if (!input) {
          continue;
        }
        const typeFieldName = `${argId}_TYPE`;
        if (input.fieldRow.some((field) => field.name === typeFieldName)) {
          continue;
        }
        const dropdown = new Blockly.FieldDropdown(
          getVariableTypeDropdownOptions,
          (value) => {
            const selectedType = value || "int";
            if (argDatum.model) {
              setVariableTypeAndMarkManual(argDatum.model, selectedType);
              Blockly.Procedures.mutateCallers(this);
            }
            return selectedType;
          },
        );
        const nameIndex = input.fieldRow.findIndex((field) => field.name === argId);
        const insertIndex = nameIndex >= 0 ? nameIndex + 1 : input.fieldRow.length;
        input.insertFieldAt(insertIndex, dropdown, typeFieldName);
        const modelType = argDatum.model?.getType?.() || "";
        const currentType = modelType && modelType !== "__NO_TYPE__" ? modelType : "int";
        dropdown.setValue(currentType);
      }
    }
  };

  // Procedure parameter dropdowns are managed inside the mutator blocks.

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
    defReturn.init = function (this: Blockly.Block) {
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
      patchProcedurePlusMinusTypes.call(this);
      this.decompose = function (this: Blockly.Block, workspace: Blockly.Workspace): Blockly.Block {
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
                  argBlock.setFieldValue(argType, "ARGTYPE");
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
      this.compose = function (this: Blockly.Block, container: Blockly.Block) {
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
          const argType =
            argBlock.getFieldValue("ARGTYPE") || argBlock.getFieldValue("TYPE");
          if (name && argType) {
            typeByName.set(name, argType);
          }
          argBlock = argBlock.nextConnection?.targetBlock() || null;
        }
        for (const model of argModels) {
          const argType = typeByName.get(model.getName());
          if (argType && model.getType() !== argType) {
            setVariableTypeAndMarkManual(model, argType);
          }
        }
      };
      this.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
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
        patchProcedurePlusMinusTypes.call(this);
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
    textAppendDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
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
        setVariableTypeAndMarkManual(variable, "string");
      }
    };
  }

  const defNoReturn = Blockly.Blocks["procedures_defnoreturn"] as ProcedureBlockDef | undefined;
  if (defNoReturn && !defNoReturn.__typedConfigured) {
    defNoReturn.__typedConfigured = true;
    const originalInit = defNoReturn.init;
    defNoReturn.init = function (this: Blockly.Block) {
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
      patchProcedurePlusMinusTypes.call(this);
      this.decompose = function (this: Blockly.Block, workspace: Blockly.Workspace): Blockly.Block {
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
                  argBlock.setFieldValue(argType, "ARGTYPE");
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
      this.compose = function (this: Blockly.Block, container: Blockly.Block) {
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
          const argType =
            argBlock.getFieldValue("ARGTYPE") || argBlock.getFieldValue("TYPE");
          if (name && argType) {
            typeByName.set(name, argType);
          }
          argBlock = argBlock.nextConnection?.targetBlock() || null;
        }
        for (const model of argModels) {
          const argType = typeByName.get(model.getName());
          if (argType && model.getType() !== argType) {
            setVariableTypeAndMarkManual(model, argType);
          }
        }
      };
      this.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
        if (originalOnchange) {
          originalOnchange.call(this, event);
        }
        if (event.type === Blockly.Events.UI || event.type === Blockly.Events.FINISHED_LOADING) {
          return;
        }
        if (event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
          return;
        }
        patchProcedurePlusMinusTypes.call(this);
      };
    };
  }

  const callReturn = Blockly.Blocks["procedures_callreturn"] as ProcedureBlockDef | undefined;
  if (callReturn && !callReturn.__typedConfigured) {
    callReturn.__typedConfigured = true;
    const originalUpdateShape = callReturn.updateShape_;
    callReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      const defName = (this as ProcedureBlockWithArgs).getProcedureCall?.();
      if (!defName || !this.workspace) {
        return;
      }
      const defBlock = Blockly.Procedures.getDefinition(defName, this.workspace) as ProcedureBlockWithArgs | null;
      const argModels = defBlock?.getVarModels?.() || defBlock?.argumentVarModels_;
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
    callNoReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      const defName = (this as ProcedureBlockWithArgs).getProcedureCall?.();
      if (!defName || !this.workspace) {
        return;
      }
      const defBlock = Blockly.Procedures.getDefinition(defName, this.workspace) as ProcedureBlockWithArgs | null;
      const argModels = defBlock?.getVarModels?.() || defBlock?.argumentVarModels_;
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

  // procedures_mutatorarg is not used with block-plus-minus procedure blocks.

  debugLog("✅ Blocs standards configurés (logic_compare restreint à int/float)");
}