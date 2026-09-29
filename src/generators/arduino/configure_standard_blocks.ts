/**
 * @packageDocumentation
 * @module Arduino.ConfigureStandardBlocks
 * @description Configuration for standard Blockly blocks.
 * @remarks
 * Applies typed-variable behaviors to standard Blockly blocks.
 * Split: configure_math / configure_loop / configure_logic / configure_text / configure_procedure.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { debugLog } from "./debug";
import { configureLogicCompareAndTernaryBlocks } from "./configure_logic_blocks";
import { configureMathNumberBlocks } from "./configure_math_blocks";
import { configureLoopBlocks } from "./configure_loop_blocks";
import { configureTextAppendBlocks } from "./configure_text_blocks";
import { configureProcedureBlocks } from "./configure_procedure_blocks";

/**
 * Applies typed variable behavior to standard Blockly blocks.
 */
export function configureStandardBlocks(): void {
  configureMathNumberBlocks();
  // Note: controls_if already uses 'Boolean' which is correct for Blockly
  // We map 'bool' to 'Boolean' in getBlockType of variables_get_dynamic
  // So controls_if will accept our variables with type 'bool' (mapped to 'Boolean')
  // No need to modify controls_if - it already uses 'Boolean' correctly
  configureLogicCompareAndTernaryBlocks();
  configureLoopBlocks();
  configureTextAppendBlocks();
  configureProcedureBlocks();
  debugLog(
    "✅ Standard blocks configured (logic_compare: EQ/NEQ same-type, else Number/int/float)",
  );
}
