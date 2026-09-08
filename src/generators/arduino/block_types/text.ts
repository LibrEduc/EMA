/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Text
 * @description Block type mappings for text blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const TEXT_BLOCK_TYPES = {
  text: "string",
  text_no_quote: "string",
  text_multiline: "string",
  text_date: "string",
  text_char: "char",
  text_join: "string",
  text_append: "string",
  text_length: "int",
  text_isEmpty: "bool",
  text_charAt: "char",
  text_prompt_ext: "__DYNAMIC__textPromptType",
  text_indexOf: "int",
  text_getSubstring: "string",
  text_changeCase: "string",
  text_trim: "string",
  text_count: "int",
  text_replace: "string",
  text_reverse: "string",
} as const;
