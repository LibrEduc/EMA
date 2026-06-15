/**
 * @packageDocumentation
 * @module Arduino.BlockTypesRegistry
 * @description Block types registry - centralized type definitions for all blocks.
 * @remarks
 * Loads block type definitions and applies them to Blockly blocks.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 *
 * This module loads block type definitions from block_types.json and applies them to Blockly blocks.
 *
 * Runtime compatibility checks (including Blockly aliases) are documented in
 * `docs/TYPES_ET_COMPATIBILITES.md`.
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
export type BlockTypeFunction = (block: Blockly.Block) => string;
export type BlockTypeDefinition = string | BlockTypeFunction;
/**
 * Registry of block types loaded from block_types.json
 */
export declare const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition>;
/** Infers int/float from a math_number field value. */
export declare function identifyMathNumberType(numString: string | number | null | undefined): "int" | "float";
/**
 * Get compatible types for a given type (for use with setCheck)
 * @param type - The target type
 * @returns Array of compatible types (including the type itself)
 */
/**
 * Returns Blockly check types compatible with a given µcBlockly type.
 * @param type - Normalized type string.
 * @returns Array of checks or null when unavailable.
 */
export declare function getCompatibleTypesForCheck(type: string | null | undefined): string[] | null;
/**
 * Check if a source type is compatible with a target type
 * @param sourceType - The source type (block output)
 * @param targetType - The target type (input expected)
 * @returns true if compatible
 */
/**
 * Checks whether two types are compatible for connection.
 * @param sourceType - Source type from the connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export declare function checkTypeCompatibility(sourceType: string | null | undefined, targetType: string | null | undefined): boolean;
/**
 * Apply type definitions to all blocks in the registry
 * This function should be called after Blockly is loaded
 */
/**
 * Applies registered block type metadata to Blockly blocks.
 */
export declare function applyBlockTypesFromRegistry(): void;
//# sourceMappingURL=block_types_registry.d.ts.map