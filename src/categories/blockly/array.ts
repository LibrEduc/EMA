/**
 * @packageDocumentation
 * @module BlocklyCategories.Array
 * @description S4e-style array blocks for Arduino (definitions + facade).
 * @remarks
 * Sync/ownership helpers live in `array_sync.ts`; plus/minus mutators in `array_mutators.ts`.
 * List defs: `array_list_defs.ts`; declare façade: `array_declare_defs.ts` (declare/create/fix/get_index); bitmap: `array_bitmap.ts`.
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
import { getArduinoTypeDropdownOptions } from "./variables";
import { defineArrayListBlocks } from "./array_list_defs";
import { defineArrayDeclareBlocks } from "./array_declare_defs";

export {
  applyListDeclarationBlockWarning,
  revalidateListDeclarationUniqueness,
  syncListDeclarationOwnership,
  syncListDeclarationUniqueness,
} from "./array_sync";

let arrayBlocksRegistered = false;

/**
 * Registers all non-bitmap array / list Blockly block definitions.
 */
export const defineArrayBlocks = (): void => {
  if (arrayBlocksRegistered) {
    return;
  }
  arrayBlocksRegistered = true;
  const getTypeOptions = (): MenuOption[] =>
    getArduinoTypeDropdownOptions();
  defineArrayListBlocks();
  defineArrayDeclareBlocks(getTypeOptions);
};
