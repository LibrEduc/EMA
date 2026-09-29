/**
 * @packageDocumentation
 * @module WorkspaceResize
 * @description Workspace SVG resize (Blockly.svgResize) without importing the app entry point.
 * @remarks
 * Call {@link registerWorkspaceForSvgResize} once after the workspace is created.
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

let workspaceSvgRef: Blockly.WorkspaceSvg | null = null;

/**
 * Registers the Blockly workspace used for SVG resize (avoids circular import with index.ts).
 * @param workspace - Blockly workspace.
 */
export function registerWorkspaceForSvgResize(workspace: Blockly.Workspace): void {
  workspaceSvgRef = workspace as Blockly.WorkspaceSvg;
}

/**
 * Returns the registered workspace, if any (e.g. for flex-resizer mouseup).
 * @returns Operation result.
 */
export function getWorkspaceSvgRef(): Blockly.WorkspaceSvg | null {
  return workspaceSvgRef;
}

/**
 * Updates workspace SVG size and position to match the layout container.
 */
export const µcB_workspaceOnResize = (): void => {
  const workspaceContentArea = document.getElementById("div_workspace_content_area");
  const workspaceContentBlockly = document.getElementById("div_workspace_content_blockly");
  if (!workspaceContentArea || !workspaceContentBlockly || !workspaceSvgRef) {
    console.warn("Workspace elements not found, skipping resize");
    return;
  }

  let x = Number(workspaceContentArea.offsetLeft) || 0;
  let y = Number(workspaceContentArea.offsetTop) || 0;
  let element: HTMLElement = workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += Number(element.offsetLeft) || 0;
    y += Number(element.offsetTop) || 0;
  }
  const rawWidth = Number(workspaceContentArea.offsetWidth);
  const rawHeight = Number(workspaceContentArea.offsetHeight);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 1;
  Object.assign(workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Number.isFinite(x) ? x : 0}px`,
    top: `${Number.isFinite(y) ? y : 0}px`,
  });
  Blockly.svgResize(workspaceSvgRef);
};
