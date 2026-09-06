/**
 * @packageDocumentation
 * @module A11yLabels
 * @description Accessibility labels for layout UI (language-aware).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { languagesMap } from "./languages/languageMap";

type SupportedLang = "fr" | "en" | "es" | "ar";

/** Reads `lang` from URL only (no side effects; avoids importing language.ts → circular deps). */
const getLangFromUrl = (): string =>
  new URLSearchParams(window.location.search).get("lang") ?? "en";

const getSupportedLang = (): SupportedLang => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (menu?.value || getLangFromUrl() || "en").toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return "en";
};

export type A11yLabelKey =
  | "A11Y_SKIP_TO_WORKSPACE"
  | "A11Y_AREA_MENU_HINT"
  | "A11Y_WORKSPACE_MAIN"
  | "A11Y_GENERATED_CODE_REGION"
  | "A11Y_CONSOLE_REGION"
  | "A11Y_HORIZONTAL_RESIZER"
  | "A11Y_VERTICAL_RESIZER"
  | "A11Y_COLLAPSE_CODE_PANEL"
  | "A11Y_OPEN_CODE_PANEL"
  | "A11Y_COLLAPSE_CONSOLE_PANEL"
  | "A11Y_OPEN_CONSOLE_PANEL"
  | "A11Y_TOPBAR"
  | "A11Y_PLUGIN_OPTIONS_GROUP"
  | "A11Y_EXTERNAL_LINK_SUFFIX"
  | "A11Y_SHORTCUT_SUFFIX"
  | "A11Y_SAVE_ANNOUNCED";

/**
 * Returns a localized accessibility label for layout controls.
 * @param key - Lookup key.
 * @returns Result string.
 */
export const getA11yLabel = (key: A11yLabelKey): string => {
  const lang = getSupportedLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};
