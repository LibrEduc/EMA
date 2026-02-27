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
import SeshatTheme from './theme_seshat';

/** Styles pour la catégorie et les blocs « Libre » (couleur Arduino #00979D). */
const LIBRE_CATEGORY_STYLE = { colour: '#00979D' };
const LIBRE_BLOCK_STYLE = { colourPrimary: '#00979D' };

/** Noir pour le thème black and white (comme les autres catégories). */
const LIBRE_BLACK = { colour: '#000000', colourPrimary: '#000000' };

/**
 * Étend un thème avec les styles libre_category et libre_blocks pour éviter
 * l'erreur "Style libre_category must exist and contain a colour value"
 * lorsque la catégorie Libre est affichée avec un thème qui ne les définit pas.
 * En thème black and white, libre reste noir comme les autres catégories.
 */
function extendThemeWithLibre(key: string, base: Blockly.Theme): Blockly.Theme {
  const isBlackWhite = key === 'blackWhite';
  const categoryStyle = isBlackWhite ? { colour: LIBRE_BLACK.colour } : LIBRE_CATEGORY_STYLE;
  const blockStyle = isBlackWhite ? { colourPrimary: LIBRE_BLACK.colourPrimary } : LIBRE_BLOCK_STYLE;
  return Blockly.Theme.defineTheme(`${key}_libre`, {
    name: `${key}_libre`,
    base,
    categoryStyles: { libre_category: categoryStyle },
    blockStyles: { libre_blocks: blockStyle },
  });
}

/**
 * Maps theme keys to Blockly theme instances.
 * Chaque thème est étendu avec libre_category et libre_blocks.
 */
export const themeMappings: { [key: string]: Blockly.Theme } = {
  classic: extendThemeWithLibre('classic', Blockly.Themes.Classic),
  modern: extendThemeWithLibre('modern', ModernTheme),
  deuteranopia: extendThemeWithLibre('deuteranopia', DeuteranopiaTheme),
  tritanopia: extendThemeWithLibre('tritanopia', TritanopiaTheme),
  zelos: extendThemeWithLibre('zelos', Blockly.Themes.Zelos),
  high_contrast: extendThemeWithLibre('high_contrast', HighContrastTheme),
  dark: extendThemeWithLibre('dark', DarkTheme),
  seshat: extendThemeWithLibre('seshat', SeshatTheme),
  blackWhite: extendThemeWithLibre('blackWhite', BandWTheme),
};