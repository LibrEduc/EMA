/**
 * @packageDocumentation
 * @module Arduino
 * @description Arduino generator helpers for µcBlockly blocks
 * @remarks
 * Exposes the generator instance and wiring helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
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