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
 * This module loads block type definitions from `block_types/` and applies them to Blockly blocks.
 *
 * Runtime compatibility checks (including Blockly aliases) are documented in
 * `docs/TYPES_ET_COMPATIBILITES.md`.
 */
/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import * as Blockly from "blockly";
/**
 * Type mapping from Blockly check types to µcBlockly internal types.
 */
export type BlockTypeFunction = (block: Blockly.Block) => string;
export type BlockTypeDefinition = string | BlockTypeFunction;
/**
 * Registry of block types loaded from `block_types/`.
 */
export declare const BLOCK_TYPE_REGISTRY: Record<string, BlockTypeDefinition>;
/** Infers int/float from a math_number field value. */
export declare function identifyMathNumberType(numString: string | number | null | undefined): "int" | "float";
/**
 * Infers element type from named value inputs (e.g. Array_declare contenu/contenu2).
 * Numeric types unify (int + float → float); float literals promote to float.
 */
export declare function inferArrayElementTypeFromInputs(block: Blockly.Block, inputNames: string[]): string;
/**
 * Infers the element type of an Array_with block from all connected inputs.
 * Numeric types unify (int + float → float); float literals promote to float.
 */
export declare function inferArrayElementTypeFromBlock(block: Blockly.Block): string;
/** True when at least one ADD input has a connected value block. */
export declare function hasArrayListConnectedElements(block: Blockly.Block): boolean;
/**
 * Finds the list declaration block for a workspace variable id.
 */
export declare function findListDeclarationBlock(workspace: Blockly.Workspace, variableId: string): Blockly.Block | null;
/**
 * Element type (int, char, …) of a list variable from its declaration block.
 */
export declare function inferListVariableElementType(workspace: Blockly.Workspace | null, variableId: string | null | undefined): string;
export declare function inferArrayGetIndexElementType(block: Blockly.Block): string;
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