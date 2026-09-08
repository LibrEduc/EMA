/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedureDefs
 * @description Typed patches for procedures_defreturn and procedures_defnoreturn.
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
} from "../../categories/blockly/shared";
import type {
  ProcedureBlockDef,
  ProcedureBlockWithArgs,
} from "./configure_procedure_types";
import {
  getBlockOutputType,
  getProcedureModel,
} from "./configure_procedure_types";
import {
  attachProcedureParameterTypeDropdown,
  patchProcedurePlusMinusTypes,
} from "./configure_procedure_plus_minus";

/**
 * Configures procedure definition blocks (return and no-return) for typed args.
 */
export function configureProcedureDefBlocks(): void {
  // Procedure parameter dropdowns are managed inside the mutator blocks.

  const defReturn = Blockly.Blocks["procedures_defreturn"] as
    | ProcedureBlockDef
    | undefined;
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
      this.decompose = function (
        this: Blockly.Block,
        workspace: Blockly.Workspace,
      ): Blockly.Block {
        const container = originalDecompose
          ? originalDecompose.call(this, workspace)
          : null;
        if (container) {
          const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
          if (argModels && argModels.length > 0) {
            const typeByName = new Map(
              argModels.map((model) => [model.getName(), model.getType()]),
            );
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
      this.onchange = function (
        this: Blockly.Block,
        event: Blockly.Events.Abstract,
      ) {
        if (originalOnchange) {
          originalOnchange.call(this, event);
        }
        if (
          event.type === Blockly.Events.UI ||
          event.type === Blockly.Events.FINISHED_LOADING
        ) {
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
        if (
          currentTypes &&
          currentTypes.length === 1 &&
          currentTypes[0] === inferredType
        ) {
          return;
        }
        model.setReturnTypes([inferredType]);
        patchProcedurePlusMinusTypes.call(this);
      };
    };
  }

  const defNoReturn = Blockly.Blocks["procedures_defnoreturn"] as
    | ProcedureBlockDef
    | undefined;
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
      this.decompose = function (
        this: Blockly.Block,
        workspace: Blockly.Workspace,
      ): Blockly.Block {
        const container = originalDecompose
          ? originalDecompose.call(this, workspace)
          : null;
        if (container) {
          const argModels = (this as ProcedureBlockWithArgs).argumentVarModels_;
          if (argModels && argModels.length > 0) {
            const typeByName = new Map(
              argModels.map((model) => [model.getName(), model.getType()]),
            );
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
      this.onchange = function (
        this: Blockly.Block,
        event: Blockly.Events.Abstract,
      ) {
        if (originalOnchange) {
          originalOnchange.call(this, event);
        }
        if (
          event.type === Blockly.Events.UI ||
          event.type === Blockly.Events.FINISHED_LOADING
        ) {
          return;
        }
        if (event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
          return;
        }
        patchProcedurePlusMinusTypes.call(this);
      };
    };
  }
}
