/**
 * @packageDocumentation
 * @module Demo.Globals
 * @description Expose Blockly / Arduino generator / Monaco env on window for the demo.
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
import { arduinoGenerator } from "../generators/arduino";
import { debugLog } from "../generators/arduino/debug";

/** Injected at build time by Webpack DefinePlugin (watermark for leak detection). */
declare const __UCB_BUILD_FINGERPRINT__: string | undefined;

export type DemoGlobalWindow = Window & {
  MonacoEnvironment?: {
    getWorkerUrl: (moduleId: string, label: string) => string;
  };
  Blockly?: typeof Blockly;
  /** Build fingerprint (version-gitHash-date); set at build time for tracing. */
  __ucbBuildFingerprint__?: string;
  arduinoGenerator?: typeof arduinoGenerator;
};

/**
 * Wires demo globals (fingerprint, Monaco worker URL, Blockly, arduinoGenerator).
 */
export const exposeDemoGlobals = (): DemoGlobalWindow => {
  const globalWindow = window as DemoGlobalWindow;

  if (typeof __UCB_BUILD_FINGERPRINT__ !== "undefined") {
    globalWindow.__ucbBuildFingerprint__ = __UCB_BUILD_FINGERPRINT__;
  }

  globalWindow.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, _label: string) {
      return "./editor.worker.js";
    },
  };

  if (typeof window !== "undefined") {
    globalWindow.Blockly = {
      ...Blockly,
      Blocks: Blockly.Blocks,
      VERSION: Blockly.VERSION,
      inject: Blockly.inject,
      Workspace: Blockly.Workspace,
      WorkspaceSvg: Blockly.WorkspaceSvg,
      svgResize: Blockly.svgResize,
      registry: Blockly.registry,
      ToolboxCategory: Blockly.ToolboxCategory,
      Names: Blockly.Names,
      Variables: Blockly.Variables,
      utils: Blockly.utils,
    };
    debugLog("✅ Blockly and all its properties exposed globally");
    debugLog("Available properties:", Object.keys(globalWindow.Blockly));
  }

  if (typeof window !== "undefined") {
    globalWindow.arduinoGenerator = arduinoGenerator;
    debugLog("✅ arduinoGenerator and all its properties exposed globally");
    debugLog("Available arduinoGenerator properties:", Object.keys(arduinoGenerator));
  }

  return globalWindow;
};
