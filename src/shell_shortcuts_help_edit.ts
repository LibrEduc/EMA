/**
 * @packageDocumentation
 * @module ShellShortcutsHelp.Edit
 * @description Editable shortcut rows, key-capture listening, and focus/status state.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { CLOSE_ID, HINT_ID, STATUS_ID } from "./shell_shortcuts_help_dialog";
import { actionLabel, t } from "./shell_shortcuts_help_i18n";
import {
  EDITABLE_SHORTCUT_NAMES,
  formatSerializedKeys,
  getDefaultKeyCodes,
  getEffectiveKeyCodes,
  hasCustomShortcutBindings,
  resetAllShortcutBindings,
  resetShortcutBinding,
  serializedKeyFromEvent,
  setShortcutBinding,
  type EditableShortcutName,
} from "./shortcut_preferences";

/** Element to restore focus to after a dialog content refresh. */
export type FocusTarget =
  | { kind: "edit"; name: EditableShortcutName }
  | { kind: "reset"; name: EditableShortcutName }
  | { kind: "reset-all" }
  | { kind: "close" };

type PendingStatus = { message: string; isError: boolean };

let listeningFor: EditableShortcutName | null = null;
let captureHandler: ((event: KeyboardEvent) => void) | null = null;
let statusEl: HTMLElement | null = null;
let pendingStatus: PendingStatus | null = null;
let pendingFocus: FocusTarget | null = null;

/**
 * Whether a rebind key-capture listener is active.
 * @returns True while waiting for a new key chord.
 */
export const isListening = (): boolean => listeningFor !== null;

/**
 * Queue focus restoration for the next content render.
 * @param target - Focus target, or `null` to clear.
 */
export const setPendingFocus = (target: FocusTarget | null): void => {
  pendingFocus = target;
};

/**
 * Take and clear the pending focus target.
 * @returns The queued focus target, if any.
 */
export const takePendingFocus = (): FocusTarget | null => {
  const focus = pendingFocus;
  pendingFocus = null;
  return focus;
};

/**
 * Clear status and focus session state (e.g. when the dialog closes).
 */
export const clearEditSession = (): void => {
  pendingStatus = null;
  pendingFocus = null;
};

/**
 * Remove the document-level key-capture listener.
 */
export const stopListening = (): void => {
  if (captureHandler) {
    document.removeEventListener("keydown", captureHandler, true);
    captureHandler = null;
  }
  listeningFor = null;
};

const applyStatusToElement = (
  el: HTMLElement,
  status: PendingStatus | null,
): void => {
  if (!status || !status.message) {
    el.textContent = "";
    el.classList.remove("shortcuts-help-status--error");
    el.setAttribute("aria-live", "polite");
    return;
  }
  el.textContent = status.message;
  el.classList.toggle("shortcuts-help-status--error", status.isError);
  el.setAttribute("aria-live", status.isError ? "assertive" : "polite");
};

/**
 * Update the live status region (and remember it across re-renders).
 * @param message - Status text; empty clears the region.
 * @param isError - When true, use assertive live region styling.
 */
export const setStatus = (message: string, isError = false): void => {
  pendingStatus = message ? { message, isError } : null;
  if (statusEl) {
    applyStatusToElement(statusEl, pendingStatus);
  }
};

/**
 * Restore keyboard focus after the dialog content is rebuilt.
 * @param target - Focus target, or `null` to skip.
 */
export const restoreFocus = (target: FocusTarget | null): void => {
  if (!target) {
    return;
  }
  requestAnimationFrame(() => {
    let el: HTMLElement | null = null;
    if (target.kind === "close") {
      el = document.getElementById(CLOSE_ID);
    } else if (target.kind === "reset-all") {
      el = document.querySelector<HTMLElement>(".shortcuts-help-reset-all");
    } else if (target.kind === "edit") {
      el = document.querySelector<HTMLElement>(
        `.shortcuts-help-edit[data-shortcut-name="${target.name}"]`,
      );
    } else {
      el = document.querySelector<HTMLElement>(
        `.shortcuts-help-reset[data-shortcut-name="${target.name}"]`,
      );
      if (!el) {
        el = document.querySelector<HTMLElement>(
          `.shortcuts-help-edit[data-shortcut-name="${target.name}"]`,
        );
      }
    }
    el?.focus({ preventScroll: false });
  });
};

