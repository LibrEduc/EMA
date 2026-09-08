/**
 * @packageDocumentation
 * @module Arduino.ConfigureLoopBlocks
 * @description Typed configuration for controls_repeat_ext and controls_for.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  inferNumericInputType,
  inferLoopCounterTypeFromForBlock,
  inferRequiredNumericTypeForVariable,
  areLoopBoundTypesCompatible,
  unifyLoopBoundTypes,
  isLoopCounterVariableCompatible,
  syncNumericVariableType,
  getTypeMismatchWarningText,
  normalizeBlocklyTypeToVariableType,
} from "../../categories/blockly/shared";

/**
 * Configures loop blocks for the typed connection system.
 */
export function configureLoopBlocks(): void {
  type RepeatExtDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfiguredRepeatExt?: boolean;
  };
  const repeatExtDef = Blockly.Blocks["controls_repeat_ext"] as RepeatExtDef | undefined;
  if (repeatExtDef && !repeatExtDef.__typedConfiguredRepeatExt) {
    repeatExtDef.__typedConfiguredRepeatExt = true;
    const originalInit = repeatExtDef.init;
    const originalOnchange = repeatExtDef.onchange;
    repeatExtDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      // Allow standard numeric blocks ("Number") and typed integer variables ("int"),
      // but reject typed float variable getters.
      this.getInput("TIMES")?.connection?.setCheck(["Number", "int"]);
    };
    repeatExtDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        event.type !== Blockly.Events.VAR_CREATE &&
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE
      ) {
        return;
      }
      const timesBlock = this.getInputTargetBlock("TIMES");
      if (!timesBlock) {
        this.setWarningText(null);
        return;
      }
      let inferredType: string | null = null;
      if (
        timesBlock.type === "variables_get" ||
        timesBlock.type === "variables_get_dynamic"
      ) {
        const variableId = timesBlock.getFieldValue("VAR");
        inferredType = variableId
          ? timesBlock.workspace?.getVariableMap().getVariableById(variableId)?.getType() || null
          : null;
      } else {
        const typedTimes = timesBlock as Blockly.Block & { getBlockType?: () => string | null };
        inferredType = typedTimes.getBlockType?.() || null;
        if (!inferredType && timesBlock.type === "math_number") {
          const rawNum = timesBlock.getFieldValue("NUM");
          const numericValue = rawNum !== null && rawNum !== undefined ? Number(rawNum) : NaN;
          if (!Number.isNaN(numericValue)) {
            inferredType = Number.isInteger(numericValue) ? "int" : "float";
          }
        }
        if (!inferredType) {
          const outputCheck = timesBlock.outputConnection?.getCheck();
          if (Array.isArray(outputCheck)) {
            inferredType = outputCheck.length > 0 ? outputCheck[0] : null;
          } else {
            inferredType = outputCheck || null;
          }
        }
      }
      if (inferredType !== "int") {
        this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
        this.getInput("TIMES")?.connection?.disconnect();
        return;
      }
      this.setWarningText(null);
    };
  }

  type ControlsForDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfiguredControlsFor?: boolean;
  };
  const controlsForDef = Blockly.Blocks["controls_for"] as ControlsForDef | undefined;
  if (controlsForDef && !controlsForDef.__typedConfiguredControlsFor) {
    controlsForDef.__typedConfiguredControlsFor = true;
    const originalInit = controlsForDef.init;
    const originalOnchange = controlsForDef.onchange;
    const normalizeType = (raw: string | null): string | null => {
      if (!raw) return null;
      return normalizeBlocklyTypeToVariableType(raw);
    };
    const isNumeric = (raw: string | null): boolean => {
      const t = normalizeType(raw);
      return t === "int" || t === "float" || t === "number";
    };
    controlsForDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      const acceptedChecks = ["Number", "int", "float"];
      this.getInput("FROM")?.connection?.setCheck(acceptedChecks);
      this.getInput("TO")?.connection?.setCheck(acceptedChecks);
      this.getInput("BY")?.connection?.setCheck(acceptedChecks);
    };
    controlsForDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (
        event.isUiEvent ||
        (
          event.type !== Blockly.Events.BLOCK_CHANGE &&
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE &&
          event.type !== "var_type_change"
        )
      ) {
        return;
      }
      const inputNames = ["FROM", "TO", "BY"] as const;
      const connected = inputNames
        .map((name) => ({ name, block: this.getInputTargetBlock(name) }))
        .filter((entry) => Boolean(entry.block)) as Array<{ name: "FROM" | "TO" | "BY"; block: Blockly.Block }>;
      if (connected.length === 0) {
        this.setWarningText(null);
        return;
      }
      const boundTypes = connected.map((entry) => inferNumericInputType(entry.block));
      for (const rawType of boundTypes) {
        if (!isNumeric(rawType)) {
          this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
          return;
        }
      }
      const anchorType = normalizeType(boundTypes[0]);
      if (!anchorType) {
        this.setWarningText(null);
        return;
      }
      for (let i = 1; i < boundTypes.length; i += 1) {
        const type = normalizeType(boundTypes[i]);
        if (!type || !areLoopBoundTypesCompatible(anchorType, type)) {
          this.setWarningText(Blockly.Msg.MATH_CHANGE_VAR_WARNING || "Connect a variable.");
          return;
        }
      }
      const variableId = this.getFieldValue("VAR");
      const requiredNumericType = variableId
        ? inferRequiredNumericTypeForVariable(this.workspace, variableId)
        : unifyLoopBoundTypes(boundTypes) ?? inferLoopCounterTypeFromForBlock(this);
      if (variableId && requiredNumericType) {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          syncNumericVariableType(variable, requiredNumericType);
          const varType = variable.getType();
          if (
            varType &&
            varType !== "__NO_TYPE__" &&
            !isLoopCounterVariableCompatible(varType, requiredNumericType)
          ) {
            this.setWarningText(getTypeMismatchWarningText(varType, requiredNumericType));
            return;
          }
        }
      }
      this.setWarningText(null);
    };
  }
}
