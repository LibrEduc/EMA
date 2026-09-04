/**
 * @packageDocumentation
 * @module Extensions.Registry
 * @description In-memory registry of runtime-loaded extension packs.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {
  ExtensionToolboxFragment,
  ExtensionThemeFragment,
  LoadedExtension,
} from "./types";
import type { ToolboxConfiguration } from "../toolbox";

const loaded = new Map<string, LoadedExtension>();

type ToolboxNode = {
  kind?: string;
  name?: string;
  contents?: ToolboxNode[];
  [key: string]: unknown;
};

export function getLoadedExtensions(): LoadedExtension[] {
  return [...loaded.values()];
}

export function getLoadedExtension(id: string): LoadedExtension | undefined {
  return loaded.get(id);
}

export function registerLoadedExtension(ext: LoadedExtension): void {
  loaded.set(ext.id, ext);
}

export function clearLoadedExtensionsForTests(): void {
  loaded.clear();
}

function findCategoryByName(
  nodes: ToolboxNode[],
  name: string,
): ToolboxNode | null {
  for (const node of nodes) {
    if (node.kind === "category" && node.name === name) {
      return node;
    }
    if (Array.isArray(node.contents)) {
      const found = findCategoryByName(node.contents, name);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function categoryChildNames(node: ToolboxNode): Set<string> {
  const names = new Set<string>();
  for (const child of node.contents ?? []) {
    if (child.kind === "category" && child.name) {
      names.add(String(child.name));
    }
  }
  return names;
}

function stripMetaFields(
  frag: ExtensionToolboxFragment,
): ExtensionToolboxFragment {
  const { parent: _p, mode: _m, ...rest } = frag;
  return rest;
}

function insertFragment(
  clone: ToolboxConfiguration,
  ext: LoadedExtension,
  frag: ExtensionToolboxFragment,
): void {
  const parentKey =
    (typeof frag.parent === "string" && frag.parent) ||
    ext.manifest.toolboxParent ||
    "";
  const mode =
    frag.mode ||
    ext.manifest.toolboxMode ||
    (parentKey ? "subcategory" : "category");
  const clean = stripMetaFields(frag);
  const name = String(clean.name ?? ext.manifest.categoryKey);

  if (!parentKey) {
    const existing = new Set(
      (clone.contents ?? [])
        .map((c) => ("name" in c ? String(c.name ?? "") : ""))
        .filter(Boolean),
    );
    if (existing.has(name)) {
      return;
    }
    clone.contents.push(clean as ToolboxConfiguration["contents"][number]);
    return;
  }

  const parent = findCategoryByName(
    (clone.contents ?? []) as ToolboxNode[],
    parentKey,
  );
  if (!parent) {
    console.warn(
      `[µcBlockly] Extension "${ext.id}": parent category "${parentKey}" not found; appending at root.`,
    );
    clone.contents.push(clean as ToolboxConfiguration["contents"][number]);
    return;
  }

  parent.contents = parent.contents ?? [];

  if (mode === "append") {
    const blocks = Array.isArray(clean.contents) ? clean.contents : [];
    parent.contents.push(...(blocks as ToolboxNode[]));
    return;
  }

  // subcategory (default when parent is set)
  const siblings = categoryChildNames(parent);
  if (siblings.has(name)) {
    return;
  }
  parent.contents.push(clean as ToolboxNode);
}

/** Deep-clones toolbox and merges each extension category / subcategory. */
export function mergeExtensionsIntoToolbox(
  base: ToolboxConfiguration,
): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(base)) as ToolboxConfiguration;

  for (const ext of loaded.values()) {
    const frag = ext.toolboxFragment as ExtensionToolboxFragment | undefined;
    if (!frag || frag.kind !== "category") {
      continue;
    }
    insertFragment(clone, ext, frag);
  }
  return clone;
}

export function getExtensionThemeFragments(): ExtensionThemeFragment[] {
  return Array.from(loaded.values())
    .map((e) => e.theme)
    .filter((t): t is ExtensionThemeFragment => Boolean(t));
}

/** Flatten i18n for one language from all loaded packs. */
export function getExtensionMessagesForLang(
  lang: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const ext of loaded.values()) {
    const bag = ext.i18n[lang] ?? ext.i18n.en;
    if (bag) {
      Object.assign(out, bag);
    }
  }
  return out;
}
