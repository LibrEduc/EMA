/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionChecker
 * @description Custom connection checker for typed Blockly blocks.
 * @remarks
 * Enforces type compatibility beyond default Blockly checks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @fileoverview Custom ConnectionChecker that uses getBlockType() for type checking.
 * This provides more robust type checking than the default ConnectionChecker,
 * especially for blocks with dynamic types (like typed variables).
 * @author scanet\@libreduc.cc (Sébastien Canet)
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

import * as Blockly from 'blockly/core';
import { checkTypeCompatibility as sharedCheckTypeCompatibility } from "./block_types_registry";
import { debugLog } from "./debug";

/**
 * Custom ConnectionChecker that extends Blockly's default ConnectionChecker
 * to use getBlockType() for source blocks, providing stricter type checking.
 */
// Blockly connection type constants (INPUT_VALUE=1, OUTPUT_VALUE=2) for robust checks
const INPUT_VALUE_TYPE = 1;
const OUTPUT_VALUE_TYPE = 2;

export class StrictConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Entry point when Blockly needs a reason code. Must allow const block before parent.
   */
  canConnectWithReason(
    a: Blockly.Connection | null,
    b: Blockly.Connection | null,
    isDragging: boolean,
    opt_distance?: number
  ): number {
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return Blockly.Connection.CAN_CONNECT;
    }
    return super.canConnectWithReason(a, b, isDragging, opt_distance);
  }

  /**
   * Main entry point for connection checking. Allow const block before parent.
   */
  canConnect(
    a: Blockly.Connection | null,
    b: Blockly.Connection | null,
    isDragging: boolean,
    opt_distance?: number
  ): boolean {
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return true;
    }
    const standardResult = super.canConnect(a, b, isDragging, opt_distance);
    if (!standardResult || !a || !b) {
      return standardResult;
    }
    // During drag preview, Blockly probes many nearby connections.
    // Keep default behavior there to avoid noisy logs and preview side effects.
    if (isDragging) {
      return standardResult;
    }
    return this.doTypeChecks(a, b);
  }

  /**
   * Override doSafetyChecks to allow value→const even across workspaces (flyout→main).
   */
  doSafetyChecks(a: Blockly.Connection | null, b: Blockly.Connection | null): number {
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return Blockly.Connection.CAN_CONNECT;
    }
    return super.doSafetyChecks(a, b);
  }

  /**
   * Allow connecting a value output to an input that accepts any type.
   * (1) Target block is variables_const (VAL_CONST input), or
   * (2) Target connection has no type check (setCheck(null)).
   * Uses numeric type (1/2) so it works regardless of ConnectionType enum binding.
   */
  private allowValueToUncheckedInput_(a: Blockly.Connection, b: Blockly.Connection): boolean {
    const aType = (a as { type: number }).type;
    const bType = (b as { type: number }).type;
    const out = aType === OUTPUT_VALUE_TYPE ? a : bType === OUTPUT_VALUE_TYPE ? b : null;
    const inp = aType === INPUT_VALUE_TYPE ? a : bType === INPUT_VALUE_TYPE ? b : null;
    if (!out || !inp) return false;
    const targetBlock = inp.getSourceBlock();
    if (targetBlock && (targetBlock as Blockly.Block & { type: string }).type === "variables_const") return true;
    const targetCheck = inp.getCheck();
    return !targetCheck || (Array.isArray(targetCheck) && targetCheck.length === 0);
  }

  /**
   * Override doTypeChecks to use getBlockType() when available.
   * This is the key method that checks type compatibility.
   *
   * @param a - Connection to compare.
   * @param b - Connection to compare against.
   * @returns True if the connections share a type.
   */
  doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean {
    const wsA = a.getSourceBlock()?.workspace as Blockly.WorkspaceSvg | null;
    const wsB = b.getSourceBlock()?.workspace as Blockly.WorkspaceSvg | null;
    if ((wsA?.isDragging && wsA.isDragging()) || (wsB?.isDragging && wsB.isDragging())) {
      return super.doTypeChecks(a, b);
    }

    // Determine which connection is the source (output) and which is the target (input)
    let sourceConnection: Blockly.Connection | null = null;
    let targetConnection: Blockly.Connection | null = null;

    if (a.type === Blockly.ConnectionType.OUTPUT_VALUE || a.type === Blockly.ConnectionType.PREVIOUS_STATEMENT) {
      sourceConnection = a;
      targetConnection = b;
    } else if (b.type === Blockly.ConnectionType.OUTPUT_VALUE || b.type === Blockly.ConnectionType.PREVIOUS_STATEMENT) {
      sourceConnection = b;
      targetConnection = a;
    } else {
      // Neither is a source connection, use standard check
      return super.doTypeChecks(a, b);
    }

    if (sourceConnection && targetConnection) {
      const targetBlock = targetConnection.getSourceBlock();
      if (
        targetBlock?.type === 'variables_const' &&
        targetConnection.type === Blockly.ConnectionType.INPUT_VALUE
      ) {
        return true;
      }
      const sourceBlock = sourceConnection.getSourceBlock();

      // Skip strict checks for blocks that trigger Blockly edge cases (e.g. value block drag from flyout)
      if (sourceBlock?.type === 'Array_list_3' || sourceBlock?.type === 'Array_with') {
        return super.doTypeChecks(a, b);
      }

      // First, try to get type from getBlockType() if available (this is the most reliable)
      let sourceType: string | null | undefined = null;
      const typedBlock = sourceBlock as Blockly.Block & {
        getBlockType?: () => string | null;
      };
      if (typedBlock && typeof typedBlock.getBlockType === 'function') {
        sourceType = typedBlock.getBlockType();
      }

      // If getBlockType() is not available, try to get from connection check
      if (sourceType === null || sourceType === undefined) {
        const sourceCheck = sourceConnection.getCheck();
        debugLog(`🔍 [StrictChecker] getCheck() retourne:`, sourceCheck, 'pour bloc', sourceBlock?.type);
        if (sourceCheck) {
          // If it's an array, take the first element (or handle it)
          if (Array.isArray(sourceCheck) && sourceCheck.length > 0) {
            sourceType = sourceCheck[0] as string;
          } else if (typeof sourceCheck === 'string') {
            sourceType = sourceCheck;
          }
        }
      }

      // If sourceType is '__NO_TYPE__' or 'undefined', block all typed connections
      // This is our special type for untyped variables
      if (sourceType === '__NO_TYPE__' || sourceType === 'undefined') {
        const targetCheck = targetConnection.getCheck();
        debugLog(`🔍 [StrictChecker] Source type='${sourceType}', target check=`, targetCheck);
        // If target has a type check (like 'Boolean'), block the connection
        if (targetCheck) {
          const targetChecks = Array.isArray(targetCheck) ? targetCheck : [targetCheck];
          // If target expects a specific type, block the connection
          // Filter out null/undefined from the checks
          const validChecks = targetChecks.filter(check => check !== null && check !== undefined && check !== '__NO_TYPE__');
          if (validChecks.length > 0) {
            debugLog(`🚫 [StrictChecker] Blocked: source='${sourceType}' cannot connect to target='${validChecks.join(',')}'`);
            return false;
          }
        }
        // If target has no type check, allow connection (untyped can connect to untyped)
        debugLog(`✅ [StrictChecker] Allowed: source='${sourceType}' can connect to untyped target`);
        return true;
      }

      // Get the target connection's check
      const targetCheck = targetConnection.getCheck();

      // If target has no check, allow connection (untyped input accepts all)
      if (!targetCheck || (Array.isArray(targetCheck) && targetCheck.length === 0)) {
        return true;
      }

      // If sourceType is null/undefined and target has a check, use standard check
      if (sourceType === null || sourceType === undefined) {
        return super.doTypeChecks(a, b);
      }

      // Check if sourceType matches any of the target checks
      // targetCheck can be a string or an array of strings
      const targetChecks = Array.isArray(targetCheck) ? targetCheck : [targetCheck];

      // If sourceType matches any target check, allow connection
      for (const check of targetChecks) {
        if (check && this.checkTypeCompatibility(sourceType, check)) {
          return true;
        }
      }

      // No match found - connection not allowed
      debugLog(`🚫 [StrictChecker] Blocked: source='${sourceType}' does not match target='${targetChecks.join(',')}'`);
      return false;
    }

    // Fall back to standard check
    return super.doTypeChecks(a, b);
  }

  /**
   * Checks if two types are compatible.
   *
   * @param sourceType - The type from the source block (from getBlockType()).
   * @param targetType - The type expected by the target connection.
   * @returns True if types are compatible, false otherwise.
   */
  private checkTypeCompatibility(sourceType: string, targetType: string): boolean {
    if (sourceType === targetType) {
      return true;
    }
    if (sourceType === 'null' || sourceType === 'undefined' ||
      targetType === 'null' || targetType === 'undefined') {
      return sourceType === targetType;
    }
    return sharedCheckTypeCompatibility(sourceType, targetType);
  }
}

