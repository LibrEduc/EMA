/**
 * @packageDocumentation
 * @module Options
 * @description Configuration options and theme mappings for µcBlockly
 * @remarks
 * Defines supported themes, renderers, and option defaults.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
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

import * as Blockly from 'blockly';

import DarkTheme from '@blockly/theme-dark';
import ModernTheme from '@blockly/theme-modern';
import HighContrastTheme from '@blockly/theme-highcontrast';
import DeuteranopiaTheme from '@blockly/theme-deuteranopia';
import TritanopiaTheme from '@blockly/theme-tritanopia';
import BandWTheme from './theme_black_and_white';
import HackerModeTheme, {
  HACKER_LIBRE_BOARD_BLOCK_STYLE,
  HACKER_LIBRE_BOARD_CATEGORY_STYLE,
} from './theme_hackermode';
import SeshatTheme from './theme_seshat';

/** Styles for the Libre category and blocks (Arduino colour #00979D). */
const LIBRE_CATEGORY_STYLE = { colour: '#00979D' };
const LIBRE_BLOCK_STYLE = { colourPrimary: '#00979D' };

/** Style for the Board category (same colour as Libre / Arduino). */
const BOARD_CATEGORY_STYLE = { colour: '#00979D' };
const BOARD_BLOCK_STYLE = { colourPrimary: '#00979D' };

/** Black for the black and white theme (like other categories). */
const LIBRE_BLACK = { colour: '#000000', colourPrimary: '#000000' };

/**
 * Extends a theme with libre_category, libre_blocks, board_category and board_blocks styles
 * to avoid style errors when these categories are displayed.
 * In black and white theme, libre and board remain black like other categories.
 */
function extendThemeWithLibre(key: string, base: Blockly.Theme): Blockly.Theme {
  const isBlackWhite = key === 'blackWhite';
  const isHacker = key === 'hacker';
  const categoryStyle = isBlackWhite
    ? { colour: LIBRE_BLACK.colour }
    : isHacker
      ? HACKER_LIBRE_BOARD_CATEGORY_STYLE
      : LIBRE_CATEGORY_STYLE;
  const blockStyle = isBlackWhite
    ? { colourPrimary: LIBRE_BLACK.colourPrimary }
    : isHacker
      ? HACKER_LIBRE_BOARD_BLOCK_STYLE
      : LIBRE_BLOCK_STYLE;
  const boardCategoryStyle = isBlackWhite
    ? { colour: LIBRE_BLACK.colour }
    : isHacker
      ? HACKER_LIBRE_BOARD_CATEGORY_STYLE
      : BOARD_CATEGORY_STYLE;
  const boardBlockStyle = isBlackWhite
    ? { colourPrimary: LIBRE_BLACK.colourPrimary }
    : isHacker
      ? HACKER_LIBRE_BOARD_BLOCK_STYLE
      : BOARD_BLOCK_STYLE;
  return Blockly.Theme.defineTheme(`${key}_libre`, {
    name: `${key}_libre`,
    base,
    categoryStyles: { libre_category: categoryStyle, board_category: boardCategoryStyle },
    blockStyles: { libre_blocks: blockStyle, board_blocks: boardBlockStyle },
  });
}

/**
 * Maps theme keys to Blockly theme instances.
 * Each theme is extended with libre_category and libre_blocks.
 */
export const themeMappings: { [key: string]: Blockly.Theme } = {
  classic: extendThemeWithLibre('classic', Blockly.Themes.Classic),
  modern: extendThemeWithLibre('modern', ModernTheme),
  deuteranopia: extendThemeWithLibre('deuteranopia', DeuteranopiaTheme),
  tritanopia: extendThemeWithLibre('tritanopia', TritanopiaTheme),
  zelos: extendThemeWithLibre('zelos', Blockly.Themes.Zelos),
  high_contrast: extendThemeWithLibre('high_contrast', HighContrastTheme),
  dark: extendThemeWithLibre('dark', DarkTheme),
  hacker: extendThemeWithLibre('hacker', HackerModeTheme),
  seshat: extendThemeWithLibre('seshat', SeshatTheme),
  blackWhite: extendThemeWithLibre('blackWhite', BandWTheme),
};