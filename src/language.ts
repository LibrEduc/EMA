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
import { pushStateReplaceSearchParam } from './tools';
import { languagesMap, LanguageItem } from './languages/languageMap';
import { applyDocumentLanguage, applyToolbarA11y } from './shell_a11y';

const RTL_LANGUAGES = new Set(['ar', 'fa', 'he', 'lki']);
import { ToolboxConfiguration } from "./toolbox";

const toolboxTranslationCache = new WeakMap<
  ToolboxConfiguration,
  Map<string, string>
>();

/**
 * Builds a stable cache key for a toolbox translation.
 * @param lang - Language code.
 * @param toolbox - Toolbox configuration to hash.
 * @returns Cache key used for storage.
 */
const getToolboxCacheKey = (lang: string, toolbox: ToolboxConfiguration): string => {
  const raw = JSON.stringify(toolbox);
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return `ucb.toolbox.${lang}.${(hash >>> 0).toString(16)}`;
};

/**
 * Reads a cached toolbox translation from local storage.
 * @param key - Cache key to read.
 * @returns Cached JSON string or null.
 */
const readToolboxFromLocalStorage = (key: string): string | null => {
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

/**
 * Clears cached toolbox entries, keeping the current key.
 * @param keepKey - Cache key to preserve.
 */
const clearToolboxLocalStorage = (keepKey: string): void => {
  try {
    const storage = window.localStorage;
    if (!storage) {
      return;
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith("ucb.toolbox.") && key !== keepKey) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Persists a toolbox translation JSON string to local storage.
 * @param key - Cache key to write.
 * @param value - Serialized toolbox JSON.
 */
const writeToolboxToLocalStorage = (key: string, value: string): void => {
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
};

/**
 * Returns a translated toolbox JSON string with caching.
 * @param newLang - Target language code.
 * @param toolbox - Base toolbox configuration.
 * @returns Serialized toolbox JSON for the target language.
 */
const getTranslatedToolboxJson = (
  newLang: string,
  toolbox: ToolboxConfiguration,
): string => {
  const storageKey = getToolboxCacheKey(newLang, toolbox);
  clearToolboxLocalStorage(storageKey);
  const localCached = readToolboxFromLocalStorage(storageKey);
  if (localCached) {
    return localCached;
  }

  let langCache = toolboxTranslationCache.get(toolbox);
  if (!langCache) {
    langCache = new Map<string, string>();
    toolboxTranslationCache.set(toolbox, langCache);
  }
  const cached = langCache.get(newLang);
  if (cached) {
    return cached;
  }

  const basicToolboxCopy = JSON.parse(
    JSON.stringify(toolbox.contents),
  ) as ToolboxConfiguration["contents"];
  const langMap: LanguageItem = languagesMap[newLang];
  interface Category {
    kind: string;
    name?: string;
    categoryStyle?: string;
    contents?: Category[];
  }
  /**
   * Replaces category labels with localized values in place.
   * @param category - Toolbox category to localize.
   */
  function replaceCategoryName(category: Category) {
    if (
      (category.kind === "category" || category.kind === "search") &&
      category.name &&
      langMap[category.name as keyof LanguageItem]
    ) {
      category.name = langMap[category.name as keyof LanguageItem];
    }
    if (category.contents) {
      category.contents.forEach((content: Category) => {
        replaceCategoryName(content);
      });
    }
  }
  (basicToolboxCopy as Category[]).forEach((category: Category) => {
    replaceCategoryName(category);
  });
  const tempToolboxCopy: ToolboxConfiguration = JSON.parse(
    JSON.stringify(toolbox),
  );
  tempToolboxCopy.contents = JSON.parse(JSON.stringify(basicToolboxCopy));
  const serialized = JSON.stringify(tempToolboxCopy);
  langCache.set(newLang, serialized);
  writeToolboxToLocalStorage(storageKey, serialized);
  return serialized;
};


/**
 * Gets the language code from the URL query string.
 * @returns Language code, defaulting to "en".
 */
export const getLangParamFromUrl = (): string => {
  const lang = new URLSearchParams(window.location.search).get('lang') ?? 'en';
  (document.getElementById('languageMenu') as HTMLSelectElement | null)!.value = lang;
  return lang;
}

/**
 * Gets the selected language from the dropdown and syncs the URL.
 * @returns Selected language code.
 */
export const getLangParamFromDropdown = (): string => {
  const dropdownMenu: HTMLSelectElement = document.getElementById('languageMenu') as HTMLSelectElement;
  const newLang: string = dropdownMenu.options[dropdownMenu.selectedIndex].value;
  pushStateReplaceSearchParam("lang", newLang);
  return newLang;
};

/**
 * Applies translations to DOM elements with language keys.
 * @param newLang - Target language code.
 */
export const HTML_changeLanguage = (newLang: string, rtl?: boolean): void => {
  const selectedLangItem = languagesMap[newLang];
  if (!selectedLangItem) return;

  const normalizeLangValue = (rawValue: string | undefined): string => {
    if (!rawValue) {
      return "";
    }
    const trimmed = rawValue.replace(/_+$/g, "").trim();
    return trimmed === "_" ? "" : trimmed;
  };

  const langElements = document.querySelectorAll<HTMLElement>('.lang');
  langElements.forEach((element) => {
    const key = element.getAttribute('key');
    if (key && Object.prototype.hasOwnProperty.call(selectedLangItem, key)) {
      const rawValue = selectedLangItem[key as keyof LanguageItem];
      const value = normalizeLangValue(rawValue);
      element.textContent = value;
      if (value) {
        element.style.removeProperty('display');
        const parent = element.parentElement;
        if (parent && parent.tagName === 'A') {
          parent.style.removeProperty('display');
        }
      } else {
        element.style.display = 'none';
        const parent = element.parentElement;
        if (parent && parent.tagName === 'A') {
          parent.style.display = 'none';
        }
      }
    }
    const titleKey = element.getAttribute('data-title-key');
    if (titleKey && selectedLangItem[titleKey as keyof LanguageItem]) {
      element.setAttribute('title', selectedLangItem[titleKey as keyof LanguageItem]);
    }
  });

  const titledElements = document.querySelectorAll('[data-title-key]');
  titledElements.forEach((element) => {
    const titleKey = element.getAttribute('data-title-key');
    if (titleKey && Object.prototype.hasOwnProperty.call(selectedLangItem, titleKey)) {
      const rawValue = selectedLangItem[titleKey as keyof LanguageItem];
      const value = normalizeLangValue(rawValue);
      if (value) {
        element.setAttribute('title', value);
      } else {
        element.removeAttribute('title');
      }
    }
  });

  applyDocumentLanguage(newLang, rtl ?? RTL_LANGUAGES.has(newLang));
  applyToolbarA11y();
}

/**
 * Populates the language dropdown from the application language map.
 * @param blocklyObject - Blockly application instance with language metadata.
 */
export const HTML_populateLanguages = (blocklyObject: BlocklyApplicationType): void => {
  /**
   * Sorts language tuples by display name.
   * @param a - [label, code] tuple.
   * @param b - [label, code] tuple.
   * @returns Sort order indicator.
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
 * Returns a toolbox configuration with translated category labels.
 * @param newLang - Target language code.
 * @param toolbox - Source toolbox configuration.
 * @returns Translated toolbox configuration.
 */
export const changeLanguageToolbox = (
  newLang: string,
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration => {
  const toolboxJson = getTranslatedToolboxJson(newLang, toolbox);
  return JSON.parse(toolboxJson) as ToolboxConfiguration;
};