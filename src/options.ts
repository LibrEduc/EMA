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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
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

import {initTheme} from '@aneilmac/blockly-theme-seshat';
const Seshat = initTheme(Blockly);
const SeshatTheme = Blockly.Theme.defineTheme('theme-seshat', {
 'base': Seshat,
 'name': 'SeshatTheme',
 'componentStyles': {
    'workspaceBackgroundColour': '#ffffff',
  }
})

/**
 * The function `changeTheme` allows the user to change the theme of a Blockly workspace based on a
 * given theme choice.
 * @param themeChoice - The `themeChoice` parameter is a string that represents the
 * chosen theme. It is optional and has a default value of `'classic'`.
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
  seshat: SeshatTheme,
};