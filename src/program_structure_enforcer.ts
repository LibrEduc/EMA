/**
 * @packageDocumentation
 * @module ProgramStructureEnforcer
 * @description Désactive les blocs qui ne sont pas dans une structure de programme valide.
 * @remarks
 * Seuls les blocs racine setup/loop/procédure et leurs descendants restent actifs.
 * @license GPL-3.0-or-later
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
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { isBlockOnMainWorkspace } from "./categories/blockly/shared";

/** Identifiant Blockly pour le motif « hors programme ». */
export const NOT_IN_PROGRAM_DISABLED_REASON = "ucb_not_in_program";

/** Blocs autorisés comme racine d'un programme sur le workspace. */
const PROGRAM_ROOT_BLOCK_TYPES = new Set([
  "board_base_setup",
  "board_base_loop",
  "board_base_setup_loop",
  "procedures_defreturn",
  "procedures_defnoreturn",
]);

type WorkspaceListener = (e: Blockly.Events.Abstract) => void;

const INSTALLED = new WeakMap<Blockly.Workspace, WorkspaceListener>();

const isRelevantEvent = (e: Blockly.Events.Abstract): boolean =>
  e.type === Blockly.Events.BLOCK_MOVE ||
  e.type === Blockly.Events.BLOCK_CREATE ||
  e.type === Blockly.Events.BLOCK_DELETE ||
  e.type === Blockly.Events.FINISHED_LOADING;

/**
 * Indique si le bloc est une racine de programme Arduino / procédure.
 */
export function isProgramRootBlock(block: Blockly.Block): boolean {
  return PROGRAM_ROOT_BLOCK_TYPES.has(block.type);
}

/**
 * Indique si le bloc participe à un programme (racine autorisée ou descendant connecté).
 */
export function isInActiveProgram(block: Blockly.Block): boolean {
  if (block.isShadow()) {
    return true;
  }
  if (!isBlockOnMainWorkspace(block)) {
    return true;
  }

  const root = block.getRootBlock();
  if (!isProgramRootBlock(root)) {
    return false;
  }
  if (block.id === root.id) {
    return true;
  }

  let current: Blockly.Block | null = block;
  while (current && current.id !== root.id) {
    const parent = current.getParent();
    if (!parent) {
      return false;
    }
    current = parent;
  }
  return current?.id === root.id;
}

/**
 * Met à jour l'état actif/inactif de tous les blocs du workspace principal.
 */
export function updateProgramStructureDisabledState(
  workspace: Blockly.Workspace,
): void {
  const wsSvg = workspace as Blockly.WorkspaceSvg;
  if (wsSvg.isDragging?.()) {
    return;
  }

  for (const block of workspace.getAllBlocks(false)) {
    if (!isBlockOnMainWorkspace(block)) {
      continue;
    }
    const active = isInActiveProgram(block);
    block.setDisabledReason(!active, NOT_IN_PROGRAM_DISABLED_REASON);
  }
}

/**
 * Désinstalle l'enforceur de structure de programme.
 */
export function uninstallProgramStructureEnforcer(
  workspace: Blockly.Workspace,
): void {
  const listener = INSTALLED.get(workspace);
  if (!listener) {
    return;
  }
  workspace.removeChangeListener(listener);
  INSTALLED.delete(workspace);
  for (const block of workspace.getAllBlocks(false)) {
    if (isBlockOnMainWorkspace(block)) {
      block.setDisabledReason(false, NOT_IN_PROGRAM_DISABLED_REASON);
    }
  }
}

/**
 * Installe l'enforceur : blocs orphelins ou hors setup/loop/procédure → inactifs.
 */
export function installProgramStructureEnforcer(
  workspace: Blockly.Workspace,
): void {
  uninstallProgramStructureEnforcer(workspace);

  let timer: number | null = null;

  const scheduleUpdate = (): void => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      timer = null;
      updateProgramStructureDisabledState(workspace);
    }, 0);
  };

  const listener: WorkspaceListener = (e) => {
    const wsSvg = workspace as Blockly.WorkspaceSvg;
    if (e.isUiEvent || wsSvg.isDragging?.()) {
      return;
    }
    if (!isRelevantEvent(e)) {
      return;
    }
    scheduleUpdate();
  };

  workspace.addChangeListener(listener);
  INSTALLED.set(workspace, listener);
  scheduleUpdate();
}
