/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, numberShadow } from "../builder";

export const listsCategory = category("CAT_LISTS", {
  style: "list_category",
  icon: "fa-list"
}, [
  block("Array_with"),
  block("Array_bitmap", {
    inputs: {
      "COLS": numberShadow(8),
      "ROWS": numberShadow(8)
    }
  }),
  block("Array_set"),
  block("Array_bitmap_get", {
    inputs: {
      "COLS": numberShadow(8),
      "ROWS": numberShadow(8)
    }
  }),
  block("Array_declare"),
  block("Array_create"),
  block("Array_getIndex_in_list"),
  block("Array_modify"),
  block("Array_fix"),
  block("Array_getIndex_in_array")
]);
