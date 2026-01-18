/**
 * @packageDocumentation Block definitions for typed variables
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";
import { debugLog } from "./debug";
import { getCompatibleTypesForCheck, checkTypeCompatibility } from "./block_types_registry";
import { getVariableTypeOptions } from "./block_types";

const getBlocklyMsg = (key: string): string => {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg || key;
};

const getUntypedWarningText = (): string => getBlocklyMsg("TYPED_VAR_UNTYPED_WARNING");

const getTypeMismatchWarningText = (varType: string, connectedType: string): string =>
  getBlocklyMsg("TYPED_VAR_TYPE_MISMATCH")
    .replace("%1", varType)
    .replace("%2", connectedType);

const normalizeBlocklyTypeToVariableType = (type: string): string => {
  if (type === "Boolean") return "bool";
  if (type === "Number") return "int";
  if (type === "String") return "string";
  return type;
};

const configureTypedVariableField = (field: Blockly.FieldVariable): void => {
  const fieldWithTypes = field as unknown as {
    variableTypes?: string[] | null;
    defaultType?: string;
  };
  fieldWithTypes.variableTypes = null;
  fieldWithTypes.defaultType = '';
};

type VariableWithMutableType = Blockly.VariableModel & {
  setType?: (type: string) => void;
  type_?: string;
  __ucbManualType?: boolean;
};

const getVariableTypeDropdownOptions = (): Blockly.MenuOption[] =>
  getVariableTypeOptions().map((type) => [type, type] as Blockly.MenuOption);

/**
 * Define the variables_get_dynamic block
 */
export function defineVariablesGetDynamicBlock(): void {
  Blockly.Blocks['variables_get_dynamic'] = {
    init: function(this: Blockly.Block) {
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendDummyInput()
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          );
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setOutput(true);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_GET_TOOLTIP'));
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
      } catch (error) {
        debugLog('Variable not found:', variableId, error);
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
      } catch (error) {
        debugLog('Error updating variable type check:', error);
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
      // Use Field.SKIP_SETUP to prevent automatic creation of default 'item' variable
      // This is the same approach used by Blockly's built-in variable blocks
      this.appendValueInput('VALUE')
          .setCheck(null)
          .appendField(getBlocklyMsg('TYPED_VAR_SET_LABEL'))
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          )
          .appendField(getBlocklyMsg('TYPED_VAR_TO_LABEL'));
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_SET_TOOLTIP'));
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
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      
      // If variable is 'item', clear it immediately to prevent blocking menus
      if (variableId) {
        try {
          const variable = this.workspace.getVariableMap().getVariableById(variableId);
          if (variable && variable.getName() === 'item') {
            // Clear the field to prevent 'item' from being used
            const varField = this.getField('VAR') as Blockly.FieldVariable | null;
            if (varField) {
              varField.setValue(null);
            }
            this.setWarningText(null);
            return;
          }
        } catch (error) {
          // Variable might have been deleted, continue
          debugLog('Variable lookup failed in variables_set_dynamic:', error);
        }
      }
      
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
        const isNoType = !varType || varType === '__NO_TYPE__';
        if (isNoType) {
          this.setWarningText(getUntypedWarningText());
        }
        
        // Update the input check to accept compatible types (e.g., float accepts int)
        const valueInput = this.getInput('VALUE');
        if (valueInput && valueInput.connection) {
          if (!varType || isNoType) {
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
            
            if ((!varType || isNoType) && connectedType) {
              const normalizedType = normalizeBlocklyTypeToVariableType(connectedType);
              if (
                normalizedType &&
                normalizedType !== "__NO_TYPE__" &&
                normalizedType !== "null" &&
                normalizedType !== "undefined"
              ) {
                // Update variable type immediately for smoother inference.
                const typedVariable = variable as VariableWithMutableType;
                if (typedVariable.__ucbManualType) {
                  return;
                }
                if (typeof typedVariable.setType === "function") {
                  typedVariable.setType(normalizedType);
                } else if ("type_" in typedVariable) {
                  typedVariable.type_ = normalizedType;
                }
                const compatibleTypes = getCompatibleTypesForCheck(normalizedType);
                valueInput.connection.setCheck(compatibleTypes);
                this.setWarningText(null);
                return;
              }
            } else if (varType && connectedType && !checkTypeCompatibility(connectedType, varType)) {
              const normalizedType = normalizeBlocklyTypeToVariableType(connectedType);
              if (
                normalizedType &&
                normalizedType !== "__NO_TYPE__" &&
                normalizedType !== "null" &&
                normalizedType !== "undefined"
              ) {
                // Prefer inference: update variable type from the connected block.
                const typedVariable = variable as VariableWithMutableType;
                if (typedVariable.__ucbManualType) {
                  this.setWarningText(getTypeMismatchWarningText(varType, connectedType));
                  if (valueInput.connection && valueInput.connection.targetBlock()) {
                    valueInput.connection.disconnect();
                  }
                  return;
                }
                if (typeof typedVariable.setType === "function") {
                  typedVariable.setType(normalizedType);
                } else if ("type_" in typedVariable) {
                  typedVariable.type_ = normalizedType;
                }
                const compatibleTypes = getCompatibleTypesForCheck(normalizedType);
                valueInput.connection.setCheck(compatibleTypes);
                this.setWarningText(null);
                return;
              }

              // Type mismatch: show warning and disconnect if no valid inference.
              this.setWarningText(getTypeMismatchWarningText(varType, connectedType));
              if (valueInput.connection && valueInput.connection.targetBlock()) {
                valueInput.connection.disconnect();
              }
            } else {
              if (!isNoType) {
                this.setWarningText(null);
              }
            }
          } else {
            if (!isNoType) {
              this.setWarningText(null);
            }
          }
        }
      } catch (error) {
        debugLog('Error in variables_set_dynamic onchange:', error);
        this.setWarningText(null);
      }
    }
  };
}

