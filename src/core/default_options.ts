/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Default option values for embed and demo.
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

import type {
  UcBlocklyEnforcerOptions,
  UcBlocklyPluginOptions,
} from "./types";

/** Default Blockly workspace plugins for µcBlockly. */
export const DEFAULT_UCBLOCKLY_PLUGINS: Required<UcBlocklyPluginOptions> = {
  backpack: true,
  contentHighlight: false,
  minimap: true,
  minimapVisible: true,
  modal: true,
  workspaceSearch: true,
  zoomToFit: true,
  shadowBlockConverter: true,
  crossTabCopyPaste: true,
  soundToggle: true,
};

/** Default enforcers applied after workspace injection. */
export const DEFAULT_UCBLOCKLY_ENFORCERS: Required<UcBlocklyEnforcerOptions> = {
  strictTypes: true,
  programStructure: true,
  strictConnectionChecker: false,
};

/**
 * Merges partial plugin options with {@link DEFAULT_UCBLOCKLY_PLUGINS}.
 * @param options - Configuration options.
 * @returns Operation result.
 */
export function resolvePluginOptions(
  options?: UcBlocklyPluginOptions,
): Required<UcBlocklyPluginOptions> {
  return { ...DEFAULT_UCBLOCKLY_PLUGINS, ...options };
}

/**
 * Merges partial enforcer options with {@link DEFAULT_UCBLOCKLY_ENFORCERS}.
 * @param options - Configuration options.
 * @returns Operation result.
 */
export function resolveEnforcerOptions(
  options?: UcBlocklyEnforcerOptions,
): Required<UcBlocklyEnforcerOptions> {
  return { ...DEFAULT_UCBLOCKLY_ENFORCERS, ...options };
}
