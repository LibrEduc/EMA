/**
 * @packageDocumentation
 * @module Extensions.LoadAll
 * @description Discover and load all extension packs at startup (no rebuild).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { createHttpExtensionIo } from "./io_http";
import { loadExtensionPack } from "./load_extension";
import {
  getExtensionMessagesForLang,
  getLoadedExtensions,
} from "./registry";
import type { ExtensionIndex, ExtensionIo, LoadedExtension } from "./types";

export type LoadExtensionsOptions = {
  /** Base URL of the extensions root (default `/extensions`). */
  baseUrl?: string;
  /** Custom I/O (Electron fs, etc.). Defaults to HTTP fetch. */
  io?: ExtensionIo;
  /** Language for merging Blockly.Msg (default `fr`). */
  language?: string;
  /** If true, missing index.json is not an error (default true). */
  optional?: boolean;
};

function joinUrl(base: string, part: string): string {
  return `${base.replace(/\/+$/, "")}/${part.replace(/^\/+/, "")}`;
}

async function discoverPackIds(
  io: ExtensionIo,
  baseUrl: string,
): Promise<string[]> {
  const indexUrl = joinUrl(baseUrl, "index.json");
  const text = await io.readText(indexUrl);
  const index = JSON.parse(text) as ExtensionIndex | string[];
  const raw = Array.isArray(index) ? index : (index.extensions ?? []);
  const ids: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string" || !entry.trim()) {
      console.warn(
        "[µcBlockly] extensions/index.json entries must be folder names (strings). Ignored:",
        entry,
      );
      continue;
    }
    ids.push(entry.trim());
  }
  return ids;
}

/** Merge loaded extension messages into Blockly.Msg for the active language. */
export function applyExtensionMessages(language: string): void {
  const msgs = getExtensionMessagesForLang(language);
  Object.assign(Blockly.Msg as Record<string, string>, msgs);
}

/**
 * Loads every pack listed in `{baseUrl}/index.json`.
 * Safe to call once at app startup (web or Electron with static root).
 */
export async function loadExtensions(
  options: LoadExtensionsOptions = {},
): Promise<LoadedExtension[]> {
  const baseUrl = options.baseUrl ?? "/extensions";
  const io = options.io ?? createHttpExtensionIo(baseUrl);
  const optional = options.optional !== false;
  const language = options.language ?? "fr";

  let packIds: string[] = [];
  try {
    packIds = await discoverPackIds(io, baseUrl);
  } catch (err) {
    if (optional) {
      console.info(
        "[µcBlockly] No extensions index at",
        joinUrl(baseUrl, "index.json"),
        err,
      );
      return getLoadedExtensions();
    }
    throw err;
  }

  const loaded: LoadedExtension[] = [];
  for (const id of packIds) {
    try {
      loaded.push(await loadExtensionPack(id, io));
    } catch (err) {
      console.warn(`[µcBlockly] Failed to load extension "${id}":`, err);
    }
  }

  applyExtensionMessages(language);
  return loaded;
}
