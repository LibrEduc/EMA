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

/**
 * Maps theme keys to Blockly theme instances.
 */
export const themeMappings: { [key: string]: Blockly.Theme } = {
  classic: Blockly.Themes.Classic,
  modern: ModernTheme,
  deuteranopia: DeuteranopiaTheme,
  tritanopia: TritanopiaTheme,
  zelos: Blockly.Themes.Zelos,
  high_contrast: HighContrastTheme,
  dark: DarkTheme,
  blackWhite: BandWTheme,
};