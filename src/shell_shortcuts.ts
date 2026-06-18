/**
 * @packageDocumentation
 * @module ShellShortcuts
 * @description Raccourcis clavier globaux de la coque (fichier) hors champs de saisie.
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
 * Indique si la cible est un champ de saisie texte (y compris Monaco).
 * Les raccourcis fichier ne doivent pas intercepter Ctrl+S / Ctrl+O dans ces zones.
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

/** Jeton WAI-ARIA pour la touche modificateur (Control ou Meta). */
export const getModifierKeyToken = (): "Control" | "Meta" =>
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "Meta" : "Control";

/** Libellé affiché du modificateur (Ctrl ou Cmd). */
export const getModifierKeyLabel = (): string =>
  getModifierKeyToken() === "Meta" ? "Cmd" : "Ctrl";

export interface ShellFileShortcutHandlers {
  onSave: () => void;
  onLoad: () => void;
}

/**
 * Enregistre Ctrl+S / Cmd+S (enregistrer) et Ctrl+O / Cmd+O (ouvrir),
 * sauf dans les champs de saisie texte.
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
