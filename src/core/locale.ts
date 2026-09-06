/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Blockly locale and custom messages for a language code.
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
import { languagesMap, languagesMapBlockly } from "../languages/languageMap";
import { BLOCKLY_CUSTOM_MESSAGE_KEYS } from "../languages/blockly_custom_message_keys";
import { mergeInstanceMessages } from "../instances/messages";
import { mergeArrayMessages } from "../languages/array_messages";
import { mergeBlocklyA11yMessages } from "../languages/blockly_a11y_messages";
import { mergeBoardMessages } from "../languages/board_messages";

/**
 * Copies selected µcBlockly message keys into `Blockly.Msg`.
 * @param language - Language code (e.g. `fr`, `en`).
 * @param keys - `keys` value.
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
