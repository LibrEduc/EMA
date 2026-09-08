/**
 * @packageDocumentation
 * @module Arduino.BlockTypesRegistry
 * @description Block types registry - centralized type definitions for all blocks.
 * @remarks
 * Loads block type definitions and applies them to Blockly blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { BLOCK_TYPES } from "./block_types/index";
import { debugLog } from "./debug";
import {
  DYNAMIC_TYPE_FUNCTIONS,
  type BlockTypeFunction,
} from "./block_types_dynamic";

export type {
  BlockTypeFunction,
  VariableTypeForBlockResolver,
} from "./block_types_dynamic";
export { registerVariableTypeForBlockResolver } from "./block_types_dynamic";

export {
  identifyMathNumberType,
  inferArrayElementTypeFromInputs,
  inferArrayElementTypeFromBlock,
  hasArrayListConnectedElements,
  findAllListDeclarationBlocks,
  findListDeclarationBlock,
  isPrimaryListDeclarationBlock,
  hasDuplicateListDeclaration,
  inferListVariableElementType,
  inferArrayGetIndexElementType,
} from "./block_types_array_infer";

export {
  getCompatibleTypesForCheck,
  checkTypeCompatibility,
} from "./block_types_compat";

/**
 * Type mapping from Blockly check types to µcBlockly internal types.
 */
export type BlockTypeDefinition = string | BlockTypeFunction;

/**
 * Registry of block types loaded from `block_types/`.
 */
export const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition> = {};

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

  debugLog(`✅ Type registry initialized with ${Object.keys(BLOCK_TYPE_REGISTRY).length} blocks from block_types.ts`);
}

/**
 * Applies registered block type metadata to Blockly blocks.
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
        blockDefinition.getBlockType = function (this: Blockly.Block): string {
          return typeDef;
        };
        appliedCount++;
      } else if (typeof typeDef === 'function') {
        // Dynamic type (function) - bind to the block instance.
        blockDefinition.getBlockType = function (this: Blockly.Block): string {
          return typeDef(this);
        };
        appliedCount++;
      }
    }
  }

  debugLog(`✅ Types applied to ${appliedCount} blocks from registry`);
}

// Initialize the registry when the module is loaded
initializeBlockTypeRegistry();
