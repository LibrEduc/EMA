/**
 * @packageDocumentation
 * @module Arduino.Generators.Math
 * @description Arduino code generators for math blocks.
 * @remarks
 * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under AGPL-3.0-or-later.
 * Split: math_literals, math_ops, math_checks, math_list_random (+ math_helpers).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export {
  math_number,
  math_percent,
  inout_angle_maths,
  math_constant,
} from "./math_literals";

export {
  math_change,
  math_arithmetic,
  math_single,
  math_trig,
  math_round,
  math_modulo,
  math_constrain,
  math_atan2,
} from "./math_ops";

export { math_interval, math_number_property } from "./math_checks";

export {
  math_on_list,
  math_random_int,
  math_random_float,
} from "./math_list_random";
