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
/**
 * Type mapping from BlocklyArduino types to Arduino types
 * Based on the types defined in src/types/ folder (extracted from BlocklyArduino)
 */
type BlockTypeFunction = (block: Blockly.Block) => string;
type BlockTypeDefinition = string | BlockTypeFunction;
/**
 * Registry of block types loaded from block_types.json
 */
export declare const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition>;
/**
 * Get compatible types for a given type (for use with setCheck)
 * @param type - The target type
 * @returns Array of compatible types (including the type itself)
 */
export declare function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null;
/**
 * Check if a source type is compatible with a target type
 * @param sourceType - The source type (block output)
 * @param targetType - The target type (input expected)
 * @returns true if compatible
 */
export declare function checkTypeCompatibility(sourceType: string | null | undefined, targetType: string | null | undefined): boolean;
/**
 * Apply type definitions to all blocks in the registry
 * This function should be called after Blockly is loaded
 */
export declare function applyBlockTypesFromRegistry(): void;
export {};
//# sourceMappingURL=block_types_registry.d.ts.map