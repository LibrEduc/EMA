/**
 * @packageDocumentation
 * @module ShellShortcutsHelp
 * @description Modale d'aide des raccourcis clavier (coque + Blockly 13).
 */

import * as Blockly from "blockly";
import { languagesMap, type LanguageItem } from "./languages/languageMap";
import { getModifierKeyLabel, isTextEntryTarget } from "./shell_shortcuts";

type ShortcutsHelpKey = keyof Pick<
  LanguageItem,
  | "SHORTCUTS_HELP_BUTTON"
  | "SHORTCUTS_HELP_TOOLTIP"
  | "SHORTCUTS_HELP_TITLE"
  | "SHORTCUTS_HELP_CLOSE"
  | "SHORTCUTS_HELP_SECTION_SHELL"
  | "SHORTCUTS_HELP_SECTION_SCREENREADER"
  | "SHORTCUTS_HELP_SECTION_NAV_ADVANCED"
  | "SHORTCUTS_HELP_COL_ACTION"
  | "SHORTCUTS_HELP_COL_KEYS"
  | "SHORTCUTS_HELP_SHELL_SKIP"
  | "SHORTCUTS_HELP_SHELL_AREAS"
  | "SHORTCUTS_HELP_SHELL_ZONES"
  | "SHORTCUTS_HELP_SHELL_SAVE"
  | "SHORTCUTS_HELP_SHELL_OPEN"
  | "SHORTCUTS_HELP_NAV_ARROWS"
  | "SHORTCUTS_HELP_EDIT_COPY"
  | "SHORTCUTS_HELP_EDIT_CUT"
  | "SHORTCUTS_HELP_EDIT_PASTE"
  | "SHORTCUTS_HELP_KEYS_DELETE"
  | "SHORTCUTS_HELP_KEYS_CONFIRM"
>;

const DIALOG_ID = "shortcuts-help-dialog";
const CONTENT_ID = "shortcuts-help-content";
const TITLE_ID = "shortcuts-help-title";
const CLOSE_ID = "shortcuts-help-close";
const BUTTON_ID = "shortcutsHelpButton";

const getLang = (): "fr" | "en" | "es" | "ar" => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (menu?.value || new URLSearchParams(window.location.search).get("lang") || "en").toLowerCase();
  if (value === "fr" || value === "es" || value === "ar") {
    return value;
  }
  return "en";
};

const t = (key: ShortcutsHelpKey): string => {
  const lang = getLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};

const blocklyMsg = (key: string): string =>
  (Blockly.Msg as Record<string, string>)[key] ?? key;

const mod = (): string => getModifierKeyLabel();

