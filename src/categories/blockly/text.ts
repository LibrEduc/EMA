import * as Blockly from "blockly";
import { getBlocklyMsgOr, validateSingleChar } from "./shared";

export const defineTextCompatBlocks = (): void => {
  if (!Blockly.Blocks["text_char"]) {
    Blockly.Blocks["text_char"] = {
      init: function(this: Blockly.Block) {
        this.setStyle("text_blocks");
        this.appendDummyInput()
          .appendField('"')
          .appendField(
            new Blockly.FieldTextInput("", validateSingleChar),
            "TEXT",
          )
          .appendField('"');
        this.setOutput(true, "char");
        this.setTooltip(getBlocklyMsgOr("TEXT_CHAR_TOOLTIP", "character"));
      },
    };
  }
};
