/**
 * @packageDocumentation
 * @module Options
 * @description Configuration options and theme mappings for µcBlockly
 * @remarks
 * Defines supported themes, renderers, and option defaults.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

/** Style for the Board category (teint plus sombre que Libre pour le daltonisme). */
const BOARD_CATEGORY_STYLE = { colour: '#006468' };
const BOARD_BLOCK_STYLE = { colourPrimary: '#006468' };
/** Bordure jaune pour le conteneur « Define » (legacy Blockly@rduino). */
const BOARD_DEFINE_BLOCK_STYLE = {
  colourPrimary: '#006468',
  colourSecondary: '#FFCC00',
  colourTertiary: '#004446',
};

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
  const boardDefineBlockStyle = isBlackWhite
    ? { colourPrimary: LIBRE_BLACK.colourPrimary }
    : isHacker
      ? { ...HACKER_LIBRE_BOARD_BLOCK_STYLE, colourSecondary: '#FFCC00' }
      : BOARD_DEFINE_BLOCK_STYLE;
  return Blockly.Theme.defineTheme(`${key}_libre`, {
    name: `${key}_libre`,
    base,
    categoryStyles: { libre_category: categoryStyle, board_category: boardCategoryStyle },
    blockStyles: {
      libre_blocks: blockStyle,
      board_blocks: boardBlockStyle,
      board_define_blocks: boardDefineBlockStyle,
    },
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
