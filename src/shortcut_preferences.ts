/**
 * @packageDocumentation
 * @module ShortcutPreferences
 * @description Persist and rebind Blockly ShortcutRegistry keybindings.
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

const STORAGE_KEY = "ucbShortcutBindings";
const STORAGE_VERSION = 1;

export type ShortcutBindingMap = Record<string, string[]>;

type StoredPrefs = {
  version: number;
  bindings: ShortcutBindingMap;
};

/** Shortcuts exposed for customization in the help dialog. */
export const EDITABLE_SHORTCUT_NAMES = [
  "delete",
  "copy",
  "cut",
  "paste",
  "undo",
  "redo",
  "duplicate",
  "cleanup",
  "disconnect",
  "menu",
  "focus_workspace",
  "focus_toolbox",
  "next_stack",
  "previous_stack",
  "next_heading",
  "previous_heading",
  "perform_action",
  "start_move",
  "information",
  "extended_information",
  "toggle_screenreader",
  "jump_to_block_start",
  "jump_to_block_end",
  "jump_to_top_of_stack",
  "jump_to_bottom_of_stack",
  "jump_to_first_block",
  "jump_to_last_block",
] as const;

export type EditableShortcutName = (typeof EDITABLE_SHORTCUT_NAMES)[number];

/** Snapshot of factory key codes (taken once after defaults are registered). */
const defaultKeyCodes = new Map<string, string[]>();

const KEY_CODE_LABELS: Record<number, string> = {
  8: "Backspace",
  9: "Tab",
  13: "Enter",
  27: "Esc",
  32: "Space",
  33: "Page Up",
  34: "Page Down",
  35: "End",
  36: "Home",
  37: "←",
  38: "↑",
  39: "→",
  40: "↓",
  46: "Delete",
  93: "Menu",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
};

const ensureDefaultsSnapshot = (): void => {
  if (defaultKeyCodes.size > 0) {
    return;
  }
  const registry = Blockly.ShortcutRegistry.registry;
  for (const name of EDITABLE_SHORTCUT_NAMES) {
    const codes = registry.getKeyCodesByShortcutName(name);
    if (codes?.length) {
      defaultKeyCodes.set(name, [...codes]);
    }
  }
};

const readStoredBindings = (): ShortcutBindingMap => {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as StoredPrefs;
    if (!parsed || parsed.version !== STORAGE_VERSION || !parsed.bindings) {
      return {};
    }
    return parsed.bindings;
  } catch {
    return {};
  }
};

