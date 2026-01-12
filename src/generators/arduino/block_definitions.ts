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
      // Initialize with 'undefined' type to prevent connections until a variable is selected
      if (this.outputConnection) {
        this.outputConnection.setCheck('undefined');
      }
      this.setColour(330);
      this.setTooltip('Gets the value of a typed variable');
      this.setHelpUrl('');
      // Force update of connection check after initialization
      // Use setTimeout to ensure the block is fully initialized
      setTimeout(() => {
        if (this.outputConnection && this.onchange) {
          // Update the check type by calling onchange with a minimal event
          try {
            const variableId = this.getFieldValue('VAR');
            if (variableId) {
              const variable = this.workspace.getVariableMap().getVariableById(variableId);
              if (variable) {
                const varType = variable.getType();
                if (!varType) {
                  this.outputConnection.setCheck('undefined');
                } else {
                  const blocklyType = varType === 'bool' ? 'Boolean' : varType;
                  this.outputConnection.setCheck(blocklyType);
                }
              } else {
                this.outputConnection.setCheck('undefined');
              }
            } else {
              this.outputConnection.setCheck('undefined');
            }
          } catch (e) {
            // Ignore errors during initialization
          }
        }
      }, 0);
    },
    /**
     * Returns the type of the variable stored in this block.
     * Inspired by Blockly's standard variables_get_dynamic implementation.
     * Returns the variable type directly, or null if no type is set.
     */
    getBlockType: function(this: Blockly.Block): string | null {
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        // No variable selected - return a unique type that won't match anything
        return 'undefined';
      }
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          // If no type is set, return 'undefined' to prevent incompatible connections
          // Blockly will use this in ConnectionChecker to verify compatibility
          if (!varType || varType === 'null') {
            return 'undefined';
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
      // Default to 'undefined' to prevent connections
      // This type will not match 'Boolean' or any other typed input
      return 'undefined';
    },
    /**
     * Called when the block changes (variable selection, etc.).
     * Updates the output connection check to match the variable type.
     * Inspired by how Blockly's standard blocks handle types.
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
      
      // Always update the check type, regardless of event type (but after filtering)
      // This ensures the connection type is always correct
      if (!this.outputConnection) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      if (!variableId) {
        this.outputConnection.setCheck('undefined');
        return;
      }
      
      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (variable) {
          const varType = variable.getType();
          if (!varType) {
            // No type set - use 'undefined' to prevent connections to typed inputs
            this.outputConnection.setCheck('undefined');
          } else {
            // Map our internal types to Blockly types
            let blocklyType: string;
            if (varType === 'bool') {
              blocklyType = 'Boolean';
            } else {
              blocklyType = varType;
            }
            this.outputConnection.setCheck(blocklyType);
          }
        } else {
          // Variable not found - set to 'undefined' to prevent all connections
          this.outputConnection.setCheck('undefined');
        }
      } catch (e) {
        console.debug('Error updating variable type check:', e);
        this.outputConnection.setCheck('undefined');
      }
      
      // Force Blockly to re-check connection compatibility by requesting workspace update
      // This ensures that any existing connections are re-validated
      if (this.workspace && (this.workspace as any).render) {
        // Trigger a connection check update
        Blockly.Events.fire(new Blockly.Events.BlockChange(
          this,
          'field',
          'VAR',
          null,
          this.getFieldValue('VAR')
        ));
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
        // If variable has no type, default to null
        const typeToUse = varType || null;
        
        // Update the input check to accept compatible types (e.g., float accepts int)
        const valueInput = this.getInput('VALUE');
        if (valueInput && valueInput.connection) {
          const compatibleTypes = getCompatibleTypesForCheck(typeToUse);
          valueInput.connection.setCheck(compatibleTypes);
          
          // Check if the connected block is compatible
          const connectedBlock = this.getInputTargetBlock('VALUE');
          if (connectedBlock) {
            const blockDef = connectedBlock as Blockly.Block & { getBlockType?: () => string | null };
            const connectedType = blockDef.getBlockType ? blockDef.getBlockType() : null;
            
            if (connectedType && !checkTypeCompatibility(connectedType, typeToUse)) {
              // Type mismatch: show warning and disconnect
              this.setWarningText(`Type incompatible: la variable est de type '${typeToUse}' mais reçoit '${connectedType}'`);
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
 * Define all typed variable blocks
 */
export function defineAllTypedVariableBlocks(): void {
  defineVariablesGetDynamicBlock();
  defineVariablesSetDynamicBlock();
  
  console.log('Blocs de variables typées définis avec succès');
}
