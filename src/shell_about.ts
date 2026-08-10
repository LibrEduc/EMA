/**
 * @packageDocumentation
 * @module ShellAbout
 * @description Modale « à propos » avec attribution Blockly.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
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

import { getLangParamFromUrl } from "./language";
import { languagesMap, type LanguageItem } from "./languages/languageMap";

const DIALOG_ID = "ucb-about-dialog";
const BUTTON_ID = "aboutButton";
const PROJECT_URL = "https://github.com/A-S-T-U-C-E/ucBlockly";
const BLOCKLY_HOME = "https://www.blockly.com";
const BLOCKLY_ATTR_DOCS =
  "https://docs.blockly.com/guides/get-started/what-is-blockly/";

function t(key: keyof LanguageItem): string {
  const lang = getLangParamFromUrl() || "en";
  const map = languagesMap[lang] ?? languagesMap.en;
  return map[key] ?? languagesMap.en[key] ?? key;
}

function ensureDialog(): HTMLDialogElement {
  let dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "ucb-about-dialog";
  dialog.innerHTML = `
    <div class="ucb-about-dialog__intro">
      <img
        class="ucb-about-dialog__logo"
        src="assets/favicon-32x32.png?v=2"
        alt="µcBlockly"
        width="32"
        height="32"
        decoding="async"
      />
      <div>
        <h2 class="ucb-about-dialog__title" data-i18n="ABOUT"></h2>
        <p class="ucb-about-dialog__text" data-i18n="ABOUT_TEXT"></p>
      </div>
    </div>
    <p class="ucb-about-dialog__links">
      <a class="ucb-about-dialog__project" href="${PROJECT_URL}" target="_blank" rel="noopener noreferrer" data-i18n="ABOUT_PROJECT"></a>
    </p>
    <div class="ucb-about-dialog__blockly">
      <p data-i18n="ABOUT_BLOCKLY"></p>
      <a href="${BLOCKLY_HOME}" target="_blank" rel="noopener noreferrer">
        <img
          src="assets/built-with-blockly-badge-black.svg"
          alt="Built with Blockly"
          height="32"
          width="146"
        />
      </a>
      <p class="ucb-about-dialog__docs">
        <a href="${BLOCKLY_ATTR_DOCS}" target="_blank" rel="noopener noreferrer" data-i18n="ABOUT_BLOCKLY_DOCS"></a>
      </p>
    </div>
    <form method="dialog" class="ucb-about-dialog__actions">
      <button type="submit" class="toolbar-btn" data-i18n="ABOUT_CLOSE"></button>
    </form>
  `;

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  document.body.appendChild(dialog);
  return dialog;
}

function refreshDialogLabels(dialog: HTMLDialogElement): void {
  dialog.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n as keyof LanguageItem | undefined;
    if (key) {
      el.textContent = t(key);
    }
  });
  const badge = dialog.querySelector<HTMLImageElement>(
    ".ucb-about-dialog__blockly img",
  );
  if (badge) {
    badge.alt = t("ABOUT_BLOCKLY_BADGE_ALT");
  }
  const logo = dialog.querySelector<HTMLImageElement>(".ucb-about-dialog__logo");
  if (logo) {
    logo.alt = t("HOME");
  }
}

/** Ouvre la modale à propos. */
export function openAboutDialog(): void {
  const dialog = ensureDialog();
  refreshDialogLabels(dialog);
  if (!dialog.open) {
    dialog.showModal();
  }
}

/** Met à jour les libellés si la modale est ouverte (changement de langue). */
export function refreshAboutDialog(): void {
  const dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog?.open) {
    refreshDialogLabels(dialog);
  }
  const button = document.getElementById(BUTTON_ID);
  if (button) {
    button.setAttribute("aria-label", t("ABOUT_TOOLTIP"));
    button.setAttribute("title", t("ABOUT_TOOLTIP"));
  }
}

/** Enregistre le bouton « à propos » et la modale. */
export function registerAboutDialog(): void {
  ensureDialog();
  const button = document.getElementById(BUTTON_ID);
  button?.addEventListener("click", () => openAboutDialog());
  refreshAboutDialog();
}
