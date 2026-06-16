/**
 * @packageDocumentation
 * @module Arduino.VariableScope
 * @description Résolution du périmètre des variables locales (setup / loop / procédure).
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "./arduino_generator";

export type LocalVariableScope =
  | { kind: "procedure"; id: string }
  | { kind: "setup" }
  | { kind: "loop" };

/** Blocs littéraux de liste (valeur branchée dans variables_set ou Array_declare). */
export function isArrayValueBlock(block: Block | null): boolean {
  return (
    block?.type === "Array_list_literal" ||
    block?.type === "Array_list_3"
  );
}

/** Bloc instruction « define variable as list » (déclaration globale). */
export function isArrayListStatementBlock(block: Block | null): boolean {
  return block?.type === "Array_with";
}

/**
 * Déplie un bloc « local » pour atteindre la valeur réelle.
 */
export function unwrapValueBlock(block: Block | null): Block | null {
  if (block?.type === "variables_local") {
    return block.getInputTargetBlock("VALUE");
  }
  return block;
}

/**
 * Affectation produisant une déclaration locale (wrapper « local » ou liste).
 */
export function usesLocalVariableDeclaration(valueBlock: Block | null): boolean {
  if (!valueBlock) {
    return false;
  }
  if (valueBlock.type === "variables_local") {
    return true;
  }
  return isArrayValueBlock(valueBlock);
}

function isUnderInput(
  block: Block,
  ancestor: Block,
  inputName: string,
): boolean {
  let current: Block | null = block;
  while (current && current.id !== ancestor.id) {
    const parent = current.getParent();
    if (!parent) {
      return false;
    }
    const input = parent.getInputWithBlock(current);
    if (parent.id === ancestor.id && input?.name === inputName) {
      return true;
    }
    current = parent;
  }
  return false;
}

/**
 * Détermine si un bloc variables_set se trouve dans setup(), loop() ou une procédure.
 */
export function resolveLocalVariableScope(block: Block): LocalVariableScope {
  let current: Block | null = block;
  while (current) {
    const parent = current.getParent();
    if (!parent) {
      break;
    }
    if (
      parent.type === "procedures_defreturn" ||
      parent.type === "procedures_defnoreturn"
    ) {
      return { kind: "procedure", id: parent.id };
    }
    if (parent.type === "board_base_setup") {
      return { kind: "setup" };
    }
    if (parent.type === "board_base_loop") {
      return { kind: "loop" };
    }
    if (parent.type === "board_base_setup_loop") {
      const input = parent.getInputWithBlock(current);
      if (input?.name === "SETUP") {
        return { kind: "setup" };
      }
      if (input?.name === "LOOP") {
        return { kind: "loop" };
      }
    }
    current = parent;
  }

  const root = block.getRootBlock();
  if (root.type === "board_base_setup") {
    return { kind: "setup" };
  }
  if (root.type === "board_base_loop") {
    return { kind: "loop" };
  }
  if (root.type === "board_base_setup_loop") {
    return isUnderInput(block, root, "SETUP")
      ? { kind: "setup" }
      : { kind: "loop" };
  }
  if (
    root.type === "procedures_defreturn" ||
    root.type === "procedures_defnoreturn"
  ) {
    return { kind: "procedure", id: root.id };
  }
  return { kind: "loop" };
}

/**
 * Enregistre une déclaration locale dans le bon contexte Arduino.
 */
export function emitLocalDeclaration(
  generator: ArduinoGenerator,
  scope: LocalVariableScope,
  tag: string,
  declaration: string,
): void {
  if (scope.kind === "procedure") {
    generator.addLocalVariable(scope.id, tag, declaration);
    return;
  }
  if (scope.kind === "setup") {
    generator.addSetup(tag, declaration);
    return;
  }
  generator.addLoop(tag, declaration);
}

/**
 * Identifiant stable pour une déclaration locale.
 */
export function localDeclarationTag(
  scope: LocalVariableScope,
  varName: string,
): string {
  const scopeKey =
    scope.kind === "procedure" ? scope.id : scope.kind;
  return `local_${scopeKey}_${varName}`;
}
