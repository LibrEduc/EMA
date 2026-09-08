/**
 * @packageDocumentation
 * @module ShellShortcuts
 * @description Global shell keyboard shortcuts (file) outside text input fields.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const TEXT_INPUT_TYPES = new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
]);

/**
 * Whether the target is a text input field (including Monaco). File shortcuts must not intercept Ctrl+S / Ctrl+O in these areas.
 * @param target - Target element or value.
 * @returns True when the condition holds.
 */
export const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  if (target.closest(".monaco-editor")) {
    return true;
  }
  if (target instanceof HTMLTextAreaElement) {
    return true;
  }
  if (target instanceof HTMLSelectElement) {
    return true;
  }
  if (target instanceof HTMLInputElement) {
    const type = (target.type || "text").toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
  }
  return false;
};

/**
 * Jeton WAI-ARIA pour la touche modificateur (Control ou Meta).
 * @returns Operation result.
 */
export const getModifierKeyToken = (): "Control" | "Meta" =>
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "Meta" : "Control";

/**
 * Libellé affiché du modificateur (Ctrl ou Cmd).
 * @returns Result string.
 */
export const getModifierKeyLabel = (): string =>
  getModifierKeyToken() === "Meta" ? "Cmd" : "Ctrl";

export interface ShellFileShortcutHandlers {
  onSave: () => void;
  onLoad: () => void;
}

/**
 * Enregistre Ctrl+S / Cmd+S (enregistrer) et Ctrl+O / Cmd+O (ouvrir), sauf dans les champs de saisie texte.
 * @param handlers - The `handlers` argument.
 */
export const registerShellFileShortcuts = (
  handlers: ShellFileShortcutHandlers,
): void => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key !== "s" && key !== "o") {
      return;
    }
    if (isTextEntryTarget(event.target)) {
      return;
    }

    event.preventDefault();
    if (key === "s") {
      handlers.onSave();
    } else {
      handlers.onLoad();
    }
  });
};
