/**
 * @packageDocumentation
 * @module Language
 * @description Internationalization and localization support for µcBlockly
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
import { BlocklyApplicationType } from './blockly_application_type';
import { ToolboxConfiguration } from "./toolbox";
/**
 * The function `getLangParamFromUrl` retrieves the language parameter from the URL and updates the
 * language menu if the parameter is valid.
 * @returns The function `getLangParamFromUrl` returns the language parameter (`lang`) extracted from
 * the URL query string. If the `lang` parameter is not found in the URL, it defaults to `'en'`. The
 * function also updates the value of the `languageMenu` select element if it exists and the `lang`
 * parameter is found in the `LANGUAGE_NAME` object.
 */
export declare const getLangParamFromUrl: () => string;
/**
 * The function `getLangParamFromDropdown` retrieves the selected language value from a dropdown menu
 * and updates the URL with the new language parameter.
 * @returns The function `getLangParamFromDropdown` returns the selected value from a dropdown menu
 * with the id 'languageMenu'.
 */
export declare const getLangParamFromDropdown: () => string;
/**
 * The function `HTML_changeLanguage` updates the text content of elements with the class "lang"
 * based on the selected language.
 * @param newLang - The `newLang` parameter is a string that represents the new language that
 * the user wants to change to.
 */
export declare const HTML_changeLanguage: (newLang: string) => void;
/**
 * The `HTML_populateLanguages` function is responsible for populating the language selection menu on a webpage
 * with options sorted alphabetically.
 * @param blocklyObject - The `blocklyObject` parameter is an object that
 * contains information about the Blockly application. It likely includes properties such as
 * `LANGUAGE_NAME`, which is an object that maps language codes to their corresponding names.
 */
export declare const HTML_populateLanguages: (blocklyObject: BlocklyApplicationType) => void;
/**
 * The function `changeLanguageToolbox` takes a new language and a toolbox configuration, replaces
 * category names with translations if available, and returns the updated toolbox configuration.
 * @param newLang - `newLang` is a string parameter representing the new language code that
 * you want to change the toolbox to. It is used to determine the language translation for the toolbox
 * categories.
 * @param toolbox - The `toolbox` parameter in the `changeLanguageToolbox`
 * function is of type `ToolboxConfiguration`. It represents a configuration object that contains the
 * contents of a toolbox, which is a collection of categories and blocks used in a programming
 * environment. The function is designed to change the language of the toolbox
 * @returns The function `changeLanguageToolbox` returns a new `ToolboxConfiguration` object with the
 * categories' names replaced with their corresponding translations based on the provided `newLang`
 * language parameter.
 */
export declare const changeLanguageToolbox: (newLang: string, toolbox: ToolboxConfiguration) => ToolboxConfiguration;
//# sourceMappingURL=language.d.ts.map