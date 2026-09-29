/**
 * @packageDocumentation
 * @module BlocklyFields.ColourAccessible
 * @description FieldColour plugin with Blockly v13 ARIA spoken values (hex + RGB).
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
 * Registers (or overrides) `field_colour` with the ARIA wrapper. Do not unregister first: `@blockly/field-colour` does not auto-register on import, and Blockly warns when unregistering a missing entry.
 */
export const registerAccessibleFieldColour = (): void => {
  // fieldRegistry.register already allows overrides.
  Blockly.fieldRegistry.register("field_colour", LocalizedFieldColour);
};
