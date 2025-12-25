/**
 * @packageDocumentation Block definitions for typed variables
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";

/**
 * Define the variables_get_dynamic block
 */
export function defineVariablesGetDynamicBlock(): void {
  Blockly.Blocks['variables_get_dynamic'] = {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldVariable('item'), 'VAR');
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Gets the value of a typed variable');
      this.setHelpUrl('');
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
          .appendField(new Blockly.FieldVariable('item'), 'VAR')
          .appendField('to');
      this.appendValueInput('VALUE')
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Sets the value of a typed variable');
      this.setHelpUrl('');
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
