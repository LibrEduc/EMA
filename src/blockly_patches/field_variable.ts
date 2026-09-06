/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * FieldVariable validation / initModel flyout safety.
 */

import * as Blockly from "blockly";

/**
 * Patch Field Variable Validation.
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
      proto.doClassValidation_ = function (this: Blockly.FieldVariable, newValue: string | null) {
        if (!newValue) return newValue;
        const field = this as Blockly.FieldVariable & { workspace_?: Blockly.WorkspaceSvg; getSourceBlock?: () => Blockly.Block | null };
        const workspace = field.getSourceBlock?.()?.workspace || field.workspace_;
        const variableMap = workspace?.getVariableMap?.();
        if (!variableMap) return originalValidation.call(this, newValue);
        const variable = variableMap.getVariableById(newValue);
        if (!variable) return null;
        return newValue;
      };
      proto.__ucbPatchedVariableValidation = true;
    }
    if (!proto.__ucbPatchedVariableInitModel) {
      const originalInitModel = proto.initModel;
      proto.initModel = function (this: Blockly.FieldVariable) {
        const field = this as Blockly.FieldVariable & { workspace_?: Blockly.WorkspaceSvg; value_?: string | null; getSourceBlock?: () => Blockly.Block | null };
        const block = field.getSourceBlock?.();
        const workspace = block?.workspace || field.workspace_;
        if (workspace?.isFlyout) return originalInitModel.call(this);
        if (block?.isInsertionMarker?.()) {
          field.value_ = null;
          return;
        }
        return originalInitModel.call(this);
      };
      proto.__ucbPatchedVariableInitModel = true;
    }
  } catch (e) {
    console.debug("Error patching FieldVariable:", e);
  }
}
