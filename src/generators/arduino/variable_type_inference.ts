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
import { checkTypeCompatibility } from "./block_types_registry";

/**
 * Infer the expected type from a block's input connection
 * @param input - The input connection
 * @returns The expected type or null if unknown
 */
function inferTypeFromInput(input: Blockly.Input): string | null {
  if (!input.connection) {
    return null;
  }
  
  // Get the target block connected to this input
  const targetBlock = input.connection.targetBlock();
  if (!targetBlock) {
    return null;
  }
  
  // Check if the block has a getBlockType method
  const blockDef = targetBlock as Blockly.Block & { getBlockType?: () => string | null };
  if (blockDef.getBlockType) {
    return blockDef.getBlockType() || null;
  }
  
  return null;
}

/**
 * Infer the expected type from a block's output connection check
 * @param outputConnection - The output connection
 * @returns The expected type or null if unknown
 */
function inferTypeFromOutputCheck(outputConnection: Blockly.Connection): string | null {
  if (!outputConnection) {
    return null;
  }
  
  // Check what types this connection accepts
  const check = outputConnection.getCheck();
  if (!check) {
    return null; // Accepts all types
  }
  
  // If it's a single type string, return it
  if (typeof check === 'string') {
    return check;
  }
  
  // If it's an array, return the first type (preferred type)
  if (Array.isArray(check) && check.length > 0) {
    return check[0] as string;
  }
  
  return null;
}

/**
 * Find all blocks that use a specific variable
 * @param workspace - The workspace
 * @param variableId - The variable ID
 * @returns Array of blocks using the variable
 */
function findBlocksUsingVariable(workspace: Blockly.Workspace, variableId: string): Blockly.Block[] {
  const blocks: Blockly.Block[] = [];
  const allBlocks = workspace.getAllBlocks(false);
  
  console.log(`🔍 [Type Inference] Recherche de blocs utilisant la variable ID '${variableId}' parmi ${allBlocks.length} blocs`);
  
  for (const block of allBlocks) {
    // Check if this is a variable block (dynamic or standard)
    if (block.type === 'variables_get_dynamic' || block.type === 'variables_set_dynamic' ||
        block.type === 'variables_get' || block.type === 'variables_set') {
      const varId = block.getFieldValue('VAR');
      if (varId === variableId) {
        console.log(`  ✓ Bloc trouvé: ${block.type} utilisant la variable '${variableId}'`);
        blocks.push(block);
      }
    }
  }
  
  console.log(`  → Total: ${blocks.length} blocs trouvés`);
  return blocks;
}

/**
 * Get expected type for a block input based on block type
 * @param parentBlock - The parent block that has the input
 * @param inputName - The name of the input
 * @returns The expected type or null if unknown
 */
/**
 * Convert Blockly's type name to our internal type name
 * @param blocklyType - Blockly type name (e.g., 'Boolean', 'Number')
 * @returns Our internal type name (e.g., 'bool', 'int')
 */
function convertBlocklyTypeToInternalType(blocklyType: string | string[] | null): string | null {
  if (!blocklyType) {
    return null;
  }
  
  if (Array.isArray(blocklyType)) {
    if (blocklyType.length > 0) {
      return convertBlocklyTypeToInternalType(blocklyType[0]);
    }
    return null;
  }
  
  // Convert Blockly types to our internal types
  const typeMap: Record<string, string> = {
    'Boolean': 'bool',
    'Number': 'int',
    'String': 'string',
  };
  
  return typeMap[blocklyType] || blocklyType;
}

/**
 * Get expected type for a block input based on block type
 * @param parentBlock - The parent block that has the input
 * @param inputName - The name of the input
 * @returns The expected type or null if unknown
 */
function getExpectedTypeFromBlockInput(parentBlock: Blockly.Block, inputName: string): string | null {
  // First, check if the input has a setCheck configured
  const input = parentBlock.getInput(inputName);
  if (input && input.connection) {
    const check = input.connection.getCheck();
    const convertedType = convertBlocklyTypeToInternalType(check);
    if (convertedType) {
      return convertedType;
    }
  }
  
  // Otherwise, infer from block type
  // Logic blocks expect bool
  if (parentBlock.type === 'controls_if' || parentBlock.type === 'controls_ifelse') {
    // IF inputs expect bool
    if (inputName && inputName.startsWith('IF')) {
      return 'bool';
    }
  } else if (parentBlock.type === 'logic_compare' || parentBlock.type === 'logic_operation') {
    // Logic comparison and operations expect bool or numeric types
    // Could be bool, int, or float - we'll let the connection check handle this
  } else if (parentBlock.type === 'math_arithmetic' || parentBlock.type === 'math_single') {
    // Math blocks expect numeric types (int or float)
    // Prefer float for operations that might produce decimals
    if (parentBlock.type === 'math_single') {
      return 'float';
    }
    return 'int';
  }
  
  return null;
}

