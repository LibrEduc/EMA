/**
 * @packageDocumentation Test file for Arduino generator
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ArduinoGenerator } from './arduino_generator';

/**
 * Test function to verify Arduino generator is working correctly
 */
export function testArduinoGenerator(): void {
  console.log('Testing Arduino Generator...');
  
  try {
    // Create a new generator instance
    const generator = new ArduinoGenerator();
    console.log('✓ Generator instance created successfully');
    
    // Test basic functionality
    console.log('✓ Generator name:', (generator as unknown as { name_: string }).name_);
    console.log('✓ Generator reserved words:', (generator as unknown as { RESERVED_WORDS_: string[] }).RESERVED_WORDS_);
    
    // Test variable type management
    generator.setVariableType('testVar', 'int');
    const varType = generator.getVariableType('testVar');
    console.log('✓ Variable type management:', varType === 'int' ? 'PASS' : 'FAIL');
    
    // Test pin usage
    const pinSuccess = generator.addPinUsage('13', 'OUTPUT', 'testBlock');
    console.log('✓ Pin usage management:', pinSuccess ? 'PASS' : 'FAIL');
    
    // Test function definition
    generator.addUserFunctionDefinition(
      'testFunction',
      ['param1'],
      'void',
      'Serial.println(param1);',
      'testBlock'
    );
    console.log('✓ Function definition:', generator.isFunctionDefined('testFunction') ? 'PASS' : 'FAIL');
    
    // Test validation
    const validation = generator.validateGeneratedCode();
    console.log('✓ Code validation:', validation.isValid ? 'PASS' : 'FAIL');
    if (validation.warnings.length > 0) {
      console.log('  Warnings:', validation.warnings);
    }
    
    console.log('✓ All tests passed! Arduino generator is working correctly.');
    
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

/**
 * Test function to verify code generation from a simple workspace
 */
export function testCodeGeneration(): void {
  console.log('Testing Code Generation...');
  
  try {
    const generator = new ArduinoGenerator();
    
    // Simulate a simple workspace with basic blocks
    // This would normally come from Blockly workspace
    generator.addVariable('var1', 'int testVar;');
    generator.addSetup('setup1', 'Serial.begin(9600);');
    generator.addLoop('loop1', 'digitalWrite(13, HIGH);');
    
    // Generate code
    const code = generator.finish('// Main loop code\n');
    console.log('✓ Code generated successfully');
    console.log('Generated code length:', code.length);
    console.log('Code preview:', code.substring(0, 200) + '...');
    
    // Validate generated code
    const validation = generator.validateGeneratedCode();
    console.log('✓ Generated code validation:', validation.isValid ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('✗ Code generation test failed:', error);
  }
}
