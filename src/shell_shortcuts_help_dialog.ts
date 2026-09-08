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
 * SPDX-License-Identifier: GPL-3.0-or-later
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
 * Lifecycle hooks so dialog chrome stays free of edit-module imports.
 */
export type ShortcutsHelpDialogHooks = {
  /** Stop key-capture listening when the dialog closes or backdrop is clicked. */
  stopListening: () => void;
  /** Whether a rebind capture is active (Esc should not dismiss the dialog). */
  isListening: () => boolean;
  /** Esc during capture: cancel rebind and refresh without closing. */
  onCancelListening: () => void;
  /** Clear pending UI session state after the dialog closes. */
  onDialogClosed: () => void;
};

/**
 * Create the shortcuts help `<dialog>` once and return it.
 * @param hooks - Close / cancel wiring supplied by the façade.
 * @returns The dialog element attached to `document.body`.
 */
export const ensureDialog = (
  hooks: ShortcutsHelpDialogHooks,
): HTMLDialogElement => {
  let dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "shortcuts-help-dialog";
  dialog.setAttribute("aria-labelledby", TITLE_ID);

  const title = document.createElement("h2");
  title.id = TITLE_ID;
  title.className = "shortcuts-help-dialog__title";
  title.tabIndex = -1;

  const content = document.createElement("div");
  content.id = CONTENT_ID;
  content.className = "shortcuts-help-dialog__content";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = CLOSE_ID;
  closeButton.className = "shortcuts-help-dialog__close toolbar-btn";
  closeButton.addEventListener("click", () => {
    hooks.stopListening();
    dialog?.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      hooks.stopListening();
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    hooks.stopListening();
    hooks.onDialogClosed();
    document.getElementById(BUTTON_ID)?.classList.remove("is-active");
  });

  dialog.addEventListener("cancel", (event) => {
    if (!hooks.isListening()) {
      return;
    }
    // Esc pendant la capture : annuler le rebind sans fermer la modale.
    event.preventDefault();
    hooks.onCancelListening();
  });

  dialog.append(title, content, closeButton);
  document.body.appendChild(dialog);
  return dialog;
};

/**
 * Append a readonly label/keys table section.
 * @param root - Parent element that receives the section.
 * @param heading - Section heading text.
 * @param rows - Label/key pairs to render.
 * @param colAction - Action column header.
 * @param colKeys - Keys column header.
 */
export const addReadonlySection = (
  root: HTMLElement,
  heading: string,
  rows: Array<{ label: string; keys: string }>,
  colAction: string,
  colKeys: string,
): void => {
  const section = document.createElement("section");
  section.className = "shortcuts-help-section";

  const h3 = document.createElement("h3");
  h3.textContent = heading;
  section.appendChild(h3);

  const table = document.createElement("table");
  table.className = "shortcuts-help-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const thAction = document.createElement("th");
  thAction.scope = "col";
  thAction.textContent = colAction;
  const thKeys = document.createElement("th");
  thKeys.scope = "col";
  thKeys.textContent = colKeys;
  headRow.append(thAction, thKeys);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(({ label, keys }) => {
    const tr = document.createElement("tr");
    const tdLabel = document.createElement("th");
    tdLabel.scope = "row";
    tdLabel.textContent = label;
    const tdKeys = document.createElement("td");
    tdKeys.textContent = keys;
    tr.append(tdLabel, tdKeys);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  section.appendChild(table);
  root.appendChild(section);
};

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
