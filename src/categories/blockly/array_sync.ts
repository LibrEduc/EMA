/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Sync
 * @description List declaration ownership, type sync, and onchange handlers for array blocks.
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
  getArrayIndexBlocklyChecks,
  getBlocklyCompatibleChecks,
  getDeclareElementBlocklyChecks,
  getArrayListUntypedWarningText,
  getDuplicateListDeclarationWarningText,
  handleVariablesSetChange,
  syncListVariableFromField,
} from "./shared";
import { getInternalTypeForArduinoType } from "../../generators/arduino/block_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
  inferArrayGetIndexElementType,
} from "../../generators/arduino/block_types_registry";
import {
  claimVariableDeclaration,
  getOrCreateKindedVariable,
  isListDeclareBlockType,
  LIST_DEFAULT_VARIABLE_NAME,
  LIST_VARIABLE_TYPE,
  releaseVariableDeclaration,
} from "../../generators/arduino/variable_utils";

export const ARRAY_DEFAULT_VAR_NAME = LIST_DEFAULT_VARIABLE_NAME;

export function bindArrayWithDefaultVariable(block: Blockly.Block): void {
  const workspace = block.workspace;
  if (!workspace) {
    return;
  }
  const variableModel = getOrCreateKindedVariable(
    workspace,
    ARRAY_DEFAULT_VAR_NAME,
    LIST_VARIABLE_TYPE,
  );
  if (variableModel?.getId()) {
    block.setFieldValue(variableModel.getId(), "VAR");
    syncListVariableFromField(block, "VAR");
  }
}

/**
 * Claims / releases list declaration ownership (same pattern as variables_const).
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const syncListDeclarationOwnership = (block: Blockly.Block): boolean => {
  if (!block.workspace || block.isInFlyout || !isListDeclareBlockType(block.type)) {
    return false;
  }
  const variableId = block.getFieldValue("VAR");
  if (!variableId) {
    return false;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    return false;
  }
  const claim = claimVariableDeclaration(variable, block.id);
  if (claim === "owned_by_other") {
    block.setWarningText(getDuplicateListDeclarationWarningText());
    return true;
  }
  return false;
};

/**
 * Affiche un avertissement si ce bloc n'est pas le propriétaire de la déclaration.
 * @param block - Blockly block instance.
 * @returns True when the condition holds.
 */
export const syncListDeclarationUniqueness = (block: Blockly.Block): boolean => {
  return syncListDeclarationOwnership(block);
};

/**
 * Applique warning ownership (+ non typé pour Array_with).
 * @param block - Blockly block instance.
 */
export const applyListDeclarationBlockWarning = (block: Blockly.Block): void => {
  if (syncListDeclarationOwnership(block)) {
    return;
  }
  if (block.type === "Array_with") {
    syncArrayListUntypedWarning(block);
    return;
  }
  if (isListDeclareBlockType(block.type)) {
    block.setWarningText(null);
  }
};

/**
 * Revalide l'ownership des déclarations de listes sur tout le workspace.
 * @param workspace - Blockly workspace.
 */
export const revalidateListDeclarationUniqueness = (
  workspace: Blockly.Workspace,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (!isListDeclareBlockType(block.type)) {
      continue;
    }
    applyListDeclarationBlockWarning(block);
  }
};

/** Synchronise le type Blockly `list` et l'ownership de déclaration. */
export function handleArrayListVariableSync(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DELETE &&
    isListDeclareBlockType(block.type)
  ) {
    // Block may already be disposed; release via event ids when possible.
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === block.id
  ) {
    if (isListDeclareBlockType(block.type) && event.recordUndo) {
      bindArrayWithDefaultVariable(block);
    } else {
      syncListVariableFromField(block, "VAR");
    }
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CHANGE &&
    (event as Blockly.Events.BlockChange).element === "field" &&
    (event as Blockly.Events.BlockChange).name === "VAR"
  ) {
    const change = event as Blockly.Events.BlockChange;
    if (isListDeclareBlockType(block.type) && change.oldValue) {
      const previous = workspace
        ?.getVariableMap()
        .getVariableById(String(change.oldValue));
      releaseVariableDeclaration(previous, block.id);
    }
    syncListVariableFromField(block, "VAR");
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DELETE ||
    event.type === Blockly.Events.BLOCK_CREATE
  ) {
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
  }
}

/** Met à jour la sortie des blocs d'accès index et propage le typage vers le parent set. */
function arrayGetIndexOutputSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  const elementType = inferArrayGetIndexElementType(this);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getBlocklyCompatibleChecks(elementType)
      : null;
  this.setOutput(true, checks);
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  if (
    parent &&
    (parent.type === "variables_set_dynamic" || parent.type === "variables_set")
  ) {
    handleVariablesSetChange(parent, event, parent.type);
  }
}

