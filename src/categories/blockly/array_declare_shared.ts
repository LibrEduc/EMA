/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareShared
 * @description Shared helpers for Array_declare and Array_create block defs.
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
import { getDeclareContenuBlocklyChecks } from "./shared";

/**
 * Lists dimension value-input names present on an Array_create block.
 * @param block Array_create block.
 * @returns Input names such as D0, D1, …
 */
export function getArrayCreateDimensionInputNames(block: Blockly.Block): string[] {
  const dim = parseInt(block.getFieldValue("dim") || "1", 10);
  const names: string[] = [];
  for (let i = 0; i < dim; i++) {
    if (block.getInput("D" + i)) {
      names.push("D" + i);
    }
  }
  return names;
}

/**
 * Notifies connected list-literal blocks to refresh type from parent define/create.
 * @param block Array_declare or Array_create parent block.
 */
export function notifyListBlockTypeFromParent(block: Blockly.Block): void {
  const inputNames =
    block.type === "Array_declare"
      ? ["contenu", "contenu2"]
      : getArrayCreateDimensionInputNames(block);
  for (const inputName of inputNames) {
    const listBlock = block.getInputTargetBlock(inputName);
    if (
      listBlock?.type === "Array_list_literal" ||
      listBlock?.type === "Array_list_3"
    ) {
      (
        listBlock as Blockly.Block & {
          onchange?: (e: Blockly.Events.Abstract) => void;
        }
      ).onchange?.({
        type: Blockly.Events.BLOCK_CHANGE,
        isUiEvent: false,
      } as Blockly.Events.Abstract);
    }
  }
}

/**
 * Sets contenu / contenu2 connection checks from choix + type fields.
 * @param block Array_declare block.
 */
export function syncArrayDeclareContenuCheck(block: Blockly.Block): void {
  const choix = block.getFieldValue("choix");
  const typeField = block.getFieldValue("type") || "int";
  const checks = getDeclareContenuBlocklyChecks(choix, typeField);
  for (const inputName of ["contenu", "contenu2"]) {
    const contenuInput = block.getInput(inputName);
    if (contenuInput?.connection) {
      contenuInput.connection.setCheck(checks);
    }
  }
}

/**
 * Sets D* connection checks on Array_create from choix + type fields.
 * @param block Array_create block.
 */
export function syncArrayCreateInputsCheck(block: Blockly.Block): void {
  const choix = block.getFieldValue("choix");
  const typeField = block.getFieldValue("type") || "int";
  const checks = getDeclareContenuBlocklyChecks(choix, typeField);
  for (const inputName of getArrayCreateDimensionInputNames(block)) {
    const dimInput = block.getInput(inputName);
    if (dimInput?.connection) {
      dimInput.connection.setCheck(checks);
    }
  }
}
