/**
 * @packageDocumentation
 * @module BlocklyCategories.Math
 * @description Math block definitions for the Blockly toolbox.
 * @remarks
 * Defines math blocks, fields, and typed behaviors.
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
import * as FieldAngleNS from "@blockly/field-angle";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import { AccessibleFieldSlider } from "./field_slider_accessible";
import {
  getBlocklyMsgOr,
  inferRequiredNumericTypeForVariable,
  resolveMathChangeVariableId,
  syncNumericVariableType,
  getTypeMismatchWarningText,
  shouldSkipVariableChange,
  type VariableWithMutableType,
  inferNumericInputType,
  getBlocklyMsg,
  isMathChangeCompatibleVariableType,
} from "./shared";

const FieldAngle = namedExportFromCjsPlugin<
  typeof import("@blockly/field-angle").FieldAngle
>(FieldAngleNS, "FieldAngle");

/** Blockly menu options for math_constant (Arduino: no INFINITY). */
const getMathConstantDropdownOptions = (): Blockly.MenuOption[] => [
  [getBlocklyMsgOr("MATH_CONSTANT_PI", "π"), "PI"],
  [getBlocklyMsgOr("MATH_CONSTANT_E", "e"), "E"],
  [getBlocklyMsgOr("MATH_CONSTANT_GOLDEN_RATIO", "φ"), "GOLDEN_RATIO"],
  [getBlocklyMsgOr("MATH_CONSTANT_SQRT2", "√2"), "SQRT2"],
  [getBlocklyMsgOr("MATH_CONSTANT_SQRT1_2", "√½"), "SQRT1_2"],
];

/**
 * Registers math compatibility blocks for µcBlockly.
 */
export const defineMathCompatBlocks = (): void => {
  if (!Blockly.Blocks["math_percent"]) {
    Blockly.Blocks["math_percent"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(new AccessibleFieldSlider(20, 0, 100, 1), "PERCENT")
          .appendField("%");
        this.setOutput(true, "Number");
        this.setStyle("math_blocks");
        this.setTooltip(getBlocklyMsgOr("MATH_PERCENT_TOOLTIP", ""));
        this.setHelpUrl(getBlocklyMsgOr("MATH_PERCENT_HELPURL", ""));
      },
    };
  }

  Blockly.Blocks["math_change"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VAR")
        .setAlign(Blockly.inputs.Align.CENTRE)
        // Numeric only: unchecked (null) would also accept String via the connection checker.
        .setCheck(["Number", "int", "float", "long"])
        .appendField(getBlocklyMsgOr("MATH_CHANGE_LABEL", "change"));
      this.appendValueInput("DELTA")
        .setCheck(["Number", "int", "float"])
        .appendField(getBlocklyMsgOr("MATH_CHANGE_BY", "by"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("math_blocks");
      this.setTooltip(getBlocklyMsgOr("MATH_CHANGE_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("MATH_CHANGE_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (shouldSkipVariableChange(this, event)) {
        return;
      }
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
        event.type !== Blockly.Events.VAR_CREATE &&
        event.type !== Blockly.Events.VAR_RENAME &&
        event.type !== Blockly.Events.VAR_DELETE &&
        event.type !== "var_type_change"
      ) {
        return;
      }
      const variableId = resolveMathChangeVariableId(this);
      if (!variableId || !this.workspace) {
        this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
        return;
      }
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
        return;
      }
      const rejectNonNumeric = (actualType: string, expectedType: string): void => {
        const varConnection = this.getInput("VAR")?.connection;
        if (varConnection?.isConnected()) {
          varConnection.disconnect();
        }
        this.setWarningText(getTypeMismatchWarningText(actualType, expectedType));
      };
      const varType = variable.getType();
      if (!isMathChangeCompatibleVariableType(varType)) {
        rejectNonNumeric(
          varType,
          inferRequiredNumericTypeForVariable(this.workspace, variableId) || "int",
        );
        return;
      }
      const deltaBlock = this.getInputTargetBlock("DELTA");
      const requiredType = inferRequiredNumericTypeForVariable(this.workspace, variableId);
      if (deltaBlock && !requiredType) {
        const deltaType = inferNumericInputType(deltaBlock);
        if (deltaType !== "int" && deltaType !== "float" && deltaType !== "number") {
          this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
          return;
        }
      }
      if (requiredType) {
        const typedVariable = variable as VariableWithMutableType;
        syncNumericVariableType(variable, requiredType);
        const syncedType = variable.getType();
        if (
          requiredType === "float" &&
          syncedType === "int" &&
          typedVariable.__ucbManualType
        ) {
          this.setWarningText(getTypeMismatchWarningText(syncedType, requiredType));
          return;
        }
        if (!isMathChangeCompatibleVariableType(syncedType)) {
          rejectNonNumeric(syncedType || "?", requiredType);
          return;
        }
      }
      this.setWarningText(null);
    },
  };

  if (!Blockly.Blocks["inout_angle_maths"]) {
    Blockly.Blocks["inout_angle_maths"] = {
      init: function (this: Blockly.Block) {
        this.setStyle("math_blocks");
        this.appendDummyInput()
          .appendField(getBlocklyMsgOr("MATH_ANGLE", "angle"))
          .appendField(new FieldAngle("90"), "ANGLE");
        this.setOutput(true, "Number");
        this.setTooltip(getBlocklyMsgOr("INOUT_ANGLE_MATHS_TOOLTIP", "angle °"));
      },
    };
  }

  if (!Blockly.Blocks["math_interval"]) {
    Blockly.Blocks["math_interval"] = {
      init: function (this: Blockly.Block) {
        const OPERATORS: Blockly.MenuOption[] = [
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"],
        ];
        this.appendValueInput("inf").setCheck("Number");
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(OPERATORS), "comp_inf");
        this.appendValueInput("valeur").setCheck(null);
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(OPERATORS), "comp_sup");
        this.appendValueInput("sup").setCheck("Number");
        this.setOutput(true, "Boolean");
        this.setStyle("math_blocks");
        this.setTooltip(getBlocklyMsgOr("MATH_INTERVAL_TOOLTIP", "compare"));
        this.setHelpUrl("");
      },
    };
  }

  Blockly.Blocks["math_constant"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown(getMathConstantDropdownOptions),
          "CONSTANT",
        );
      this.setOutput(true, "Number");
      this.setStyle("math_blocks");
      this.setTooltip(getBlocklyMsg("MATH_CONSTANT_TOOLTIP"));
      this.setHelpUrl(getBlocklyMsg("MATH_CONSTANT_HELPURL"));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
      ) {
        return;
      }
      if (this.getFieldValue("CONSTANT") === "INFINITY") {
        this.setFieldValue("PI", "CONSTANT");
      }
    },
  };
};
