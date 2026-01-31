/**
 * @packageDocumentation
 * @module BlocklyPatches
 * @description Runtime patches and overrides for Blockly behaviors.
 * @remarks
 * Applies compatibility tweaks and µcBlockly-specific adjustments.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

const INPUT_VALUE = 1;
const OUTPUT_VALUE = 2;

/**
 * Returns true when connecting a value output to the variables_const value input.
 * Used so the default Blockly checker allows this connection regardless of type checks.
 */
function isValueToConstInput(
  a: Blockly.Connection | null,
  b: Blockly.Connection | null,
): boolean {
  if (!a || !b) return false;
  const out =
    (a as { type: number }).type === OUTPUT_VALUE
      ? a
      : (b as { type: number }).type === OUTPUT_VALUE
        ? b
        : null;
  const inp =
    (a as { type: number }).type === INPUT_VALUE
      ? a
      : (b as { type: number }).type === INPUT_VALUE
        ? b
        : null;
  if (!out || !inp) return false;
  const block = inp.getSourceBlock();
  return block != null && block.type === "variables_const";
}

/**
 * Patches Blockly's ConnectionChecker so that connecting any value block to the
 * "const ... = ..." block's value input is always allowed. Patches both canConnect
 * and canConnectWithReason (called during drag from flyout).
 */
export function patchConnectionCheckerForConstBlock(): void {
  try {
    const DefaultChecker = (Blockly as unknown as { ConnectionChecker: new (p?: Blockly.Workspace) => Blockly.ConnectionChecker }).ConnectionChecker;
    if (!DefaultChecker?.prototype) return;
    const proto = DefaultChecker.prototype as Blockly.ConnectionChecker & {
      canConnect: (a: Blockly.Connection | null, b: Blockly.Connection | null, isDragging: boolean, opt_distance?: number) => boolean;
      canConnectWithReason: (a: Blockly.Connection | null, b: Blockly.Connection | null, isDragging: boolean, opt_distance?: number) => number;
      __ucbPatchedConstBlock?: boolean;
    };
    if (proto.__ucbPatchedConstBlock) return;

    const originalCanConnect = proto.canConnect;
    proto.canConnect = function (a, b, isDragging, opt_distance) {
      if (isValueToConstInput(a, b)) return true;
      return originalCanConnect.call(this, a, b, isDragging, opt_distance);
    };

    const originalCanConnectWithReason = proto.canConnectWithReason;
    const CAN_CONNECT = (Blockly.Connection as { CAN_CONNECT: number }).CAN_CONNECT;
    proto.canConnectWithReason = function (a, b, isDragging, opt_distance) {
      if (isValueToConstInput(a, b)) return CAN_CONNECT;
      return originalCanConnectWithReason.call(this, a, b, isDragging, opt_distance);
    };

    proto.__ucbPatchedConstBlock = true;
  } catch (e) {
    console.debug("Error patching connection checker for const block:", e);
  }
}

/**
 * Patches VariableMap.createVariable to normalize types and avoid duplicates.
 * @param workspace - Workspace whose variable map will be patched.
 */
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

/**
 * Patches FieldVariable validation to handle normalized types safely.
 */
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

/**
 * Patches WorkspaceSvg.removeTopBlock to tolerate missing blocks.
 */
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
