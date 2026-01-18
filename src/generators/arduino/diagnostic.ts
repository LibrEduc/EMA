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
import { debugLog } from "./debug";

/**
 * Diagnostic function to identify why code generation is not working
 */
export function diagnoseGeneratorIssues(generator: ArduinoGenerator): void {
  debugLog('🔍 Diagnosing Arduino Generator Issues...');
  
  try {
    // Check generator state
    const state = generator.debugGeneratorState();
    debugLog('📊 Generator State:', state);
    
    // Check registered generators
    const registeredTypes = generator.getRegisteredBlockTypes();
    debugLog('📝 Registered Block Types:', registeredTypes);
    
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
    
    debugLog('🔍 Checking critical block types:');
    criticalBlockTypes.forEach(blockType => {
      const hasGenerator = generator.hasGeneratorForBlockType(blockType);
      debugLog(`  ${blockType}: ${hasGenerator ? '✅' : '❌'}`);
    });
    
    // Check if variables_typed generators are properly registered
    const typedVarTypes = [
      'variables_set_dynamic',
      'variables_get_dynamic'
    ];
    
    debugLog('🔍 Checking typed variable generators:');
    typedVarTypes.forEach(blockType => {
      const hasGenerator = generator.hasGeneratorForBlockType(blockType);
      debugLog(`  ${blockType}: ${hasGenerator ? '✅' : '❌'}`);
    });
    
    // Provide recommendations
    debugLog('\n💡 Recommendations:');
    if (registeredTypes.length === 0) {
      debugLog('  1. Check if the generator modules are properly imported');
      debugLog('  2. Verify that the forBlock registration is working');
      debugLog('  3. Check for JavaScript errors in the console');
    }
    
    if (!generator.hasGeneratorForBlockType('variables_set')) {
      debugLog('  1. Basic variable generators are missing - check variables.ts import');
    }
    
    if (!generator.hasGeneratorForBlockType('logic_compare')) {
      debugLog('  1. Logic generators are missing - check logic.ts import');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

/**
 * Test function to verify basic generator functionality
 */
export function testBasicGeneration(generator: ArduinoGenerator): void {
  debugLog('🧪 Testing Basic Code Generation...');
  
  try {
    // Test 1: Basic variable generation
    generator.addVariable('test1', 'int testVar;');
    generator.addSetup('test1', 'Serial.begin(9600);');
    
    const code = generator.finish('// Test code\n');
    debugLog('✅ Basic code generation test passed');
    debugLog('Generated code length:', code.length);
    
    // Test 2: Check if the code contains expected elements
    if (code.includes('int testVar;')) {
      debugLog('✅ Variable declaration found in generated code');
    } else {
      debugLog('❌ Variable declaration missing from generated code');
    }
    
    if (code.includes('Serial.begin(9600);')) {
      debugLog('✅ Setup code found in generated code');
    } else {
      debugLog('❌ Setup code missing from generated code');
    }
    
    if (code.includes('void setup()')) {
      debugLog('✅ Setup function found in generated code');
    } else {
      debugLog('❌ Setup function missing from generated code');
    }
    
    if (code.includes('void loop()')) {
      debugLog('✅ Loop function found in generated code');
    } else {
      debugLog('❌ Loop function missing from generated code');
    }
    
  } catch (error) {
    console.error('❌ Basic generation test failed:', error);
  }
}

/**
 * Function to reset and reinitialize the generator
 */
export function resetAndReinitializeGenerator(generator: ArduinoGenerator): void {
  debugLog('🔄 Resetting and reinitializing generator...');
  
  try {
    // Reset generator state
    generator.resetForDebug();
    
    // Re-add some basic content
    generator.addVariable('reset1', 'int resetVar;');
    generator.addSetup('reset1', 'pinMode(13, OUTPUT);');
    
    debugLog('✅ Generator reset and reinitialized');
    
    // Test generation after reset
    const code = generator.finish('// Reset test code\n');
    debugLog('✅ Code generation after reset:', code.length > 0 ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Reset and reinitialization failed:', error);
  }
}
