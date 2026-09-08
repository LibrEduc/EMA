/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, numberShadow } from "../builder";

export const colorCategory = category("CAT_COLOR", {
  style: "colour_category",
  icon: "fa-palette"
}, [
  block("colour_picker"),
  block("color_picker_custom"),
  block("color_picker_hsv"),
  block("colour_random"),
  block("colour_rgb"),
  block("colour_blend", {
    inputs: {
      "COLOUR1": {
        "shadow": {
          "type": "colour_picker"
        }
      },
      "COLOUR2": {
        "shadow": {
          "type": "colour_picker"
        }
      },
      "RATIO": numberShadow(0.5)
    }
  })
]);
