/**
 * @packageDocumentation
 * @module Extensions.Io
 * @description Default HTTP I/O for extension packs (web server / static Electron).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ExtensionIo } from "./types";

function joinUrl(base: string, ...parts: string[]): string {
  const trimmed = base.replace(/\/+$/, "");
  const rest = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  return rest ? `${trimmed}/${rest}` : trimmed;
}

/**
 * I/O based on `fetch` + dynamic `import()` — works for any static `/extensions` root (webpack-dev-server, nginx, Electron `loadURL` + local static).
 * @param baseUrl - Base URL for extension packs.
 * @returns Operation result.
 */
export function createHttpExtensionIo(baseUrl: string): ExtensionIo {
  const root = baseUrl.replace(/\/+$/, "") || "/extensions";

  return {
    resolveUrl(packId: string, relativePath: string): string {
      return joinUrl(root, packId, relativePath);
    },
    async readText(url: string): Promise<string> {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Extension fetch failed (${res.status}): ${url}`);
      }
      return res.text();
    },
    importModule(url: string): Promise<Record<string, unknown>> {
      // Cache-bust helps during prototyping when packs are edited on disk.
      const sep = url.includes("?") ? "&" : "?";
      return import(/* webpackIgnore: true */ `${url}${sep}t=${Date.now()}`) as Promise<
        Record<string, unknown>
      >;
    },
  };
}
