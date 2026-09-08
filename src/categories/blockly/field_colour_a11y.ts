/**
 * @packageDocumentation
 * @module BlocklyFields.ColourA11y
 * @description ARIA helpers for colour fields (Blockly v13+).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getBlocklyMsgOr } from "./shared";

/**
 * Localized ARIA type name for a colour field.
 * @returns Result string.
 */
export const getColourAriaTypeName = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_TYPE", "Colour");

/**
 * ARIA value when the colour is missing or invalid.
 * @returns Result string.
 */
export const getColourAriaEmptyValue = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_EMPTY", "empty");

/**
 * Normalizes a hexadecimal colour (#RRGGBB).
 * @param raw - The `raw` argument.
 * @returns Result string.
 */
export const normalizeHexColour = (raw: string | null | undefined): string | null => {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  // FieldColour may expose shortened #rgb in getText(); accept it for ARIA too.
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[0];
    const g = trimmed[1];
    const b = trimmed[2];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
};

/**
 * Screen-reader-friendly representation of a hex colour.
 * @param raw - The `raw` argument.
 * @returns Result string.
 */
export const formatColourAriaValue = (raw: string | null | undefined): string => {
  const hex = normalizeHexColour(raw);
  if (!hex) {
    return getColourAriaEmptyValue();
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rgb = `${r}, ${g}, ${b}`;
  return getBlocklyMsgOr("FIELD_COLOUR_ARIA_VALUE", "%1 (RGB %2)")
    .replace("%1", hex)
    .replace("%2", rgb);
};

/**
 * Libellé du groupe éditeur pipette iro.js.
 * @returns Result string.
 */
export const getColourPickerEditorLabel = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_PICKER_EDITOR_LABEL", "Colour picker");

/**
 * Libellé du groupe éditeur curseurs HSV.
 * @returns Result string.
 */
export const getColourHsvEditorLabel = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_HSV_EDITOR_LABEL", "Colour HSV sliders");
