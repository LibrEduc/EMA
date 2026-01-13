/**
 * @packageDocumentation Block definitions for typed variables
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";
import { getCompatibleTypesForCheck, checkTypeCompatibility } from "./block_types_registry";

/**
 * Define the variables_get_dynamic block
 */
export function defineVariablesGetDynamicBlock(): void {
  Blockly.Blocks['variables_get_dynamic'] = {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldVariable(null), 'VAR');
      this.setOutput(true);
      this.setColour(330);
      this.setTooltip('Gets the value of a typed variable');
      this.setHelpUrl('');
    },
    /**
     * Returns the type of the variable stored in this block.
     * This is used by Blockly's ConnectionChecker to verify type compatibility.
     * Returns the variable type, mapped to Blockly's type system.
     */
    getBlockType: function(this: Blockly.Block): string | null {
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        // No variable selected - return a type that won't match anything
        // Blockly will use this to prevent connections
        return '__NO_TYPE__';
      }
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            // Variable has no type - return a type that won't match typed inputs
            return '__NO_TYPE__';
          }
          // Map our internal types to Blockly types
          // Blockly uses 'Boolean' (capital B), we use 'bool'
          if (varType === 'bool') {
            return 'Boolean';
          }
          // Other types remain the same (int, float, string, char, array)
          return varType;
        }
      } catch (e) {
        console.debug('Variable not found:', variableId);
      }
      // Variable not found - return a type that won't match anything
      return '__NO_TYPE__';
    },
    /**
     * Called when the block changes (variable selection, etc.).
     * Updates the output connection type using setOutput() so the ConnectionChecker can verify it.
     * Note: setCheck() on output connections doesn't work - we must use setOutput(true, type).
     */
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        // No variable selected - block all typed connections
        // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
        this.setOutput(true, '__NO_TYPE__');
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            // Variable has no type - block all typed connections
            // Use '__NO_TYPE__' to prevent connections to typed inputs (like Boolean)
            this.setOutput(true, '__NO_TYPE__');
          } else {
            // Map our internal types to Blockly types
            // Blockly uses 'Boolean' (capital B), we use 'bool'
            const blocklyType = varType === 'bool' ? 'Boolean' : varType;
            // setOutput(true, type) sets the check on the output connection
            // This is what the ConnectionChecker actually verifies
            this.setOutput(true, blocklyType);
          }
        } else {
          // Variable not found - block all typed connections
          this.setOutput(true, '__NO_TYPE__');
        }
      } catch (e) {
        console.debug('Error updating variable type check:', e);
        this.setOutput(true, '__NO_TYPE__');
      }
    }
  };
}

/**
 * Define the variables_set_dynamic block
 */
export function defineVariablesSetDynamicBlock(): void {
  Blockly.Blocks['variables_set_dynamic'] = {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField('set')
          .appendField(new Blockly.FieldVariable(null), 'VAR')
          .appendField('to');
      this.appendValueInput('VALUE')
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Sets the value of a typed variable');
      this.setHelpUrl('');
    },
    /**
     * Called when the block changes (variable selection, value connection, etc.).
     * Validates that the assigned value type matches the variable type.
     * If incompatible, suggests changing the variable type or shows a warning.
     */
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        this.setWarningText(null);
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (!variable) {
          this.setWarningText(null);
          return;
        }
        
        const varType = variable.getType();
        
        // Update the input check to accept compatible types (e.g., float accepts int)
        const valueInput = this.getInput('VALUE');
        if (valueInput && valueInput.connection) {
          if (!varType) {
            // Variable has no type yet - accept all types to allow type inference
            // This allows typed blocks (like 'true' with Boolean) to connect and infer the variable type
            valueInput.connection.setCheck(null);
          } else {
            // Variable has a type - only accept compatible types
            const compatibleTypes = getCompatibleTypesForCheck(varType);
            valueInput.connection.setCheck(compatibleTypes);
          }
          
          // Check if the connected block is compatible
          const connectedBlock = this.getInputTargetBlock('VALUE');
          if (connectedBlock) {
            const blockDef = connectedBlock as Blockly.Block & { getBlockType?: () => string | null };
            const connectedType = blockDef.getBlockType ? blockDef.getBlockType() : null;
            
            if (!varType && connectedType) {
              // Variable has no type but a block is connected - trigger type inference
              // The type inference system will update the variable type automatically
              this.setWarningText(null);
            } else if (varType && connectedType && !checkTypeCompatibility(connectedType, varType)) {
              // Type mismatch: show warning and disconnect
              this.setWarningText(`Type incompatible: la variable est de type '${varType}' mais reçoit '${connectedType}'`);
              // Disconnect the incompatible block
              if (valueInput.connection && valueInput.connection.targetBlock()) {
                valueInput.connection.disconnect();
              }
            } else {
              this.setWarningText(null);
            }
          } else {
            this.setWarningText(null);
          }
        }
      } catch (e) {
        console.debug('Error in variables_set_dynamic onchange:', e);
        this.setWarningText(null);
      }
    }
  };
}

