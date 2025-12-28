/**
 * @packageDocumentation
 * @module Theme
 * @description Black and white theme implementation for µcBlockly
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
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
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see \<https://www.gnu.org/licenses/\>.
 * 
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * @packageDocumentation Black & White theme.
 */

import * as Blockly from 'blockly/core';

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
  },
  'componentStyles': {},
  'fontStyle': {},
  'startHats': undefined,
});