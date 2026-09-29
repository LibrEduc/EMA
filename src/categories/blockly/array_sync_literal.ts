/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Sync.Literal
 * @description Literal / declare list type inference and ADD input checks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getDeclareElementBlocklyChecks } from "./shared";
import { getInternalTypeForArduinoType } from "../../generators/arduino/block_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
} from "../../generators/arduino/block_types_registry";
import {
  applyListDeclarationBlockWarning,
  handleArrayListVariableSync,
  syncArrayListUntypedWarning,
} from "./array_sync_ownership";
import { revalidateGetIndexBlocksForVariable } from "./array_sync_access";

/**
 * Met à jour les checks des entrées ADD d'un bloc liste (littéral ou define).
 */
export function syncArrayListAddInputChecks(
  block: Blockly.Block,
  checks: string[] | null,
): void {
  for (let j = 0; ; j++) {
    const inp = block.getInput("ADD" + j);
    if (!inp?.connection) break;
    inp.connection.setCheck(checks);
  }
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