/**
 * Infer the type expected for a variable based on its usage in blocks
 * @param workspace - The workspace
 * @param variableId - The variable ID
 * @returns The inferred type or null if unknown
 */
function inferVariableType(workspace: Blockly.Workspace, variableId: string): string | null {
  const blocks = findBlocksUsingVariable(workspace, variableId);
  const expectedTypes: string[] = [];
  
  console.log(`🔍 [Type Inference] Variable ID '${variableId}' utilisée dans ${blocks.length} blocs`);
  
  for (const block of blocks) {
    console.log(`  🔍 Analyse du bloc ${block.type}`);
    
    if (block.type === 'variables_get_dynamic' || block.type === 'variables_get') {
      // For variables_get, check where it's connected (output)
      if (block.outputConnection) {
        const connectedInput = block.outputConnection.targetConnection;
        if (connectedInput) {
          console.log(`    → Connexion de sortie trouvée, parent: ${connectedInput.getSourceBlock()?.type || 'null'}`);
          
          // First try to get from the connection's check
          const check = connectedInput.getCheck();
          const convertedType = convertBlocklyTypeToInternalType(check);
          if (convertedType) {
            console.log(`    → Type détecté depuis check: ${convertedType}`);
            expectedTypes.push(convertedType);
          }
          
          // Also try to infer from the parent block type
          const parentBlock = connectedInput.getSourceBlock();
          if (parentBlock) {
            // Find which input this connection belongs to
            for (const input of parentBlock.inputList) {
              if (input.connection === connectedInput) {
                const expectedType = getExpectedTypeFromBlockInput(parentBlock, input.name || '');
                if (expectedType) {
                  console.log(`    → Type détecté depuis parent block (${input.name}): ${expectedType}`);
                  expectedTypes.push(expectedType);
                }
                break;
              }
            }
          }
        } else {
          console.log(`    → Aucune connexion de sortie`);
        }
      }
    } else if (block.type === 'variables_set_dynamic' || block.type === 'variables_set') {
      // For variables_set, check what's connected to VALUE input
      const valueInput = block.getInput('VALUE');
      if (valueInput && valueInput.connection) {
        const targetBlock = valueInput.connection.targetBlock();
        if (targetBlock) {
          console.log(`    → Bloc connecté à VALUE: ${targetBlock.type}`);
          
          // Try to get the block type using getBlockType
          const blockDef = targetBlock as Blockly.Block & { getBlockType?: () => string | null };
          if (blockDef.getBlockType) {
            const type = blockDef.getBlockType();
            if (type) {
              console.log(`    → Type détecté depuis getBlockType: ${type}`);
              expectedTypes.push(type);
            }
          }
          // Also try to infer from the block's output connection check
          else if (targetBlock.outputConnection) {
            const check = targetBlock.outputConnection.getCheck();
            const convertedType = convertBlocklyTypeToInternalType(check);
            if (convertedType) {
              console.log(`    → Type détecté depuis output check: ${convertedType}`);
              expectedTypes.push(convertedType);
            }
          }
        } else {
          console.log(`    → Aucun bloc connecté à VALUE`);
        }
      } else {
        console.log(`    → Pas d'input VALUE trouvé`);
      }
    }
  }
  
  // Only collect types from assignments (variables_set), not from usages (variables_get)
  // This ensures unidirectional type inference: child → parent (assignment → variable)
  const assignmentTypes: string[] = [];
  
  // Collect types only from assignments (variables_set)
  for (const block of blocks) {
    if (block.type === 'variables_set_dynamic' || block.type === 'variables_set') {
      // For variables_set, check what's connected to VALUE input
      const valueInput = block.getInput('VALUE');
      if (valueInput && valueInput.connection) {
        const targetBlock = valueInput.connection.targetBlock();
        if (targetBlock) {
          const blockDef = targetBlock as Blockly.Block & { getBlockType?: () => string | null };
          if (blockDef.getBlockType) {
            const type = blockDef.getBlockType();
            if (type) {
              assignmentTypes.push(type);
            }
          } else if (targetBlock.outputConnection) {
            const check = targetBlock.outputConnection.getCheck();
            const convertedType = convertBlocklyTypeToInternalType(check);
            if (convertedType) {
              assignmentTypes.push(convertedType);
            }
          }
        }
      }
    }
    // Ignore variables_get - we don't infer types from usages (parent → child)
  }
  
  console.log(`  → Types assignments: [${assignmentTypes.join(', ')}]`);
  
  // Only use assignments (child → parent direction), never use usages (parent → child)
  if (assignmentTypes.length > 0) {
    const firstAssignmentType = assignmentTypes[0];
    console.log(`  → Type depuis assignment: ${firstAssignmentType}`);
    return firstAssignmentType;
  }
  
  // No assignments detected - return null (will check if blocks are connected)
  console.log(`  → Aucun type détecté depuis assignments, retourne null`);
  return null;
}

