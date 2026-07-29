/**
 * @packageDocumentation
 * @module BlocklyFields.ColourA11y
 * @description ARIA helpers for colour fields (Blockly v13+).
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

import { getBlocklyMsgOr } from "./shared";

/** Localized ARIA type name for a colour field. */
export const getColourAriaTypeName = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_TYPE", "Colour");

/** ARIA value when the colour is missing or invalid. */
export const getColourAriaEmptyValue = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_EMPTY", "empty");

/**
 * Normalizes a hexadecimal colour (#RRGGBB).
 * @returns Uppercase hex or null if invalid.
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
 * @remarks Used by custom colour fields' `getAriaValue` / `getText`.
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

/** Libellé du groupe éditeur pipette iro.js. */
export const getColourPickerEditorLabel = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_PICKER_EDITOR_LABEL", "Colour picker");

/** Libellé du groupe éditeur curseurs HSV. */
export const getColourHsvEditorLabel = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_HSV_EDITOR_LABEL", "Colour HSV sliders");
