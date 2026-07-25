/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Blockly locale and custom messages for a language code.
 */

import * as Blockly from "blockly";
import { languagesMap, languagesMapBlockly } from "../languages/languageMap";
import { BLOCKLY_CUSTOM_MESSAGE_KEYS } from "../languages/blockly_custom_message_keys";
import { mergeArrayMessages } from "../languages/array_messages";
import { mergeBlocklyA11yMessages } from "../languages/blockly_a11y_messages";
import { mergeBoardMessages } from "../languages/board_messages";

/** Copies selected µcBlockly message keys into `Blockly.Msg`. */
export function mergeCustomBlocklyMessages(language: string, keys: readonly string[]): void {
  const custom = languagesMap[language];
  if (!custom) {
    return;
  }
  const msg = Blockly.Msg as Record<string, string>;
  for (const key of keys) {
    const value = custom[key as keyof typeof custom];
    if (value !== undefined) {
      msg[key] = value;
    }
  }
}

/**
 * Applies Blockly locale and µcBlockly custom messages.
 * @param language - ISO 639 language code (e.g. `fr`, `en`).
 */
export function applyUcBlocklyLocale(language: string): void {
  const locale = languagesMapBlockly[language] ?? languagesMapBlockly.fr;
  Blockly.setLocale(locale);
  mergeArrayMessages(language);
  mergeBoardMessages(language);
  mergeBlocklyA11yMessages(language);
  mergeCustomBlocklyMessages(language, BLOCKLY_CUSTOM_MESSAGE_KEYS);
}