/**
 * Extend the standard variables_get block to support type checking
 */
function extendStandardVariablesGetBlock(): void {
  // Add getBlockType to the standard variables_get block
  if (Blockly.Blocks['variables_get']) {
    Blockly.Blocks['variables_get'].getBlockType = function(this: Blockly.Block): string | null {
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        return '__NO_TYPE__';
      }
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            return '__NO_TYPE__';
          }
          // Map our internal types to Blockly types
          if (varType === 'bool') {
            return 'Boolean';
          }
          return varType;
        }
      } catch (e) {
        console.debug('Variable not found:', variableId);
      }
      return '__NO_TYPE__';
    };

    // Add onchange to update the output connection type
    const originalOnchange = Blockly.Blocks['variables_get'].onchange;
    Blockly.Blocks['variables_get'].onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }

      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_CREATE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        this.setOutput(true, '__NO_TYPE__');
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            this.setOutput(true, '__NO_TYPE__');
          } else {
            const blocklyType = varType === 'bool' ? 'Boolean' : varType;
            this.setOutput(true, blocklyType);
          }
        } else {
          this.setOutput(true, '__NO_TYPE__');
        }
      } catch (e) {
        console.debug('Error updating variable type check:', e);
        this.setOutput(true, '__NO_TYPE__');
      }
    };
  }
}

/**
 * Extend the standard variables_set block to support type checking
 */
function extendStandardVariablesSetBlock(): void {
  if (Blockly.Blocks['variables_set']) {
    const originalOnchange = Blockly.Blocks['variables_set'].onchange;
    Blockly.Blocks['variables_set'].onchange = function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      // Call original onchange if it exists
      if (originalOnchange) {
        originalOnchange.call(this, event);
      }

      // Only process relevant events
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        this.setWarningText(null);
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (!variable) {
          this.setWarningText(null);
          return;
        }
        
        const varType = variable.getType();
        const valueInput = this.getInput('VALUE');
        if (valueInput && valueInput.connection) {
          if (!varType) {
            // Variable has no type yet - accept all types to allow type inference
            valueInput.connection.setCheck(null);
          } else {
            // Variable has a type - only accept compatible types
            const compatibleTypes = getCompatibleTypesForCheck(varType);
            valueInput.connection.setCheck(compatibleTypes);
          }
        }
      } catch (e) {
        console.debug('Error in variables_set onchange:', e);
        this.setWarningText(null);
      }
    };
  }
}

/**
 * Define all typed variable blocks
 */
export function defineAllTypedVariableBlocks(): void {
  defineVariablesGetDynamicBlock();
  defineVariablesSetDynamicBlock();
  
  // Also extend the standard blocks to support type checking
  extendStandardVariablesGetBlock();
  extendStandardVariablesSetBlock();
  
  console.log('Blocs de variables typées définis avec succès');
}
