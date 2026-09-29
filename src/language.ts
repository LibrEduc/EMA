/**
 * @packageDocumentation
 * @module Language
 * @description Internationalization and localization support for µcBlockly
 * @remarks
 * Handles language switching and translation lookup.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BlocklyApplicationType } from './blockly_application_type';
import { pushStateReplaceSearchParam } from './tools';
import { languagesMap, LanguageItem } from './languages/languageMap';
import { applyDocumentLanguage, applyToolbarA11y } from './shell_a11y';
import { refreshShortcutsHelp } from './shell_shortcuts_help';
import { refreshKeyboardTutorial } from './shell_keyboard_tutorial';
import * as Blockly from 'blockly';
import { getExtensionMessagesForLang } from './extensions/registry';

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
 * @return Cache key used for storage.
 */
const getToolboxCacheKey = (lang: string, toolbox: ToolboxConfiguration): string => {
  const raw = JSON.stringify(toolbox);
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  // v2: category labels also resolve from Blockly.Msg / extension i18n
  return `ucb.toolbox.v2.${lang}.${(hash >>> 0).toString(16)}`;
};

/**
 * Reads a cached toolbox translation from local storage.
 * @param key - Cache key to read.
 * @return Cached JSON string or null.
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
 * @return Serialized toolbox JSON for the target language.
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
  const extensionMsgs = getExtensionMessagesForLang(newLang);
  const blocklyMsg = Blockly.Msg as Record<string, string>;
  interface Category {
    kind: string;
    name?: string;
    categoryStyle?: string;
    contents?: Category[];
  }
  const resolveCategoryLabel = (key: string): string | undefined => {
    const fromLang = langMap?.[key as keyof LanguageItem];
    if (typeof fromLang === "string" && fromLang) {
      return fromLang;
    }
    if (extensionMsgs[key]) {
      return extensionMsgs[key];
    }
    if (blocklyMsg[key]) {
      return blocklyMsg[key];
    }
    return undefined;
  };
  /**
   * Replaces category labels with localized values in place.
   * @param category - Toolbox category to localize.
   */
  function replaceCategoryName(category: Category) {
    if (
      (category.kind === "category" || category.kind === "search") &&
      category.name
    ) {
      const label = resolveCategoryLabel(category.name);
      if (label) {
        category.name = label;
      }
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
 * @returns Result string.
 */
export const getLangParamFromUrl = (): string => {
  const lang = new URLSearchParams(window.location.search).get('lang') ?? 'en';
  const languageMenu = document.getElementById(
    'languageMenu',
  ) as HTMLSelectElement | null;
  if (languageMenu) {
    languageMenu.value = lang;
  }
  return lang;
}

/**
 * Gets the selected language from the dropdown and syncs the URL.
 * @returns Result string.
 */
export const getLangParamFromDropdown = (): string => {
  const dropdownMenu = document.getElementById(
    'languageMenu',
  ) as HTMLSelectElement | null;
  const newLang =
    dropdownMenu?.options[dropdownMenu.selectedIndex]?.value ??
    getLangParamFromUrl();
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
  refreshShortcutsHelp();
  refreshKeyboardTutorial();
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
   * @return Sort order indicator.
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
 * Also sets the board category to « Carte : Arduino Uno » / « Carte : aucune ».
 * @param newLang - Target language code.
 * @param toolbox - Source toolbox configuration.
 * @return Translated toolbox configuration.
 */
export const changeLanguageToolbox = (
  newLang: string,
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration => {
  const toolboxJson = getTranslatedToolboxJson(newLang, toolbox);
  const parsed = JSON.parse(toolboxJson) as ToolboxConfiguration;
  return applyBoardCategoryDisplayName(parsed, newLang);
};

/**
 * Updates the top-level board category label from the current #boardMenu selection.
 * @param toolbox - Toolbox configuration.
 * @param language - Language code (e.g. `fr`, `en`).
 * @returns Operation result.
 */
export function applyBoardCategoryDisplayName(
  toolbox: ToolboxConfiguration,
  language: string,
): ToolboxConfiguration {
  const langMap: LanguageItem = languagesMap[language] ?? languagesMap.en;
  const prefix = langMap.CAT_BOARD;
  const menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  const suffix =
    !value || value === "none"
      ? langMap.CAT_BOARD_NONE
      : menu?.selectedOptions[0]?.textContent?.trim() || value;
  const label = `${prefix} : ${suffix}`;

  type Cat = {
    kind?: string;
    name?: string;
    categorystyle?: string;
    contents?: Cat[];
  };
  for (const item of (toolbox.contents ?? []) as Cat[]) {
    if (
      item.kind === "category" &&
      (item.categorystyle === "board_category" ||
        item.name === "CAT_BOARD" ||
        item.name === prefix ||
        (typeof item.name === "string" && item.name.startsWith(`${prefix} :`)))
    ) {
      item.name = label;
      break;
    }
  }
  return toolbox;
}
