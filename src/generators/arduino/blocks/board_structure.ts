/**
 * @packageDocumentation
 * @module Arduino.Generators.Board.Structure
 * @description Arduino generators for setup/loop, comment, include, and define.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "../arduino_generator";

import { commentFromField } from "./libre";

/**
 * Board base setup.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_setup(block: Block, generator: ArduinoGenerator): string {
  let code = generator.statementToCode(block, "SETUP") || "";
  code = generator.scrubArduino_(block, code);
  // Always register setup, even when empty → emits `void setup() {}`.
  generator.addSetup("base_setup", code);
  return "";
}

/**
 * Board base setup loop.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_setup_loop(block: Block, generator: ArduinoGenerator): string {
  let setupCode = generator.statementToCode(block, "SETUP") || "";
  setupCode = generator.scrubArduino_(block, setupCode, true);
  generator.addSetup("base_setup", setupCode);
  let loopCode = generator.statementToCode(block, "LOOP") || "";
  loopCode = generator.scrubArduino_(block, loopCode, true);
  // Always register loop, even when empty → emits `void loop() {}`.
  generator.addLoop("base_loop", loopCode);
  return "";
}

/**
 * Board base loop.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function board_base_loop(block: Block, generator: ArduinoGenerator): string {
  let code = generator.statementToCode(block, "LOOP") || "";
  code = generator.scrubArduino_(block, code);
  // Always register loop, even when empty → emits `void loop() {}`.
  generator.addLoop("base_loop", code);
  return "";
}

/**
 * Bloc commentaire Blockly@rduino : `// texte`.
 * @param block - Blockly block instance.
 * @param _generator - Code generator instance.
 * @returns Result string.
 */
export function comment(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

/**
 * Bloc include librarie Blockly@rduino : `#include <Nom.h>`.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function include_library(block: Block, generator: ArduinoGenerator): string {
  const raw = (block.getFieldValue("FILE") as string) || "";
  const name = raw.trim().replace(/[<>"\\]/g, "");
  if (name) {
    generator.addInclude(`lib_${name}`, `#include <${name}.h>`);
  }
  return "";
}

/**
 * Conteneur Define : code global (commentaires, etc.) avant setup/loop.
 * @param block - Blockly block instance.
 * @param generator - Code generator instance.
 * @returns Result string.
 */
export function define(block: Block, generator: ArduinoGenerator): string {
  let code = generator.statementToCode(block, "DEFINE") || "";
  code = generator.scrubArduino_(block, code);
  const trimmed = code.trimEnd();
  if (trimmed) {
    generator.addPreamble(`define_${block.id}`, trimmed + "\n");
  }
  return "";
}