/** Revalide les blocs getIndex / modify qui référencent une variable liste. */
export function revalidateGetIndexBlocksForVariable(
  workspace: Blockly.Workspace,
  variableId: string,
  event: Blockly.Events.Abstract,
): void {
  for (const block of workspace.getAllBlocks(false)) {
    if (block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (
      block.type === "Array_getIndex_in_list" ||
      block.type === "Array_getIndex_in_array"
    ) {
      arrayGetIndexOutputSyncOnChange.call(block, event);
    } else if (
      block.type === "Array_modify" ||
      block.type === "Array_fix"
    ) {
      syncArrayListAssignValueInputCheck(block);
      syncArrayIndexInputChecks(block);
    }
  }
}

/** Restreint les entrées D* aux entiers (index 0-based). */
export function syncArrayIndexInputChecks(block: Blockly.Block): void {
  const dim = parseInt(block.getFieldValue("dim") || "1", 10);
  const checks = getArrayIndexBlocklyChecks();
  for (let i = 0; i < dim; i++) {
    const inp = block.getInput("D" + i);
    if (inp?.connection) {
      inp.connection.setCheck(checks);
    }
  }
}

/** Restreint l'entrée « value » au type élément du tableau sélectionné. */
export function syncArrayListAssignValueInputCheck(block: Blockly.Block): void {
  const elementType = inferArrayGetIndexElementType(block);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getDeclareElementBlocklyChecks(elementType)
      : null;
  const valueInput = block.getInput("value");
  if (valueInput?.connection) {
    valueInput.connection.setCheck(checks);
  }
}

function arrayListAssignAndIndexSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  syncArrayIndexInputChecks(this);
  if (this.type === "Array_fix" || this.type === "Array_modify") {
    syncArrayListAssignValueInputCheck(this);
  }
}

/** Restreint l'entrée « value » au type élément du tableau sélectionné. */
function arrayModifyValueCheckSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  arrayListAssignAndIndexSyncOnChange.call(this, event);
}

export function handleArrayModifyOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayModifyValueCheckSyncOnChange.call(block, event);
}

export function handleArrayGetIndexOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayGetIndexOutputSyncOnChange.call(block, event);
  if (block.type === "Array_getIndex_in_array") {
    arrayListAssignAndIndexSyncOnChange.call(block, event);
  }
}

export function handleArrayFixOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayListAssignAndIndexSyncOnChange.call(block, event);
}

/**
 * Met à jour les checks des entrées ADD d'un bloc liste (littéral ou define).
 */
function syncArrayListAddInputChecks(
  block: Blockly.Block,
  checks: string[] | null,
): void {
  for (let j = 0; ; j++) {
    const inp = block.getInput("ADD" + j);
    if (!inp?.connection) break;
    inp.connection.setCheck(checks);
  }
}

function syncArrayListUntypedWarning(block: Blockly.Block): void {
  if (syncListDeclarationUniqueness(block)) {
    return;
  }
  const inferred = inferArrayElementTypeFromBlock(block);
  const incomplete =
    !hasArrayListConnectedElements(block) ||
    !inferred ||
    inferred === "__NO_TYPE__";
  block.setWarningText(incomplete ? getArrayListUntypedWarningText() : null);
}

/**
 * Bloc valeur `Array_list_literal` : type depuis le parent (declare/create) ou inféré.
 */
export function arrayListLiteralTypeFromInputsOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) return;
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) return;
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  let elementInternalType: string | null = null;
  let typeFromParent = false;
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  const parentChoice = parent?.getFieldValue?.("choix");
  if (
    parent &&
    parentChoice === "c2" &&
    (parent.type === "Array_declare" || parent.type === "Array_create")
  ) {
    const declaredType = parent.getFieldValue?.("type");
    if (declaredType && declaredType !== "__NO_TYPE__") {
      elementInternalType = getInternalTypeForArduinoType(declaredType);
      typeFromParent = true;
    }
  }
  if (!typeFromParent) {
    const inferred = inferArrayElementTypeFromBlock(this);
    if (inferred && inferred !== "__NO_TYPE__") {
      elementInternalType = inferred;
    }
  }
  const checks = elementInternalType
    ? getDeclareElementBlocklyChecks(elementInternalType)
    : null;
  const blocklyOutputType =
    elementInternalType === "bool"
      ? "Boolean"
      : elementInternalType === "int" || elementInternalType === "float"
        ? "Number"
        : elementInternalType === "string"
          ? "String"
          : elementInternalType || null;
  syncArrayListAddInputChecks(this, checks);
  syncArrayListUntypedWarning(this);
  if (this.outputConnection) {
    const incomplete =
      !hasArrayListConnectedElements(this) ||
      !elementInternalType;
    if (incomplete) {
      this.setOutput(true, "__NO_TYPE__");
      return;
    }
    if (checks) {
      this.outputConnection.setCheck(checks);
    } else {
      this.outputConnection.setCheck(null);
    }
  } else if (elementInternalType) {
    this.setOutput(true, blocklyOutputType);
  } else {
    this.setOutput(true, "__NO_TYPE__");
  }
}

/**
 * Bloc instruction `Array_with` : infère le type des entrées ADD, sans sortie ni chaînage.
 */
export function arrayWithDeclareTypeFromInputsOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) return;
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) return;
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === this.id
  ) {
    if (this.outputConnection) {
      this.setOutput(false);
    }
    if (this.previousConnection) {
      this.setPreviousStatement(false);
    }
    if (this.nextConnection) {
      this.setNextStatement(false);
    }
  }
  const inferred = inferArrayElementTypeFromBlock(this);
  const checks =
    inferred && inferred !== "__NO_TYPE__"
      ? getDeclareElementBlocklyChecks(inferred)
      : null;
  syncArrayListAddInputChecks(this, checks);
  applyListDeclarationBlockWarning(this);
  handleArrayListVariableSync(this, event);
  const varId = this.getFieldValue("VAR");
  if (varId && this.workspace) {
    revalidateGetIndexBlocksForVariable(this.workspace, varId, event);
  }
}
