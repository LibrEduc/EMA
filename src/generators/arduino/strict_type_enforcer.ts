/**
 * @packageDocumentation
 * @module Arduino.StrictTypeEnforcer
 * @description Post-connection type enforcement without drag-time checker hooks.
 * @remarks
 * Runs after Blockly events settle (no drag/preview interception) to avoid
 * ghost blocks and gesture/preview instability seen with global strict checkers.
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
import {
  handleVariablesSetChange,
  revalidateBoardIntInputBlocks,
  revalidateLocalWrapperBlocks,
  revalidateProcedureCallBlocks,
  revalidateTypedNumericBlocks,
} from "../../categories/blockly/shared";
import {
  queueWorkspaceEnforcement,
} from "../../core/workspace_event_utils";

export type StrictTypeEnforcerMode = "warn" | "disconnect";
export type StrictTypeEnforcerScope = "variables-only" | "extended";

export interface StrictTypeEnforcerOptions {
  mode?: StrictTypeEnforcerMode;
  scope?: StrictTypeEnforcerScope;
}

type WorkspaceListener = (e: Blockly.Events.Abstract) => void;

const INSTALLED = new WeakMap<Blockly.Workspace, WorkspaceListener>();

/** Debounce after block moves settle (ms). */
const STRICT_TYPE_DEBOUNCE_MS = 100;

const isRelevantEvent = (e: Blockly.Events.Abstract): boolean =>
  e.type === Blockly.Events.BLOCK_MOVE ||
  e.type === Blockly.Events.BLOCK_CHANGE ||
  e.type === Blockly.Events.BLOCK_CREATE ||
  e.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE ||
  e.type === Blockly.Events.VAR_CREATE ||
  e.type === Blockly.Events.VAR_RENAME ||
  e.type === Blockly.Events.VAR_DELETE;

const VARIABLE_SET_TYPES = new Set([
  "variables_set",
  "variables_set_dynamic",
]);

const revalidateVariablesSetBlocks = (
  workspace: Blockly.Workspace,
  event: Blockly.Events.Abstract,
): void => {
  const blockId =
    "blockId" in event ? (event as { blockId?: string }).blockId : undefined;
  if (blockId) {
    const block = workspace.getBlockById(blockId);
    if (block && VARIABLE_SET_TYPES.has(block.type)) {
      handleVariablesSetChange(block, event, "strict_enforcer");
      return;
    }
  }
  for (const block of workspace.getAllBlocks(false)) {
    if (VARIABLE_SET_TYPES.has(block.type)) {
      handleVariablesSetChange(block, event, "strict_enforcer");
    }
  }
};

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

  const listener: WorkspaceListener = (e) => {
    if (e.type === Blockly.Events.FINISHED_LOADING) {
      return;
    }
    queueWorkspaceEnforcement(
      workspace,
      e,
      isRelevantEvent,
      () => {
        revalidateLocalWrapperBlocks(workspace, e);
        revalidateTypedNumericBlocks(workspace, e);
        revalidateProcedureCallBlocks(workspace);
        revalidateBoardIntInputBlocks(workspace, e);
        revalidateVariablesSetBlocks(workspace, e);
        if (scope !== "variables-only" && mode === "warn") {
          // mode reserved for future non-disconnecting behavior.
        }
      },
      STRICT_TYPE_DEBOUNCE_MS,
    );
  };

  workspace.addChangeListener(listener);
  INSTALLED.set(workspace, listener);
}
