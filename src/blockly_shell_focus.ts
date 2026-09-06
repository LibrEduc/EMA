/**
 * @packageDocumentation
 * @module BlocklyShellFocus
 * @description Connects the HTML shell to Blockly 13 FocusManager (W / T shortcuts).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

type WorkspaceSvg = Blockly.WorkspaceSvg;
type WorkspaceGetter = () => WorkspaceSvg | null | undefined;

let getWorkspaceSvg: WorkspaceGetter | null = null;

/**
 * Registers access to the active Blockly workspace (after inject or reboot).
 * @param getter - Accessor callback.
 */
export const registerShellBlocklyWorkspace = (getter: WorkspaceGetter): void => {
  getWorkspaceSvg = getter;
};

const resolveRegisteredWorkspace = (): WorkspaceSvg | null => {
  const workspace = getWorkspaceSvg?.();
  return workspace ?? null;
};

/** Same logic as the Blockly "focus workspace" shortcut (W key). */
const resolveEffectiveWorkspace = (workspace: WorkspaceSvg): WorkspaceSvg => {
  if (workspace.isFlyout) {
    const target = workspace.targetWorkspace as WorkspaceSvg | null;
    if (target) {
      return resolveEffectiveWorkspace(target);
    }
  }
  return workspace.getRootWorkspace() ?? workspace;
};

const scrollWorkspaceRegionIntoView = (): void => {
  document.getElementById("blockly-workspace-main")?.scrollIntoView({ block: "start" });
};

/**
 * Place le focus Blockly sur le workspace (équivalent touche **W**).
 * @returns True when the condition holds.
 */
export const focusBlocklyWorkspace = (): boolean => {
  const workspace = resolveRegisteredWorkspace();
  if (!workspace || workspace.isDragging()) {
    return false;
  }

  Blockly.keyboardNavigationController.setIsActive(true);
  const effective = resolveEffectiveWorkspace(workspace);
  const focusManager = Blockly.getFocusManager();
  const focusTarget = effective.getWorkspaceFocusTarget() ?? effective;
  focusManager.focusNode(focusTarget);
  scrollWorkspaceRegionIntoView();
  return true;
};

/**
 * Place le focus Blockly sur la toolbox ou le flyout (équivalent touche **T**).
 * @returns True when the condition holds.
 */
export const focusBlocklyToolbox = (): boolean => {
  const workspace = resolveRegisteredWorkspace();
  if (!workspace || workspace.isDragging()) {
    return false;
  }

  Blockly.keyboardNavigationController.setIsActive(true);
  const focusManager = Blockly.getFocusManager();
  const toolbox = workspace.getToolbox();
  if (toolbox) {
    focusManager.focusTree(toolbox);
    scrollWorkspaceRegionIntoView();
    return true;
  }

  const flyout = workspace.getFlyout();
  if (flyout) {
    focusManager.focusTree(flyout.getWorkspace());
    scrollWorkspaceRegionIntoView();
    return true;
  }

  return false;
};