const writeStoredBindings = (bindings: ShortcutBindingMap): void => {
  try {
    if (Object.keys(bindings).length === 0) {
      window.localStorage?.removeItem(STORAGE_KEY);
      return;
    }
    const payload: StoredPrefs = { version: STORAGE_VERSION, bindings };
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
};

const arraysEqual = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Human-readable label for a Blockly serialized key code (e.g. Control+67 → Ctrl+C).
 * @param serialized - The `serialized` argument.
 * @returns Result string.
 */
export const formatSerializedKey = (serialized: string): string => {
  const parts = serialized.split("+");
  const keyPart = parts[parts.length - 1];
  const mods = parts.slice(0, -1);
  const modLabel = getModifierKeyLabel();
  const formattedMods = mods.map((m) => {
    if (m === "Control" || m === "Meta") {
      return modLabel;
    }
    if (m === "Shift") {
      return "Shift";
    }
    if (m === "Alt") {
      return "Alt";
    }
    return m;
  });
  const code = Number(keyPart);
  let keyLabel = keyPart;
  if (Number.isFinite(code)) {
    if (KEY_CODE_LABELS[code]) {
      keyLabel = KEY_CODE_LABELS[code];
    } else if (code >= 65 && code <= 90) {
      keyLabel = String.fromCharCode(code);
    } else if (code >= 48 && code <= 57) {
      keyLabel = String.fromCharCode(code);
    } else {
      keyLabel = `Key${code}`;
    }
  }
  return [...formattedMods, keyLabel].join("+");
};

/**
 * Format Serialized Keys.
 * @param codes - The `codes` argument.
 * @returns Result string.
 */
export const formatSerializedKeys = (codes: string[]): string =>
  [...new Set(codes.map(formatSerializedKey))].join(", ");

const getModifierKeyLabel = (): string =>
  /Mac|iPhone|iPad|iPod/.test(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  )
    ? "Cmd"
    : "Ctrl";

/**
 * Build a Blockly serialized key from a KeyboardEvent. Returns null for modifier-only presses.
 * @param event - Blockly workspace event.
 * @returns Result string.
 */
export const serializedKeyFromEvent = (event: KeyboardEvent): string | null => {
  const registry = Blockly.ShortcutRegistry.registry;
  const K = Blockly.utils.KeyCodes;
  const key = event.key;
  if (
    key === "Control" ||
    key === "Shift" ||
    key === "Alt" ||
    key === "Meta" ||
    key === "OS"
  ) {
    return null;
  }

  const modifiers: Blockly.utils.KeyCodes[] = [];
  if (event.ctrlKey) {
    modifiers.push(K.CTRL);
  }
  if (event.metaKey) {
    modifiers.push(K.META);
  }
  if (event.shiftKey) {
    modifiers.push(K.SHIFT);
  }
  if (event.altKey) {
    modifiers.push(K.ALT);
  }

  // Prefer event.code letter keys for stable layout-independent binding.
  let keyCode = event.keyCode || event.which;
  if (event.code?.startsWith("Key") && event.code.length === 4) {
    keyCode = event.code.charCodeAt(3);
  } else if (event.code?.startsWith("Digit") && event.code.length === 6) {
    keyCode = event.code.charCodeAt(5);
  } else if (event.code === "Space") {
    keyCode = K.SPACE;
  } else if (event.code === "Enter") {
    keyCode = K.ENTER;
  } else if (event.code === "Escape") {
    keyCode = K.ESC;
  } else if (event.code === "Backspace") {
    keyCode = K.BACKSPACE;
  } else if (event.code === "Delete") {
    keyCode = K.DELETE;
  } else if (event.code === "Home") {
    keyCode = K.HOME;
  } else if (event.code === "End") {
    keyCode = K.END;
  } else if (event.code === "PageUp") {
    keyCode = K.PAGE_UP;
  } else if (event.code === "PageDown") {
    keyCode = K.PAGE_DOWN;
  } else if (event.code === "ArrowUp") {
    keyCode = K.UP;
  } else if (event.code === "ArrowDown") {
    keyCode = K.DOWN;
  } else if (event.code === "ArrowLeft") {
    keyCode = K.LEFT;
  } else if (event.code === "ArrowRight") {
    keyCode = K.RIGHT;
  } else if (event.code?.startsWith("F") && /^F\d{1,2}$/.test(event.code)) {
    const n = Number(event.code.slice(1));
    if (n >= 1 && n <= 12) {
      keyCode = K.F1 + (n - 1);
    }
  }

  if (!keyCode) {
    return null;
  }
  return registry.createSerializedKey(keyCode, modifiers.length ? modifiers : null);
};

export type RebindConflict = {
  keyCode: string;
  owners: string[];
};

/**
 * Returns conflicting shortcut names for the proposed key codes (excluding `name`).
 * @param name - Name string.
 * @param keyCodes - The `keyCodes` argument.
 * @returns Result array.
 */
export const findRebindConflicts = (
  name: string,
  keyCodes: string[],
): RebindConflict[] => {
  const registry = Blockly.ShortcutRegistry.registry;
  const conflicts: RebindConflict[] = [];
  for (const keyCode of keyCodes) {
    const owners = (registry.getShortcutNamesByKeyCode(keyCode) ?? []).filter(
      (n) => n !== name,
    );
    if (owners.length) {
      conflicts.push({ keyCode, owners });
    }
  }
  return conflicts;
};

/**
 * Rebind a registered shortcut to new serialized key codes.
 * @param name - Name string.
 * @param keyCodes - The `keyCodes` argument.
 * @returns Result array.
 */
export const rebindShortcut = (
  name: string,
  keyCodes: string[],
): { ok: true } | { ok: false; reason: "missing" | "conflict"; conflicts?: RebindConflict[] } => {
  const registry = Blockly.ShortcutRegistry.registry;
  const existing = registry.getRegistry()[name];
  if (!existing) {
    return { ok: false, reason: "missing" };
  }
  const conflicts = findRebindConflicts(name, keyCodes);
  if (conflicts.length) {
    return { ok: false, reason: "conflict", conflicts };
  }

  const snapshot = {
    name: existing.name,
    callback: existing.callback,
    preconditionFn: existing.preconditionFn,
    metadata: existing.metadata,
    allowCollision: existing.allowCollision,
    keyCodes: [...keyCodes],
  };

  registry.unregister(name);
  registry.register(snapshot, true);
  return { ok: true };
};

/**
 * Current effective key codes for a shortcut (registry live state).
 * @param name - Name string.
 * @returns Result string.
 */
export const getEffectiveKeyCodes = (name: string): string[] => {
  const registry = Blockly.ShortcutRegistry.registry;
  return [...(registry.getKeyCodesByShortcutName(name) ?? [])];
};

/**
 * Get Default Key Codes.
 * @param name - Name string.
 * @returns Result string.
 */
export const getDefaultKeyCodes = (name: string): string[] => {
  ensureDefaultsSnapshot();
  return [...(defaultKeyCodes.get(name) ?? getEffectiveKeyCodes(name))];
};

/**
 * Apply persisted overrides onto the live ShortcutRegistry. Safe to call multiple times (e.g. after cross-tab copy/paste replaces C/X/V).
 */
export const applyShortcutPreferences = (): void => {
  ensureDefaultsSnapshot();
  const bindings = readStoredBindings();
  for (const [name, keyCodes] of Object.entries(bindings)) {
    if (!keyCodes?.length) {
      continue;
    }
    const result = rebindShortcut(name, keyCodes);
    if (result.ok === false && result.reason === "conflict") {
      // Drop stale conflicting override so the app keeps working.
      delete bindings[name];
      writeStoredBindings(bindings);
    }
  }
};

const expandModifierAliases = (keyCodes: string[]): string[] => {
  const out = new Set(keyCodes);
  for (const key of keyCodes) {
    if (key.includes("Control+")) {
      out.add(key.replace(/Control\+/g, "Meta+"));
    }
    if (key.includes("Meta+")) {
      out.add(key.replace(/Meta\+/g, "Control+"));
    }
  }
  return [...out];
};

/**
 * Persist and apply a new binding for one shortcut.
 * @param name - Name string.
 * @param keyCodes - The `keyCodes` argument.
 * @returns Result array.
 */
export const setShortcutBinding = (
  name: string,
  keyCodes: string[],
): { ok: true } | { ok: false; reason: "missing" | "conflict"; conflicts?: RebindConflict[] } => {
  ensureDefaultsSnapshot();
  const expanded = expandModifierAliases(keyCodes);
  const result = rebindShortcut(name, expanded);
  if (!result.ok) {
    return result;
  }
  const bindings = readStoredBindings();
  const defaults = defaultKeyCodes.get(name) ?? [];
  if (arraysEqual(expanded, defaults)) {
    delete bindings[name];
  } else {
    bindings[name] = [...expanded];
  }
  writeStoredBindings(bindings);
  return { ok: true };
};

/**
 * Restore one shortcut to its factory binding.
 * @param name - Name string.
 */
export const resetShortcutBinding = (name: string): void => {
  ensureDefaultsSnapshot();
  const defaults = defaultKeyCodes.get(name);
  if (!defaults?.length) {
    return;
  }
  rebindShortcut(name, defaults);
  const bindings = readStoredBindings();
  delete bindings[name];
  writeStoredBindings(bindings);
};

/**
 * Restore all editable shortcuts to factory defaults.
 */
export const resetAllShortcutBindings = (): void => {
  ensureDefaultsSnapshot();
  for (const name of EDITABLE_SHORTCUT_NAMES) {
    const defaults = defaultKeyCodes.get(name);
    if (defaults?.length) {
      rebindShortcut(name, defaults);
    }
  }
  writeStoredBindings({});
};

/**
 * Has Custom Shortcut Bindings.
 * @returns True when the condition holds.
 */
export const hasCustomShortcutBindings = (): boolean =>
  Object.keys(readStoredBindings()).length > 0;
