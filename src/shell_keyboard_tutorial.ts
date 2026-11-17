/**
 * @packageDocumentation
 * @module ShellKeyboardTutorial
 * @description Interactive keyboard tutorial (shell + Blockly 13).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { languagesMap, type LanguageItem } from "./languages/languageMap";
import {
  isKeyboardTutorialDismissed,
} from "./blockly_a11y_extensions";
import { getModifierKeyLabel } from "./shell_shortcuts";

export type KeyboardTutorialKey = keyof Pick<
  LanguageItem,
  | "KEYBOARD_TUTORIAL_BUTTON"
  | "KEYBOARD_TUTORIAL_TOOLTIP"
  | "KEYBOARD_TUTORIAL_TITLE"
  | "KEYBOARD_TUTORIAL_CLOSE"
  | "KEYBOARD_TUTORIAL_SKIP"
  | "KEYBOARD_TUTORIAL_PREV"
  | "KEYBOARD_TUTORIAL_NEXT"
  | "KEYBOARD_TUTORIAL_DONT_SHOW"
  | "KEYBOARD_TUTORIAL_STEP_1_TITLE"
  | "KEYBOARD_TUTORIAL_STEP_1_BODY"
  | "KEYBOARD_TUTORIAL_STEP_2_TITLE"
  | "KEYBOARD_TUTORIAL_STEP_2_BODY"
  | "KEYBOARD_TUTORIAL_STEP_3_TITLE"
  | "KEYBOARD_TUTORIAL_STEP_3_BODY"
  | "KEYBOARD_TUTORIAL_STEP_4_TITLE"
  | "KEYBOARD_TUTORIAL_STEP_4_BODY"
  | "KEYBOARD_TUTORIAL_STEP_5_TITLE"
  | "KEYBOARD_TUTORIAL_STEP_5_BODY"
>;

const BUTTON_ID = "keyboardTutorialButton";
export const KEYBOARD_TUTORIAL_OPEN_EVENT = "ucb:keyboard-tutorial-open";
export const KEYBOARD_TUTORIAL_REFRESH_EVENT = "ucb:keyboard-tutorial-refresh";

const getLang = (): "fr" | "en" | "es" | "ar" => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (menu?.value || new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return "en";
};

const t = (key: KeyboardTutorialKey): string => {
  const lang = getLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};

const stepCount = 5;

export const getKeyboardTutorialContent = (index: number): { title: string; body: string } => {
  const mod = getModifierKeyLabel();
  const titles: KeyboardTutorialKey[] = [
    "KEYBOARD_TUTORIAL_STEP_1_TITLE",
    "KEYBOARD_TUTORIAL_STEP_2_TITLE",
    "KEYBOARD_TUTORIAL_STEP_3_TITLE",
    "KEYBOARD_TUTORIAL_STEP_4_TITLE",
    "KEYBOARD_TUTORIAL_STEP_5_TITLE",
  ];
  const bodies: KeyboardTutorialKey[] = [
    "KEYBOARD_TUTORIAL_STEP_1_BODY",
    "KEYBOARD_TUTORIAL_STEP_2_BODY",
    "KEYBOARD_TUTORIAL_STEP_3_BODY",
    "KEYBOARD_TUTORIAL_STEP_4_BODY",
    "KEYBOARD_TUTORIAL_STEP_5_BODY",
  ];
  let body = t(bodies[index] ?? bodies[0]);
  body = body.split("%MOD%").join(mod);
  return {
    title: t(titles[index] ?? titles[0]),
    body,
  };
};

export const getKeyboardTutorialText = (key: KeyboardTutorialKey): string => t(key);

/**
 * Ouvre le tutoriel clavier à l'étape demandée (0 par défaut).
 * @param step - The `step` argument.
 */
export const openKeyboardTutorial = (step = 0): void => {
  const initialStep = Math.max(0, Math.min(step, stepCount - 1));
  window.dispatchEvent(new CustomEvent(KEYBOARD_TUTORIAL_OPEN_EVENT, { detail: { step: initialStep } }));
};

const refreshTutorialButton = (): void => {
  const button = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (!button) {
    return;
  }
  const label = t("KEYBOARD_TUTORIAL_BUTTON");
  const tooltip = t("KEYBOARD_TUTORIAL_TOOLTIP");
  if (!button.querySelector(".lang")) {
    button.textContent = label;
  }
  button.setAttribute("aria-label", tooltip);
  button.setAttribute("title", tooltip);
};

const scheduleAutoTutorial = (): void => {
  if (isKeyboardTutorialDismissed()) {
    return;
  }
  window.setTimeout(() => {
    if (!isKeyboardTutorialDismissed()) {
      openKeyboardTutorial(0);
    }
  }, 1200);
};

/**
 * Enregistre le bouton barre d'outils et le tutoriel automatique au premier chargement.
 * @param options - autoOpen: if false, do not open the tutorial on startup (embedded hosts).
 */
export const registerKeyboardTutorial = (options?: {
  autoOpen?: boolean;
}): void => {
  const button = document.getElementById(BUTTON_ID);
  button?.addEventListener("click", () => openKeyboardTutorial(0));
  refreshTutorialButton();
  if (options?.autoOpen !== false) {
    scheduleAutoTutorial();
  }
};

/**
 * Met à jour les libellés du bouton (et du contenu si la modale est ouverte).
 */
export const refreshKeyboardTutorial = (): void => {
  refreshTutorialButton();
  window.dispatchEvent(new Event(KEYBOARD_TUTORIAL_REFRESH_EVENT));
};
