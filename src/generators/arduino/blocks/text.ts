/**
 * @packageDocumentation
 * @module Arduino.Generators.Text
 * @description Arduino code generators for text blocks.
 * @remarks
 * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under AGPL-3.0-or-later.
 * Split: text_expr, text_literals, text_ops, text_transform, text_io (+ text_helpers).
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
  text,
  text_no_quote,
  text_multiline,
  text_date,
  text_char,
} from "./text_literals";

export {
  text_join,
  text_append,
  text_length,
  text_isEmpty,
  text_indexOf,
  text_charAt,
  text_getSubstring,
} from "./text_ops";

export {
  text_changeCase,
  text_trim,
  text_count,
  text_replace,
  text_reverse,
} from "./text_transform";

export { text_print, text_prompt_ext } from "./text_io";
