/**
 * @packageDocumentation
 * @module BlocklyFields.ColourA11y
 * @description Helpers ARIA pour les champs couleur (Blockly v13+).
 */

import { getBlocklyMsgOr } from "./shared";

/** Type ARIA localisé pour un champ couleur. */
export const getColourAriaTypeName = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_TYPE", "Colour");

/** Valeur ARIA lorsque la couleur est absente ou invalide. */
export const getColourAriaEmptyValue = (): string =>
  getBlocklyMsgOr("FIELD_COLOUR_ARIA_EMPTY", "empty");

/**
 * Normalise une couleur hexadécimale (#RRGGBB).
 * @returns Hex en majuscules ou null si invalide.
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
  return null;
};

/**
 * Représentation lisible par lecteur d'écran pour une couleur hex.
 * @remarks Utilisé par `getAriaValue` / `getText` des champs couleur custom.
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
