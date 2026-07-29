/**
 * @packageDocumentation
 * @module Arduino.ConfigureStandardBlocks
 * @description Configuration for standard Blockly blocks.
 * @remarks
 * Applies typed-variable behaviors to standard Blockly blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  setVariableTypeAndMarkManual,
  normalizeBlocklyTypeToVariableType,
  inferNumericInputType,
  inferLoopCounterTypeFromForBlock,
  inferRequiredNumericTypeForVariable,
  areLoopBoundTypesCompatible,
  unifyLoopBoundTypes,
  isLoopCounterVariableCompatible,
  syncNumericVariableType,
  isVariableUsedOutsideProcedureBodies,
  revalidateVariableBlocksForId,
  getTypeMismatchWarningText,
  isBlockOnMainWorkspace,
  resolveMathNumberBlockType,
  revalidateTypedNumericBlocks,
  revalidateLocalWrapperBlocks,
  revalidateProcedureCallBlocks,
  syncProcedureCallArgInputChecks,
} from "../../categories/blockly/shared";
import { getVariableTypeDropdownOptions } from "../../categories/blockly/variables";
import { isArduinoScalarType } from "./block_types";
import { debugLog } from "./debug";
import { isShareableProceduresEnabled } from "../../shareable_procedures";
import { configureLogicCompareAndTernaryBlocks } from "./configure_logic_blocks";

/**
 * Configure standard Blockly blocks to work with our type system
 * This should be called after Blockly is loaded
 */
/**
 * Applies typed variable behavior to standard Blockly blocks.
 */
