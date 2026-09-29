/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Blockly locale and custom messages for a language code.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { languagesMap, languagesMapBlockly } from "../languages/languageMap";
import { BLOCKLY_CUSTOM_MESSAGE_KEYS } from "../languages/blockly_custom_message_keys";
import { mergeInstanceMessages } from "../instances/messages";
import { mergeArrayMessages } from "../languages/array_messages";
import { mergeBlocklyA11yMessages } from "../languages/blockly_a11y_messages";
import { mergeBoardMessages } from "../languages/board_messages";

/**
 * Copies selected µcBlockly message keys into `Blockly.Msg`.
 * @param language - Language code (e.g. `fr`, `en`).
 * @param keys - The `keys` argument.
 */
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
  mergeInstanceMessages(language);
  mergeCustomBlocklyMessages(language, BLOCKLY_CUSTOM_MESSAGE_KEYS);
}
