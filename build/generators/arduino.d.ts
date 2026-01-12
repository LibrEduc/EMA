/**
 * @packageDocumentation Complete helper functions for generating Arduino for blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ArduinoGenerator } from './arduino/arduino_generator';
export * from './arduino/arduino_generator';
export * from './arduino/arduino_types';
export * from './arduino/diagnostic';
export * from './arduino/test_generator';
export * from './arduino/debug_variables_typed';
export * from './arduino/block_definitions';
export * from './arduino/block_types_registry';
/**
 * Arduino code generator instance.
 * {@type ArduinoGenerator}
 */
export declare const arduinoGenerator: ArduinoGenerator;
//# sourceMappingURL=arduino.d.ts.map