/**
 * Update variable types based on block connections
 * This function analyzes all variable usages and updates their types automatically
 * @param workspace - The workspace to analyze
 */
export function inferAndUpdateVariableTypes(workspace: Blockly.Workspace): void {
  const variableMap = workspace.getVariableMap();
  const allVariables = variableMap.getAllVariables();
  
  console.log(`🔍 [Type Inference] Analyse de ${allVariables.length} variables`);
  
  for (const variable of allVariables) {
    const variableId = variable.getId();
    const currentType = variable.getType() || null;
    
    // Infer the expected type from block connections
    const inferredType = inferVariableType(workspace, variableId);
    
    console.log(`🔍 [Type Inference] Variable '${variable.getName()}' : type actuel='${currentType}', type inféré='${inferredType || 'null'}'`);
    
    // Check if blocks are connected to determine if we should revert to 'int'
    const blocks = findBlocksUsingVariable(workspace, variableId);
    const hasConnectedBlocks = blocks.some(block => {
      if (block.type === 'variables_set_dynamic' || block.type === 'variables_set') {
        const valueInput = block.getInput('VALUE');
        return valueInput && valueInput.connection && valueInput.connection.targetBlock();
      } else if (block.type === 'variables_get_dynamic' || block.type === 'variables_get') {
        return block.outputConnection && block.outputConnection.targetConnection;
      }
      return false;
    });
    
    if (inferredType && inferredType !== currentType) {
      console.log(`💡 [Type Inference] Changement nécessaire : '${variable.getName()}' : '${currentType}' → '${inferredType}'`);
      // Update the variable type using Blockly's internal API
      try {
        const varModel = variable as any;
        let typeUpdated = false;
        
        // Method 1: Try to use setType if it exists (internal API)
        if (typeof varModel.setType === 'function') {
          varModel.setType(inferredType);
          typeUpdated = true;
          console.log(`✅ Type mis à jour (setType): variable '${variable.getName()}' : '${currentType}' → '${inferredType}'`);
        } 
        // Method 2: Directly set the type_ property (private property)
        else if ('type_' in varModel) {
          varModel.type_ = inferredType;
          typeUpdated = true;
          console.log(`✅ Type mis à jour (type_): variable '${variable.getName()}' : '${currentType}' → '${inferredType}'`);
        }
        
        if (!typeUpdated) {
          console.warn(`⚠️ Impossible de modifier le type de la variable '${variable.getName()}' : '${currentType}' → '${inferredType}' (API non disponible)`);
        }
      } catch (e) {
        console.debug('Error updating variable type:', e);
      }
    } else if (!inferredType && !hasConnectedBlocks && currentType !== null) {
      // No type detected and no blocks connected - revert to default null
      console.log(`💡 [Type Inference] Aucun bloc connecté, retour à 'null' pour variable '${variable.getName()}'`);
      try {
        const varModel = variable as any;
        let typeReverted = false;
        
        // Method 1: Try to use setType if it exists (internal API)
        if (typeof varModel.setType === 'function') {
          varModel.setType(null);
          typeReverted = true;
          console.log(`✅ Type remis à 'null' (setType): variable '${variable.getName()}'`);
        } 
        // Method 2: Directly set the type_ property (private property)
        else if ('type_' in varModel) {
          varModel.type_ = null;
          typeReverted = true;
          console.log(`✅ Type remis à 'null' (type_): variable '${variable.getName()}'`);
          // Also try to delete the property if setting to null doesn't work
          if (varModel.type_ !== null) {
            delete varModel.type_;
            console.log(`  → Propriété type_ supprimée pour forcer le retour à null`);
          }
        }
        
        if (!typeReverted) {
          console.warn(`⚠️ Impossible de remettre le type à 'null' pour la variable '${variable.getName()}' (API non disponible)`);
        } else {
          // Verify the change
          const newType = variable.getType();
          console.log(`  → Vérification: type après mise à jour = '${newType || 'null'}'`);
        }
      } catch (e) {
        console.debug('Error reverting variable type to null:', e);
      }
    }
  }
}
