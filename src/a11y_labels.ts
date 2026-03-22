/**
 * @packageDocumentation
 * @module A11yLabels
 * @description Accessibility labels for layout UI (language-aware).
 * @license GPL-3.0-or-later
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
  | "A11Y_GENERATED_CODE_REGION"
  | "A11Y_CONSOLE_REGION"
  | "A11Y_HORIZONTAL_RESIZER"
  | "A11Y_VERTICAL_RESIZER"
  | "A11Y_COLLAPSE_CODE_PANEL"
  | "A11Y_OPEN_CODE_PANEL"
  | "A11Y_COLLAPSE_CONSOLE_PANEL"
  | "A11Y_OPEN_CONSOLE_PANEL";

/**
 * Returns a localized accessibility label for layout controls.
 */
export const getA11yLabel = (key: A11yLabelKey): string => {
  const lang = getSupportedLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};
