/**
 * @packageDocumentation
 * @module Toolbox.Builder
 * @description Beginner-friendly helpers to declare toolbox categories and blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
  ToolboxBlockEntry,
  ToolboxCategoryContentEntry,
  ToolboxConfiguration,
} from "../toolbox_types";
import { toolboxIcon } from "../toolbox_types";

export type BlockOptions = {
  fields?: ToolboxBlockEntry["fields"];
  inputs?: ToolboxBlockEntry["inputs"];
  levels?: string;
};

export type CategoryOptions = {
  /** Blockly categorystyle (e.g. `logic_category`). */
  style?: string;
  /** Font Awesome icon name without prefix, e.g. `fa-microchip`. */
  icon?: string;
  /** Dynamic flyout (`TYPED_VARIABLES`, `PROCEDURE`, …). */
  custom?: string;
};

/**
 * A simple block entry (most common case: just the type id).
 * @param type - Blockly block type id.
 * @param options - Optional fields / shadow inputs.
 * @returns Toolbox block entry.
 */
export function block(
  type: string,
  options?: BlockOptions,
): ToolboxBlockEntry {
  const entry: ToolboxBlockEntry = { kind: "block", type };
  if (options?.fields) entry.fields = options.fields;
  if (options?.inputs) entry.inputs = options.inputs;
  if (options?.levels) entry.levels = options.levels;
  return entry;
}

/**
 * Horizontal separator between categories.
 * @returns Separator entry.
 */
export function sep(): ToolboxCategoryContentEntry {
  return { kind: "sep" };
}

/**
 * Search category (requires toolbox-search plugin).
 * @param name - Message key (e.g. `CAT_SEARCH`).
 * @returns Search entry.
 */
export function search(name = "CAT_SEARCH"): ToolboxCategoryContentEntry {
  return { kind: "search", name, contents: [] };
}

/**
 * A toolbox category (or subcategory).
 * @param name - Message key (e.g. `CAT_LOGIC`).
 * @param options - Style / icon / custom flyout.
 * @param contents - Blocks and nested categories (omit for custom flyouts).
 * @returns Category entry.
 */
export function category(
  name: string,
  options: CategoryOptions = {},
  contents?: ToolboxCategoryContentEntry[],
): ToolboxCategoryContentEntry {
  const entry: {
    kind: string;
    name: string;
    categorystyle?: string;
    custom?: string;
    cssConfig?: ReturnType<typeof toolboxIcon>;
    contents?: ToolboxCategoryContentEntry[];
  } = {
    kind: "category",
    name,
  };
  if (options.style) entry.categorystyle = options.style;
  if (options.icon) entry.cssConfig = toolboxIcon(options.icon);
  if (options.custom) entry.custom = options.custom;
  if (contents) entry.contents = contents;
  else if (!options.custom) entry.contents = [];
  return entry;
}

/**
 * Number shadow input helper for `block(..., { inputs })`.
 * @param num - Default number.
 * @returns Shadow descriptor.
 */
export function numberShadow(num: number): {
  shadow: { type: string; fields: { NUM: number } };
} {
  return { shadow: { type: "math_number", fields: { NUM: num } } };
}

/**
 * Text shadow input helper.
 * @param text - Default text.
 * @returns Shadow descriptor.
 */
export function textShadow(text = ""): {
  shadow: { type: string; fields: { TEXT: string } };
} {
  return { shadow: { type: "text", fields: { TEXT: text } } };
}

/**
 * Assemble the top-level toolbox from categories / seps / search.
 * @param contents - Ordered top-level entries.
 * @returns Blockly toolbox configuration (before levels).
 */
export function buildToolbox(
  contents: ToolboxCategoryContentEntry[],
): ToolboxConfiguration {
  return {
    kind: "categoryToolbox",
    contents: contents as ToolboxConfiguration["contents"],
  };
}
