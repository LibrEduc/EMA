/**
 * @packageDocumentation
 * @module BlocklyCategories.Logic.IfExtras
 * @description controls_if helper blocks and controls_ifelse.
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
import { getBlocklyMsg } from "./shared";

/**
 * Registers controls_if_if / elseif / else and controls_ifelse.
 */
export const defineControlsIfExtraBlocks = (): void => {
  if (!Blockly.Blocks["controls_if_if"]) {
    Blockly.Blocks["controls_if_if"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_IF_TITLE_IF"));
        this.setNextStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_IF_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  if (!Blockly.Blocks["controls_if_elseif"]) {
    Blockly.Blocks["controls_if_elseif"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_ELSEIF_TITLE_ELSEIF"));
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_ELSEIF_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  if (!Blockly.Blocks["controls_if_else"]) {
    Blockly.Blocks["controls_if_else"] = {
      init: function (this: Blockly.Block) {
        this.appendDummyInput()
          .appendField(getBlocklyMsg("CONTROLS_IF_ELSE_TITLE_ELSE"));
        this.setPreviousStatement(true);
        this.setStyle("logic_blocks");
        this.setTooltip(getBlocklyMsg("CONTROLS_IF_ELSE_TOOLTIP"));
        this.contextMenu = false;
      },
    };
  }
  Blockly.Blocks["controls_ifelse"] = {
    init: function (this: Blockly.Block) {
      const baseIf = Blockly.Blocks["controls_if"] as
        | { init?: (this: Blockly.Block) => void }
        | undefined;
      baseIf?.init?.call(this);
      const mutation = Blockly.utils.xml.createElement("mutation");
      mutation.setAttribute("else", "1");
      this.domToMutation?.(mutation);
    },
  };
};
