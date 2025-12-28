/**
 * @packageDocumentation Diagnostic tools for Arduino generator issues
 * @author scanet\@libreduc.cc (Sébastien Canet)
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
export declare function diagnoseGeneratorIssues(generator: ArduinoGenerator): void;
/**
 * Test function to verify basic generator functionality
 */
export declare function testBasicGeneration(generator: ArduinoGenerator): void;
/**
 * Function to reset and reinitialize the generator
 */
export declare function resetAndReinitializeGenerator(generator: ArduinoGenerator): void;
//# sourceMappingURL=diagnostic.d.ts.map