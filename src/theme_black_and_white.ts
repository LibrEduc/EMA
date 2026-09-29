/**
 * @packageDocumentation
 * @module Theme.BlackAndWhite
 * @description Black and white theme implementation for µcBlockly.
 * @remarks
 * Defines a minimal monochrome theme for Blockly.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @packageDocumentation Black & White theme.
 */

import * as Blockly from "blockly";

export default Blockly.Theme.defineTheme('black_and_white', {
  'name': 'Black and white',
  'base': Blockly.Themes.Classic,
  'blockStyles': {
    'colour_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'list_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'logic_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'loop_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'math_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'procedure_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'text_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'variable_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'variable_dynamic_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'hat_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
      'hat': 'cap',
    },
    'libre_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
    'board_blocks': {
      'colourPrimary': '#000000',
      'colourSecondary': '#000000',
      'colourTertiary': '#000000',
    },
  },
  'categoryStyles': {
    'colour_category': {
      'colour': '#000000',
    },
    'list_category': {
      'colour': '#000000',
    },
    'logic_category': {
      'colour': '#000000',
    },
    'loop_category': {
      'colour': '#000000',
    },
    'math_category': {
      'colour': '#000000',
    },
    'procedure_category': {
      'colour': '#000000',
    },
    'text_category': {
      'colour': '#000000',
    },
    'variable_category': {
      'colour': '#000000',
    },
    'variable_dynamic_category': {
      'colour': '#000000',
    },
    'libre_category': {
      'colour': '#000000',
    },
    'board_category': {
      'colour': '#000000',
    },
  },
  'componentStyles': {
    workspaceBackgroundColour: '#ffffff',
    toolboxBackgroundColour: '#f0f0f0',
    toolboxForegroundColour: '#000000',
    flyoutBackgroundColour: '#f0f0f0',
    flyoutForegroundColour: '#000000',
    scrollbarColour: '#404040',
    markerColour: '#000000',
    cursorColour: '#000000',
  },
  'fontStyle': {},
  'startHats': undefined,
});
