/**
 * @packageDocumentation
 * @module BlocklyPatches
 * @description Runtime patches for Blockly (facade).
 * @remarks
 * Implementations live under `src/blockly_patches/`. Re-test these at each Blockly bump.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export { patchConnectionCheckerForConstBlock } from "./blockly_patches/const_connection";
export { patchVariableMapCreateVariable } from "./blockly_patches/variable_map";
export { patchFieldVariableValidation } from "./blockly_patches/field_variable";
export { patchBlockChangeForProcedureCompat } from "./blockly_patches/procedure_compat";
export { patchBlocklyDefensive } from "./blockly_patches/defensive";

