/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * VariableMap create/rename vs FieldInstance names.
 */

import * as Blockly from "blockly";
import {
  convertToUniqueName,
  findInstanceNameCollision,
} from "../instances/instances";

/**
 * Patch Variable Map Create Variable.
 * @param workspace - Blockly workspace.
 */
export function patchVariableMapCreateVariable(workspace: Blockly.Workspace): void {
  try {
    const variableMap = workspace.getVariableMap();
    const originalCreateVariable = variableMap.createVariable.bind(variableMap);
    const variableMapWithOverride = variableMap as Blockly.VariableMap & {
      createVariable: (
        name: string,
        opt_type?: string | null,
        opt_id?: string | null,
      ) => Blockly.IVariableModel<Blockly.IVariableState>;
      renameVariable: (
        variable: Blockly.IVariableModel<Blockly.IVariableState>,
        newName: string,
      ) => void;
      __ucbPatchedInstanceCollision?: boolean;
    };
    variableMapWithOverride.createVariable = (
      name: string,
      opt_type?: string | null,
      opt_id?: string | null,
    ) => {
      const type = opt_type === null || opt_type === "null" ? "" : opt_type;
      const id = opt_id === null ? undefined : opt_id;
      let finalName = name;
      if (!id) {
        const existing = variableMap
          .getAllVariables()
          .find((variable) => variable && variable.getName() === name);
        if (existing) return existing;
      }
      if (findInstanceNameCollision(finalName, workspace)) {
        finalName = convertToUniqueName(finalName, workspace);
      }
      return originalCreateVariable(finalName, type, id);
    };

    if (
      !variableMapWithOverride.__ucbPatchedInstanceCollision &&
      typeof variableMapWithOverride.renameVariable === "function"
    ) {
      const originalRename = variableMapWithOverride.renameVariable.bind(
        variableMap,
      );
      variableMapWithOverride.renameVariable = (variable, newName) => {
        if (findInstanceNameCollision(newName, workspace)) {
          const template =
            (Blockly.Msg as Record<string, string | undefined>)[
              "VARIABLE_NAME_COLLIDES_WITH_INSTANCE"
            ] ||
            'The name "%1" is already used by a component instance.';
          Blockly.dialog.alert(template.replace("%1", newName), () => {
            const Variables = (
              Blockly as unknown as {
                Variables?: {
                  renameVariable?: (
                    ws: Blockly.Workspace,
                    v: Blockly.IVariableModel<Blockly.IVariableState>,
                  ) => void;
                };
              }
            ).Variables;
            Variables?.renameVariable?.(workspace, variable);
          });
          return variable;
        }
        return originalRename(variable, newName);
      };
      variableMapWithOverride.__ucbPatchedInstanceCollision = true;
    }
  } catch (e) {
    console.debug("Error patching VariableMap.createVariable:", e);
  }
}
