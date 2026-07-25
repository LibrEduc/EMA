/**
 * @packageDocumentation
 * @module BlocklyShellFocus
 * @description Relie la coque HTML au FocusManager Blockly 13 (raccourcis W / T).
 */

import * as Blockly from "blockly";

type WorkspaceSvg = Blockly.WorkspaceSvg;
type WorkspaceGetter = () => WorkspaceSvg | null | undefined;

let getWorkspaceSvg: WorkspaceGetter | null = null;

/**
 * Enregistre l'accès au workspace Blockly actif (après inject ou reboot).
 */
export const registerShellBlocklyWorkspace = (getter: WorkspaceGetter): void => {
  getWorkspaceSvg = getter;
};

const resolveRegisteredWorkspace = (): WorkspaceSvg | null => {
  const workspace = getWorkspaceSvg?.();
  return workspace ?? null;
};

/** Même logique que le raccourci Blockly « focus workspace » (touche W). */
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
