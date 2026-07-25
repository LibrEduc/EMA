/**
 * @packageDocumentation
 * @module Arduino.VariableUtils
 * @description Utilities for typed variable tracking and updates.
 * @remarks
 * Variables are one model with three Blockly kinds (forms):
 * - scalar (`""`) — ordinary typed variables
 * - list (`list`) — arrays declared by List toolbox blocks
 * - instance (`instance`) — reserved for future object/instance bindings
 *
 * Name collisions reuse the existing VariableMap entry (see
 * `patchVariableMapCreateVariable`). Exclusive declaration ownership uses
 * `__ucbDeclareBlockId`, the same pattern as `__ucbConstBlockId` for const.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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

/** Blockly kind for ordinary (scalar) variables. */
export const SCALAR_VARIABLE_TYPE = "";

/** Blockly kind for list/array variables. */
export const LIST_VARIABLE_TYPE = "list";

/** Blockly kind for instance variables (reserved for later use). */
export const INSTANCE_VARIABLE_TYPE = "instance";

/** Canonical variable kinds used by µcBlockly. */
export const VARIABLE_KINDS = [
  SCALAR_VARIABLE_TYPE,
  LIST_VARIABLE_TYPE,
  INSTANCE_VARIABLE_TYPE,
] as const;

export type VariableKind = (typeof VARIABLE_KINDS)[number];

/**
 * Default C/Arduino identifier for list variables.
 * Intentionally not translated (FR/EN/ES/AR): always `item`.
 */
export const LIST_DEFAULT_VARIABLE_NAME = "item";

/**
 * Default C/Arduino identifier for instance variables (future).
 * Intentionally not translated: always `instance`.
 */
export const INSTANCE_DEFAULT_VARIABLE_NAME = "instance";

/**
 * Blocks that declare a `list` variable (one declaration owner per variable).
 */
export const LIST_DECLARE_BLOCK_TYPES = [
  "Array_declare",
  "Array_create",
  "Array_with",
  "Array_bitmap",
] as const;

export type ListDeclareBlockType = (typeof LIST_DECLARE_BLOCK_TYPES)[number];

/** True when the block type is a list declaration block. */
export function isListDeclareBlockType(
  blockType: string | null | undefined,
): blockType is ListDeclareBlockType {
  return (
    !!blockType &&
    (LIST_DECLARE_BLOCK_TYPES as readonly string[]).includes(blockType)
  );
}

/** Type canonique du bloc « définir une variable globale typée ». */
export const VARIABLES_DEFINE_BLOCK_TYPE = "variables_define";

/**
 * Alias historique (singulier) conservé pour les projets sauvegardés avant l'unification.
 * @see VARIABLES_DEFINE_BLOCK_TYPE
 */
export const VARIABLES_DEFINE_LEGACY_BLOCK_TYPE = "variable_define";

/** Indique si le type de bloc correspond à une déclaration globale typée. */
export function isVariablesDefineBlock(
  blockType: string | null | undefined,
): boolean {
  return (
    blockType === VARIABLES_DEFINE_BLOCK_TYPE ||
    blockType === VARIABLES_DEFINE_LEGACY_BLOCK_TYPE
  );
}

export type MutableVariableModel = Blockly.IVariableModel<Blockly.IVariableState> & {
  setType?: (type: string) => void;
  type_?: string | null;
  /** Owner block id for const assignment (scalar). */
  __ucbConst?: boolean;
  __ucbConstBlockId?: string;
  /**
   * Owner block id for the exclusive declaration of a kinded variable
   * (list today, instance later). Same conflict pattern as `__ucbConstBlockId`.
   */
  __ucbDeclareBlockId?: string;
};

export function isListVariableType(type: string | null | undefined): boolean {
  return type === LIST_VARIABLE_TYPE;
}

export function isInstanceVariableType(
  type: string | null | undefined,
): boolean {
  return type === INSTANCE_VARIABLE_TYPE;
}

export function isScalarVariableType(type: string | null | undefined): boolean {
  return !type || type === SCALAR_VARIABLE_TYPE;
}

export function isListVariable(
  variable: Blockly.IVariableModel<Blockly.IVariableState> | null | undefined,
): boolean {
  return isListVariableType(variable?.getType?.() ?? null);
}

export function isInstanceVariable(
  variable: Blockly.IVariableModel<Blockly.IVariableState> | null | undefined,
): boolean {
  return isInstanceVariableType(variable?.getType?.() ?? null);
}

/**
 * Sets a variable's type metadata and updates the model.
 * @param variable - Variable model to update.
 * @param type - New type string.
 */
