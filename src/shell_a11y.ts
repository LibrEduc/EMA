/**
 * @packageDocumentation
 * @module ShellA11y
 * @description HTML shell accessibility (skip link, area menu, ARIA landmarks).
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

import { focusBlocklyToolbox, focusBlocklyWorkspace } from "./blockly_shell_focus";
import { getA11yLabel } from "./a11y_labels";
import { languagesMap, type LanguageItem } from "./languages/languageMap";
import { getModifierKeyLabel, getModifierKeyToken } from "./shell_shortcuts";

const AREA_MENU_TIMEOUT_MS = 5000;

let areaMenuAwaitingChoice = false;
let areaMenuTimeoutId: number | null = null;

const clearAreaMenuTimeout = (): void => {
  if (areaMenuTimeoutId !== null) {
    window.clearTimeout(areaMenuTimeoutId);
    areaMenuTimeoutId = null;
  }
};

const getShortcutsEl = (): HTMLElement | null =>
  document.getElementById("shortcuts");

const getAnnouncerEl = (): HTMLElement | null =>
  document.getElementById("a11y-announcer");

const getShellMessages = (): LanguageItem => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const lang = (menu?.value || new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  if (lang === "fr" || lang === "es" || lang === "ar") {
    return languagesMap[lang];
  }
  return languagesMap.en;
};

const appendShortcutToLabel = (label: string, shortcut: string): string => {
  const suffix = getA11yLabel("A11Y_SHORTCUT_SUFFIX").replace("%1", shortcut);
  return `${label} ${suffix}`;
};

const showAreaMenuMessage = (message: string): void => {
  const el = getShortcutsEl();
  if (!el) {
    return;
  }
  el.hidden = false;
  el.textContent = message;
};

const hideAreaMenuMessage = (): void => {
  const el = getShortcutsEl();
  if (!el) {
    return;
  }
  el.hidden = true;
  el.textContent = "";
};

const focusFirstIn = (root: ParentNode | null): boolean => {
  if (!root) {
    return false;
  }
  const focusable = root.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusable) {
    focusable.focus({ preventScroll: true });
    return true;
  }
  if (root instanceof HTMLElement) {
    if (!root.hasAttribute("tabindex")) {
      root.setAttribute("tabindex", "-1");
    }
    root.focus({ preventScroll: true });
    return true;
  }
  return false;
};

const focusArea = (index: number): void => {
  switch (index) {
    case 1:
      focusFirstIn(document.getElementById("app_topbar"));
      break;
    case 2:
      if (!focusBlocklyToolbox()) {
        focusFirstIn(document.getElementById("blockly-workspace-main"));
      }
      break;
    case 3:
      if (!focusBlocklyWorkspace()) {
        focusFirstIn(document.getElementById("blockly-workspace-main"));
      }
      break;
    case 4:
      focusFirstIn(document.getElementById("div_content_code"));
      break;
    case 5:
      focusFirstIn(document.getElementById("content_console"));
      break;
    default:
      break;
  }
};

const openAreaMenu = (): void => {
  areaMenuAwaitingChoice = true;
  clearAreaMenuTimeout();
  showAreaMenuMessage(getA11yLabel("A11Y_AREA_MENU_HINT"));
  areaMenuTimeoutId = window.setTimeout(() => {
    areaMenuAwaitingChoice = false;
    hideAreaMenuMessage();
    areaMenuTimeoutId = null;
  }, AREA_MENU_TIMEOUT_MS);
};

const onAreaMenuKeyDown = (event: KeyboardEvent): void => {
  const isMod = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (isMod && key === "b") {
    event.preventDefault();
    openAreaMenu();
    return;
  }

  if (!areaMenuAwaitingChoice) {
    return;
  }

  const areaIndex = Number(event.key);
  if (areaIndex >= 1 && areaIndex <= 5) {
    event.preventDefault();
    areaMenuAwaitingChoice = false;
    clearAreaMenuTimeout();
    hideAreaMenuMessage();
    focusArea(areaIndex);
  } else if (key === "escape") {
    event.preventDefault();
    areaMenuAwaitingChoice = false;
    clearAreaMenuTimeout();
    hideAreaMenuMessage();
  }
};

const initSkipLink = (): void => {
  const skipLink = document.getElementById("skip-to-workspace");
  const main = document.getElementById("blockly-workspace-main");
  if (!skipLink || !main) {
    return;
  }
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (!focusBlocklyWorkspace()) {
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: "start" });
    }
  });
};

/**
 * Applique les repères ARIA et tabindex sur la coque (hors workspace Blockly).
 */
export const applyShellLandmarks = (): void => {
  const topbar = document.getElementById("app_topbar");
  if (topbar) {
    topbar.setAttribute("role", "banner");
  }

  const main = document.getElementById("blockly-workspace-main");
  if (main) {
    main.setAttribute("aria-label", getA11yLabel("A11Y_WORKSPACE_MAIN"));
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
  }

  const shortcuts = getShortcutsEl();
  if (shortcuts) {
    shortcuts.setAttribute("role", "status");
    shortcuts.setAttribute("aria-live", "polite");
    shortcuts.setAttribute("aria-atomic", "true");
  }

  const logo = document.querySelector<HTMLImageElement>(".app-title__logo");
  if (logo) {
    logo.setAttribute("aria-hidden", "true");
  }

  const announcer = getAnnouncerEl();
  if (announcer) {
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
  }
};

