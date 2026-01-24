import * as Blockly from "blockly";
import { FieldAngle } from "@blockly/field-angle";
import { FieldSlider } from "@blockly/field-slider";
import { getBlocklyMsgOr } from "./shared";

export const defineMathCompatBlocks = (): void => {
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
      const numberChecks = ["Number", "int", "float"];
      this.appendValueInput("VAR")
        .setAlign(Blockly.inputs.Align.CENTRE)
        .setCheck(numberChecks)
        .appendField(getBlocklyMsgOr("MATH_CHANGE_LABEL", "change"));
      this.appendValueInput("DELTA")
        .setCheck(numberChecks)
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
