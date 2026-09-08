/**
 * @packageDocumentation
 * @module ShellMessages
 * @description Shell / UI messages (alerts, board families) — 4 languages via languagesMap.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { languagesMap, type LanguageItem } from "./languages/languageMap";

export type ShellMessageKey =
  | "LOAD_MERGE_CONFIRM"
  | "FILE_INVALID_FORMAT"
  | "FILE_LOAD_ERROR"
  | "FILE_READ_ERROR"
  | "FILE_SAVE_ERROR"
  | "BOARD_FAMILY_OTHER"
  | "BOARD_FAMILY_ARDUINO_AVR"
  | "BOARD_FAMILY_ESP8266"
  | "BOARD_FAMILY_ESP32"
  | "BOARD_FAMILY_FRANZININHO"
  | "BOARD_FAMILY_PI_PICO"
  | "BOARD_FAMILY_STM32_NUCLEO"
  | "BOARD_FAMILY_TEENSY"
  | "BOARD_FAMILY_MAKEBLOCK"
  | "BOARD_FAMILY_DFROBOT"
  | "BOARD_FAMILY_DAGU"
  | "BOARD_FAMILY_PEGUINO"
  | "BOARD_FAMILY_KITS";

const DEFAULT_LANG = "en";

const normalizeLang = (language?: string): string => {
  const fromMenu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (language ?? fromMenu?.value ?? new URLSearchParams(window.location.search).get("lang") ?? DEFAULT_LANG).toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return DEFAULT_LANG;
};

/**
 * Returns a localized shell/UI string for the given language (defaults from URL / menu).
 * @param key - Lookup key.
 * @param language - Language code (e.g. `fr`, `en`).
 * @returns Result string.
 */
export const getShellMessage = (key: ShellMessageKey, language?: string): string => {
  const lang = normalizeLang(language);
  const messages = languagesMap[lang] as LanguageItem | undefined;
  const fallback = languagesMap[DEFAULT_LANG] as LanguageItem;
  return messages?.[key] ?? fallback[key] ?? key;
};

/**
 * Maps a board profile id to a translated optgroup family label key.
 * @param boardId - Board identifier.
 * @returns Operation result.
 */
export const getBoardFamilyMessageKey = (boardId: string): ShellMessageKey => {
  if (boardId === "none") {
    return "BOARD_FAMILY_OTHER";
  }
  if (
    boardId.startsWith("arduino_") ||
    boardId === "lilypad" ||
    boardId === "LilyPadUSB" ||
    boardId === "attiny85"
  ) {
    return "BOARD_FAMILY_ARDUINO_AVR";
  }
  if (boardId.startsWith("esp8266")) {
    return "BOARD_FAMILY_ESP8266";
  }
  if (boardId.startsWith("esp32")) {
    return "BOARD_FAMILY_ESP32";
  }
  if (boardId.startsWith("franzininho_")) {
    return "BOARD_FAMILY_FRANZININHO";
  }
  if (boardId.startsWith("pi-pico")) {
    return "BOARD_FAMILY_PI_PICO";
  }
  if (boardId.startsWith("st-nucleo")) {
    return "BOARD_FAMILY_STM32_NUCLEO";
  }
  if (boardId.startsWith("teensy")) {
    return "BOARD_FAMILY_TEENSY";
  }
  if (boardId.startsWith("makeblock_")) {
    return "BOARD_FAMILY_MAKEBLOCK";
  }
  if (boardId.startsWith("dfrobot_")) {
    return "BOARD_FAMILY_DFROBOT";
  }
  if (boardId.startsWith("dagu_")) {
    return "BOARD_FAMILY_DAGU";
  }
  if (boardId.startsWith("peguino_")) {
    return "BOARD_FAMILY_PEGUINO";
  }
  if (boardId.startsWith("kit_")) {
    return "BOARD_FAMILY_KITS";
  }
  return "BOARD_FAMILY_OTHER";
};
