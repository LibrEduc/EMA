/**
 * @packageDocumentation
 * @module Arduino.Diagnostic
 * @description Diagnostic tools for Arduino generator issues.
 * @remarks
 * Diagnostic helpers for generator output and typed variables.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ArduinoGenerator } from './arduino_generator';
/**
 * Diagnostic function to identify why code generation is not working
 */
/**
 * Runs diagnostics to validate generator wiring and block coverage.
 * @param generator - Arduino generator instance.
 */
export declare function diagnoseGeneratorIssues(generator: ArduinoGenerator): void;
/**
 * Test function to verify basic generator functionality
 */
/**
 * Runs a minimal generation pass to validate output.
 * @param generator - Arduino generator instance.
 */
export declare function testBasicGeneration(generator: ArduinoGenerator): void;
/**
 * Function to reset and reinitialize the generator
 */
/**
 * Resets generator state and reinitializes configuration.
 * @param generator - Arduino generator instance.
 */
export declare function resetAndReinitializeGenerator(generator: ArduinoGenerator): void;
//# sourceMappingURL=diagnostic.d.ts.map