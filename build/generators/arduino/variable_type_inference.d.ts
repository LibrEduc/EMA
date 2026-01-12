/**
 * @packageDocumentation Variable type inference - Automatically update variable types based on block connections
 * @author scanet@libreduc.cc (Sébastien Canet)
 *
 * This module implements automatic type inference for variables based on their usage in blocks.
 * When a variable is used in different contexts, its type is automatically updated to match.
 * This is similar to the approach used in BlocklyArduino.
 */
/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import * as Blockly from "blockly";
/**
 * Update variable types based on block connections
 * This function analyzes all variable usages and updates their types automatically
 * @param workspace - The workspace to analyze
 */
export declare function inferAndUpdateVariableTypes(workspace: Blockly.Workspace): void;
//# sourceMappingURL=variable_type_inference.d.ts.map