const ensureDialog = (): HTMLDialogElement => {
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

  const content = document.createElement("div");
  content.id = CONTENT_ID;
  content.className = "shortcuts-help-dialog__content";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = CLOSE_ID;
  closeButton.className = "shortcuts-help-dialog__close toolbar-btn";
  closeButton.addEventListener("click", () => dialog?.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.append(title, content, closeButton);
  document.body.appendChild(dialog);
  return dialog;
};

const addSection = (
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

const shellRows = (): Array<{ label: string; keys: string }> => {
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

const uiLabel = (key: "UNDO" | "REDO"): string =>
  languagesMap[getLang()]?.[key] ?? languagesMap.en[key] ?? key;

const navigationRows = (): Array<{ label: string; keys: string }> => [
  { label: blocklyMsg("SHORTCUTS_FOCUS_WORKSPACE"), keys: "W" },
  { label: blocklyMsg("SHORTCUTS_FOCUS_TOOLBOX"), keys: "T" },
  { label: t("SHORTCUTS_HELP_NAV_ARROWS"), keys: "↑ ↓ ← →" },
  { label: blocklyMsg("SHORTCUTS_PERFORM_ACTION"), keys: t("SHORTCUTS_HELP_KEYS_CONFIRM") },
  { label: blocklyMsg("SHORTCUTS_NEXT_STACK"), keys: "N" },
  { label: blocklyMsg("SHORTCUTS_PREVIOUS_STACK"), keys: "B" },
  { label: blocklyMsg("SHORTCUTS_NEXT_HEADING"), keys: "H" },
  { label: blocklyMsg("SHORTCUTS_PREVIOUS_HEADING"), keys: "Shift+H" },
  { label: blocklyMsg("SHORTCUTS_START_MOVE"), keys: "M" },
];

const editingRows = (): Array<{ label: string; keys: string }> => {
  const m = mod();
  return [
    { label: blocklyMsg("SHORTCUTS_DELETE"), keys: t("SHORTCUTS_HELP_KEYS_DELETE") },
    { label: t("SHORTCUTS_HELP_EDIT_COPY"), keys: `${m}+C` },
    { label: t("SHORTCUTS_HELP_EDIT_CUT"), keys: `${m}+X` },
    { label: t("SHORTCUTS_HELP_EDIT_PASTE"), keys: `${m}+V` },
    { label: uiLabel("UNDO"), keys: `${m}+Z` },
    { label: uiLabel("REDO"), keys: `${m}+Shift+Z, ${m}+Y` },
    { label: blocklyMsg("SHORTCUTS_DISCONNECT"), keys: "Shift+X" },
    { label: blocklyMsg("SHORTCUTS_DUPLICATE"), keys: "D" },
    { label: blocklyMsg("SHORTCUTS_CLEANUP"), keys: "C" },
    { label: blocklyMsg("SHORTCUTS_SHOW_CONTEXT_MENU"), keys: `${m}+Enter, Shift+F10` },
    { label: blocklyMsg("SHORTCUTS_ESCAPE"), keys: "Esc" },
  ];
};

const navigationJumpRows = (): Array<{ label: string; keys: string }> => {
  const m = mod();
  return [
    { label: blocklyMsg("SHORTCUTS_JUMP_BLOCK_START"), keys: "Home" },
    { label: blocklyMsg("SHORTCUTS_JUMP_BLOCK_END"), keys: "End" },
    { label: blocklyMsg("SHORTCUTS_JUMP_TOP_STACK"), keys: "Page Up" },
    { label: blocklyMsg("SHORTCUTS_JUMP_BOTTOM_STACK"), keys: "Page Down" },
    { label: blocklyMsg("SHORTCUTS_JUMP_FIRST_BLOCK"), keys: `${m}+Home` },
    { label: blocklyMsg("SHORTCUTS_JUMP_LAST_BLOCK"), keys: `${m}+End` },
  ];
};

const screenReaderRows = (): Array<{ label: string; keys: string }> => [
  { label: blocklyMsg("SHORTCUTS_INFORMATION"), keys: "I" },
  { label: blocklyMsg("SHORTCUTS_EXTENDED_INFORMATION"), keys: "Shift+I" },
  { label: blocklyMsg("SHORTCUTS_TOGGLE_SCREENREADER_MODE"), keys: "Alt+Shift+A" },
];

const renderDialogContent = (): void => {
  const title = document.getElementById(TITLE_ID);
  const content = document.getElementById(CONTENT_ID);
  const closeButton = document.getElementById(CLOSE_ID) as HTMLButtonElement | null;
  if (!title || !content) {
    return;
  }

  title.textContent = t("SHORTCUTS_HELP_TITLE");
  if (closeButton) {
    closeButton.textContent = t("SHORTCUTS_HELP_CLOSE");
    closeButton.setAttribute("aria-label", t("SHORTCUTS_HELP_CLOSE"));
  }

  content.replaceChildren();
  const colAction = t("SHORTCUTS_HELP_COL_ACTION");
  const colKeys = t("SHORTCUTS_HELP_COL_KEYS");

  addSection(content, t("SHORTCUTS_HELP_SECTION_SHELL"), shellRows(), colAction, colKeys);
  addSection(content, blocklyMsg("SHORTCUTS_CODE_NAVIGATION"), navigationRows(), colAction, colKeys);
  addSection(
    content,
    t("SHORTCUTS_HELP_SECTION_NAV_ADVANCED"),
    navigationJumpRows(),
    colAction,
    colKeys,
  );
  addSection(content, blocklyMsg("SHORTCUTS_EDITING"), editingRows(), colAction, colKeys);
  addSection(
    content,
    t("SHORTCUTS_HELP_SECTION_SCREENREADER"),
    screenReaderRows(),
    colAction,
    colKeys,
  );
};

/** Ouvre la modale d'aide des raccourcis. */
export const openShortcutsHelp = (): void => {
  const dialog = ensureDialog();
  renderDialogContent();
  if (!dialog.open) {
    dialog.showModal();
  }
};

/** Met à jour les libellés du bouton et du contenu si la modale est ouverte. */
export const refreshShortcutsHelp = (): void => {
  const button = document.getElementById(BUTTON_ID) as HTMLButtonElement | null;
  if (button) {
    const label = t("SHORTCUTS_HELP_BUTTON");
    const tooltip = t("SHORTCUTS_HELP_TOOLTIP");
    button.textContent = label;
    button.setAttribute("aria-label", tooltip);
    button.setAttribute("title", tooltip);
    button.setAttribute("aria-keyshortcuts", "F1 ?");
  }

  const dialog = document.getElementById(DIALOG_ID) as HTMLDialogElement | null;
  if (dialog?.open) {
    renderDialogContent();
  }
};

/**
 * Enregistre le bouton barre d'outils, la modale et les raccourcis F1 / ?.
 */
export const registerShortcutsHelp = (): void => {
  ensureDialog();

  const button = document.getElementById(BUTTON_ID);
  button?.addEventListener("click", () => openShortcutsHelp());

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isTextEntryTarget(event.target)) {
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