/**
 * Define the variables_set_type block
 */
export function defineVariablesSetTypeBlock(): void {
  Blockly.Blocks['variables_set_type'] = {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField(getBlocklyMsg('TYPED_VAR_TYPE_SET_LABEL'))
          .appendField(
            new Blockly.FieldVariable(Blockly.Field.SKIP_SETUP, undefined, null, ''),
            'VAR',
          )
          .appendField(getBlocklyMsg('TYPED_VAR_TYPE_TO_LABEL'))
          .appendField(
            new Blockly.FieldDropdown(getVariableTypeDropdownOptions),
            'TYPE',
          );
      const varField = this.getField('VAR') as Blockly.FieldVariable | null;
      if (varField) {
        configureTypedVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("variable_dynamic_blocks");
      this.setTooltip(getBlocklyMsg('VARIABLES_SET_TOOLTIP'));
      this.setHelpUrl('');
    },
    onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (event.type !== Blockly.Events.BLOCK_CHANGE && 
          event.type !== Blockly.Events.BLOCK_CREATE &&
          event.type !== Blockly.Events.BLOCK_MOVE &&
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_RENAME &&
          event.type !== Blockly.Events.VAR_DELETE &&
          event.type !== Blockly.Events.VAR_CREATE) {
        return;
      }
      const variableId = this.getFieldValue('VAR');
      const typeField = this.getField('TYPE') as Blockly.FieldDropdown | null;
      if (!variableId || !typeField) {
        return;
      }

      const selectedType = typeField.getValue();
      if (!selectedType) {
        return;
      }

      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field" &&
        (event as Blockly.Events.BlockChange).name === "TYPE"
      ) {
        try {
          const variable = this.workspace.getVariableMap().getVariableById(variableId);
          if (variable && variable.getType() !== selectedType) {
            const typedVariable = variable as VariableWithMutableType;
            if (typeof typedVariable.setType === "function") {
              typedVariable.setType(selectedType);
            } else if ("type_" in typedVariable) {
              typedVariable.type_ = selectedType;
            }
            typedVariable.__ucbManualType = true;
          }
        } catch (error) {
          debugLog('Error setting variable type:', error);
        }
        return;
      }

      try {
        const variable = this.workspace.getVariableMap().getVariableById(variableId);
        if (!variable) {
          return;
        }
        const varType = variable.getType();
        if (varType && varType !== selectedType) {
          typeField.setValue(varType);
        }
      } catch (error) {
        debugLog('Error syncing variable type:', error);
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
      } catch (error) {
        debugLog('Variable not found:', variableId, error);
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
      
      // If variable is 'item', clear it immediately
      if (variableId) {
        try {
          const variable = this.workspace.getVariableMap().getVariableById(variableId);
          if (variable && variable.getName() === 'item') {
            // Clear the field to prevent 'item' from being used
            const varField = this.getField('VAR') as Blockly.FieldVariable | null;
            if (varField) {
              varField.setValue(null);
            }
            this.setOutput(true, '__NO_TYPE__');
            return;
          }
        } catch (error) {
          // Variable might have been deleted, continue
          debugLog('Variable lookup failed in variables_set:', error);
        }
      }
      
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
      } catch (error) {
        debugLog('Error updating variable type check:', error);
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
          event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE &&
          event.type !== Blockly.Events.VAR_DELETE) {
        return;
      }
      
      const variableId = this.getFieldValue('VAR');
      
      // If variable is 'item', clear it immediately to prevent blocking menus
      if (variableId) {
        try {
          const variable = this.workspace.getVariableMap().getVariableById(variableId);
          if (variable && variable.getName() === 'item') {
            // Clear the field to prevent 'item' from being used
            const varField = this.getField('VAR') as Blockly.FieldVariable | null;
            if (varField) {
              varField.setValue(null);
            }
            this.setWarningText(null);
            return;
          }
        } catch (error) {
          // Variable might have been deleted, continue
          debugLog('Variable lookup failed in variables_set:', error);
        }
      }
      
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
        const isNoType = !varType || varType === '__NO_TYPE__';
        if (isNoType) {
          this.setWarningText(getUntypedWarningText());
        }
        const valueInput = this.getInput('VALUE');
        if (valueInput && valueInput.connection) {
          if (!varType || isNoType) {
            // Variable has no type yet - accept all types to allow type inference
            valueInput.connection.setCheck(null);
          } else {
            // Variable has a type - only accept compatible types
            const compatibleTypes = getCompatibleTypesForCheck(varType);
            valueInput.connection.setCheck(compatibleTypes);
          }
        }
      } catch (error) {
        debugLog('Error in variables_set onchange:', error);
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
  defineVariablesSetTypeBlock();
  
  // Also extend the standard blocks to support type checking
  extendStandardVariablesGetBlock();
  extendStandardVariablesSetBlock();
  
  debugLog('Blocs de variables typées définis avec succès');
}
