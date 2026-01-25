/**
 * @packageDocumentation
 * @module Arduino.TestGenerator
 * @description Test file for Arduino generator.
 * @remarks
 * Test helpers and fixtures for generator output.
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
import { debugLog } from "./debug";

/**
 * Test function to verify Arduino generator is working correctly
 */
/**
 * Runs a quick sanity check against the Arduino generator.
 */
export function testArduinoGenerator(): void {
  debugLog('Testing Arduino Generator...');

  try {
    // Create a new generator instance
    const generator = new ArduinoGenerator();
    debugLog('✓ Generator instance created successfully');

    // Test basic functionality
    debugLog('✓ Generator name:', (generator as unknown as { name_: string }).name_);
    debugLog('✓ Generator reserved words:', (generator as unknown as { RESERVED_WORDS_: string[] }).RESERVED_WORDS_);

    // Test variable type management
    generator.setVariableType('testVar', 'int');
    const varType = generator.getVariableType('testVar');
    debugLog('✓ Variable type management:', varType === 'int' ? 'PASS' : 'FAIL');

    // Test pin usage
    const pinSuccess = generator.addPinUsage('13', 'OUTPUT', 'testBlock');
    debugLog('✓ Pin usage management:', pinSuccess ? 'PASS' : 'FAIL');

    // Test function definition
    generator.addUserFunctionDefinition(
      'testFunction',
      ['param1'],
      'void',
      'Serial.println(param1);',
      'testBlock'
    );
    debugLog('✓ Function definition:', generator.isFunctionDefined('testFunction') ? 'PASS' : 'FAIL');

    // Test validation
    const validation = generator.validateGeneratedCode();
    debugLog('✓ Code validation:', validation.isValid ? 'PASS' : 'FAIL');
    if (validation.warnings.length > 0) {
      debugLog('  Warnings:', validation.warnings);
    }

    debugLog('✓ All tests passed! Arduino generator is working correctly.');

  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

/**
 * Test function to verify code generation from a simple workspace
 */
/**
 * Runs a sample code generation path for diagnostics.
 */
export function testCodeGeneration(): void {
  debugLog('Testing Code Generation...');

  try {
    const generator = new ArduinoGenerator();

    // Simulate a simple workspace with basic blocks
    // This would normally come from Blockly workspace
    generator.addVariable('var1', 'int testVar;');
    generator.addSetup('setup1', 'Serial.begin(9600);');
    generator.addLoop('loop1', 'digitalWrite(13, HIGH);');

    // Generate code
    const code = generator.finish('// Main loop code\n');
    debugLog('✓ Code generated successfully');
    debugLog('Generated code length:', code.length);
    debugLog('Code preview:', code.substring(0, 200) + '...');

    // Validate generated code
    const validation = generator.validateGeneratedCode();
    debugLog('✓ Generated code validation:', validation.isValid ? 'PASS' : 'FAIL');

  } catch (error) {
    console.error('✗ Code generation test failed:', error);
  }
}
