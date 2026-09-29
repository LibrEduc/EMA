/**
 * @packageDocumentation
 * @module BlockPlusMinusInit
 * @description Loads block-plus-minus (if, lists, text, procedures +/-).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Main `blockly` entry loads blocks_compressed (registers text_join_mutator, etc.).
// Plus-minus must run after that so it can unregister/replace those mutators.
import "blockly";

import "@blockly/block-plus-minus/src/if.js";
import "@blockly/block-plus-minus/src/list_create.js";
import "@blockly/block-plus-minus/src/text_join.js";
import "@blockly/block-plus-minus/src/procedures.js";
