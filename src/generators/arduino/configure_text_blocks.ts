/**
 * @packageDocumentation
 * @module Arduino.ConfigureTextBlocks
 * @description Typed configuration for text_append.
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
import { setVariableTypeAndMarkManual } from "../../categories/blockly/shared";

/**
 * Configures text_append for the typed connection system.
 */
export function configureTextAppendBlocks(): void {
  type TextAppendDef = Blockly.Block & {
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    __typedConfigured?: boolean;
  };
  const textAppendDef = Blockly.Blocks["text_append"] as TextAppendDef | undefined;
  if (textAppendDef && !textAppendDef.__typedConfigured) {
    textAppendDef.__typedConfigured = true;
    const originalOnchange = textAppendDef.onchange;
    textAppendDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
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
      const variableId = this.getFieldValue("VAR");
      if (!variableId) {
        return;
      }
      const variable = this.workspace.getVariableMap().getVariableById(variableId);
      if (!variable) {
        return;
      }
      const varType = variable.getType();
      if (!varType || varType === "__NO_TYPE__") {
        setVariableTypeAndMarkManual(variable, "string");
      }
    };
  }
}
