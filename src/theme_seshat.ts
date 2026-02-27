/**
 * @packageDocumentation
 * @module Theme.Seshat
 * @description Local Seshat-inspired theme for µcBlockly.
 * @remarks
 * This local implementation avoids the deprecated external package
 * peer-dependency constraint on old Blockly versions.
 * @license GPL-3.0-or-later
 */

import * as Blockly from "blockly";

const SeshatTheme = Blockly.Theme.defineTheme("seshat", {
  name: "Seshat",
  base: Blockly.Themes.Classic,
  blockStyles: {
    colour_blocks: { colourPrimary: "#56a5d8" },
    list_blocks: { colourPrimary: "#e4d154" },
    logic_blocks: { colourPrimary: "#0079c1" },
    loop_blocks: { colourPrimary: "#d17e21" },
    math_blocks: { colourPrimary: "#9bc19c" },
    procedure_blocks: { colourPrimary: "#5a9359" },
    text_blocks: { colourPrimary: "#ab3c16" },
    variable_blocks: { colourPrimary: "#9081bc" },
    variable_dynamic_blocks: { colourPrimary: "#7461a8" },
    hat_blocks: { colourPrimary: "#5a9359" },
    libre_blocks: { colourPrimary: "#00979D" },
  },
  categoryStyles: {
    colour_category: { colour: "#56a5d8" },
    list_category: { colour: "#e4d154" },
    logic_category: { colour: "#0079c1" },
    loop_category: { colour: "#d17e21" },
    math_category: { colour: "#9bc19c" },
    procedure_category: { colour: "#5a9359" },
    text_category: { colour: "#ab3c16" },
    variable_category: { colour: "#9081bc" },
    variable_dynamic_category: { colour: "#7461a8" },
    libre_category: { colour: "#00979D" },
  },
  componentStyles: {
    workspaceBackgroundColour: "#f8f8f8",
    toolboxBackgroundColour: "#efefef",
    toolboxForegroundColour: "#323232",
    flyoutBackgroundColour: "#efefef",
    flyoutForegroundColour: "#323232",
    flyoutOpacity: 0.9,
    scrollbarColour: "#ccc",
    scrollbarOpacity: 0.8,
    insertionMarkerColour: "#0079c1",
    markerColour: "#de2900",
    cursorColour: "#ab3c16",
  },
  fontStyle: {
    family: "'Montserrat', sans-serif",
    size: 14,
    weight: "400",
  },
  startHats: true,
});

export default SeshatTheme;
