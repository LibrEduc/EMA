/**
 * @packageDocumentation
 * @module Extensions.Theme
 * @description Merge extension theme styles into µcBlockly theme mappings (before inject).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type * as Blockly from "blockly";
import { themeMappings } from "../options";
import type { ExtensionThemeFragment } from "./types";

type MutableTheme = Blockly.Theme & {
  categoryStyles: Record<string, Blockly.Theme.CategoryStyle>;
  blockStyles: Record<string, Blockly.Theme.BlockStyle>;
};

/**
 * Mutates registered themes so extension category/block styles resolve.
 * @param fragment - Theme or toolbox fragment.
 */
export function applyExtensionThemeFragment(
  fragment: ExtensionThemeFragment,
): void {
  for (const theme of Object.values(themeMappings)) {
    const t = theme as MutableTheme;
    if (fragment.categoryStyles) {
      for (const [key, style] of Object.entries(fragment.categoryStyles)) {
        t.categoryStyles[key] = { colour: style.colour ?? "" };
      }
    }
    if (fragment.blockStyles) {
      for (const [key, style] of Object.entries(fragment.blockStyles)) {
        const existing = t.blockStyles[key];
        t.blockStyles[key] = {
          colourPrimary: style.colourPrimary ?? existing?.colourPrimary ?? "",
          colourSecondary:
            style.colourSecondary ?? existing?.colourSecondary ?? "",
          colourTertiary: style.colourTertiary ?? existing?.colourTertiary ?? "",
          hat: existing?.hat ?? "",
        };
      }
    }
  }
}
