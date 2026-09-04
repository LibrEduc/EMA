/**
 * @packageDocumentation
 * @module Extensions
 * @description Runtime extension packs (web server / Electron) — load without rebuild.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type ExtensionPinKind = "digital" | "pwm" | "analog";

export type ExtensionManifest = {
  id: string;
  version: string;
  name?: string;
  description?: string;
  categoryKey: string;
  toolboxItemId?: string;
  /**
   * Optional parent toolbox category key (e.g. `CAT_BOARD`).
   * When set, the fragment is inserted as a **subcategory** (or appended
   * if `toolboxMode` is `"append"`). Overridden by `parent` on the fragment.
   */
  toolboxParent?: string;
  /**
   * How to merge into the toolbox when a parent is set.
   * - `subcategory` (default): insert the category fragment under the parent
   * - `append`: append the fragment's `contents` (blocks) into the parent
   */
  toolboxMode?: "subcategory" | "append";
  style?: { category?: string; blocks?: string };
  blocks: string[];
  pinDropdowns?: Record<string, ExtensionPinKind>;
  levels?: string;
  /** Runtime entrypoints (JSON / ESM .js). `.ts` is authoring-only. */
  entrypoints: {
    blocksJson?: string;
    /** ESM module exporting `defineBlocks(ctx)`. */
    blocksJs?: string;
    /** ESM module exporting `registerArduinoGenerators(ctx)`. */
    generatorArduinoJs?: string;
    /** ESM module exporting `registerMicropythonGenerators(ctx)`. */
    generatorMicropythonJs?: string;
    blockTypes?: string;
    toolbox?: string;
    theme?: string;
    i18n?: string;
  };
  media?: Record<string, string>;
};

/**
 * `extensions/index.json` lists **folder names**.
 * Each entry MUST equal `manifest.id` of that folder (enforced at load).
 */
export type ExtensionIndex = {
  extensions: string[];
};

export type ExtensionThemeFragment = {
  categoryStyles?: Record<string, { colour?: string }>;
  blockStyles?: Record<
    string,
    { colourPrimary?: string; colourSecondary?: string; colourTertiary?: string }
  >;
};

export type ExtensionToolboxFragment = {
  kind: string;
  name?: string;
  /**
   * Parent category key (e.g. `CAT_BOARD`). Same meaning as `manifest.toolboxParent`.
   * Stripped before insertion into the live toolbox JSON.
   */
  parent?: string;
  /** See `manifest.toolboxMode`. */
  mode?: "subcategory" | "append";
  categorystyle?: string;
  toolboxitemid?: string;
  levels?: string;
  cssConfig?: Record<string, string>;
  contents?: unknown[];
  [key: string]: unknown;
};

/** Host adapters — same API for fetch(web) and fs(Electron). */
export type ExtensionIo = {
  /** Resolve a pack-relative URL/path to an absolute URL or file URL. */
  resolveUrl: (packId: string, relativePath: string) => string;
  /** Read text (JSON, etc.). */
  readText: (url: string) => Promise<string>;
  /** Dynamic import of an ESM module (browser import() or Electron). */
  importModule: (url: string) => Promise<Record<string, unknown>>;
};

export type LoadedExtension = {
  id: string;
  manifest: ExtensionManifest;
  toolboxFragment?: ExtensionToolboxFragment;
  theme?: ExtensionThemeFragment;
  i18n: Record<string, Record<string, string>>;
  blockTypes: Record<string, string>;
};
