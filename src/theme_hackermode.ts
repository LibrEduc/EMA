/**
 * @packageDocumentation
 * @module Theme.HackerMode
 * @description Local mirror of \@blockly/theme-hackermode (blockly-samples).
 * @remarks
 * Colors and structure match the official plugin so swapping to the npm
 * package later is invisible. Libre/board styles are added in options.ts
 * via extendThemeWithLibre().
 * @see https://github.com/RaspberryPiFoundation/blockly-samples/tree/main/plugins/theme-hackermode
 * @license GPL-3.0-or-later
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Hacker Mode block/category palette (Apache-2.0, Google LLC 2023):
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";

/** Official defaultBlockStyles from theme-hackermode/src/index.ts */
const defaultBlockStyles = {
  colour_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  list_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  logic_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  loop_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  math_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  procedure_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  text_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  variable_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
  variable_dynamic_blocks: {
    colourPrimary: "#0c0d0d",
    colourSecondary: "#0c0d0d",
    colourTertiary: "#edf2f2",
  },
};

/** Official categoryStyles from theme-hackermode/src/index.ts */
const categoryStyles = {
  colour_category: { colour: "#0c0d0d" },
  list_category: { colour: "#0c0d0d" },
  logic_category: { colour: "#0c0d0d" },
  loop_category: { colour: "#0c0d0d" },
  math_category: { colour: "#0c0d0d" },
  procedure_category: { colour: "#0c0d0d" },
  text_category: { colour: "#0c0d0d" },
  variable_category: { colour: "#0c0d0d" },
  variable_dynamic_category: { colour: "#0c0d0d" },
};

/** Block style for libre/board when extendThemeWithLibre merges hacker theme. */
export const HACKER_LIBRE_BOARD_BLOCK_STYLE = defaultBlockStyles.colour_blocks;

/** Category colour for libre/board on hacker theme. */
export const HACKER_LIBRE_BOARD_CATEGORY_STYLE = { colour: "#0c0d0d" };

const HackerModeTheme = Blockly.Theme.defineTheme("hackermode", {
  name: "hackermode",
  base: Blockly.Themes.Classic,
  blockStyles: defaultBlockStyles,
  categoryStyles,
  componentStyles: {
    workspaceBackgroundColour: "#1e1e1e",
    toolboxBackgroundColour: "#333",
    toolboxForegroundColour: "#73ed58",
    flyoutBackgroundColour: "#252526",
    flyoutForegroundColour: "#73ed58",
    flyoutOpacity: 1,
    scrollbarColour: "#797979",
    insertionMarkerColour: "#fff",
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.4,
    cursorColour: "#d0d0d0",
  },
  fontStyle: {
    family: "monospace",
  },
  startHats: undefined,
});

export default HackerModeTheme;
