/**
 * @packageDocumentation
 * @module Arduino.StrictTypeEnforcer
 * @description Post-connection type enforcement without drag-time checker hooks.
 * @remarks
 * Runs after Blockly events settle (no drag/preview interception) to avoid
 * ghost blocks and gesture/preview instability seen with global strict checkers.
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
import { handleVariablesSetChange } from "../../categories/blockly/shared";

export type StrictTypeEnforcerMode = "warn" | "disconnect";
export type StrictTypeEnforcerScope = "variables-only" | "extended";

export interface StrictTypeEnforcerOptions {
  mode?: StrictTypeEnforcerMode;
  scope?: StrictTypeEnforcerScope;
}

type WorkspaceListener = (e: Blockly.Events.Abstract) => void;

const INSTALLED = new WeakMap<Blockly.Workspace, WorkspaceListener>();

const isRelevantEvent = (e: Blockly.Events.Abstract): boolean =>
  e.type === Blockly.Events.BLOCK_MOVE ||
  e.type === Blockly.Events.BLOCK_CHANGE ||
  e.type === Blockly.Events.BLOCK_CREATE ||
  e.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE ||
  e.type === Blockly.Events.VAR_CREATE ||
  e.type === Blockly.Events.VAR_RENAME ||
  e.type === Blockly.Events.VAR_DELETE;

/**
 * Uninstalls a previously installed strict type enforcer.
 * @param workspace - Target workspace.
 */
export function uninstallStrictTypeEnforcer(workspace: Blockly.Workspace): void {
  const listener = INSTALLED.get(workspace);
  if (listener) {
    workspace.removeChangeListener(listener);
    INSTALLED.delete(workspace);
  }
}

/**
 * Installs post-connection type enforcement.
 * @param workspace - Target workspace.
 * @param options - Enforcer options.
 */
export function installStrictTypeEnforcer(
  workspace: Blockly.Workspace,
  options: StrictTypeEnforcerOptions = {},
): void {
  uninstallStrictTypeEnforcer(workspace);

  const mode = options.mode ?? "disconnect";
  const scope = options.scope ?? "variables-only";

  let timer: number | null = null;

  const listener: WorkspaceListener = (e) => {
    const wsSvg = workspace as Blockly.WorkspaceSvg;
    if (e.isUiEvent || (wsSvg.isDragging && wsSvg.isDragging())) return;
    if (e.type === Blockly.Events.FINISHED_LOADING) return;
    if (!isRelevantEvent(e)) return;

    if (timer !== null) {
      window.clearTimeout(timer);
    }
    // Defer until Blockly finishes endDrag/applyConnections/render cycle.
    timer = window.setTimeout(() => {
      timer = null;
      if (scope === "variables-only") {
        const all = workspace.getAllBlocks(false);
        for (const block of all) {
          if (block.type === "variables_set" || block.type === "variables_set_dynamic") {
            handleVariablesSetChange(block, e, "strict_enforcer");
          }
        }
        return;
      }

      // Extended mode currently delegates to variable assignment enforcement,
      // and can be expanded later to other typed sinks.
      const all = workspace.getAllBlocks(false);
      for (const block of all) {
        if (block.type === "variables_set" || block.type === "variables_set_dynamic") {
          handleVariablesSetChange(block, e, "strict_enforcer");
        }
      }
      if (mode === "warn") {
        // mode reserved for future non-disconnecting behavior.
      }
    }, 0);
  };

  workspace.addChangeListener(listener);
  INSTALLED.set(workspace, listener);
}

