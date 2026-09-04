/**
 * @packageDocumentation
 * @module Extensions.LoadOne
 * @description Load a single extension pack at runtime.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { registerExtensionPinDropdowns } from "../categories/blockly/board";
import {
  enforceIntOnlyValueInputs,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
} from "../categories/blockly/shared";
import { getBoardDropdownOptions } from "../boards";
import { arduinoGenerator, Order } from "../generators/arduino";
import { BLOCK_TYPE_REGISTRY } from "../generators/arduino/block_types_registry";
import {
  FieldInstance,
  Instances,
  updateInstancePresenceWarning,
} from "../instances";
import { applyExtensionThemeFragment } from "./theme";
import { registerLoadedExtension } from "./registry";
import type {
  ExtensionIo,
  ExtensionManifest,
  ExtensionThemeFragment,
  ExtensionToolboxFragment,
  LoadedExtension,
} from "./types";

const FALLBACK_BOARD = "arduino_uno";

function getSelectedBoardId(): string {
  const menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  if (!value || value === "none") {
    return FALLBACK_BOARD;
  }
  return value;
}

function getPwmPinOptions(): Blockly.MenuOption[] {
  const opts = getBoardDropdownOptions(getSelectedBoardId()).pwm;
  return opts.length > 0 ? opts : [["9", "9"]];
}

async function readJson<T>(io: ExtensionIo, url: string): Promise<T> {
  const text = await io.readText(url);
  return JSON.parse(text) as T;
}

async function loadI18n(
  io: ExtensionIo,
  packId: string,
  i18nDir: string,
): Promise<Record<string, Record<string, string>>> {
  const langs = ["en", "fr", "es", "ar"];
  const out: Record<string, Record<string, string>> = {};
  await Promise.all(
    langs.map(async (lang) => {
      try {
        const url = io.resolveUrl(packId, `${i18nDir}/${lang}.json`);
        out[lang] = await readJson(io, url);
      } catch {
        /* optional language */
      }
    }),
  );
  return out;
}

/**
 * Loads one pack: JSON assets + optional ESM `blocksJs` / `generatorArduinoJs`.
 */
export async function loadExtensionPack(
  packId: string,
  io: ExtensionIo,
): Promise<LoadedExtension> {
  const manifestUrl = io.resolveUrl(packId, "manifest.json");
  const manifest = await readJson<ExtensionManifest>(io, manifestUrl);
  if (!manifest.id) {
    throw new Error(
      `Extension folder "${packId}": manifest.json missing required "id".`,
    );
  }
  if (manifest.id !== packId) {
    throw new Error(
      `Extension id mismatch: folder is "${packId}" but manifest.id is "${manifest.id}". ` +
        `They must be identical (rename the folder or fix manifest.id).`,
    );
  }

  const ep = manifest.entrypoints ?? {};
  let toolboxFragment: ExtensionToolboxFragment | undefined;
  let theme: ExtensionThemeFragment | undefined;
  let blockTypes: Record<string, string> = {};
  let i18n: Record<string, Record<string, string>> = {};

  if (ep.toolbox) {
    toolboxFragment = await readJson(
      io,
      io.resolveUrl(packId, ep.toolbox),
    );
  }
  if (ep.theme) {
    theme = await readJson(io, io.resolveUrl(packId, ep.theme));
  }
  if (ep.blockTypes) {
    blockTypes = await readJson(io, io.resolveUrl(packId, ep.blockTypes));
  }
  if (ep.i18n) {
    i18n = await loadI18n(io, packId, ep.i18n);
  }

  if (ep.blocksJson && !ep.blocksJs) {
    const blocksJson = await readJson<{ blocks?: object[] }>(
      io,
      io.resolveUrl(packId, ep.blocksJson),
    );
    if (Array.isArray(blocksJson.blocks)) {
      Blockly.defineBlocksWithJsonArray(blocksJson.blocks);
    }
  }

  if (ep.blocksJs) {
    const mod = await io.importModule(io.resolveUrl(packId, ep.blocksJs));
    const defineBlocks = mod.defineBlocks as
      | ((ctx: Record<string, unknown>) => void)
      | undefined;
    if (typeof defineBlocks === "function") {
      defineBlocks({
        Blockly,
        getBlocklyMsgOr,
        getBlocklyCompatibleChecks,
        enforceIntOnlyValueInputs,
        getPwmPinOptions,
        getDigitalPinOptions: () =>
          getBoardDropdownOptions(getSelectedBoardId()).digital,
        getAnalogPinOptions: () =>
          getBoardDropdownOptions(getSelectedBoardId()).analog,
        style: manifest.style?.blocks ?? "servo_blocks",
        FieldInstance,
        Instances,
        updateInstancePresenceWarning,
      });
    }
  }

  if (ep.generatorArduinoJs) {
    const mod = await io.importModule(
      io.resolveUrl(packId, ep.generatorArduinoJs),
    );
    const register = mod.registerArduinoGenerators as
      | ((ctx: Record<string, unknown>) => void)
      | undefined;
    if (typeof register === "function") {
      register({ arduinoGenerator, Order });
    }
  }

  if (manifest.pinDropdowns) {
    registerExtensionPinDropdowns(manifest.pinDropdowns);
  }

  for (const [type, check] of Object.entries(blockTypes)) {
    BLOCK_TYPE_REGISTRY[type] = check;
  }

  if (theme) {
    applyExtensionThemeFragment(theme);
  }

  const loaded: LoadedExtension = {
    id: manifest.id,
    manifest,
    toolboxFragment,
    theme,
    i18n,
    blockTypes,
  };
  registerLoadedExtension(loaded);
  return loaded;
}
