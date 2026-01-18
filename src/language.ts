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
import { addReplaceParamToUrl } from './tools';
import { languagesMap, LanguageItem } from './languages/languageMap';
import { ToolboxConfiguration } from "./toolbox";


/**
 * The function `getLangParamFromUrl` retrieves the language parameter from the URL and updates the
 * language menu if the parameter is valid.
 * @returns The function `getLangParamFromUrl` returns the language parameter (`lang`) extracted from
 * the URL query string. If the `lang` parameter is not found in the URL, it defaults to `'en'`. The
 * function also updates the value of the `languageMenu` select element if it exists and the `lang`
 * parameter is found in the `LANGUAGE_NAME` object.
 */
export const getLangParamFromUrl = (): string => {
  const lang = new URLSearchParams(window.location.search).get('lang') ?? 'en';
  (document.getElementById('languageMenu') as HTMLSelectElement | null)!.value = lang;
  return lang;
}

/**
 * The function `getLangParamFromDropdown` retrieves the selected language value from a dropdown menu
 * and updates the URL with the new language parameter.
 * @returns The function `getLangParamFromDropdown` returns the selected value from a dropdown menu
 * with the id 'languageMenu'.
 */
export const getLangParamFromDropdown = (): string => {
  const dropdownMenu: HTMLSelectElement = document.getElementById('languageMenu') as HTMLSelectElement;
  const newLang: string = dropdownMenu.options[dropdownMenu.selectedIndex].value;
  window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "lang", newLang));
  return newLang;
};

/**
 * The function `HTML_changeLanguage` updates the text content of elements with the class "lang"
 * based on the selected language.
 * @param newLang - The `newLang` parameter is a string that represents the new language that
 * the user wants to change to.
 */
export const HTML_changeLanguage = (newLang: string): void => {
  const selectedLangItem = languagesMap[newLang];
  if (!selectedLangItem) return;

  const langElements = document.querySelectorAll('.lang');
  langElements.forEach((element) => {
    const key = element.getAttribute('key');
    if (key && selectedLangItem[key as keyof LanguageItem]) {
      element.textContent = selectedLangItem[key as keyof LanguageItem];
    }
    const titleKey = element.getAttribute('data-title-key');
    if (titleKey && selectedLangItem[titleKey as keyof LanguageItem]) {
      element.setAttribute('title', selectedLangItem[titleKey as keyof LanguageItem]);
    }
  });

  const titledElements = document.querySelectorAll('[data-title-key]');
  titledElements.forEach((element) => {
    const titleKey = element.getAttribute('data-title-key');
    if (titleKey && selectedLangItem[titleKey as keyof LanguageItem]) {
      element.setAttribute('title', selectedLangItem[titleKey as keyof LanguageItem]);
    }
  });
}

/**
 * The `HTML_populateLanguages` function is responsible for populating the language selection menu on a webpage
 * with options sorted alphabetically.
 * @param blocklyObject - The `blocklyObject` parameter is an object that
 * contains information about the Blockly application. It likely includes properties such as
 * `LANGUAGE_NAME`, which is an object that maps language codes to their corresponding names.
 */
export const HTML_populateLanguages = (blocklyObject: BlocklyApplicationType): void => {
  /**
   * The function sorts an array of language names based on their first argument.
   * @param a - a is an array of strings representing languages. Each element in the array
   * is an array itself, with the first element being the name of the language (e.g. 'English',
   * 'Русский', '简体字', etc) and the remaining elements being additional information about the language.
   * @param b - The parameter `b` is an array of strings.
   * @returns The `comp` function is being used as a comparator function to sort the `languages` array.
   * The `comp` function compares two elements `a` and `b` based on their first element (`a[0]` and
   * `b[0]`).
   */
  const comp = (a: string[], b: string[]) => {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0])
      return 1;
    if (a[0] < b[0])
      return -1;
    return 0;
  };

  const languages = [];
  for (const lang in blocklyObject.LANGUAGE_NAME) {
    languages.push([blocklyObject.LANGUAGE_NAME[lang], lang]);
  }
  languages.sort(comp);
  /* This code block is responsible for populating the language selection menu on a webpage with
  options sorted alphabetically. */
  const languageMenu: HTMLSelectElement = document.getElementById('languageMenu') as HTMLSelectElement;
  languageMenu.options.length = 0;
  for (const element of languages) {
    const lang = element[element.length - 1];
    const option = new Option(element[0], lang);
    if (lang === getLangParamFromUrl()) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
}

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
export const changeLanguageToolbox = (newLang: string, toolbox: ToolboxConfiguration ): ToolboxConfiguration => {
 const basic_toolboxCopy = JSON.parse(JSON.stringify(toolbox.contents));
 const langMap: LanguageItem = languagesMap[newLang];
 interface Category {
   kind: string;
   name: string;
   categoryStyle: string;
   contents?: Category[];
 }
 /**
  * The function replaces the name of a category with its corresponding translation if available in
  * the language map.
  * @param category - The parameter `category` is of type `Category`, which is an object
  * that represents a category.
  */
 function replaceCategoryName(category: Category) {
   if (category.kind === 'category' && category.name && langMap[category.name as keyof LanguageItem]) {
     category.name = langMap[category.name as keyof LanguageItem];
   }
   if (category.contents) {
     category.contents.forEach((content: Category) => {
       replaceCategoryName(content);
     });
   }
 }
 basic_toolboxCopy.forEach((category: Category) => {
   replaceCategoryName(category);
 });
 const temp_toolboxCopy: ToolboxConfiguration = JSON.parse(JSON.stringify(toolbox));
 temp_toolboxCopy.contents = JSON.parse(JSON.stringify(basic_toolboxCopy));
 return(JSON.parse(JSON.stringify(temp_toolboxCopy)));
}