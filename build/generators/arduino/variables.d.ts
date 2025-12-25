/**
 * @packageDocumentation Variable block generators for Arduino
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import * as Blockly from "blockly";
import { ArduinoGenerator } from "./arduino_generator";
/**
 * Generator for variables_set block.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export declare const variables_set: (block: Blockly.Block, generator: ArduinoGenerator) => string | [string, number];
/**
 * Generator for variables_get block.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export declare const variables_get: (block: Blockly.Block, generator: ArduinoGenerator) => string | [string, number];
//# sourceMappingURL=variables.d.ts.map