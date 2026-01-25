/**
 * @packageDocumentation
 * @module Language
 * @description Internationalization and localization support for µcBlockly
 * @remarks
 * Handles language switching and translation lookup.
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
import { BlocklyApplicationType } from './blockly_application_type';
import { ToolboxConfiguration } from "./toolbox";
/**
 * Gets the language code from the URL query string.
 * @returns Language code, defaulting to "en".
 */
export declare const getLangParamFromUrl: () => string;
/**
 * Gets the selected language from the dropdown and syncs the URL.
 * @returns Selected language code.
 */
export declare const getLangParamFromDropdown: () => string;
/**
 * Applies translations to DOM elements with language keys.
 * @param newLang - Target language code.
 */
export declare const HTML_changeLanguage: (newLang: string) => void;
/**
 * Populates the language dropdown from the application language map.
 * @param blocklyObject - Blockly application instance with language metadata.
 */
export declare const HTML_populateLanguages: (blocklyObject: BlocklyApplicationType) => void;
/**
 * Returns a toolbox configuration with translated category labels.
 * @param newLang - Target language code.
 * @param toolbox - Source toolbox configuration.
 * @returns Translated toolbox configuration.
 */
export declare const changeLanguageToolbox: (newLang: string, toolbox: ToolboxConfiguration) => ToolboxConfiguration;
//# sourceMappingURL=language.d.ts.map