export function setVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  type: string,
): boolean {
  try {
    const workspace = variable.getWorkspace?.();
    const variableMap = workspace?.getVariableMap?.();
    if (variableMap && typeof variableMap.changeVariableType === "function") {
      variableMap.changeVariableType(variable, type);
      return true;
    }
  } catch {
    // Fall through to legacy mutation.
  }
  const mutable = variable as MutableVariableModel;
  if (typeof mutable.setType === "function") {
    mutable.setType(type);
    return true;
  }
  if ("type_" in mutable) {
    mutable.type_ = type;
    return true;
  }
  return false;
}

/**
 * Tags a workspace variable as a list/array variable (`list`).
 */
export function tagVariableAsList(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  return setVariableType(variable, LIST_VARIABLE_TYPE);
}

/**
 * Tags a workspace variable as an instance variable (`instance`).
 */
export function tagVariableAsInstance(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  return setVariableType(variable, INSTANCE_VARIABLE_TYPE);
}

/**
 * Clears a variable's type metadata (back to scalar kind).
 * @param variable - Variable model to update.
 */
export function clearVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): boolean {
  try {
    const workspace = variable.getWorkspace?.();
    const variableMap = workspace?.getVariableMap?.();
    if (variableMap && typeof variableMap.changeVariableType === "function") {
      variableMap.changeVariableType(variable, SCALAR_VARIABLE_TYPE);
      return true;
    }
  } catch {
    // Fall through to legacy mutation.
  }
  const mutable = variable as MutableVariableModel;
  if (typeof mutable.setType === "function") {
    mutable.setType(SCALAR_VARIABLE_TYPE);
    return true;
  }
  if ("type_" in mutable) {
    mutable.type_ = null;
    if (mutable.type_ !== null) {
      delete mutable.type_;
    }
    return true;
  }
  return false;
}

/**
 * Normalizes null/"null" types to empty string.
 * @param variable - Variable model to normalize.
 */
export function normalizeVariableType(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
): void {
  const currentType = variable.getType();
  if (currentType === null || currentType === "null") {
    clearVariableType(variable);
  }
}

/**
 * True when `blockId` owns (or may claim) the exclusive declaration slot.
 * Unowned variables and stale owners (deleted blocks) are claimable.
 */
export function isVariableDeclarationOwner(
  variable: Blockly.IVariableModel<Blockly.IVariableState> | null | undefined,
  blockId: string,
): boolean {
  if (!variable) {
    return true;
  }
  const owner = (variable as MutableVariableModel).__ucbDeclareBlockId;
  if (!owner || owner === blockId) {
    return true;
  }
  const workspace = variable.getWorkspace?.();
  if (!workspace) {
    return true;
  }
  return !workspace.getAllBlocks(false).some((block) => block.id === owner);
}

/**
 * Claims exclusive declaration ownership, mirroring const `__ucbConstBlockId`.
 * @returns `owned_by_other` when another living block already declared this variable.
 */
export function claimVariableDeclaration(
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  blockId: string,
): "claimed" | "already_owner" | "owned_by_other" {
  const typed = variable as MutableVariableModel;
  if (typed.__ucbDeclareBlockId === blockId) {
    return "already_owner";
  }
  if (typed.__ucbDeclareBlockId) {
    const workspace = variable.getWorkspace?.();
    const ownerAlive = workspace
      ?.getAllBlocks(false)
      .some((block) => block.id === typed.__ucbDeclareBlockId);
    if (ownerAlive) {
      return "owned_by_other";
    }
  }
  typed.__ucbDeclareBlockId = blockId;
  return "claimed";
}

/**
 * Releases declaration ownership when the owner block is deleted or retargeted.
 */
export function releaseVariableDeclaration(
  variable: Blockly.IVariableModel<Blockly.IVariableState> | null | undefined,
  blockId: string,
): void {
  if (!variable) {
    return;
  }
  const typed = variable as MutableVariableModel;
  if (typed.__ucbDeclareBlockId === blockId) {
    delete typed.__ucbDeclareBlockId;
  }
}

/**
 * Gets or creates a variable of the given kind/name via Blockly's package helper
 * (name reuse follows VariableMap / `patchVariableMapCreateVariable`).
 */
export function getOrCreateKindedVariable(
  workspace: Blockly.Workspace,
  name: string,
  kind: VariableKind,
): Blockly.IVariableModel<Blockly.IVariableState> {
  return Blockly.Variables.getOrCreateVariablePackage(
    workspace,
    null,
    name,
    kind,
  );
}
