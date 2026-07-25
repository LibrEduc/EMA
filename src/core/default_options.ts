/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Default option values for embed and demo.
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
};

/** Default enforcers applied after workspace injection. */
export const DEFAULT_UCBLOCKLY_ENFORCERS: Required<UcBlocklyEnforcerOptions> = {
  strictTypes: true,
  programStructure: true,
  strictConnectionChecker: false,
};

/** Merges partial plugin options with {@link DEFAULT_UCBLOCKLY_PLUGINS}. */
export function resolvePluginOptions(
  options?: UcBlocklyPluginOptions,
): Required<UcBlocklyPluginOptions> {
  return { ...DEFAULT_UCBLOCKLY_PLUGINS, ...options };
}

/** Merges partial enforcer options with {@link DEFAULT_UCBLOCKLY_ENFORCERS}. */
export function resolveEnforcerOptions(
  options?: UcBlocklyEnforcerOptions,
): Required<UcBlocklyEnforcerOptions> {
  return { ...DEFAULT_UCBLOCKLY_ENFORCERS, ...options };
}