/**
 * Registers the StrictConnectionChecker in Blockly's registry as the default checker.
 * MUST be called BEFORE Blockly.inject() so the workspace uses our checker from the start.
 */
export function registerStrictConnectionCheckerInRegistry(): void {
  // Override the default connection checker so all workspaces (main + flyouts) use ours.
  // Do not unregister first: register with allowOverrides so Blockly always has a checker.
  Blockly.registry.register(
    Blockly.registry.Type.CONNECTION_CHECKER,
    "default",
    StrictConnectionChecker,
    true, // allowOverrides
  );
  debugLog("✅ StrictConnectionChecker registered in Blockly registry");
}

/**
 * Installs the strict connection checker on an existing workspace.
 * Use registerStrictConnectionCheckerInRegistry() BEFORE Blockly.inject() instead for best results.
 * @param workspace - Target workspace.
 */
export function registerStrictConnectionChecker(workspace: Blockly.Workspace): void {
  if (!workspace) {
    console.error('Cannot register StrictConnectionChecker: workspace is null');
    return;
  }

  // Create a new instance of the strict checker
  const strictChecker = new StrictConnectionChecker();

  // Set the connection checker on the workspace
  const workspaceWithChecker = workspace as Blockly.Workspace & {
    connectionChecker?: Blockly.ConnectionChecker;
  };
  workspaceWithChecker.connectionChecker = strictChecker;

  // Also try to set it via the workspace SVG if available
  const workspaceSvg = workspace as Blockly.WorkspaceSvg;
  const workspaceSvgWithChecker = workspaceSvg as Blockly.WorkspaceSvg & {
    setConnectionChecker?: (checker: Blockly.ConnectionChecker) => void;
  };
  if (workspaceSvgWithChecker && typeof workspaceSvgWithChecker.setConnectionChecker === 'function') {
    workspaceSvgWithChecker.setConnectionChecker(strictChecker);
  }

  debugLog('✅ StrictConnectionChecker set on workspace');
}
