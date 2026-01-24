/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

export function patchVariableMapCreateVariable(
  workspace: Blockly.Workspace,
): void {
  try {
    const variableMap = workspace.getVariableMap();
    const originalCreateVariable = variableMap.createVariable.bind(variableMap);
    const variableMapWithOverride = variableMap as Blockly.VariableMap & {
      createVariable: (
        name: string,
        opt_type?: string | null,
        opt_id?: string | null,
      ) => Blockly.IVariableModel<Blockly.IVariableState>;
    };
    variableMapWithOverride.createVariable = (
      name: string,
      opt_type?: string | null,
      opt_id?: string | null,
    ) => {
      const type = opt_type === null || opt_type === "null" ? "" : opt_type;
      const id = opt_id === null ? undefined : opt_id;
      if (!id) {
        const existing = variableMap
          .getAllVariables()
          .find((variable) => variable && variable.getName() === name);
        if (existing) {
          return existing;
        }
      }
      return originalCreateVariable(name, type, id);
    };
  } catch (e) {
    console.debug("Error normalizing variable creation types:", e);
  }
}

export function patchFieldVariableValidation(): void {
  try {
    if (!Blockly.FieldVariable) return;
    type FieldVariableProto = Blockly.FieldVariable & {
      __ucbPatchedVariableValidation?: boolean;
      __ucbPatchedVariableInitModel?: boolean;
      doClassValidation_: (newValue: string | null) => string | null;
      initModel: () => void;
    };
    const proto = Blockly.FieldVariable.prototype as unknown as FieldVariableProto;
    if (!proto.__ucbPatchedVariableValidation) {
      const originalValidation = proto.doClassValidation_;
      proto.doClassValidation_ = function (
        this: Blockly.FieldVariable,
        newValue: string | null,
      ) {
        if (!newValue) return newValue;
        const field = this as Blockly.FieldVariable & {
          workspace_?: Blockly.WorkspaceSvg;
          getSourceBlock?: () => Blockly.Block | null;
        };
        const workspace = field.getSourceBlock?.()?.workspace || field.workspace_;
        const variableMap = workspace?.getVariableMap?.();
        if (!variableMap) {
          return originalValidation.call(this, newValue);
        }
        const variable = variableMap.getVariableById(newValue);
        if (!variable) {
          // Prevent creation of phantom variables due to invalid IDs.
          return null;
        }
        // Accept existing variables regardless of type mismatch warnings.
        return newValue;
      };
      proto.__ucbPatchedVariableValidation = true;
    }

    if (!proto.__ucbPatchedVariableInitModel) {
      const originalInitModel = proto.initModel;
      proto.initModel = function (this: Blockly.FieldVariable) {
        const field = this as Blockly.FieldVariable & {
          workspace_?: Blockly.WorkspaceSvg;
          value_?: string | null;
          getSourceBlock?: () => Blockly.Block | null;
        };
        const block = field.getSourceBlock?.();
        const workspace = block?.workspace || field.workspace_;
        // Allow flyout blocks to initialize a local variable to avoid null IDs in serialization.
        if (workspace?.isFlyout) {
          return originalInitModel.call(this);
        }
        // Avoid auto-creating variables for insertion markers in the main workspace.
        if (block?.isInsertionMarker?.()) {
          field.value_ = null;
          return;
        }
        return originalInitModel.call(this);
      };
      proto.__ucbPatchedVariableInitModel = true;
    }
  } catch (e) {
    console.debug("Error intercepting field variable validation:", e);
  }
}

export function patchWorkspaceRemoveTopBlock(): void {
  try {
    const proto = Blockly.WorkspaceSvg.prototype as unknown as {
      __ucbPatchedRemoveTopBlock?: boolean;
      removeTopBlock: (block: Blockly.BlockSvg) => void;
      getTopBlocks: (ordered: boolean) => Blockly.BlockSvg[];
    };
    if (proto.__ucbPatchedRemoveTopBlock) {
      return;
    }
    const originalRemoveTopBlock = proto.removeTopBlock;
    proto.removeTopBlock = function (this: Blockly.WorkspaceSvg, block: Blockly.BlockSvg) {
      const topBlocks = this.getTopBlocks(false);
      if (!topBlocks.includes(block)) {
        return;
      }
      originalRemoveTopBlock.call(this, block);
    };
    proto.__ucbPatchedRemoveTopBlock = true;
  } catch (e) {
    console.debug("Error patching workspace removeTopBlock:", e);
  }
}