/**
 * Begin capturing the next key chord for `name`.
 * @param name - Editable shortcut registry name.
 * @param editBtn - Edit button that entered listening mode.
 * @param renderDialogContent - Rebuild dialog content after capture ends.
 */
export const startListening = (
  name: EditableShortcutName,
  editBtn: HTMLButtonElement,
  renderDialogContent: () => void,
): void => {
  stopListening();
  listeningFor = name;
  editBtn.textContent = t("SHORTCUTS_HELP_LISTENING");
  editBtn.classList.add("shortcuts-help-edit--listening");
  editBtn.setAttribute("aria-pressed", "true");
  editBtn.setAttribute("aria-busy", "true");
  editBtn.setAttribute(
    "aria-label",
    t("SHORTCUTS_HELP_EDIT_ARIA").replace("%1", actionLabel(name)),
  );
  setStatus(t("SHORTCUTS_HELP_LISTENING"));

  captureHandler = (event: KeyboardEvent) => {
    if (listeningFor !== name) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") {
      stopListening();
      pendingFocus = { kind: "edit", name };
      setStatus(t("SHORTCUTS_HELP_CANCELLED"));
      renderDialogContent();
      return;
    }

    const serialized = serializedKeyFromEvent(event);
    if (!serialized) {
      return;
    }

    const result = setShortcutBinding(name, [serialized]);
    stopListening();
    if (result.ok === false) {
      if (result.reason === "conflict" && result.conflicts?.length) {
        const owners = result.conflicts
          .map((c: { owners: string[] }) => c.owners.join(", "))
          .join("; ");
        pendingFocus = { kind: "edit", name };
        setStatus(
          t("SHORTCUTS_HELP_CONFLICT")
            .replace("%1", formatSerializedKeys([serialized]))
            .replace("%2", owners),
          true,
        );
      }
      renderDialogContent();
      return;
    }

    pendingFocus = { kind: "edit", name };
    setStatus(
      t("SHORTCUTS_HELP_SAVED")
        .replace("%1", actionLabel(name))
        .replace("%2", formatSerializedKeys([serialized])),
    );
    renderDialogContent();
  };

  document.addEventListener("keydown", captureHandler, true);
};

/**
 * Append the editable shortcuts table (edit / reset controls).
 * @param root - Parent element that receives the section.
 * @param renderDialogContent - Rebuild dialog content after mutations.
 */
