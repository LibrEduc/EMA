/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedureCalls
 * @description Typed connection checks for procedure call blocks.
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
import { syncProcedureCallArgInputChecks } from "../../categories/blockly/shared";
import type { ProcedureBlockDef } from "./configure_procedure_types";

/**
 * Patches procedures_callreturn / callnoreturn to sync arg input checks on reshape.
 */
export function configureProcedureCallBlocks(): void {
  const callReturn = Blockly.Blocks["procedures_callreturn"] as
    | ProcedureBlockDef
    | undefined;
  if (callReturn && !callReturn.__typedConfigured) {
    callReturn.__typedConfigured = true;
    const originalUpdateShape = callReturn.updateShape_;
    callReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      syncProcedureCallArgInputChecks(this);
    };
  }

  const callNoReturn = Blockly.Blocks["procedures_callnoreturn"] as
    | ProcedureBlockDef
    | undefined;
  if (callNoReturn && !callNoReturn.__typedConfigured) {
    callNoReturn.__typedConfigured = true;
    const originalUpdateShape = callNoReturn.updateShape_;
    callNoReturn.updateShape_ = function (this: Blockly.Block) {
      if (originalUpdateShape) {
        originalUpdateShape.call(this);
      }
      syncProcedureCallArgInputChecks(this);
    };
  }

  // procedures_mutatorarg : mutateur legacy ; procédures via block-plus-minus (+/-).
}
