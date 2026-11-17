/**
 * @packageDocumentation
 * @module ShellShortcutsHelp.Dialog
 * @description Dialog chrome and readonly sections for the shortcuts help modal.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { blocklyMsg, mod, t } from "./shell_shortcuts_help_i18n";

/** Root `<dialog>` element id. */
export const DIALOG_ID = "shortcuts-help-dialog";
/** Scrollable content container id. */
export const CONTENT_ID = "shortcuts-help-content";
/** Dialog title heading id. */
export const TITLE_ID = "shortcuts-help-title";
/** Close button id. */
export const CLOSE_ID = "shortcuts-help-close";
/** Toolbar button that opens the dialog. */
export const BUTTON_ID = "shortcutsHelpButton";
/** Editable-section hint paragraph id. */
export const HINT_ID = "shortcuts-help-editable-hint";
/** Live status region id inside the editable section. */
export const STATUS_ID = "shortcuts-help-status";

/**
 * Readonly rows for shell-level shortcuts.
 * @returns Label/key pairs for the shell section.
 */
export const shellRows = (): Array<{ label: string; keys: string }> => {
  const m = mod();
  return [
    { label: t("SHORTCUTS_HELP_SHELL_SKIP"), keys: "Tab" },
    { label: t("SHORTCUTS_HELP_SHELL_AREAS"), keys: `${m}+B` },
    { label: t("SHORTCUTS_HELP_SHELL_ZONES"), keys: "1 – 5" },
    { label: t("SHORTCUTS_HELP_SHELL_SAVE"), keys: `${m}+S` },
    { label: t("SHORTCUTS_HELP_SHELL_OPEN"), keys: `${m}+O` },
    { label: blocklyMsg("SHORTCUTS_ESCAPE"), keys: "Esc" },
  ];
};

/**
 * Readonly rows for code-navigation hints.
 * @returns Label/key pairs for the navigation section.
 */
export const navigationHintRows = (): Array<{ label: string; keys: string }> => [
  { label: t("SHORTCUTS_HELP_NAV_ARROWS"), keys: "↑ ↓ ← →" },
  {
    label: blocklyMsg("SHORTCUTS_PERFORM_ACTION"),
    keys: t("SHORTCUTS_HELP_KEYS_CONFIRM"),
  },
];
