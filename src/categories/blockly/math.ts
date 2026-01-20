import * as Blockly from "blockly";
import { FieldAngle } from "@blockly/field-angle";
import { getBlocklyMsgOr } from "./shared";

export const defineMathCompatBlocks = (): void => {
  if (!Blockly.Blocks["inout_angle_maths"]) {
    Blockly.Blocks["inout_angle_maths"] = {
      init: function(this: Blockly.Block) {
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
      init: function(this: Blockly.Block) {
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
