/**
 * Type definitions for @blockly/plugin-strict-connection-checker
 */
declare module '@blockly/plugin-strict-connection-checker' {
  import * as Blockly from 'blockly/core';

  export class StrictConnectionChecker extends Blockly.ConnectionChecker {
    constructor();
    doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean;
  }

  export const pluginInfo: {
    [Blockly.registry.Type.CONNECTION_CHECKER]: string;
  };

  export const registrationName: string;
  export const registrationType: Blockly.registry.Type;
}
