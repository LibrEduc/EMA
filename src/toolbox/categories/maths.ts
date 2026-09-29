/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, numberShadow } from "../builder";

export const mathsCategory = category("CAT_MATHS", {
  style: "math_category",
  icon: "fa-calculator"
}, [
  block("math_number", {
    fields: {
      "NUM": 123
    }
  }),
  block("math_percent"),
  block("math_change", {
    inputs: {
      "DELTA": numberShadow(1)
    }
  }),
  block("inout_angle_maths"),
  block("math_arithmetic", {
    inputs: {
      "A": numberShadow(1),
      "B": numberShadow(1)
    }
  }),
  block("math_interval"),
  block("math_single", {
    inputs: {
      "NUM": numberShadow(9)
    }
  }),
  block("math_trig", {
    inputs: {
      "NUM": numberShadow(45)
    }
  }),
  block("math_constant"),
  block("math_number_property", {
    inputs: {
      "NUMBER_TO_CHECK": numberShadow(0)
    }
  }),
  block("math_round", {
    fields: {
      "OP": "ROUND"
    },
    inputs: {
      "NUM": numberShadow(3.1)
    }
  }),
  block("math_on_list", {
    fields: {
      "OP": "SUM"
    }
  }),
  block("math_modulo", {
    inputs: {
      "DIVIDEND": numberShadow(64),
      "DIVISOR": numberShadow(10)
    }
  }),
  block("math_constrain", {
    inputs: {
      "VALUE": numberShadow(50),
      "LOW": numberShadow(1),
      "HIGH": numberShadow(100)
    }
  }),
  block("math_random_int", {
    inputs: {
      "FROM": numberShadow(1),
      "TO": numberShadow(100)
    }
  }),
  block("math_random_float"),
  block("math_atan2", {
    inputs: {
      "X": numberShadow(1),
      "Y": numberShadow(1)
    }
  })
]);
