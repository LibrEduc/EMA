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
export function diagnoseGeneratorIssues(generator: ArduinoGenerator): void {
  console.log('🔍 Diagnosing Arduino Generator Issues...');
  
  try {
    // Check generator state
    const state = generator.debugGeneratorState();
    console.log('📊 Generator State:', state);
    
    // Check registered generators
    const registeredTypes = generator.getRegisteredBlockTypes();
    console.log('📝 Registered Block Types:', registeredTypes);
    
    // Check for common issues
    if (registeredTypes.length === 0) {
      console.error('❌ CRITICAL: No block generators are registered!');
      console.error('This is why code generation is not working.');
    }
    
    // Check specific block types
    const criticalBlockTypes = [
      'variables_set',
      'variables_get',
      'logic_compare',
      'controls_if'
    ];
    
    console.log('🔍 Checking critical block types:');
    criticalBlockTypes.forEach(blockType => {
      const hasGenerator = generator.hasGeneratorForBlockType(blockType);
      console.log(`  ${blockType}: ${hasGenerator ? '✅' : '❌'}`);
    });
    
    // Check if variables_typed generators are properly registered
    const typedVarTypes = [
      'variables_set_dynamic',
      'variables_get_dynamic'
    ];
    
    console.log('🔍 Checking typed variable generators:');
    typedVarTypes.forEach(blockType => {
      const hasGenerator = generator.hasGeneratorForBlockType(blockType);
      console.log(`  ${blockType}: ${hasGenerator ? '✅' : '❌'}`);
    });
    
    // Provide recommendations
    console.log('\n💡 Recommendations:');
    if (registeredTypes.length === 0) {
      console.log('  1. Check if the generator modules are properly imported');
      console.log('  2. Verify that the forBlock registration is working');
      console.log('  3. Check for JavaScript errors in the console');
    }
    
    if (!generator.hasGeneratorForBlockType('variables_set')) {
      console.log('  1. Basic variable generators are missing - check variables.ts import');
    }
    
    if (!generator.hasGeneratorForBlockType('logic_compare')) {
      console.log('  1. Logic generators are missing - check logic.ts import');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

/**
 * Test function to verify basic generator functionality
 */
export function testBasicGeneration(generator: ArduinoGenerator): void {
  console.log('🧪 Testing Basic Code Generation...');
  
  try {
    // Test 1: Basic variable generation
    generator.addVariable('test1', 'int testVar;');
    generator.addSetup('test1', 'Serial.begin(9600);');
    
    const code = generator.finish('// Test code\n');
    console.log('✅ Basic code generation test passed');
    console.log('Generated code length:', code.length);
    
    // Test 2: Check if the code contains expected elements
    if (code.includes('int testVar;')) {
      console.log('✅ Variable declaration found in generated code');
    } else {
      console.log('❌ Variable declaration missing from generated code');
    }
    
    if (code.includes('Serial.begin(9600);')) {
      console.log('✅ Setup code found in generated code');
    } else {
      console.log('❌ Setup code missing from generated code');
    }
    
    if (code.includes('void setup()')) {
      console.log('✅ Setup function found in generated code');
    } else {
      console.log('❌ Setup function missing from generated code');
    }
    
    if (code.includes('void loop()')) {
      console.log('✅ Loop function found in generated code');
    } else {
      console.log('❌ Loop function missing from generated code');
    }
    
  } catch (error) {
    console.error('❌ Basic generation test failed:', error);
  }
}

/**
 * Function to reset and reinitialize the generator
 */
export function resetAndReinitializeGenerator(generator: ArduinoGenerator): void {
  console.log('🔄 Resetting and reinitializing generator...');
  
  try {
    // Reset generator state
    generator.resetForDebug();
    
    // Re-add some basic content
    generator.addVariable('reset1', 'int resetVar;');
    generator.addSetup('reset1', 'pinMode(13, OUTPUT);');
    
    console.log('✅ Generator reset and reinitialized');
    
    // Test generation after reset
    const code = generator.finish('// Reset test code\n');
    console.log('✅ Code generation after reset:', code.length > 0 ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Reset and reinitialization failed:', error);
  }
}