export function configureStandardBlocks(): void {
  type MathNumberDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    getBlockType?: (this: Blockly.Block) => string;
    __typedMathNumberConfigured?: boolean;
  };
  const mathNumberDef = Blockly.Blocks["math_number"] as MathNumberDef | undefined;
  if (mathNumberDef && !mathNumberDef.__typedMathNumberConfigured) {
    mathNumberDef.__typedMathNumberConfigured = true;
    const originalInit = mathNumberDef.init;
    const originalOnchange = mathNumberDef.onchange;
    mathNumberDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      this.setOutput(true, "Number");
    };
    mathNumberDef.getBlockType = function (this: Blockly.Block): string {
      return resolveMathNumberBlockType(this);
    };
    mathNumberDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (event.isUiEvent) {
        return;
      }
      if (
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
      ) {
        return;
      }
      if (!isBlockOnMainWorkspace(this) || !this.workspace) {
        return;
      }
      revalidateLocalWrapperBlocks(this.workspace, event);
      revalidateTypedNumericBlocks(this.workspace, event);
    };
  }

  // Note: controls_if already uses 'Boolean' which is correct for Blockly
  // We map 'bool' to 'Boolean' in getBlockType of variables_get_dynamic
  // So controls_if will accept our variables with type 'bool' (mapped to 'Boolean')
  // No need to modify controls_if - it already uses 'Boolean' correctly

  configureLogicCompareAndTernaryBlocks();

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

  type ControlsForDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfiguredControlsFor?: boolean;
  };
  const controlsForDef = Blockly.Blocks["controls_for"] as ControlsForDef | undefined;
  if (controlsForDef && !controlsForDef.__typedConfiguredControlsFor) {
    controlsForDef.__typedConfiguredControlsFor = true;
    const originalInit = controlsForDef.init;
    const originalOnchange = controlsForDef.onchange;
    const normalizeType = (raw: string | null): string | null => {
      if (!raw) return null;
      return normalizeBlocklyTypeToVariableType(raw);
    };
    const isNumeric = (raw: string | null): boolean => {
      const t = normalizeType(raw);
      return t === "int" || t === "float" || t === "number";
    };
    controlsForDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const acceptedChecks = ["Number", "int", "float"];
      this.getInput("FROM")?.connection?.setCheck(acceptedChecks);
      this.getInput("TO")?.connection?.setCheck(acceptedChecks);
      this.getInput("BY")?.connection?.setCheck(acceptedChecks);
    };
    controlsForDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (
        event.isUiEvent ||
        (
          event.type !== Blockly.Events.BLOCK_CHANGE &&
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE &&
          event.type !== "var_type_change"
        )
      ) {
        return;
      }
      const inputNames = ["FROM", "TO", "BY"] as const;
      const connected = inputNames
        .map((name) => ({ name, block: this.getInputTargetBlock(name) }))
        .filter((entry) => Boolean(entry.block)) as Array<{ name: "FROM" | "TO" | "BY"; block: Blockly.Block }>;
      if (connected.length === 0) {
        this.setWarningText(null);
        return;
      }
      const boundTypes = connected.map((entry) => inferNumericInputType(entry.block));
      for (const rawType of boundTypes) {
        if (!isNumeric(rawType)) {
          this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
          return;
        }
      }
      const anchorType = normalizeType(boundTypes[0]);
      if (!anchorType) {
        this.setWarningText(null);
        return;
      }
      for (let i = 1; i < boundTypes.length; i += 1) {
        const type = normalizeType(boundTypes[i]);
        if (!type || !areLoopBoundTypesCompatible(anchorType, type)) {
          this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
          return;
        }
      }
      const variableId = this.getFieldValue("VAR");
      const requiredNumericType = variableId
        ? inferRequiredNumericTypeForVariable(this.workspace, variableId)
        : unifyLoopBoundTypes(boundTypes) ?? inferLoopCounterTypeFromForBlock(this);
      if (variableId && requiredNumericType) {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          syncNumericVariableType(variable, requiredNumericType);
          const varType = variable.getType();
          if (
            varType &&
            varType !== "__NO_TYPE__" &&
            !isLoopCounterVariableCompatible(varType, requiredNumericType)
          ) {
            this.setWarningText(getTypeMismatchWarningText(varType, requiredNumericType));
            return;
          }
        }
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

  const attachProcedureParameterTypeDropdown = (
    block: Blockly.Block,
    argId: string,
    options?: { fireEvents?: boolean },
  ): void => {
    const proc = block as ProcedureBlockWithArgs;
    const input = block.getInput(argId);
    if (!input) {
      return;
    }
    const typeFieldName = `${argId}_TYPE`;
    const fireEvents = options?.fireEvents ?? true;
    let dropdown = input.fieldRow.find(
      (field) => field.name === typeFieldName,
    ) as Blockly.FieldDropdown | undefined;
    if (!dropdown) {
      dropdown = new Blockly.FieldDropdown(
        getVariableTypeDropdownOptions,
        (value) => {
          const selectedType = value || "int";
          const argDatum = proc.argData_?.find((elem) => elem.argId === argId);
          if (argDatum?.model) {
            if (
              !isVariableUsedOutsideProcedureBodies(
                block.workspace,
                argDatum.model.getId(),
              )
            ) {
              setVariableTypeAndMarkManual(argDatum.model, selectedType);
            }
            Blockly.Procedures.mutateCallers(block);
            revalidateProcedureCallBlocks(block.workspace);
            revalidateVariableBlocksForId(block.workspace, argDatum.model.getId());
          }
          return selectedType;
        },
      );
      const nameIndex = input.fieldRow.findIndex((field) => field.name === argId);
      const insertIndex = nameIndex >= 0 ? nameIndex + 1 : input.fieldRow.length;
      input.insertFieldAt(insertIndex, dropdown, typeFieldName);
    }

    const argDatum = proc.argData_?.find((elem) => elem.argId === argId);
    const modelType = argDatum?.model?.getType?.() || "";
    const currentType =
      modelType && modelType !== "__NO_TYPE__" && isArduinoScalarType(modelType)
        ? modelType
        : "int";
    dropdown.setValue(currentType, fireEvents);
    if (argDatum?.model && !isVariableUsedOutsideProcedureBodies(block.workspace, argDatum.model.getId())) {
      setVariableTypeAndMarkManual(argDatum.model, currentType);
    }
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
        Blockly.Events.disable();
        try {
          originalAddVarInput.call(this, name, argId);
          attachProcedureParameterTypeDropdown(this, argId, { fireEvents: false });
        } finally {
          Blockly.Events.enable();
        }
      };
    }

    if (typed.argData_ && typed.argData_.length > 0) {
      for (const argDatum of typed.argData_) {
        attachProcedureParameterTypeDropdown(this, argDatum.argId, { fireEvents: false });
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
  if (defReturn && !defReturn.__typedConfigured && !isShareableProceduresEnabled()) {
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
        const proc = this as ProcedureBlockWithArgs;
        for (const argDatum of proc.argData_ || []) {
          attachProcedureParameterTypeDropdown(this, argDatum.argId, {
            fireEvents: false,
          });
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
            if (
              !isVariableUsedOutsideProcedureBodies(this.workspace, model.getId())
            ) {
              setVariableTypeAndMarkManual(model, argType);
            }
            revalidateVariableBlocksForId(this.workspace, model.getId());
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
  if (defNoReturn && !defNoReturn.__typedConfigured && !isShareableProceduresEnabled()) {
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
        const proc = this as ProcedureBlockWithArgs;
        for (const argDatum of proc.argData_ || []) {
          attachProcedureParameterTypeDropdown(this, argDatum.argId, {
            fireEvents: false,
          });
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
            if (
              !isVariableUsedOutsideProcedureBodies(this.workspace, model.getId())
            ) {
              setVariableTypeAndMarkManual(model, argType);
            }
            revalidateVariableBlocksForId(this.workspace, model.getId());
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
  if (callReturn && !callReturn.__typedConfigured && !isShareableProceduresEnabled()) {
    callReturn.__typedConfigured = true;
    const originalUpdateShape = callReturn.updateShape_;
    callReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      syncProcedureCallArgInputChecks(this);
    };
  }

  const callNoReturn = Blockly.Blocks["procedures_callnoreturn"] as ProcedureBlockDef | undefined;
  if (callNoReturn && !callNoReturn.__typedConfigured && !isShareableProceduresEnabled()) {
    callNoReturn.__typedConfigured = true;
    const originalUpdateShape = callNoReturn.updateShape_;
    callNoReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      syncProcedureCallArgInputChecks(this);
    };
  }

  // procedures_mutatorarg : mutateur legacy ; procédures via block-plus-minus (+/-).

  debugLog(
    "✅ Standard blocks configured (logic_compare: EQ/NEQ same-type, else Number/int/float)",
  );
}
