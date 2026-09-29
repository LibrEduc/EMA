/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionChecker
 * @description Custom connection checker for typed Blockly blocks.
 * @remarks
 * Enforces type compatibility beyond default Blockly checks.
 * Custom ConnectionChecker that uses `getBlockType()` for type checking — more robust than the
 * default ConnectionChecker, especially for blocks with dynamic types (e.g. typed variables).
 * Compatibility rules: `docs/TYPES_ET_COMPATIBILITES.md`.
 * Array/list and procedure-arg checks live in sibling modules.
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
import { normalizeBlocklyCheckToInternalType } from "./block_types";
import { debugLog } from "./debug";
import {
  checkArrayDefineInputConnection,
  checkArrayIndexInputConnection,
  checkArrayListAssignValueInputConnection,
  checkArrayListLiteralAddInputConnection,
} from "./strict_connection_array";
import { checkProcedureCallArgConnection } from "./strict_connection_procedure";
import {
  checkSwitchCaseIntConnection,
  checkTypeCompatibility,
  getInputNameForConnection,
  resolveOutputInputPair,
  resolveSourceBlockType,
} from "./strict_connection_type_utils";
import {
  isMathChangeCompatibleVariableType,
  isUnresolvedVariableType,
} from "../../categories/blockly/shared_numeric";

