/**
 * @packageDocumentation
 * @module BlocklyCategories.Math
 * @description Math block definitions for the Blockly toolbox.
 * @remarks
 * Defines math blocks, fields, and typed behaviors.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
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
import { FieldAngle } from "@blockly/field-angle";
import { FieldSlider } from "@blockly/field-slider";
import { getBlocklyMsgOr } from "./shared";

/**
 * Registers math compatibility blocks for µcBlockly.
 */
export const defineMathCompatBlocks = (): void => {
  const inferBlockType = (block: Blockly.Block | null): string | null => {
    if (!block) {
      return null;
    }
    if (
      block.type === "variables_get" ||
      block.type === "variables_get_dynamic"
    ) {
      const variableId = block.getFieldValue("VAR");
      return variableId
        ? block.workspace?.getVariableMap().getVariableById(variableId)?.getType() || null
        : null;
    }
    const typed = block as Blockly.Block & { getBlockType?: () => string | null };
    const typedType = typed.getBlockType?.() || null;
    if (typedType) {
      return typedType;
    }
    if (block.type === "math_number") {
      const raw = block.getFieldValue("NUM");
      const numeric = raw !== null && raw !== undefined ? Number(raw) : NaN;
      if (!Number.isNaN(numeric)) {
        return Number.isInteger(numeric) ? "int" : "float";
      }
    }
    const outputCheck = block.outputConnection?.getCheck();
    if (Array.isArray(outputCheck)) {
      return outputCheck[0] || null;
    }
    return outputCheck || null;
  };

  if (!Blockly.Blocks["math_percent"]) {
    Blockly.Blocks["math_percent"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(new FieldSlider(20, 0, 100, 1), "PERCENT")
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
      const numericDeltaChecks = ["Number", "int"];
      this.appendValueInput("VAR")
        .setAlign(Blockly.inputs.Align.CENTRE)
        .setCheck(null)
        .appendField(getBlocklyMsgOr("MATH_CHANGE_LABEL", "change"));
      this.appendValueInput("DELTA")
        .setCheck(numericDeltaChecks)
        .appendField(getBlocklyMsgOr("MATH_CHANGE_BY", "by"));
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("math_blocks");
      this.setTooltip(getBlocklyMsgOr("MATH_CHANGE_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("MATH_CHANGE_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (event.isUiEvent) {
        return;
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
      const targetBlock =
        this.getInputTargetBlock("VAR") ?? this.getInputTargetBlock("NAME");
      if (!targetBlock) {
        this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
        return;
      }
      const isVariable =
        targetBlock.type === "variables_get" ||
        targetBlock.type === "variables_get_dynamic";
      if (!isVariable) {
        this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
        return;
      }
      const variableId = targetBlock.getFieldValue("VAR");
      const variableType = variableId
        ? targetBlock.workspace?.getVariableMap().getVariableById(variableId)?.getType()
        : null;
      if (variableType !== "int") {
        this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
        this.getInput("VAR")?.connection?.disconnect();
        return;
      }
      const deltaBlock = this.getInputTargetBlock("DELTA");
      if (deltaBlock) {
        const deltaType = inferBlockType(deltaBlock);
        const isNumeric =
          deltaType === "int" ||
          deltaType === "float" ||
          deltaType === "Number" ||
          deltaType === "number";
        if (!isNumeric) {
          this.setWarningText(getBlocklyMsgOr("MATH_CHANGE_VAR_WARNING", "Connect a variable."));
          this.getInput("DELTA")?.connection?.disconnect();
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
};
