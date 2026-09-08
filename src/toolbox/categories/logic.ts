/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category } from "../builder";

export const logicCategory = category("CAT_LOGIC", {
  style: "logic_category",
  icon: "fa-diagram-project"
}, [
  block("controls_if"),
  block("controls_ifelse"),
  block("controls_switch"),
  block("logic_compare"),
  block("logic_operation"),
  block("logic_negate"),
  block("logic_boolean"),
  block("logic_null"),
  block("logic_ternary")
]);
