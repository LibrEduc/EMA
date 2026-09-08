/**
 * @packageDocumentation
 * @module BlocklyCategories.Variables
 * @description Variable block definitions for the Blockly toolbox (facade).
 * @remarks
 * Split: `variables_types`, `variables_access`, `variables_declare`, `variables_cast_local`.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export {
  createArduinoScalarTypeField,
  getArduinoTypeDropdownOptions,
  getArduinoTypeLabel,
} from "./variables_types";

export {
  defineVariablesGetDynamicBlock,
  defineVariablesSetDynamicBlock,
  extendStandardVariablesGetBlock,
  extendStandardVariablesSetBlock,
} from "./variables_access";

export {
  defineVariablesConstBlock,
  defineVariablesDefineBlock,
  defineVariablesSetInitBlock,
  defineVariablesSetTypeBlock,
} from "./variables_declare";

export {
  defineVariablesCastBlock,
  defineVariablesLocalBlock,
} from "./variables_cast_local";
