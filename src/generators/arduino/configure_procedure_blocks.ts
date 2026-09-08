/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedureBlocks
 * @description Typed configuration for procedure definition and call blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  setVariableTypeAndMarkManual,
  isVariableUsedOutsideProcedureBodies,
  revalidateVariableBlocksForId,
  revalidateProcedureCallBlocks,
  syncProcedureCallArgInputChecks,
} from "../../categories/blockly/shared";
import { getArduinoTypeDropdownOptions } from "../../categories/blockly/variables";
import { isArduinoScalarType } from "./block_types";

/**
 * Configures procedure blocks for the typed connection system.
 */
export function configureProcedureBlocks(): void {
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
        getArduinoTypeDropdownOptions,
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
  if (callReturn && !callReturn.__typedConfigured) {
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
  if (callNoReturn && !callNoReturn.__typedConfigured) {
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
}
