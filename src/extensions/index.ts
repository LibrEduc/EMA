/**
 * @packageDocumentation
 * @module Extensions
 * @description Runtime extension packs — load at startup without rebuild.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type {
  ExtensionManifest,
  ExtensionIndex,
  ExtensionIo,
  ExtensionPinKind,
  ExtensionThemeFragment,
  ExtensionToolboxFragment,
  LoadedExtension,
} from "./types";

export { createHttpExtensionIo } from "./io_http";
export {
  loadExtensionPack,
  type ExtensionMicropythonContext,
  type LoadExtensionPackOptions,
} from "./load_extension";
export {
  loadExtensions,
  applyExtensionMessages,
  type LoadExtensionsOptions,
} from "./load_all";
export {
  mergeExtensionsIntoToolbox,
  getLoadedExtensions,
  getLoadedExtension,
  getExtensionMessagesForLang,
  getExtensionThemeFragments,
  clearLoadedExtensionsForTests,
  registerLoadedExtension,
} from "./registry";
export { applyExtensionThemeFragment } from "./theme";
