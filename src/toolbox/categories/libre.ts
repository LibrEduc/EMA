/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category } from "../builder";

export const libreCategory = category("CAT_LIBRE", {
  style: "libre_category",
  icon: "fa-puzzle-piece"
}, [
  block("libre_start"),
  block("libre_in"),
  block("libre_out"),
  block("libre_in_out"),
  block("libre_end"),
  block("libre_loop"),
  block("libre_loop_with_return"),
  block("libre_loop_inside"),
  block("libre_loop_inside_in"),
  block("libre_loop_inside_in_mutator"),
  block("libre_loop_do_inside"),
  block("libre_loop_do_inside_in")
]);
