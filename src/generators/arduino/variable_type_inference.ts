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
import { debugLog } from "./debug";
import { clearVariableType, setVariableType } from "./variable_utils";

type ConnectionWithShadowDom = Blockly.Connection & {
  getShadowDom?: () => Element | null;
};

/**
 * Find all blocks that use a specific variable
 * @param workspace - The workspace
 * @param variableId - The variable ID
 * @returns Array of blocks using the variable
 */
function findBlocksUsingVariable(workspace: Blockly.Workspace, variableId: string): Blockly.Block[] {
  const blocks: Blockly.Block[] = [];
  const allBlocks = workspace.getAllBlocks(false);
  
  debugLog(`🔍 [Type Inference] Recherche de blocs utilisant la variable ID '${variableId}' parmi ${allBlocks.length} blocs`);
  
  for (const block of allBlocks) {
    // Check if this is a variable block (dynamic or standard or manual typing)
    if (block.type === 'variables_get_dynamic' || block.type === 'variables_set_dynamic' ||
        block.type === 'variables_get' || block.type === 'variables_set' ||
        block.type === 'variables_set_type') {
      const varId = block.getFieldValue('VAR');
      if (varId === variableId) {
        debugLog(`  ✓ Bloc trouvé: ${block.type} utilisant la variable '${variableId}'`);
        blocks.push(block);
      }
    }
  }
  
  debugLog(`  → Total: ${blocks.length} blocs trouvés`);
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

function inferProcedureCallReturnType(
  block: Blockly.Block,
): string | null {
  if (block.type !== "procedures_callreturn") {
    return null;
  }
  const name = block.getFieldValue?.("NAME");
  if (!name || !block.workspace) {
    return null;
  }
  const defBlock = Blockly.Procedures.getDefinition(name, block.workspace);
  const returnBlock = defBlock?.getInputTargetBlock?.("RETURN");
  if (!returnBlock) {
    return "int";
  }
  const blockDef = returnBlock as Blockly.Block & { getBlockType?: () => string | null };
  const rawType = blockDef.getBlockType ? blockDef.getBlockType() : null;
  const converted = convertBlocklyTypeToInternalType(rawType);
  if (converted) {
    return converted;
  }
  if (returnBlock.outputConnection) {
    const check = returnBlock.outputConnection.getCheck();
    return convertBlocklyTypeToInternalType(check);
  }
  return "int";
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
  
  debugLog(`🔍 [Type Inference] Variable ID '${variableId}' utilisée dans ${blocks.length} blocs`);
  
  for (const block of blocks) {
    debugLog(`  🔍 Analyse du bloc ${block.type}`);
    
    if (block.type === 'variables_get_dynamic' || block.type === 'variables_get') {
      // For variables_get, check where it's connected (output)
      if (block.outputConnection) {
        const connectedInput = block.outputConnection.targetConnection;
        if (connectedInput) {
          debugLog(`    → Connexion de sortie trouvée, parent: ${connectedInput.getSourceBlock()?.type || 'null'}`);
          
          // First try to get from the connection's check
          const check = connectedInput.getCheck();
          const convertedType = convertBlocklyTypeToInternalType(check);
          if (convertedType) {
            debugLog(`    → Type détecté depuis check: ${convertedType}`);
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
                  debugLog(`    → Type détecté depuis parent block (${input.name}): ${expectedType}`);
                  expectedTypes.push(expectedType);
                }
                break;
              }
            }
          }
        } else {
          debugLog(`    → Aucune connexion de sortie`);
        }
      }
    } else if (block.type === 'variables_set_dynamic' || block.type === 'variables_set') {
      // For variables_set, check what's connected to VALUE input
      const valueInput = block.getInput('VALUE');
      if (valueInput && valueInput.connection) {
        const targetBlock = valueInput.connection.targetBlock();
        if (targetBlock) {
          debugLog(`    → Bloc connecté à VALUE: ${targetBlock.type}`);
          
          // Try to get the block type using getBlockType
          const blockDef = targetBlock as Blockly.Block & { getBlockType?: () => string | null };
          if (blockDef.getBlockType) {
            const type = blockDef.getBlockType();
            if (type) {
              debugLog(`    → Type détecté depuis getBlockType: ${type}`);
              expectedTypes.push(type);
            }
          }
          // Also try to infer from the block's output connection check
          else if (targetBlock.outputConnection) {
            const check = targetBlock.outputConnection.getCheck();
            const convertedType = convertBlocklyTypeToInternalType(check);
            if (convertedType) {
              debugLog(`    → Type détecté depuis output check: ${convertedType}`);
              expectedTypes.push(convertedType);
            }
          }
        } else {
          debugLog(`    → Aucun bloc connecté à VALUE`);
        }
      } else {
        debugLog(`    → Pas d'input VALUE trouvé`);
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
        // Try to get the connected block
        // Use targetConnection to get the source connection, then getSourceBlock()
        // This is more reliable than targetBlock() in some cases
        const targetConnection = valueInput.connection.targetConnection;
        const targetBlock = targetConnection ? targetConnection.getSourceBlock() : 
                          valueInput.connection.targetBlock();
        
        if (targetBlock) {
          debugLog(`    → Bloc connecté à VALUE (assignment): ${targetBlock.type}`);
          
          // First, try to use getBlockType() if available (this is what StrictConnectionChecker uses)
          const blockDef = targetBlock as Blockly.Block & { getBlockType?: () => string | null };
          if (blockDef.getBlockType) {
            const type = blockDef.getBlockType();
            if (type && type !== '__NO_TYPE__' && type !== 'null' && type !== 'undefined') {
              // Convert Blockly types to internal types
              const internalType = convertBlocklyTypeToInternalType(type) || type;
              debugLog(`    → Type détecté depuis getBlockType (assignment): ${internalType} (original: ${type})`);
              assignmentTypes.push(internalType);
            } else {
              debugLog(`    → getBlockType() retourne: ${type} (ignoré)`);
              const procType = inferProcedureCallReturnType(targetBlock);
              if (procType) {
                debugLog(`    → Type détecté depuis procedures_callreturn (assignment): ${procType}`);
                assignmentTypes.push(procType);
              }
            }
          } else if (targetBlock.type === "procedures_callreturn") {
            const procType = inferProcedureCallReturnType(targetBlock);
            if (procType) {
              debugLog(`    → Type détecté depuis procedures_callreturn (assignment): ${procType}`);
              assignmentTypes.push(procType);
            }
          } 
          // Fallback: try to get from output connection check
          if (targetBlock.outputConnection) {
            const check = targetBlock.outputConnection.getCheck();
            const convertedType = convertBlocklyTypeToInternalType(check);
            if (convertedType) {
              debugLog(`    → Type détecté depuis output check (assignment): ${convertedType}`);
              assignmentTypes.push(convertedType);
            }
          }
        } else {
          debugLog(`    → Aucun bloc connecté à VALUE (assignment)`);
          // No block connected yet - check if there's a shadow block
          const shadowConnection = valueInput.connection as ConnectionWithShadowDom | null;
          const shadowDom = shadowConnection?.getShadowDom
            ? shadowConnection.getShadowDom()
            : null;
          if (shadowDom) {
            // Try to infer from shadow block type attribute
            const shadowType = shadowDom.getAttribute('type');
            if (shadowType) {
              const convertedType = convertBlocklyTypeToInternalType(shadowType);
              if (convertedType) {
                debugLog(`    → Type détecté depuis shadow block (assignment): ${convertedType}`);
                assignmentTypes.push(convertedType);
              }
            }
          }
        }
      }
    }
    // Ignore variables_get - we don't infer types from usages (parent → child)
  }
  
  debugLog(`  → Types assignments: [${assignmentTypes.join(', ')}]`);
  
  // Only use assignments (child → parent direction), never use usages (parent → child)
  if (assignmentTypes.length > 0) {
    const firstAssignmentType = assignmentTypes[0];
    debugLog(`  → Type depuis assignment: ${firstAssignmentType}`);
    return firstAssignmentType;
  }
  
  // No assignments detected - return null (will check if blocks are connected)
  debugLog(`  → Aucun type détecté depuis assignments, retourne null`);
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
  
  debugLog(`🔍 [Type Inference] Analyse de ${allVariables.length} variables`);
  
  for (const variable of allVariables) {
    if (!variable) {
      continue;
    }
    const manualType = (variable as { __ucbManualType?: boolean }).__ucbManualType === true;
    if (manualType) {
      debugLog(`🔒 [Type Inference] Variable '${variable.getName()}' typée manuellement, inférence ignorée`);
      continue;
    }
    const variableId = variable.getId();
    const currentType = variable.getType() || null;
    
    // Infer the expected type from block connections
    const inferredType = inferVariableType(workspace, variableId);
    
    debugLog(`🔍 [Type Inference] Variable '${variable.getName()}' : type actuel='${currentType}', type inféré='${inferredType || 'null'}'`);
    
    // Check if blocks are connected to determine if we should revert to 'int'
    const blocks = findBlocksUsingVariable(workspace, variableId);
    const manualTypeBlock = blocks.find(block => block.type === 'variables_set_type') || null;
    if (manualTypeBlock) {
      const selectedType = manualTypeBlock.getFieldValue('TYPE');
      if (selectedType && selectedType !== currentType) {
        try {
          if (setVariableType(variable, selectedType)) {
            debugLog(`✅ Type manuel appliqué: variable '${variable.getName()}' → '${selectedType}'`);
          } else {
            console.warn(
              `⚠️ Impossible de modifier le type de la variable '${variable.getName()}' : '${currentType}' → '${selectedType}' (API non disponible)`,
            );
          }
        } catch (e) {
          debugLog('Error applying manual type:', e);
        }
      }
      debugLog(`🔒 [Type Inference] Variable '${variable.getName()}' typée manuellement, inférence ignorée`);
      continue;
    }

    const hasConnectedBlocks = blocks.some(block => {
      if (block.type === 'variables_set_dynamic' || block.type === 'variables_set') {
        const valueInput = block.getInput('VALUE');
        return valueInput && valueInput.connection && valueInput.connection.targetBlock();
      } else if (block.type === 'variables_get_dynamic' || block.type === 'variables_get') {
        return block.outputConnection && block.outputConnection.targetConnection;
      } else if (block.type === 'variables_set_type') {
        return true;
      }
      return false;
    });
    
    if (inferredType && inferredType !== currentType) {
      debugLog(`💡 [Type Inference] Changement nécessaire : '${variable.getName()}' : '${currentType}' → '${inferredType}'`);
      // Update the variable type using Blockly's internal API
      try {
        if (setVariableType(variable, inferredType || '')) {
          debugLog(`✅ Type mis à jour: variable '${variable.getName()}' : '${currentType}' → '${inferredType}'`);
        } else {
          console.warn(
            `⚠️ Impossible de modifier le type de la variable '${variable.getName()}' : '${currentType}' → '${inferredType}' (API non disponible)`,
          );
        }
      } catch (e) {
        debugLog('Error updating variable type:', e);
      }
    } else if (!inferredType && !hasConnectedBlocks && currentType !== null) {
      // No type detected and no blocks connected - revert to default null
      debugLog(`💡 [Type Inference] Aucun bloc connecté, retour à 'null' pour variable '${variable.getName()}'`);
      try {
        if (clearVariableType(variable)) {
          debugLog(`✅ Type remis à 'null': variable '${variable.getName()}'`);
          // Verify the change
          const newType = variable.getType();
          debugLog(`  → Vérification: type après mise à jour = '${newType || 'null'}'`);
        } else {
          console.warn(
            `⚠️ Impossible de remettre le type à 'null' pour la variable '${variable.getName()}' (API non disponible)`,
          );
        }
      } catch (e) {
        debugLog('Error reverting variable type to null:', e);
      }
    }
  }
}