export const addEditableSection = (
  root: HTMLElement,
  renderDialogContent: () => void,
): void => {
  const section = document.createElement("section");
  section.className = "shortcuts-help-section";
  section.setAttribute("aria-describedby", HINT_ID);

  const h3 = document.createElement("h3");
  h3.textContent = t("SHORTCUTS_HELP_SECTION_EDITABLE");
  section.appendChild(h3);

  const hint = document.createElement("p");
  hint.id = HINT_ID;
  hint.className = "shortcuts-help-hint";
  hint.textContent = t("SHORTCUTS_HELP_EDITABLE_HINT");
  section.appendChild(hint);

  statusEl = document.createElement("p");
  statusEl.id = STATUS_ID;
  statusEl.className = "shortcuts-help-status";
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-atomic", "true");
  applyStatusToElement(statusEl, pendingStatus);
  section.appendChild(statusEl);

  const table = document.createElement("table");
  table.className = "shortcuts-help-table shortcuts-help-table--editable";
  table.setAttribute("aria-describedby", HINT_ID);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const text of [
    t("SHORTCUTS_HELP_COL_ACTION"),
    t("SHORTCUTS_HELP_COL_KEYS"),
    t("SHORTCUTS_HELP_COL_EDIT"),
  ]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = text;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const name of EDITABLE_SHORTCUT_NAMES) {
    const codes = getEffectiveKeyCodes(name);
    if (!codes.length && !Blockly.ShortcutRegistry.registry.getRegistry()[name]) {
      continue;
    }
    const defaults = getDefaultKeyCodes(name);
    const isCustom =
      codes.length > 0 &&
      (defaults.length === 0 ||
        codes.length !== defaults.length ||
        codes.some((c, i) => c !== defaults[i]));

    const label = actionLabel(name);
    const tr = document.createElement("tr");
    if (isCustom) {
      tr.classList.add("shortcuts-help-row--custom");
    }

    const tdLabel = document.createElement("th");
    tdLabel.scope = "row";
    tdLabel.append(document.createTextNode(label));
    if (isCustom) {
      const badge = document.createElement("span");
      badge.className = "shortcuts-help-sr-only";
      badge.textContent = ` (${t("SHORTCUTS_HELP_CUSTOM_BADGE")})`;
      tdLabel.appendChild(badge);
    }

    const tdKeys = document.createElement("td");
    tdKeys.className = "shortcuts-help-keys";
    tdKeys.textContent = formatSerializedKeys(codes.length ? codes : defaults);

    const tdEdit = document.createElement("td");
    tdEdit.className = "shortcuts-help-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "toolbar-btn shortcuts-help-edit";
    editBtn.dataset.shortcutName = name;
    editBtn.textContent = t("SHORTCUTS_HELP_EDIT");
    editBtn.setAttribute(
      "aria-label",
      t("SHORTCUTS_HELP_EDIT_ARIA").replace("%1", label),
    );
    editBtn.setAttribute("aria-pressed", "false");
    editBtn.addEventListener("click", () => {
      startListening(name, editBtn, renderDialogContent);
    });
    tdEdit.appendChild(editBtn);

    if (isCustom) {
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "toolbar-btn shortcuts-help-reset";
      resetBtn.dataset.shortcutName = name;
      resetBtn.textContent = t("SHORTCUTS_HELP_RESET_ONE");
      resetBtn.setAttribute(
        "aria-label",
        t("SHORTCUTS_HELP_RESET_ARIA").replace("%1", label),
      );
      resetBtn.addEventListener("click", () => {
        stopListening();
        resetShortcutBinding(name);
        pendingFocus = { kind: "edit", name };
        setStatus(t("SHORTCUTS_HELP_RESET_DONE").replace("%1", label));
        renderDialogContent();
      });
      tdEdit.appendChild(resetBtn);
    }

    tr.append(tdLabel, tdKeys, tdEdit);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  section.appendChild(table);

  if (hasCustomShortcutBindings()) {
    const resetAll = document.createElement("button");
    resetAll.type = "button";
    resetAll.className = "toolbar-btn shortcuts-help-reset-all";
    resetAll.textContent = t("SHORTCUTS_HELP_RESET_ALL");
    resetAll.addEventListener("click", () => {
      stopListening();
      resetAllShortcutBindings();
      pendingFocus = { kind: "close" };
      setStatus(t("SHORTCUTS_HELP_RESET_ALL_DONE"));
      renderDialogContent();
    });
    section.appendChild(resetAll);
  }

  root.appendChild(section);
};

/**
 * Cancel an in-progress capture (Esc on the dialog) and refresh.
 * @param renderDialogContent - Rebuild dialog content after cancel.
 */
export const cancelListeningCapture = (
  renderDialogContent: () => void,
): void => {
  const name = listeningFor;
  if (!name) {
    return;
  }
  stopListening();
  pendingFocus = { kind: "edit", name };
  setStatus(t("SHORTCUTS_HELP_CANCELLED"));
  renderDialogContent();
};
