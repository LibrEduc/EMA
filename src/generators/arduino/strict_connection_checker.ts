/**
 * @packageDocumentation
 * @module Arduino.StrictConnectionChecker
 * @description Custom connection checker for typed Blockly blocks.
 * @remarks
 * Enforces type compatibility beyond default Blockly checks.
 * Custom ConnectionChecker that uses `getBlockType()` for type checking — more robust than the
 * default ConnectionChecker, especially for blocks with dynamic types (e.g. typed variables).
 * Compatibility rules: `docs/TYPES_ET_COMPATIBILITES.md`.
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

import * as Blockly from 'blockly/core';
import {
  inferArrayElementTypeFromBlock,
  inferListVariableElementType,
} from "./block_types_registry";
import { isDeclareContainsTypeCompatible, isTypeCompatible, normalizeBlocklyCheckToInternalType } from "./block_types";
import { resolveMathNumberBlockType } from "../../categories/blockly/shared";
import { debugLog } from "./debug";
import {
  checkSwitchCaseIntConnection,
  checkTypeCompatibility,
  getInputNameForConnection,
  resolveSourceBlockType,
  resolveSwitchCaseSourceType,
} from "./strict_connection_type_utils";
import {
  isMathChangeCompatibleVariableType,
  isUnresolvedVariableType,
} from "../../categories/blockly/shared_numeric";

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
    if (a && b) {
      const listAdd = this.checkArrayListLiteralAddInputConnection_(a, b);
      if (listAdd === true) {
        return this.finishArrayDeclareConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (listAdd === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayDefine = this.checkArrayDefineInputConnection_(a, b);
      if (arrayDefine === true) {
        return this.finishArrayDeclareConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayDefine === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayAssign = this.checkArrayListAssignValueInputConnection_(a, b);
      if (arrayAssign === true) {
        return this.finishArrayDeclareConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayAssign === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const arrayIndex = this.checkArrayIndexInputConnection_(a, b);
      if (arrayIndex === true) {
        return this.finishSwitchCaseConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (arrayIndex === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const procedureArg = this.checkProcedureCallArgConnection_(a, b);
      if (procedureArg === true) {
        return this.finishSwitchCaseConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (procedureArg === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const switchCase = this.checkSwitchCaseIntConnection_(a, b);
      if (switchCase === true) {
        return this.finishSwitchCaseConnectWithReason_(a, b, isDragging, opt_distance);
      }
      if (switchCase === false) {
        return Blockly.Connection.REASON_CHECKS_FAILED;
      }
      const mathChangeVar = this.checkMathChangeVarConnection_(a, b);
      if (mathChangeVar === true) {
        return this.finishSwitchCaseConnectWithReason_(a, b, isDragging, opt_distance);
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
      resolveOutputInputPair: (x, y) => this.resolveOutputInputPair_(x, y),
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
    const pair = this.resolveOutputInputPair_(a, b);
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
    if (a && b && this.allowValueToUncheckedInput_(a, b)) {
      return true;
    }
    if (a && b) {
      const listAdd = this.checkArrayListLiteralAddInputConnection_(a, b);
      if (listAdd === true) {
        return this.finishArrayDeclareConnect_(a, b, isDragging, opt_distance);
      }
      if (listAdd === false) {
        return false;
      }
      const arrayDefine = this.checkArrayDefineInputConnection_(a, b);
      if (arrayDefine === true) {
        return this.finishArrayDeclareConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayDefine === false) {
        return false;
      }
      const arrayAssign = this.checkArrayListAssignValueInputConnection_(a, b);
      if (arrayAssign === true) {
        return this.finishArrayDeclareConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayAssign === false) {
        return false;
      }
      const arrayIndex = this.checkArrayIndexInputConnection_(a, b);
      if (arrayIndex === true) {
        return this.finishSwitchCaseConnect_(a, b, isDragging, opt_distance);
      }
      if (arrayIndex === false) {
        return false;
      }
      const procedureArg = this.checkProcedureCallArgConnection_(a, b);
      if (procedureArg === true) {
        return this.finishSwitchCaseConnect_(a, b, isDragging, opt_distance);
      }
      if (procedureArg === false) {
        return false;
      }
      const switchCase = this.checkSwitchCaseIntConnection_(a, b);
      if (switchCase === true) {
        return this.finishSwitchCaseConnect_(a, b, isDragging, opt_distance);
      }
      if (switchCase === false) {
        return false;
      }
      const mathChangeVar = this.checkMathChangeVarConnection_(a, b);
      if (mathChangeVar === true) {
        return this.finishSwitchCaseConnect_(a, b, isDragging, opt_distance);
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
        this.checkArrayDefineInputConnection_(a, b) === true ||
        this.checkArrayListLiteralAddInputConnection_(a, b) === true ||
        this.checkArrayListAssignValueInputConnection_(a, b) === true ||
        this.checkArrayIndexInputConnection_(a, b) === true ||
        this.checkProcedureCallArgConnection_(a, b) === true)
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
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair) return false;
    const targetBlock = pair.inp.getSourceBlock();
    if (targetBlock && (targetBlock as Blockly.Block & { type: string }).type === "variables_const") return true;
    const targetCheck = pair.inp.getCheck();
    return !targetCheck || (Array.isArray(targetCheck) && targetCheck.length === 0);
  }

  private resolveOutputInputPair_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): { out: Blockly.Connection; inp: Blockly.Connection } | null {
    const aType = (a as { type: number }).type;
    const bType = (b as { type: number }).type;
    const out = aType === OUTPUT_VALUE_TYPE ? a : bType === OUTPUT_VALUE_TYPE ? b : null;
    const inp = aType === INPUT_VALUE_TYPE ? a : bType === INPUT_VALUE_TYPE ? b : null;
    if (!out || !inp) return null;
    return { out, inp };
  }

  private resolveArrayDefineInputContext_(
    inputConnection: Blockly.Connection,
  ): { choix: string; typeField: string } | null {
    const targetBlock = inputConnection.getSourceBlock();
    if (!targetBlock) {
      return null;
    }
    const inputName = getInputNameForConnection(targetBlock, inputConnection);
    if (!inputName) {
      return null;
    }

    if (targetBlock.type === "Array_declare") {
      if (inputName !== "contenu" && inputName !== "contenu2") {
        return null;
      }
      return {
        choix: targetBlock.getFieldValue("choix"),
        typeField: targetBlock.getFieldValue("type") || "int",
      };
    }

    if (targetBlock.type === "Array_create") {
      const match = /^D(\d+)$/.exec(inputName);
      if (!match) {
        return null;
      }
      const index = parseInt(match[1], 10);
      const dim = parseInt(targetBlock.getFieldValue("dim") || "1", 10);
      if (index >= dim) {
        return null;
      }
      return {
        choix: targetBlock.getFieldValue("choix"),
        typeField: targetBlock.getFieldValue("type") || "int",
      };
    }

    return null;
  }

  /**
   * Entrées « value » de Array_modify / Array_fix : type imposé par le tableau (VAR).
   */
  private checkArrayListAssignValueInputConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair) {
      return null;
    }

    const targetBlock = pair.inp.getSourceBlock();
    if (
      !targetBlock ||
      (targetBlock.type !== "Array_modify" && targetBlock.type !== "Array_fix")
    ) {
      return null;
    }
    const inputName = getInputNameForConnection(targetBlock, pair.inp);
    if (inputName !== "value") {
      return null;
    }

    const varId = targetBlock.getFieldValue("VAR");
    const elementType = inferListVariableElementType(targetBlock.workspace, varId);
    if (!elementType || elementType === "__NO_TYPE__") {
      return null;
    }

    const sourceBlock = pair.out.getSourceBlock();
    if (!sourceBlock) {
      return false;
    }

    if (sourceBlock.type === "math_number") {
      const numType = resolveMathNumberBlockType(sourceBlock);
      return this.isDeclareElementTypeCompatible_(numType, elementType);
    }

    const rawSourceType = resolveSourceBlockType(sourceBlock);
    if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
      return false;
    }
    const sourceType = this.normalizeDeclareSourceType_(rawSourceType);
    return this.isDeclareElementTypeCompatible_(sourceType, elementType);
  }

  /**
   * Entrées d'index D* de Array_fix / Array_getIndex_in_array : entiers uniquement.
   */
  private isArrayIndexInput_(inputConnection: Blockly.Connection): boolean {
    const targetBlock = inputConnection.getSourceBlock();
    if (!targetBlock) {
      return false;
    }
    if (
      targetBlock.type !== "Array_fix" &&
      targetBlock.type !== "Array_getIndex_in_array"
    ) {
      return false;
    }
    const inputName = getInputNameForConnection(targetBlock, inputConnection);
    return inputName !== null && /^D\d+$/.test(inputName);
  }

  private checkArrayIndexInputConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair || !this.isArrayIndexInput_(pair.inp)) {
      return null;
    }
    const semanticType = resolveSwitchCaseSourceType(pair.out.getSourceBlock());
    return semanticType === "int";
  }

  private isProcedureCallArgInput_(inputConnection: Blockly.Connection): boolean {
    const targetBlock = inputConnection.getSourceBlock();
    if (
      !targetBlock ||
      (targetBlock.type !== "procedures_callreturn" &&
        targetBlock.type !== "procedures_callnoreturn")
    ) {
      return false;
    }
    const inputName = getInputNameForConnection(targetBlock, inputConnection);
    return inputName !== null && /^ARG\d+$/.test(inputName);
  }

  private resolveProcedureCallArgSourceType_(
    sourceBlock: Blockly.Block | null,
  ): string | null {
    if (!sourceBlock) {
      return null;
    }
    if (sourceBlock.type === "math_number") {
      return resolveMathNumberBlockType(sourceBlock);
    }
    const typed = sourceBlock as Blockly.Block & { getBlockType?: () => string | null };
    const rawType = typed.getBlockType?.() ?? null;
    const normalized = this.normalizeDeclareSourceType_(rawType || "");
    if (normalized && normalized !== "__NO_TYPE__") {
      return normalized;
    }
    const check = sourceBlock.outputConnection?.getCheck();
    const checkNorm = this.normalizeDeclareSourceType_(
      Array.isArray(check) ? (check[0] ?? "") : (check ?? ""),
    );
    return checkNorm && checkNorm !== "__NO_TYPE__" ? checkNorm : null;
  }

  /**
   * Entrées ARG* des appels de procédure : int n'accepte que int, float accepte int+float.
   */
  private checkProcedureCallArgConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair || !this.isProcedureCallArgInput_(pair.inp)) {
      return null;
    }

    const callBlock = pair.inp.getSourceBlock();
    if (!callBlock?.workspace) {
      return null;
    }

    const inputName = getInputNameForConnection(callBlock, pair.inp);
    const argIndex = inputName ? parseInt(inputName.replace("ARG", ""), 10) : -1;
    if (argIndex < 0 || Number.isNaN(argIndex)) {
      return null;
    }

    type CallBlock = Blockly.Block & {
      getProcedureCall?: () => string;
      getVarModels?: () => Blockly.VariableModel[];
      argumentVarModels_?: Blockly.VariableModel[];
      argData_?: { argId: string; model: Blockly.VariableModel }[];
    };
    const typedCall = callBlock as CallBlock;
    const defName = typedCall.getProcedureCall?.();
    if (!defName) {
      return null;
    }

    const defBlock = Blockly.Procedures.getDefinition(
      defName,
      callBlock.workspace,
    ) as CallBlock | null;
    if (!defBlock) {
      return null;
    }

    const argModels =
      defBlock.getVarModels?.() || defBlock.argumentVarModels_ || [];
    const argDatum = defBlock.argData_?.[argIndex];
    let argType = argModels[argIndex]?.getType?.() || "int";
    if (argDatum?.argId) {
      const fromField = defBlock.getFieldValue(`${argDatum.argId}_TYPE`);
      if (fromField) {
        argType = fromField;
      }
    }

    const sourceType = this.resolveProcedureCallArgSourceType_(
      pair.out.getSourceBlock(),
    );
    if (!sourceType || sourceType === "__NO_TYPE__") {
      return false;
    }

    return isTypeCompatible(sourceType, argType);
  }

  /**
   * Entrées valeur de Array_declare / Array_create : type imposé par le menu déroulant.
   */
  private checkArrayDefineInputConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair) {
      return null;
    }

    const defineContext = this.resolveArrayDefineInputContext_(pair.inp);
    if (!defineContext) {
      return null;
    }

    const { choix, typeField } = defineContext;
    const sourceBlock = pair.out.getSourceBlock();
    if (!sourceBlock) {
      return false;
    }

    if (choix === "c1") {
      if (sourceBlock.type === "math_number") {
        return resolveMathNumberBlockType(sourceBlock) === "int";
      }
      const sourceType = resolveSourceBlockType(sourceBlock);
      return sourceType === "int";
    }

    if (
      sourceBlock.type === "Array_list_literal" ||
      sourceBlock.type === "Array_list_3"
    ) {
      const inferred = inferArrayElementTypeFromBlock(sourceBlock);
      if (!inferred || inferred === "__NO_TYPE__") {
        return true;
      }
      return this.isDeclareElementTypeCompatible_(inferred, typeField);
    }

    if (sourceBlock.type === "math_number") {
      const numType = resolveMathNumberBlockType(sourceBlock);
      return this.isDeclareElementTypeCompatible_(numType, typeField);
    }

    const rawSourceType = resolveSourceBlockType(sourceBlock);
    if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
      return false;
    }
    const sourceType = this.normalizeDeclareSourceType_(rawSourceType);
    return this.isDeclareElementTypeCompatible_(sourceType, typeField);
  }

  private isArrayListElementAddInput_(inputConnection: Blockly.Connection): boolean {
    const targetBlock = inputConnection.getSourceBlock();
    if (!targetBlock) {
      return false;
    }
    const inputName = getInputNameForConnection(targetBlock, inputConnection);
    if (!inputName?.startsWith("ADD")) {
      return false;
    }
    return (
      targetBlock.type === "Array_with" ||
      targetBlock.type === "Array_list_literal" ||
      targetBlock.type === "Array_list_3"
    );
  }

  private resolveArrayListElementTypeKey_(listBlock: Blockly.Block): string | null {
    if (listBlock.type === "Array_with") {
      const inferred = inferArrayElementTypeFromBlock(listBlock);
      return inferred && inferred !== "__NO_TYPE__" ? inferred : null;
    }
    return this.getArrayListLiteralParentDeclareType_(listBlock);
  }

  private getArrayListLiteralParentDeclareType_(
    listBlock: Blockly.Block,
  ): string | null {
    const parent = listBlock.outputConnection?.targetBlock?.() ?? null;
    if (!parent || parent.getFieldValue("choix") !== "c2") {
      return null;
    }
    if (parent.type !== "Array_declare" && parent.type !== "Array_create") {
      return null;
    }
    const declaredType = parent.getFieldValue("type");
    if (!declaredType || declaredType === "__NO_TYPE__") {
      return null;
    }
    return declaredType;
  }

  /**
   * Entrées ADD de Array_with / littéral de liste (type imposé ou inféré).
   */
  private checkArrayListLiteralAddInputConnection_(
    a: Blockly.Connection,
    b: Blockly.Connection,
  ): boolean | null {
    const pair = this.resolveOutputInputPair_(a, b);
    if (!pair || !this.isArrayListElementAddInput_(pair.inp)) {
      return null;
    }

    const listBlock = pair.inp.getSourceBlock()!;
    const typeKey = this.resolveArrayListElementTypeKey_(listBlock);
    if (!typeKey) {
      return null;
    }

    const sourceBlock = pair.out.getSourceBlock();
    if (!sourceBlock) {
      return false;
    }

    if (sourceBlock.type === "math_number") {
      const numType = resolveMathNumberBlockType(sourceBlock);
      return isDeclareContainsTypeCompatible(numType, typeKey);
    }

    const rawSourceType = resolveSourceBlockType(sourceBlock);
    if (!rawSourceType || rawSourceType === "__NO_TYPE__" || rawSourceType === "undefined") {
      return false;
    }
    return isDeclareContainsTypeCompatible(
      this.normalizeDeclareSourceType_(rawSourceType),
      typeKey,
    );
  }

  private isDeclareElementTypeCompatible_(
    sourceType: string,
    arduinoTypeField: string,
  ): boolean {
    return isDeclareContainsTypeCompatible(sourceType, arduinoTypeField);
  }

  private normalizeDeclareSourceType_(sourceType: string): string {
    if (sourceType === "Boolean") {
      return "bool";
    }
    if (sourceType === "String") {
      return "string";
    }
    if (sourceType === "Colour" || sourceType === "color" || sourceType === "colour") {
      return "string";
    }
    return sourceType;
  }

  private finishArrayDeclareConnect_(
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

  private finishArrayDeclareConnectWithReason_(
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

  private finishSwitchCaseConnect_(
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

  private finishSwitchCaseConnectWithReason_(
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
