/**
 * @packageDocumentation
 * @module Arduino.BlockTypes.Text
 * @description Block type mappings for text blocks.
 * @remarks
 * Maps block IDs to static or dynamic types.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
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
  text_prompt_ext: "__DYNAMIC__textPromptType",
} as const;
