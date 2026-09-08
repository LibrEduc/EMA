/**
 * @packageDocumentation
 * @module Arduino.ConfigureMathBlocks
 * @description Typed configuration for math_number.
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
  isBlockOnMainWorkspace,
  resolveMathNumberBlockType,
  revalidateTypedNumericBlocks,
  revalidateLocalWrapperBlocks,
} from "../../categories/blockly/shared";

/**
 * Configures math_number for the typed connection system.
 */
export function configureMathNumberBlocks(): void {
  type MathNumberDef = Blockly.Block & {
    init?: (this: Blockly.Block) => void;
    onchange?: (this: Blockly.Block, event: Blockly.Events.Abstract) => void;
    getBlockType?: (this: Blockly.Block) => string;
    __typedMathNumberConfigured?: boolean;
  };
  const mathNumberDef = Blockly.Blocks["math_number"] as MathNumberDef | undefined;
  if (mathNumberDef && !mathNumberDef.__typedMathNumberConfigured) {
    mathNumberDef.__typedMathNumberConfigured = true;
    const originalInit = mathNumberDef.init;
    const originalOnchange = mathNumberDef.onchange;
    mathNumberDef.init = function (this: Blockly.Block) {
      if (originalInit) {
        originalInit.call(this);
      }
      this.setOutput(true, "Number");
    };
    mathNumberDef.getBlockType = function (this: Blockly.Block): string {
      return resolveMathNumberBlockType(this);
    };
    mathNumberDef.onchange = function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }
      if (event.isUiEvent) {
        return;
      }
      if (
        event.type !== Blockly.Events.BLOCK_CREATE &&
        event.type !== Blockly.Events.BLOCK_MOVE &&
        event.type !== Blockly.Events.BLOCK_CHANGE &&
        event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
      ) {
        return;
      }
      if (!isBlockOnMainWorkspace(this) || !this.workspace) {
        return;
      }
      revalidateLocalWrapperBlocks(this.workspace, event);
      revalidateTypedNumericBlocks(this.workspace, event);
    };
  }
}
