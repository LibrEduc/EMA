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

import { CLOSE_ID } from "./shell_shortcuts_help_dialog";
import { actionLabel, t } from "./shell_shortcuts_help_i18n";
import {
  formatSerializedKeys,
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

export type ShortcutEditState = {
  listeningFor: EditableShortcutName | null;
  status: PendingStatus | null;
};

let listeningFor: EditableShortcutName | null = null;
let captureHandler: ((event: KeyboardEvent) => void) | null = null;
let pendingStatus: PendingStatus | null = null;
let pendingFocus: FocusTarget | null = null;
const stateListeners = new Set<() => void>();

export const subscribeShortcutEditState = (listener: () => void): (() => void) => {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
};

export const getShortcutEditState = (): ShortcutEditState => ({
  listeningFor,
  status: pendingStatus,
});

const notifyStateChange = (): void => {
  stateListeners.forEach((listener) => listener());
};

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
  notifyStateChange();
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
  notifyStateChange();
};

/**
 * Update the live status region (and remember it across re-renders).
 * @param message - Status text; empty clears the region.
 * @param isError - When true, use assertive live region styling.
 */
export const setStatus = (message: string, isError = false): void => {
  pendingStatus = message ? { message, isError } : null;
  notifyStateChange();
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
  renderDialogContent: () => void,
): void => {
  stopListening();
  listeningFor = name;
  setStatus(t("SHORTCUTS_HELP_LISTENING"));
  renderDialogContent();

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
