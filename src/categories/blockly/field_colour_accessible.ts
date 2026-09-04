/**
 * @packageDocumentation
 * @module BlocklyFields.ColourAccessible
 * @description FieldColour plugin with Blockly v13 ARIA spoken values (hex + RGB).
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
import * as FieldColourNS from "@blockly/field-colour";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import {
  formatColourAriaValue,
  getColourAriaTypeName,
} from "./field_colour_a11y";

const FieldColour = namedExportFromCjsPlugin<
  typeof import("@blockly/field-colour").FieldColour
>(FieldColourNS, "FieldColour");

/**
 * Colour grid field with screen-reader-friendly ARIA values.
 */
export class LocalizedFieldColour extends FieldColour {
  /** ARIA type for Blockly v13 keyboard / screen reader navigation. */
  override getAriaTypeName(): string {
    return getColourAriaTypeName();
  }

  /** Spoken colour value (hex + RGB), not only the abbreviated hex from getText(). */
  override getAriaValue(): string {
    return formatColourAriaValue(this.getValue());
  }
}

/**
 * Registers (or overrides) `field_colour` with the ARIA wrapper.
 * Do not unregister first: `@blockly/field-colour` does not auto-register on
 * import, and Blockly warns when unregistering a missing entry.
 */
export const registerAccessibleFieldColour = (): void => {
  // fieldRegistry.register already allows overrides.
  Blockly.fieldRegistry.register("field_colour", LocalizedFieldColour);
};
