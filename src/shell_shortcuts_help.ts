/**
 * @packageDocumentation
 * @module ShellShortcutsHelp
 * @description Help / customize keyboard shortcuts modal (shell + Blockly 13).
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

import * as Blockly from "blockly";
import { languagesMap, type LanguageItem } from "./languages/languageMap";
import { getModifierKeyLabel, isTextEntryTarget } from "./shell_shortcuts";
import {
  EDITABLE_SHORTCUT_NAMES,
  applyShortcutPreferences,
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
  | "SHORTCUTS_HELP_COL_EDIT"
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
  | "SHORTCUTS_HELP_EDIT"
  | "SHORTCUTS_HELP_LISTENING"
  | "SHORTCUTS_HELP_RESET_ONE"
  | "SHORTCUTS_HELP_RESET_ALL"
  | "SHORTCUTS_HELP_CONFLICT"
  | "SHORTCUTS_HELP_SECTION_EDITABLE"
  | "SHORTCUTS_HELP_EDITABLE_HINT"
  | "SHORTCUTS_HELP_SAVED"
  | "SHORTCUTS_HELP_RESET_DONE"
  | "SHORTCUTS_HELP_RESET_ALL_DONE"
  | "SHORTCUTS_HELP_CANCELLED"
  | "SHORTCUTS_HELP_CUSTOM_BADGE"
  | "SHORTCUTS_HELP_EDIT_ARIA"
  | "SHORTCUTS_HELP_RESET_ARIA"
>;

type FocusTarget =
  | { kind: "edit"; name: EditableShortcutName }
  | { kind: "reset"; name: EditableShortcutName }
  | { kind: "reset-all" }
  | { kind: "close" };

type PendingStatus = { message: string; isError: boolean };

const DIALOG_ID = "shortcuts-help-dialog";
const CONTENT_ID = "shortcuts-help-content";
const TITLE_ID = "shortcuts-help-title";
const CLOSE_ID = "shortcuts-help-close";
const BUTTON_ID = "shortcutsHelpButton";
const HINT_ID = "shortcuts-help-editable-hint";
const STATUS_ID = "shortcuts-help-status";

const SHORTCUT_LABELS: Record<EditableShortcutName, () => string> = {
  delete: () => blocklyMsg("SHORTCUTS_DELETE"),
  copy: () => t("SHORTCUTS_HELP_EDIT_COPY"),
  cut: () => t("SHORTCUTS_HELP_EDIT_CUT"),
  paste: () => t("SHORTCUTS_HELP_EDIT_PASTE"),
  undo: () => uiLabel("UNDO"),
  redo: () => uiLabel("REDO"),
  duplicate: () => blocklyMsg("SHORTCUTS_DUPLICATE"),
  cleanup: () => blocklyMsg("SHORTCUTS_CLEANUP"),
  disconnect: () => blocklyMsg("SHORTCUTS_DISCONNECT"),
  menu: () => blocklyMsg("SHORTCUTS_SHOW_CONTEXT_MENU"),
  focus_workspace: () => blocklyMsg("SHORTCUTS_FOCUS_WORKSPACE"),
  focus_toolbox: () => blocklyMsg("SHORTCUTS_FOCUS_TOOLBOX"),
  next_stack: () => blocklyMsg("SHORTCUTS_NEXT_STACK"),
  previous_stack: () => blocklyMsg("SHORTCUTS_PREVIOUS_STACK"),
  next_heading: () => blocklyMsg("SHORTCUTS_NEXT_HEADING"),
  previous_heading: () => blocklyMsg("SHORTCUTS_PREVIOUS_HEADING"),
  perform_action: () => blocklyMsg("SHORTCUTS_PERFORM_ACTION"),
  start_move: () => blocklyMsg("SHORTCUTS_START_MOVE"),
  information: () => blocklyMsg("SHORTCUTS_INFORMATION"),
  extended_information: () => blocklyMsg("SHORTCUTS_EXTENDED_INFORMATION"),
  toggle_screenreader: () => blocklyMsg("SHORTCUTS_TOGGLE_SCREENREADER_MODE"),
  jump_to_block_start: () => blocklyMsg("SHORTCUTS_JUMP_BLOCK_START"),
  jump_to_block_end: () => blocklyMsg("SHORTCUTS_JUMP_BLOCK_END"),
  jump_to_top_of_stack: () => blocklyMsg("SHORTCUTS_JUMP_TOP_STACK"),
  jump_to_bottom_of_stack: () => blocklyMsg("SHORTCUTS_JUMP_BOTTOM_STACK"),
  jump_to_first_block: () => blocklyMsg("SHORTCUTS_JUMP_FIRST_BLOCK"),
  jump_to_last_block: () => blocklyMsg("SHORTCUTS_JUMP_LAST_BLOCK"),
};

let listeningFor: EditableShortcutName | null = null;
let captureHandler: ((event: KeyboardEvent) => void) | null = null;
let statusEl: HTMLElement | null = null;
let pendingStatus: PendingStatus | null = null;
let pendingFocus: FocusTarget | null = null;

const getLang = (): "fr" | "en" | "es" | "ar" => {
  const menu = document.getElementById("languageMenu") as HTMLSelectElement | null;
  const value = (
    menu?.value ||
    new URLSearchParams(window.location.search).get("lang") ||
    "en"
  ).toLowerCase();
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

const uiLabel = (key: "UNDO" | "REDO"): string =>
  languagesMap[getLang()]?.[key] ?? languagesMap.en[key] ?? key;

const actionLabel = (name: EditableShortcutName): string =>
  SHORTCUT_LABELS[name]();

const stopListening = (): void => {
  if (captureHandler) {
    document.removeEventListener("keydown", captureHandler, true);
    captureHandler = null;
  }
  listeningFor = null;
};

const applyStatusToElement = (el: HTMLElement, status: PendingStatus | null): void => {
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

const setStatus = (message: string, isError = false): void => {
  pendingStatus = message ? { message, isError } : null;
  if (statusEl) {
    applyStatusToElement(statusEl, pendingStatus);
  }
};

const restoreFocus = (target: FocusTarget | null): void => {
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
  title.tabIndex = -1;

  const content = document.createElement("div");
  content.id = CONTENT_ID;
  content.className = "shortcuts-help-dialog__content";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = CLOSE_ID;
  closeButton.className = "shortcuts-help-dialog__close toolbar-btn";
  closeButton.addEventListener("click", () => {
    stopListening();
    dialog?.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      stopListening();
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    stopListening();
    pendingStatus = null;
    pendingFocus = null;
  });

  dialog.addEventListener("cancel", (event) => {
    if (!listeningFor) {
      return;
    }
    // Esc pendant la capture : annuler le rebind sans fermer la modale.
    event.preventDefault();
    const name = listeningFor;
    stopListening();
    pendingFocus = { kind: "edit", name };
    setStatus(t("SHORTCUTS_HELP_CANCELLED"));
    renderDialogContent();
  });

  dialog.append(title, content, closeButton);
  document.body.appendChild(dialog);
  return dialog;
};

const addReadonlySection = (
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

const startListening = (
  name: EditableShortcutName,
  editBtn: HTMLButtonElement,
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
    if (!result.ok) {
      if (result.reason === "conflict" && result.conflicts?.length) {
        const owners = result.conflicts
          .map((c) => c.owners.join(", "))
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

const addEditableSection = (root: HTMLElement): void => {
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
      startListening(name, editBtn);
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

const navigationHintRows = (): Array<{ label: string; keys: string }> => [
  { label: t("SHORTCUTS_HELP_NAV_ARROWS"), keys: "↑ ↓ ← →" },
  {
    label: blocklyMsg("SHORTCUTS_PERFORM_ACTION"),
    keys: t("SHORTCUTS_HELP_KEYS_CONFIRM"),
  },
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

  addReadonlySection(
    content,
    t("SHORTCUTS_HELP_SECTION_SHELL"),
    shellRows(),
    colAction,
    colKeys,
  );
  addReadonlySection(
    content,
    blocklyMsg("SHORTCUTS_CODE_NAVIGATION"),
    navigationHintRows(),
    colAction,
    colKeys,
  );
  addEditableSection(content);

  const focus = pendingFocus;
  pendingFocus = null;
  restoreFocus(focus);
};

/** Ouvre la modale d'aide des raccourcis. */
export const openShortcutsHelp = (): void => {
  applyShortcutPreferences();
  const dialog = ensureDialog();
  const wasOpen = dialog.open;
  renderDialogContent();
  if (!wasOpen) {
    dialog.showModal();
    restoreFocus({ kind: "close" });
  }
};

/** Met à jour les libellés du bouton et du contenu si la modale est ouverte. */
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
      pendingFocus = { kind: "edit", name };
    } else if (active?.classList.contains("shortcuts-help-reset") && name) {
      pendingFocus = { kind: "reset", name };
    } else if (active?.classList.contains("shortcuts-help-reset-all")) {
      pendingFocus = { kind: "reset-all" };
    } else if (active?.id === CLOSE_ID) {
      pendingFocus = { kind: "close" };
    }
    renderDialogContent();
  }
};

/**
 * Enregistre le bouton barre d'outils, la modale et les raccourcis F1 / ?.
 */
export const registerShortcutsHelp = (): void => {
  ensureDialog();
  applyShortcutPreferences();

  const button = document.getElementById(BUTTON_ID);
  button?.addEventListener("click", () => openShortcutsHelp());

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isTextEntryTarget(event.target)) {
      return;
    }
    if (listeningFor) {
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
