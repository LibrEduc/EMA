/**
 * @packageDocumentation
 * @module Instances.NameGuard
 * @description Prevent variable / instance name collisions (Blockly Variables UI).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { findInstanceNameCollision } from "./instances";

type VariablesNs = {
  renameVariable: (
    workspace: Blockly.Workspace,
    variable: Blockly.IVariableModel<Blockly.IVariableState>,
    opt_callback?: (p1?: string | null) => void,
  ) => void;
  createVariableButtonHandler: (
    workspace: Blockly.WorkspaceSvg,
    opt_callback?: (p1?: string | null) => void,
    opt_type?: string,
  ) => void;
  promptName: (
    promptText: string,
    defaultText: string,
    callback: (p1: string | null) => void,
  ) => void;
  nameUsedWithAnyType: (
    name: string,
    workspace: Blockly.Workspace,
  ) => Blockly.IVariableModel<Blockly.IVariableState> | null;
  nameUsedWithConflictingParam: (
    oldName: string,
    newName: string,
    workspace: Blockly.Workspace,
  ) => string | null;
  __ucbPatchedInstanceNames?: boolean;
};

function msgOr(key: string, fallback: string): string {
  const value = (Blockly.Msg as Record<string, string | undefined>)[key];
  return value && value.length ? value : fallback;
}

function getVariablesNs(): VariablesNs | null {
  const ns = (Blockly as unknown as { Variables?: VariablesNs }).Variables;
  return ns ?? null;
}

function alertCollidesWithInstance(name: string, then: () => void): void {
  const template = msgOr(
    "VARIABLE_NAME_COLLIDES_WITH_INSTANCE",
    'The name "%1" is already used by a component instance.',
  );
  Blockly.dialog.alert(template.replace("%1", name), then);
}

/**
 * Patches Blockly.Variables rename / create prompts so variable names cannot match an existing FieldInstance name.
 */
export function patchVariableUiAgainstInstances(): void {
  const Variables = getVariablesNs();
  if (!Variables || Variables.__ucbPatchedInstanceNames) {
    return;
  }

  Variables.renameVariable = function (workspace, variable, opt_callback): void {
    const promptRename = (defaultName: string): void => {
      Variables.promptName(
        String(
          Blockly.Msg["RENAME_VARIABLE_TITLE"] ?? 'Rename variable "%1" to:',
        ).replace("%1", variable.getName()),
        defaultName,
        (newName) => {
          if (!newName) {
            opt_callback?.(null);
            return;
          }
          const other = Variables.nameUsedWithAnyType(newName, workspace);
          if (other && other.getId() !== variable.getId()) {
            const msg = String(
              Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE"] ??
                'A variable named "%1" already exists for another type: "%2".',
            )
              .replace("%1", other.getName())
              .replace("%2", other.getType());
            Blockly.dialog.alert(msg, () => promptRename(newName));
            return;
          }
          const paramConflict = Variables.nameUsedWithConflictingParam(
            variable.getName(),
            newName,
            workspace,
          );
          if (paramConflict) {
            const msg = String(
              Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_A_PARAMETER"] ??
                'A variable named "%1" already exists as a parameter in procedure "%2".',
            )
              .replace("%1", newName)
              .replace("%2", paramConflict);
            Blockly.dialog.alert(msg, () => promptRename(newName));
            return;
          }
          if (findInstanceNameCollision(newName, workspace)) {
            alertCollidesWithInstance(newName, () => promptRename(newName));
            return;
          }
          workspace.getVariableMap().renameVariable(variable, newName);
          opt_callback?.(newName);
        },
      );
    };
    promptRename("");
  };

  Variables.createVariableButtonHandler = function (
    workspace,
    opt_callback,
    opt_type,
  ): void {
    const promptCreate = (defaultName: string): void => {
      Variables.promptName(
        String(Blockly.Msg["NEW_VARIABLE_TITLE"] ?? "New variable name:"),
        defaultName,
        (text) => {
          if (text === null || text === undefined) {
            opt_callback?.(null);
            return;
          }
          if (text === "") {
            opt_callback?.(null);
            return;
          }
          const existing = Variables.nameUsedWithAnyType(text, workspace);
          if (existing) {
            opt_callback?.(undefined);
            return;
          }
          if (findInstanceNameCollision(text, workspace)) {
            alertCollidesWithInstance(text, () => promptCreate(text));
            return;
          }
          workspace.getVariableMap().createVariable(text, opt_type);
          opt_callback?.(text);
        },
      );
    };
    promptCreate("");
  };

  Variables.__ucbPatchedInstanceNames = true;
}
