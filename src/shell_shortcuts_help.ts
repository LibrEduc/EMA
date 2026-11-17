/**
 * @packageDocumentation
 * @module ShellShortcutsHelp
 * @description Help / customize keyboard shortcuts modal (shell + Blockly 13).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { isTextEntryTarget } from "./shell_shortcuts";
import {
  BUTTON_ID,
  CLOSE_ID,
  DIALOG_ID,
} from "./shell_shortcuts_help_dialog";
import {
  clearEditSession,
  isListening,
  setPendingFocus,
  stopListening,
} from "./shell_shortcuts_help_edit";
import { t } from "./shell_shortcuts_help_i18n";
import {
  applyShortcutPreferences,
  type EditableShortcutName,
} from "./shortcut_preferences";

export const SHORTCUTS_HELP_OPEN_EVENT = "ucb:shortcuts-help-open";
export const SHORTCUTS_HELP_REFRESH_EVENT = "ucb:shortcuts-help-refresh";

const requestRefresh = (): void => {
  window.dispatchEvent(new Event(SHORTCUTS_HELP_REFRESH_EVENT));
};

/**
 * Opens the shortcuts help dialog.
 */
export const openShortcutsHelp = (): void => {
  applyShortcutPreferences();
  window.dispatchEvent(new Event(SHORTCUTS_HELP_OPEN_EVENT));
};

/**
 * Refresh toolbar button labels and open-dialog content after a language change.
 */
export const refreshShortcutsHelp = (): void => {
  const button = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (button) {
    const label = t("SHORTCUTS_HELP_BUTTON");
    const tooltip = t("SHORTCUTS_HELP_TOOLTIP");
    // Boutons icône (ex. BlocklyDuino) : ne pas écraser <i>/<svg> avec textContent.
    const isIconButton =
      button.classList.contains("iconButtons") ||
      (!!button.querySelector("i, svg, img") && !button.classList.contains("lang"));
    if (!isIconButton) {
      button.textContent = label;
    }
    button.setAttribute("aria-label", tooltip);
    button.setAttribute("title", tooltip);
    button.setAttribute("aria-keyshortcuts", "F1 ?");
  }

  const dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog?.open) {
    const active = document.activeElement as HTMLElement | null;
    const name = active?.dataset?.shortcutName as EditableShortcutName | undefined;
    if (active?.classList.contains("shortcuts-help-edit") && name) {
      setPendingFocus({ kind: "edit", name });
    } else if (active?.classList.contains("shortcuts-help-reset") && name) {
      setPendingFocus({ kind: "reset", name });
    } else if (active?.classList.contains("shortcuts-help-reset-all")) {
      setPendingFocus({ kind: "reset-all" });
    } else if (active?.id === CLOSE_ID) {
      setPendingFocus({ kind: "close" });
    }
    requestRefresh();
  }
};

/**
 * Register the toolbar button, dialog, and F1 / ? open shortcuts.
 */
export const registerShortcutsHelp = (): void => {
  applyShortcutPreferences();

  const button = document.getElementById(BUTTON_ID);
  button?.addEventListener("click", () => openShortcutsHelp());

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isTextEntryTarget(event.target)) {
      return;
    }
    if (isListening()) {
      return;
    }
    if (event.key === "F1") {
      event.preventDefault();
      openShortcutsHelp();
      return;
    }
    if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openShortcutsHelp();
    }
  });

  refreshShortcutsHelp();
};

export const closeShortcutsHelp = (): void => {
  stopListening();
  clearEditSession();
};
