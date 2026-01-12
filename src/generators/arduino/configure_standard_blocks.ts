/**
 * @packageDocumentation Configuration for standard Blockly blocks
 * @author scanet@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";

/**
 * Configure standard Blockly blocks to work with our type system
 * This should be called after Blockly is loaded
 */
export function configureStandardBlocks(): void {
  // Note: controls_if already uses 'Boolean' which is correct for Blockly
  // We map 'bool' to 'Boolean' in getBlockType of variables_get_dynamic
  // So controls_if will accept our variables with type 'bool' (mapped to 'Boolean')
  // No need to modify controls_if - it already uses 'Boolean' correctly
  
  console.log('✅ Blocs standards - controls_if utilise déjà "Boolean" (correct pour Blockly)');
}