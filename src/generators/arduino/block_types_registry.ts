/**
 * @packageDocumentation Block types registry - Centralized type definitions for all blocks
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * 
 * This module loads block type definitions from block_types.json and applies them to Blockly blocks.
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { BLOCK_TYPES } from "./block_types/index";
import { getCompatibleTypes, isTypeCompatible } from "./block_types";
import { debugLog } from "./debug";

/**
 * Type mapping from BlocklyArduino types to Arduino types
 * Based on the types defined in src/types/ folder (extracted from BlocklyArduino)
 */
type BlockTypeFunction = (block: Blockly.Block) => string;
type BlockTypeDefinition = string | BlockTypeFunction;

/**
 * Registry of block types loaded from block_types.json
 */
export const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition> = {};

/**
 * Identify number type (int or float) from a string
 * @param numString - The number as a string
 * @returns 'int' or 'float'
 */
function identifyNumber(numString: string): string {
  if (!numString) return 'int';
  
  // Check if it contains a decimal point or scientific notation
  if (numString.includes('.') || numString.includes('e') || numString.includes('E')) {
    return 'float';
  }
  
  // Try to parse as number to check range
  const num = Number.parseFloat(numString);
  if (!Number.isNaN(num)) {
    // Integers are int, decimals are float
    if (num % 1 === 0) {
      return 'int';
    }
    return 'float';
  }
  
  return 'int';
}

/**
 * Dynamic type functions map
 */
const DYNAMIC_TYPE_FUNCTIONS: Record<string, BlockTypeFunction> = {
  'ternary': (block: Blockly.Block): string => {
    // Ternary returns the type of the THEN or ELSE branch
    const thenBlock = block.getInputTargetBlock('THEN');
    const elseBlock = block.getInputTargetBlock('ELSE');
    if (thenBlock) {
      const blockDef = thenBlock as Blockly.Block & { getBlockType?: () => string };
      if (blockDef.getBlockType) {
        return blockDef.getBlockType() || 'int';
      }
    }
    if (elseBlock) {
      const blockDef = elseBlock as Blockly.Block & { getBlockType?: () => string };
      if (blockDef.getBlockType) {
        return blockDef.getBlockType() || 'int';
      }
    }
    return 'int';
  },
  'identifyNumber': (block: Blockly.Block): string => {
    const numString = block.getFieldValue('NUM');
    return identifyNumber(numString);
  },
};

/**
 * Initialize the block type registry from block_types.ts
 */
function initializeBlockTypeRegistry(): void {
  if (!BLOCK_TYPES || Object.keys(BLOCK_TYPES).length === 0) {
    console.warn('⚠️ Aucune définition de type trouvée dans block_types.ts');
    return;
  }

  for (const [blockType, typeDef] of Object.entries(BLOCK_TYPES)) {
    // Check if it's a dynamic type (starts with __DYNAMIC__)
    if (typeof typeDef === 'string' && typeDef.startsWith('__DYNAMIC__')) {
      const dynamicTypeName = typeDef.replace('__DYNAMIC__', '');
      const dynamicFunction = DYNAMIC_TYPE_FUNCTIONS[dynamicTypeName];
      if (dynamicFunction) {
        BLOCK_TYPE_REGISTRY[blockType] = dynamicFunction;
      } else {
        console.warn(`⚠️ Type dynamique '${dynamicTypeName}' non trouvé pour le bloc '${blockType}'`);
        // Fallback to 'int'
        BLOCK_TYPE_REGISTRY[blockType] = 'int';
      }
    } else {
      // Static type (simple string)
      BLOCK_TYPE_REGISTRY[blockType] = typeDef as string;
    }
  }

  debugLog(`✅ Registre de types initialisé avec ${Object.keys(BLOCK_TYPE_REGISTRY).length} blocs depuis block_types.ts`);
}

/**
 * Get compatible types for a given type (for use with setCheck)
 * @param type - The target type
 * @returns Array of compatible types (including the type itself)
 */
export function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null {
  if (!type) {
    return null; // No type restriction
  }
  
  const compatibleTypes = getCompatibleTypes(type);
  
  // If only one type (itself), return it as a string for Blockly
  // If multiple types, return as array
  if (compatibleTypes.length === 1) {
    return [compatibleTypes[0]];
  }
  
  return compatibleTypes;
}

/**
 * Check if a source type is compatible with a target type
 * @param sourceType - The source type (block output)
 * @param targetType - The target type (input expected)
 * @returns true if compatible
 */
export function checkTypeCompatibility(
  sourceType: string | null | undefined,
  targetType: string | null | undefined,
): boolean {
  if (!sourceType || !targetType) {
    return false;
  }

  // Treat Blockly types as compatible with internal types.
  const numericTypes = new Set(["Number", "number", "int", "float"]);
  if (numericTypes.has(sourceType) && numericTypes.has(targetType)) {
    return true;
  }

  if (
    (sourceType === "Boolean" || sourceType === "bool") &&
    (targetType === "Boolean" || targetType === "bool")
  ) {
    return true;
  }

  return isTypeCompatible(sourceType, targetType);
}

/**
 * Apply type definitions to all blocks in the registry
 * This function should be called after Blockly is loaded
 */
export function applyBlockTypesFromRegistry(): void {
  // Initialize registry if not already done
  if (Object.keys(BLOCK_TYPE_REGISTRY).length === 0) {
    initializeBlockTypeRegistry();
  }

  let appliedCount = 0;
  
  for (const [blockType, typeDef] of Object.entries(BLOCK_TYPE_REGISTRY)) {
    const blockDef = Blockly.Blocks[blockType];
    if (blockDef !== undefined) {
      const blockDefinition = blockDef as Blockly.Block & { getBlockType?: BlockTypeFunction };
      
      if (typeof typeDef === 'string') {
        // Simple type (string)
        blockDefinition.getBlockType = function(this: Blockly.Block): string {
          return typeDef;
        };
        appliedCount++;
      } else if (typeof typeDef === 'function') {
        // Dynamic type (function) - bind to the block instance.
        blockDefinition.getBlockType = function(this: Blockly.Block): string {
          return typeDef(this);
        };
        appliedCount++;
      }
    }
  }
  
  debugLog(`✅ Types appliqués à ${appliedCount} blocs depuis le registre`);
}

// Initialize the registry when the module is loaded
initializeBlockTypeRegistry();