/**
 * Met à jour `lang`, `xml:lang` et `dir` sur `<html>` lors d'un changement de langue.
 */
export const applyDocumentLanguage = (lang: string, rtl: boolean): void => {
  const html = document.documentElement;
  html.lang = lang;
  html.setAttribute("xml:lang", lang);
  html.dir = rtl ? "rtl" : "ltr";
  // Keep Blockly | code panel order physically stable; only Blockly workspace uses RTL.
  document.getElementById("flex_container_up")?.setAttribute("dir", "ltr");
};

/**
 * Annonce un message bref aux lecteurs d'écran (région live dédiée).
 */
export const announceShellMessage = (message: string, timeoutMs = 3000): void => {
  const el = getAnnouncerEl();
  if (!el) {
    return;
  }
  el.hidden = false;
  el.textContent = message;
  window.setTimeout(() => {
    el.hidden = true;
    el.textContent = "";
  }, timeoutMs);
};

/**
 * Applique aria-label, aria-keyshortcuts et infobulles sur la barre d'outils.
 */
export const applyToolbarA11y = (): void => {
  const messages = getShellMessages();
  const modLabel = getModifierKeyLabel();
  const modToken = getModifierKeyToken();

  const toolbarButtons: Array<{
    id: string;
    tooltipKey: keyof LanguageItem;
    shortcutKey?: string;
  }> = [
    { id: "saveButton", tooltipKey: "SAVE_TOOLTIP", shortcutKey: "S" },
    { id: "loadButton", tooltipKey: "LOAD_TOOLTIP", shortcutKey: "O" },
    { id: "undoButton", tooltipKey: "UNDO_TOOLTIP" },
    { id: "redoButton", tooltipKey: "REDO_TOOLTIP" },
    { id: "shortcutsHelpButton", tooltipKey: "SHORTCUTS_HELP_TOOLTIP" },
    { id: "keyboardTutorialButton", tooltipKey: "KEYBOARD_TUTORIAL_TOOLTIP" },
  ];

  toolbarButtons.forEach(({ id, tooltipKey, shortcutKey }) => {
    const button = document.getElementById(id) as HTMLButtonElement | null;
    if (!button) {
      return;
    }
    let label = messages[tooltipKey] ?? String(tooltipKey);
    if (shortcutKey) {
      const displayShortcut = `${modLabel}+${shortcutKey}`;
      label = appendShortcutToLabel(label, displayShortcut);
      button.setAttribute("aria-keyshortcuts", `${modToken}+${shortcutKey}`);
    } else if (id === "shortcutsHelpButton") {
      button.setAttribute("aria-keyshortcuts", "F1 ?");
    }
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  });

  const selects: Array<{ id: string; tooltipKey: keyof LanguageItem }> = [
    { id: "languageMenu", tooltipKey: "LANGUAGE_MENU_TOOLTIP" },
    { id: "themeMenu", tooltipKey: "THEME_MENU_TOOLTIP" },
    { id: "rendererMenu", tooltipKey: "RENDERER_MENU_TOOLTIP" },
    { id: "boardMenu", tooltipKey: "BOARD_MENU_TOOLTIP" },
  ];

  selects.forEach(({ id, tooltipKey }) => {
    const select = document.getElementById(id) as HTMLSelectElement | null;
    if (!select) {
      return;
    }
    const label = messages[tooltipKey] ?? String(tooltipKey);
    select.setAttribute("aria-label", label);
    select.setAttribute("title", label);
  });

  const pluginOptions = document.getElementById("pluginOptions");
  if (pluginOptions) {
    pluginOptions.setAttribute("role", "group");
    pluginOptions.setAttribute("aria-label", getA11yLabel("A11Y_PLUGIN_OPTIONS_GROUP"));
  }

  const topbar = document.getElementById("app_topbar");
  if (topbar) {
    topbar.setAttribute("aria-label", getA11yLabel("A11Y_TOPBAR"));
  }

  const externalSuffix = getA11yLabel("A11Y_EXTERNAL_LINK_SUFFIX");
  document.querySelectorAll("#app_topbar a[target='_blank']").forEach((link) => {
    const anchor = link as HTMLAnchorElement;
    const text = anchor.textContent?.trim() ?? "";
    anchor.setAttribute("aria-label", `${text} ${externalSuffix}`);
    anchor.setAttribute("rel", "noopener noreferrer");
  });

  const loadInput = document.getElementById("loadFileInput");
  if (loadInput) {
    loadInput.setAttribute("aria-hidden", "true");
    loadInput.setAttribute("tabindex", "-1");
  }
};

/**
 * Enregistre le lien d'évitement et le menu de zones (Ctrl+B / Cmd+B puis 1–5).
 */
export const registerShellAreaNavigation = (): void => {
  initSkipLink();
  document.addEventListener("keydown", onAreaMenuKeyDown);
};
