/**
 * @packageDocumentation
 * @module Boards
 * @description Pin validators and board dropdown helpers.
 * @remarks
 * Profile **data** lives in {@link ./board_profiles.ts}. Regenerate data via
 * `scripts/convert-boards-to-ts.mjs` when converting from legacy boards.js.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
  BOARD_PROFILES,
  DEFAULT_BOARD_ID,
  type BoardId,
  type BoardProfile,
  type PinEntry,
} from "./board_profiles";

export {
  BOARD_PROFILES,
  DEFAULT_BOARD_ID,
  type BoardId,
  type BoardProfile,
  type PinDropdownEntry,
  type PinEntry,
} from "./board_profiles";

const toPinValues = (entries: readonly PinEntry[]): string[] => {
  return entries
    .map((entry) => (Array.isArray(entry) ? entry[1] : entry))
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
};

const contains = (list: readonly string[], value: string): boolean => list.includes(value);

const getBoard = (boardId: BoardId = DEFAULT_BOARD_ID): BoardProfile => {
  return BOARD_PROFILES[boardId] ?? BOARD_PROFILES[DEFAULT_BOARD_ID];
};

/**
 * Pin Digital Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinDigitalValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  return contains(toPinValues(getBoard(boardId).digital), text) ? text : null;
};

/**
 * Pin Interrupt Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinInterruptValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  return contains(toPinValues(getBoard(boardId).interrupt), text) ? text : null;
};

/**
 * Pin PWMValidator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinPWMValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  return contains(toPinValues(getBoard(boardId).PWM), text) ? text : null;
};

/**
 * Pin Analog Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinAnalogValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  return contains(toPinValues(getBoard(boardId).analog), text) ? text : null;
};

/**
 * Pin Soft Serial Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinSoftSerialValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  const serialPins = toPinValues(getBoard(boardId).serialPin);
  return contains(serialPins, text) ? text : null;
};

/**
 * Pin Grove Digital Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinGroveDigitalValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  const digitalPins = toPinValues(getBoard(boardId).digital);
  if (!contains(digitalPins, text)) return null;
  const nextPin = String(parseInt(text, 10) + 1);
  return contains(digitalPins, nextPin) ? text : null;
};

/**
 * Pin Grove Analog Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinGroveAnalogValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  const analogPins = toPinValues(getBoard(boardId).analog);
  if (!contains(analogPins, text)) return null;
  const numeric = parseInt(text.slice(1), 10);
  const nextPin = "A" + String(numeric + 1);
  return contains(analogPins, nextPin) ? text : null;
};

/**
 * Pin Dual Validator.
 * @param text - Text content.
 * @param boardId - Board identifier.
 * @returns Result string.
 */
export const pinDualValidator = (text: string, boardId: BoardId = DEFAULT_BOARD_ID): string | null => {
  const board = getBoard(boardId);
  return contains(toPinValues(board.analog), text) || contains(toPinValues(board.digital), text) ? text : null;
};

const FALLBACK_BOARD_FOR_DROPDOWNS = "arduino_uno";

function normalizeDropdownEntries(raw: unknown): [string, string][] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((e) =>
    Array.isArray(e) ? ([String(e[0]), String(e[1])] as [string, string]) : ([String(e), String(e)] as [string, string]),
  );
}

/**
 * Board choices for embedded per-block board dropdowns (excludes "none").
 * @returns Result string.
 */
export function getBoardProfileDropdownOptions(): [string, string][] {
  const options: [string, string][] = [];
  for (const [boardId, profile] of Object.entries(BOARD_PROFILES)) {
    if (boardId === DEFAULT_BOARD_ID) continue;
    const label =
      typeof profile.description === "string" && profile.description.trim().length > 0
        ? profile.description
        : boardId;
    options.push([label, boardId]);
  }
  options.sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));
  return options;
}

/**
 * Digital pin options per board id, for dependent-dropdown child menus.
 * @returns Result string.
 */
export function getBoardDigitalPinOptionMapping(): Record<string, [string, string][]> {
  const mapping: Record<string, [string, string][]> = {};
  for (const boardId of Object.keys(BOARD_PROFILES)) {
    if (boardId === DEFAULT_BOARD_ID) continue;
    mapping[boardId] = getBoardDropdownOptions(boardId).digital;
  }
  return mapping;
}

/**
 * Returns dropdown options (digital, PWM, analog, serial baud) for a given board. Used so block pin dropdowns match the selected board.
 * @param boardId - Board identifier.
 */
export function getBoardDropdownOptions(boardId: BoardId): {
  digital: [string, string][];
  pwm: [string, string][];
  analog: [string, string][];
  serial: [string, string][];
} {
  const profile = getBoard(boardId) as Record<string, unknown>;
  const fallback = BOARD_PROFILES[FALLBACK_BOARD_FOR_DROPDOWNS] as Record<string, unknown> | undefined;
  const use = (key: string): [string, string][] => {
    const raw = profile?.[key];
    if (raw === "attention" || raw === undefined || !Array.isArray(raw)) {
      const fb = fallback?.[key];
      return Array.isArray(fb) ? normalizeDropdownEntries(fb) : [];
    }
    return normalizeDropdownEntries(raw);
  };
  return {
    digital: use("dropdownDigital").length ? use("dropdownDigital") : [["13", "13"]],
    pwm: use("dropdownPWM").length ? use("dropdownPWM") : [["3", "3"]],
    analog: use("dropdownAnalog").length ? use("dropdownAnalog") : [["A0", "A0"]],
    serial: use("serial").length ? use("serial") : [["9600", "9600"], ["115200", "115200"]],
  };
}