/**
 * Custom ConnectionChecker that extends Blockly's default ConnectionChecker
 * to use getBlockType() for source blocks, providing stricter type checking.
 */
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
    if (isDragging) {
      return super.canConnectWithReason(a, b, isDragging, opt_distance);
    }
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return Blockly.Connection.CAN_CONNECT;
    }
    if (a && b) {
      const listAdd = checkArrayListLiteralAddInputConnection(a, b);
      if (listAdd === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (listAdd === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayDefine = checkArrayDefineInputConnection(a, b);
      if (arrayDefine === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayDefine === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayAssign = checkArrayListAssignValueInputConnection(a, b);
      if (arrayAssign === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayAssign === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayIndex = checkArrayIndexInputConnection(a, b);
      if (arrayIndex === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayIndex === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const procedureArg = checkProcedureCallArgConnection(a, b);
      if (procedureArg === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (procedureArg === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const switchCase = this.checkSwitchCaseIntConnection_(a, b);
      if (switchCase === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (switchCase === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const mathChangeVar = this.checkMathChangeVarConnection_(a, b);
      if (mathChangeVar === true) {
        return this.finishTypedConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (mathChangeVar === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
    }
    return super.canConnectWithReason(a, b, isDragging, opt_distance);
  }

  /** Delegates to extracted switch-case int connection check. */
  private checkSwitchCaseIntConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    return checkSwitchCaseIntConnection(a, b, {
      resolveOutputInputPair,
    });
  }

  /**
   * math_change VAR accepts untyped or numeric scalars only (not String/bool/…).
   * Untyped (__NO_TYPE__) must be allowed so change-by can still infer int/float.
   */
  private checkMathChangeVarConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = resolveOutputInputPair(a, b);
    if (!pair) {
      return null;
    }
    const targetBlock = pair.inp.getSourceBlock();
    if (!targetBlock || targetBlock.type !== "math_change") {
      return null;
    }
    const inputName = getInputNameForConnection(targetBlock, pair.inp);
    if (inputName !== "VAR" && inputName !== "NAME") {
      return null;
    }
    const sourceBlock = pair.out.getSourceBlock();
    const sourceType = resolveSourceBlockType(sourceBlock);
    if (isUnresolvedVariableType(sourceType)) {
      return true;
    }
    const normalized =
      normalizeBlocklyCheckToInternalType(sourceType) ?? sourceType;
    if (isMathChangeCompatibleVariableType(normalized)) {
      return true;
    }
    return false;
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
    if (isDragging) {
      return super.canConnect(a, b, isDragging, opt_distance);
    }
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return true;
    }
    if (a && b) {
      const listAdd = checkArrayListLiteralAddInputConnection(a, b);
      if (listAdd === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (listAdd === false) {
        return false;
      }
      const arrayDefine = checkArrayDefineInputConnection(a, b);
      if (arrayDefine === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayDefine === false) {
        return false;
      }
      const arrayAssign = checkArrayListAssignValueInputConnection(a, b);
      if (arrayAssign === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayAssign === false) {
        return false;
      }
      const arrayIndex = checkArrayIndexInputConnection(a, b);
      if (arrayIndex === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayIndex === false) {
        return false;
      }
      const procedureArg = checkProcedureCallArgConnection(a, b);
      if (procedureArg === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (procedureArg === false) {
        return false;
      }
      const switchCase = this.checkSwitchCaseIntConnection_(a, b);
      if (switchCase === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (switchCase === false) {
        return false;
      }
      const mathChangeVar = this.checkMathChangeVarConnection_(a, b);
      if (mathChangeVar === true) {
        return this.finishTypedConnect_(a, b, isDragging, opt_distance);
      }
      if (mathChangeVar === false) {
        return false;
      }
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
    const result = super.doSafetyChecks(a, b);
    if (
      result === Blockly.Connection.REASON_DIFFERENT_WORKSPACES &&
      a &&
      b &&
      (this.checkSwitchCaseIntConnection_(a, b) === true ||
        checkArrayDefineInputConnection(a, b) === true ||
        checkArrayListLiteralAddInputConnection(a, b) === true ||
        checkArrayListAssignValueInputConnection(a, b) === true ||
        checkArrayIndexInputConnection(a, b) === true ||
        checkProcedureCallArgConnection(a, b) === true)
    ) {
      return Blockly.Connection.CAN_CONNECT;
    }
    return result;
  }

  /**
   * Allow connecting a value output to an input that accepts any type.
   * (1) Target block is variables_const (VAL_CONST input), or
   * (2) Target connection has no type check (setCheck(null)).
   * Uses numeric type (1/2) so it works regardless of ConnectionType enum binding.
   */
  private allowValueToUncheckedInput_(a: Blockly.Connection, b: Blockly.Connection): boolean {
    const pair = resolveOutputInputPair(a, b);
    if (!pair) return false;
    const targetBlock = pair.inp.getSourceBlock();
    if (targetBlock && (targetBlock as Blockly.Block & { type: string }).type === "variables_const") return true;
    const targetCheck = pair.inp.getCheck();
    return !targetCheck || (Array.isArray(targetCheck) && targetCheck.length === 0);
  }

  private finishTypedConnect_(
    a: Blockly.Connection,
    b: Blockly.Connection,
    isDragging: boolean,
    opt_distance?: number,
  ): boolean {
    const safety = this.doSafetyChecks(a, b);
    if (safety !== Blockly.Connection.CAN_CONNECT) {
      return false;
    }
    if (isDragging) {
      return this.doDragChecks(
        a as Blockly.RenderedConnection,
        b as Blockly.RenderedConnection,
        opt_distance ?? 0,
      );
    }
    return true;
  }

  private finishTypedConnectWithReason_(
    a: Blockly.Connection,
    b: Blockly.Connection,
    isDragging: boolean,
    opt_distance?: number,
  ): number {
    const safety = this.doSafetyChecks(a, b);
    if (safety !== Blockly.Connection.CAN_CONNECT) {
      return safety;
    }
    if (
      isDragging &&
      !this.doDragChecks(
        a as Blockly.RenderedConnection,
        b as Blockly.RenderedConnection,
        opt_distance ?? 0,
      )
    ) {
      return Blockly.Connection.REASON_DRAG_CHECKS_FAILED;
    }
    return Blockly.Connection.CAN_CONNECT;
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
    const switchCase = this.checkSwitchCaseIntConnection_(a, b);
    if (switchCase === true) {
      return true;
    }
    if (switchCase === false) {
      return false;
    }
    const mathChangeVar = this.checkMathChangeVarConnection_(a, b);
    if (mathChangeVar === true) {
      return true;
    }
    if (mathChangeVar === false) {
      return false;
    }

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
      if (sourceBlock?.type === 'Array_list_3' || sourceBlock?.type === 'Array_list_literal') {
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
        if (check && checkTypeCompatibility(sourceType, check)) {
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

}

/**
 * Registers the StrictConnectionChecker in Blockly's registry as the default checker. MUST be called BEFORE Blockly.inject() so the workspace uses our checker from the start.
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
