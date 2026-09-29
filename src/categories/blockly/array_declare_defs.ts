/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareDefs
 * @description Facade registering Array_declare, create, fix, and getIndex_in_array.
 * @remarks
 * Split: array_declare_declare / create / fix / get_index (+ shared helpers).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { MenuOption } from "blockly";
import { defineArrayCreateBlock } from "./array_declare_create";
import { defineArrayDeclareBlock } from "./array_declare_declare";
import { defineArrayFixBlock } from "./array_declare_fix";
import { defineArrayGetIndexBlock } from "./array_declare_get_index";

/**
 * Registers Array_declare, Array_create, Array_fix, and Array_getIndex_in_array.
 * @param getTypeOptions Arduino scalar type dropdown options.
 */
export function defineArrayDeclareBlocks(
  getTypeOptions: () => MenuOption[],
): void {
  defineArrayDeclareBlock(getTypeOptions);
  defineArrayCreateBlock(getTypeOptions);
  defineArrayFixBlock();
  defineArrayGetIndexBlock();
}
