/**
 * @packageDocumentation
 * @module Arduino.ConfigureLogicBlocks
 * @description Typed connection configuration for logic_compare and logic_ternary.
 * @remarks
 * Applies type-aware input/output checks to Blockly logic comparison and ternary blocks.
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
  inferNumericInputType,
  normalizeBlocklyTypeToVariableType,
} from "../../categories/blockly/shared";
import { checkTypeCompatibility, getCompatibleTypesForCheck } from "./block_types_registry";

/**
 * Configures logic_compare and logic_ternary for the typed connection system.
 */
export function configureLogicCompareAndTernaryBlocks(): void {
  type LogicCompareDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfigured?: boolean;
  };
  const logicCompareDef = Blockly.Blocks["logic_compare"] as LogicCompareDef | undefined;
  if (logicCompareDef && !logicCompareDef.__typedConfigured) {
    logicCompareDef.__typedConfigured = true;
    const originalInit = logicCompareDef.init;
    const NUMERIC_COMPARE_CHECKS = ["Number", "int", "float"];
    const EQUALITY_OPS = new Set(["EQ", "NEQ"]);

    const inferOperandType = (candidate: Blockly.Block | null): string | null => {
      if (!candidate) {
        return null;
      }
      // Known Blockly value blocks without getBlockType in headless / before registry apply.
      if (candidate.type === "logic_boolean") {
        return "bool";
      }
      if (candidate.type === "text" || candidate.type === "text_multiline") {
        return "string";
      }
      if (
        candidate.type === "colour_picker" ||
        candidate.type === "colour_random" ||
        candidate.type === "colour_rgb" ||
        candidate.type === "colour_blend"
      ) {
        return "string";
      }
      return inferNumericInputType(candidate);
    };

    const getEqualityChecksForType = (type: string | null): string[] | null => {
      if (!type) {
        return null;
      }
      const checks = new Set(getCompatibleTypesForCheck(type) || [type]);
      if (checks.has("bool")) {
        checks.add("Boolean");
      }
      if (checks.has("Boolean")) {
        checks.add("bool");
      }
      if (checks.has("int") || checks.has("float") || checks.has("long")) {
        checks.add("Number");
      }
      if (checks.has("string")) {
        checks.add("String");
      }
      if (checks.has("String")) {
        checks.add("string");
      }
      if (checks.has("colour") || checks.has("color") || checks.has("Colour")) {
        checks.add("Colour");
        checks.add("colour");
        checks.add("color");
      }
      return Array.from(checks);
    };

    const isNumericOperandType = (type: string | null): boolean => {
      if (!type) {
        return false;
      }
      const normalized = normalizeBlocklyTypeToVariableType(type);
      return (
        normalized === "int" ||
        normalized === "float" ||
        normalized === "number" ||
        normalized === "long"
      );
    };

    const typesCompatibleForEquality = (
      left: string | null,
      right: string | null,
    ): boolean => {
      if (!left || !right) {
        return true;
      }
      const a = normalizeBlocklyTypeToVariableType(left);
      const b = normalizeBlocklyTypeToVariableType(right);
      return (
        checkTypeCompatibility(a, b) || checkTypeCompatibility(b, a)
      );
    };

    const disconnectIfConnected = (
      connection: Blockly.Connection | null | undefined,
    ): void => {
      if (connection?.isConnected()) {
        connection.disconnect();
      }
    };

    logicCompareDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }

      const syncCompareInputChecks = (): void => {
        const op = this.getFieldValue("OP");
        const inputA = this.getInput("A");
        const inputB = this.getInput("B");

        if (!EQUALITY_OPS.has(op)) {
          inputA?.connection?.setCheck(NUMERIC_COMPARE_CHECKS);
          inputB?.connection?.setCheck(NUMERIC_COMPARE_CHECKS);
          // setCheck may already have ejected non-numeric blocks.
          if (inputA?.connection?.isConnected()) {
            const stillA = inputA.connection.targetBlock();
            if (stillA && !isNumericOperandType(inferOperandType(stillA))) {
              disconnectIfConnected(inputA.connection);
            }
          }
          if (inputB?.connection?.isConnected()) {
            const stillB = inputB.connection.targetBlock();
            if (stillB && !isNumericOperandType(inferOperandType(stillB))) {
              disconnectIfConnected(inputB.connection);
            }
          }
          return;
        }

        // EQ / NEQ : d'abord ouvrir les checks, éjecter les paires incompatibles,
        // puis contraindre le côté vide au type du côté branché (UX drag).
        inputA?.connection?.setCheck(null);
        inputB?.connection?.setCheck(null);

        const liveA = this.getInputTargetBlock("A");
        let liveB = this.getInputTargetBlock("B");
        const liveTypeA = inferOperandType(liveA);
        let liveTypeB = inferOperandType(liveB);

        if (
          liveTypeA &&
          liveTypeB &&
          !typesCompatibleForEquality(liveTypeA, liveTypeB)
        ) {
          disconnectIfConnected(inputB?.connection);
          liveB = null;
          liveTypeB = null;
        }

        if (liveTypeA && !liveB) {
          inputB?.connection?.setCheck(getEqualityChecksForType(liveTypeA));
          return;
        }
        if (liveTypeB && !liveA) {
          inputA?.connection?.setCheck(getEqualityChecksForType(liveTypeB));
          return;
        }
        if (liveTypeA && liveTypeB) {
          const checks = getEqualityChecksForType(liveTypeA);
          inputA?.connection?.setCheck(checks);
          inputB?.connection?.setCheck(checks);
        }
      };

      syncCompareInputChecks();

      const originalOnchange = this.onchange;
      this.onchange = function (
        this: Blockly.Block,
        event: Blockly.Events.Abstract,
      ) {
        if (originalOnchange) {
          originalOnchange.call(this, event);
        }
        if (event.isUiEvent) {
          return;
        }
        syncCompareInputChecks();
      };
    };
  }

  type LogicTernaryDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    __typedConfiguredTernary?: boolean;
  };
  const logicTernaryDef = Blockly.Blocks["logic_ternary"] as LogicTernaryDef | undefined;
  if (logicTernaryDef && !logicTernaryDef.__typedConfiguredTernary) {
    logicTernaryDef.__typedConfiguredTernary = true;
    const originalInit = logicTernaryDef.init;
    const inferOutputType = (candidate: Blockly.Block | null): string | null => {
      if (!candidate) {
        return null;
      }
      if (
        candidate.type === "variables_get" ||
        candidate.type === "variables_get_dynamic"
      ) {
        const variableId = candidate.getFieldValue("VAR");
        return variableId
          ? candidate.workspace?.getVariableMap().getVariableById(variableId)?.getType() || null
          : null;
      }
      const typed = candidate as Blockly.Block & { getBlockType?: () => string | null };
      const typedType = typed.getBlockType?.() || null;
      if (typedType) {
        return typedType;
      }
      if (candidate.type === "math_number") {
        const raw = candidate.getFieldValue("NUM");
        const numeric = raw !== null && raw !== undefined ? Number(raw) : NaN;
        if (!Number.isNaN(numeric)) {
          return Number.isInteger(numeric) ? "int" : "float";
        }
      }
      const check = candidate.outputConnection?.getCheck();
      if (Array.isArray(check)) {
        return check[0] || null;
      }
      return check || null;
    };
    const getStrictChecksForType = (type: string | null): string[] | null => {
      if (!type) return null;
      const checks = new Set(getCompatibleTypesForCheck(type) || [type]);
      if (checks.has("bool")) checks.add("Boolean");
      if (checks.has("Boolean")) checks.add("bool");
      if (checks.has("int") || checks.has("float")) checks.add("Number");
      if (checks.has("string")) checks.add("String");
      if (checks.has("String")) checks.add("string");
      return Array.from(checks);
    };
    logicTernaryDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      // THEN decides admissible type for ELSE.
      this.getInput("THEN")?.connection?.setCheck(null);
      this.getInput("ELSE")?.connection?.setCheck(null);
      this.outputConnection?.setCheck(null);
      const originalOnchange = this.onchange;
      this.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
        if (originalOnchange) {
          originalOnchange.call(this, event);
        }
        if (event.isUiEvent) {
          return;
        }
        this.getInput("THEN")?.connection?.setCheck(null);
        const thenBlock = this.getInputTargetBlock("THEN");
        const inferredThenType = inferOutputType(thenBlock);
        const elseInput = this.getInput("ELSE");
        elseInput?.connection?.setCheck(getStrictChecksForType(inferredThenType));
        const elseBlock = this.getInputTargetBlock("ELSE");
        if (elseBlock && inferredThenType) {
          const elseType = inferOutputType(elseBlock);
          const normalizedThen = normalizeBlocklyTypeToVariableType(inferredThenType);
          const normalizedElse = elseType
            ? normalizeBlocklyTypeToVariableType(elseType)
            : null;
          const isAccepted = Boolean(
            normalizedElse && checkTypeCompatibility(normalizedElse, normalizedThen),
          );
          if (!isAccepted) {
            elseInput?.connection?.disconnect();
          }
        }
        this.outputConnection?.setCheck(null);
      };
    };
  }
}
