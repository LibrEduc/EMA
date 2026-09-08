/**
 * @packageDocumentation
 * @module ShellShortcutsHelp.I18n
 * @description i18n helpers and action labels for the shortcuts help modal.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { languagesMap, type LanguageItem } from "./languages/languageMap";
import { getModifierKeyLabel } from "./shell_shortcuts";
import type { EditableShortcutName } from "./shortcut_preferences";

export type ShortcutsHelpKey = keyof Pick<
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

export const getLang = (): "fr" | "en" | "es" | "ar" => {
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

export const t = (key: ShortcutsHelpKey): string => {
  const lang = getLang();
  return languagesMap[lang]?.[key] ?? languagesMap.en[key] ?? key;
};

export const blocklyMsg = (key: string): string =>
  (Blockly.Msg as Record<string, string>)[key] ?? key;

export const mod = (): string => getModifierKeyLabel();

export const uiLabel = (key: "UNDO" | "REDO"): string =>
  languagesMap[getLang()]?.[key] ?? languagesMap.en[key] ?? key;

export const actionLabel = (name: EditableShortcutName): string =>
  SHORTCUT_LABELS[name]();
