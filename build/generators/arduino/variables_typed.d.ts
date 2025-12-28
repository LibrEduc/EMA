/**
 * @packageDocumentation Typed variable block generators for Arduino
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import * as Blockly from "blockly";
import { ArduinoGenerator } from './arduino_generator';
/**
 * Generator for variables_set_dynamic block.
 * This block sets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export declare const variables_set_dynamic: (block: Blockly.Block, generator: ArduinoGenerator) => string | [string, number];
/**
 * Generator for variables_get_dynamic block.
 * This block gets the value of a typed variable.
 * @param block - The block to generate code for.
 * @param generator - The Arduino generator instance.
 * @returns Generated Arduino code.
 */
export declare const variables_get_dynamic: (block: Blockly.Block, generator: ArduinoGenerator) => string | [string, number];
//# sourceMappingURL=variables_typed.d.ts.map