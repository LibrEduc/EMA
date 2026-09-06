/**
 * @packageDocumentation
 * @module ShellKeyboardTutorial
 * @description Interactive keyboard tutorial (shell + Blockly 13).
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

import { languagesMap, type LanguageItem } from "./languages/languageMap";
import {
  dismissKeyboardTutorial,
  isKeyboardTutorialDismissed,
} from "./blockly_a11y_extensions";
import { getModifierKeyLabel } from "./shell_shortcuts";

type TutorialKey = keyof Pick<
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

const DIALOG_ID = "keyboard-tutorial-dialog";
const TITLE_ID = "keyboard-tutorial-title";
const BODY_ID = "keyboard-tutorial-body";
const PROGRESS_ID = "keyboard-tutorial-progress";
const BUTTON_ID = "keyboardTutorialButton";

let currentStep = 0;

const getLang = (): "fr" | "en" | "es" | "ar" => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (menu?.value || new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return "en";
};

const t = (key: TutorialKey): string => {
  const lang = getLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};

const stepCount = 5;

const getStepContent = (index: number): { title: string; body: string } => {
  const mod = getModifierKeyLabel();
  const titles: TutorialKey[] = [
    "KEYBOARD_TUTORIAL_STEP_1_TITLE",
    "KEYBOARD_TUTORIAL_STEP_2_TITLE",
    "KEYBOARD_TUTORIAL_STEP_3_TITLE",
    "KEYBOARD_TUTORIAL_STEP_4_TITLE",
    "KEYBOARD_TUTORIAL_STEP_5_TITLE",
  ];
  const bodies: TutorialKey[] = [
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

const ensureDialog = (): HTMLDialogElement => {
  let dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "keyboard-tutorial-dialog shortcuts-help-dialog";
  dialog.setAttribute("aria-labelledby", TITLE_ID);

  const title = document.createElement("h2");
  title.id = TITLE_ID;
  title.className = "shortcuts-help-dialog__title";

  const progress = document.createElement("p");
  progress.id = PROGRESS_ID;
  progress.className = "keyboard-tutorial-dialog__progress";

  const body = document.createElement("div");
  body.id = BODY_ID;
  body.className = "keyboard-tutorial-dialog__body shortcuts-help-dialog__content";

  const nav = document.createElement("div");
  nav.className = "keyboard-tutorial-dialog__nav";

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.id = "keyboard-tutorial-prev";
  prevButton.className = "toolbar-btn";
  prevButton.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.id = "keyboard-tutorial-next";
  nextButton.className = "toolbar-btn";
  nextButton.addEventListener("click", () => {
    if (currentStep < stepCount - 1) {
      currentStep += 1;
      renderStep();
      return;
    }
    dialog?.close();
  });

  const skipButton = document.createElement("button");
  skipButton.type = "button";
  skipButton.id = "keyboard-tutorial-skip";
  skipButton.className = "toolbar-btn";
  skipButton.addEventListener("click", () => dialog?.close());

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.id = "keyboard-tutorial-dismiss";
  dismissButton.className = "keyboard-tutorial-dialog__dismiss";
  dismissButton.addEventListener("click", () => {
    dismissKeyboardTutorial();
    dialog?.close();
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = "keyboard-tutorial-close";
  closeButton.className = "shortcuts-help-dialog__close toolbar-btn";
  closeButton.addEventListener("click", () => dialog?.close());

  nav.append(prevButton, nextButton, skipButton);
  dialog.append(title, progress, body, nav, dismissButton, closeButton);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  document.body.appendChild(dialog);
  return dialog;
};

const renderStep = (): void => {
  const title = document.getElementById(TITLE_ID);
  const body = document.getElementById(BODY_ID);
  const progress = document.getElementById(PROGRESS_ID);
  const prevButton = document.getElementById("keyboard-tutorial-prev") as HTMLButtonElement | null;
  const nextButton = document.getElementById("keyboard-tutorial-next") as HTMLButtonElement | null;
  const skipButton = document.getElementById("keyboard-tutorial-skip") as HTMLButtonElement | null;
  const dismissButton = document.getElementById("keyboard-tutorial-dismiss") as HTMLButtonElement | null;
  const closeButton = document.getElementById("keyboard-tutorial-close") as HTMLButtonElement | null;

  if (!title || !body || !progress) {
    return;
  }

  const { title: stepTitle, body: stepBody } = getStepContent(currentStep);
  title.textContent = t("KEYBOARD_TUTORIAL_TITLE");
  progress.textContent = `${currentStep + 1} / ${stepCount} — ${stepTitle}`;
  body.textContent = stepBody;

  if (prevButton) {
    prevButton.textContent = t("KEYBOARD_TUTORIAL_PREV");
    prevButton.disabled = currentStep === 0;
  }
  if (nextButton) {
    nextButton.textContent =
      currentStep === stepCount - 1 ? t("KEYBOARD_TUTORIAL_CLOSE") : t("KEYBOARD_TUTORIAL_NEXT");
  }
  if (skipButton) {
    skipButton.textContent = t("KEYBOARD_TUTORIAL_SKIP");
  }
  if (dismissButton) {
    dismissButton.textContent = t("KEYBOARD_TUTORIAL_DONT_SHOW");
  }
  if (closeButton) {
    closeButton.textContent = t("KEYBOARD_TUTORIAL_CLOSE");
    closeButton.setAttribute("aria-label", t("KEYBOARD_TUTORIAL_CLOSE"));
  }
};

/**
 * Ouvre le tutoriel clavier à l'étape demandée (0 par défaut).
 * @param step - `step` value.
 */
export const openKeyboardTutorial = (step = 0): void => {
  const dialog = ensureDialog();
  currentStep = Math.max(0, Math.min(step, stepCount - 1));
  renderStep();
  if (!dialog.open) {
    dialog.showModal();
  }
};

const refreshTutorialButton = (): void => {
  const button = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (!button) {
    return;
  }
  const label = t("KEYBOARD_TUTORIAL_BUTTON");
  const tooltip = t("KEYBOARD_TUTORIAL_TOOLTIP");
  button.textContent = label;
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
  ensureDialog();
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
  const dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog?.open) {
    renderStep();
  }
};
