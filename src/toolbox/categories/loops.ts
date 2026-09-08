/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, numberShadow } from "../builder";

export const loopsCategory = category("CAT_LOOPS", {
  style: "loop_category",
  icon: "fa-repeat"
}, [
  block("controls_repeat_ext", {
    inputs: {
      "TIMES": numberShadow(10)
    }
  }),
  block("controls_repeat"),
  block("controls_whileUntil"),
  block("controls_for", {
    inputs: {
      "FROM": numberShadow(1),
      "TO": numberShadow(10),
      "BY": numberShadow(1)
    }
  }),
  block("controls_forEach"),
  block("controls_flow_statements")
]);
