/**
 * @fileoverview Custom ConnectionChecker that uses getBlockType() for type checking.
 * This provides more robust type checking than the default ConnectionChecker,
 * especially for blocks with dynamic types (like typed variables).
 * @author scanet@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from 'blockly/core';

/**
 * Custom ConnectionChecker that extends Blockly's default ConnectionChecker
 * to use getBlockType() for source blocks, providing stricter type checking.
 */
export class StrictConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Override canConnect to add logging and ensure our custom logic is called.
   * This is the main entry point for connection checking in Blockly.
   */
  canConnect(
    a: Blockly.Connection | null,
    b: Blockly.Connection | null,
    isDragging: boolean,
    opt_distance?: number
  ): boolean {
    // First, do the standard checks (connection types, etc.)
    const standardResult = super.canConnect(a, b, isDragging, opt_distance);
    if (!standardResult || !a || !b) {
      return standardResult;
    }

    // Then do our custom type checks
    return this.doTypeChecks(a, b);
  }

  /**
   * Override doTypeChecks to use getBlockType() when available.
   * This is the key method that checks type compatibility.
   * 
   * @param a Connection to compare.
   * @param b Connection to compare against.
   * @returns True if the connections share a type.
   */
  doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean {
    // Determine which connection is the source (output) and which is the target (input)
    let sourceConnection: Blockly.Connection | null = null;
    let targetConnection: Blockly.Connection | null = null;

    if (a.type === Blockly.ConnectionType.OUTPUT_VALUE || a.type === Blockly.ConnectionType.PREVIOUS_STATEMENT) {
      sourceConnection = a;
      targetConnection = b;
    } else if (b.type === Blockly.ConnectionType.OUTPUT_VALUE || b.type === Blockly.ConnectionType.PREVIOUS_STATEMENT) {
      sourceConnection = b;
      targetConnection = a;
    } else {
      // Neither is a source connection, use standard check
      return super.doTypeChecks(a, b);
    }

    // If we have a source connection, check if the block has getBlockType()
    // We check this FIRST to be stricter than the standard checker
    if (sourceConnection && targetConnection) {
      const sourceBlock = sourceConnection.getSourceBlock();
      
      // First, try to get type from getBlockType() if available (this is the most reliable)
      let sourceType: string | null | undefined = null;
      if (sourceBlock && typeof (sourceBlock as any).getBlockType === 'function') {
        sourceType = (sourceBlock as any).getBlockType();
        console.log(`🔍 [StrictChecker] getBlockType() retourne: '${sourceType}' pour bloc ${sourceBlock.type}`);
      }
      
      // If getBlockType() is not available, try to get from connection check
      if (sourceType === null || sourceType === undefined) {
        const sourceCheck = sourceConnection.getCheck();
        console.log(`🔍 [StrictChecker] getCheck() retourne:`, sourceCheck, 'pour bloc', sourceBlock?.type);
        if (sourceCheck) {
          // If it's an array, take the first element (or handle it)
          if (Array.isArray(sourceCheck) && sourceCheck.length > 0) {
            sourceType = sourceCheck[0] as string;
          } else if (typeof sourceCheck === 'string') {
            sourceType = sourceCheck;
          }
        }
      }
      
      // If sourceType is '__NO_TYPE__' or 'undefined', block all typed connections
      // This is our special type for untyped variables
      if (sourceType === '__NO_TYPE__' || sourceType === 'undefined') {
        const targetCheck = targetConnection.getCheck();
        console.log(`🔍 [StrictChecker] Source type='${sourceType}', target check=`, targetCheck);
        // If target has a type check (like 'Boolean'), block the connection
        if (targetCheck) {
          const targetChecks = Array.isArray(targetCheck) ? targetCheck : [targetCheck];
          // If target expects a specific type, block the connection
          // Filter out null/undefined from the checks
          const validChecks = targetChecks.filter(check => check !== null && check !== undefined && check !== '__NO_TYPE__');
          if (validChecks.length > 0) {
            console.log(`🚫 [StrictChecker] Blocage: source='${sourceType}' ne peut pas se connecter à target='${validChecks.join(',')}'`);
            return false;
          }
        }
        // If target has no type check, allow connection (untyped can connect to untyped)
        console.log(`✅ [StrictChecker] Autorisation: source='${sourceType}' peut se connecter à target non typé`);
        return true;
      }

      // Get the target connection's check
      const targetCheck = targetConnection.getCheck();
      
      // If target has no check, allow connection (untyped input accepts all)
      if (!targetCheck || (Array.isArray(targetCheck) && targetCheck.length === 0)) {
        return true;
      }

      // If sourceType is null/undefined and target has a check, use standard check
      if (sourceType === null || sourceType === undefined) {
        return super.doTypeChecks(a, b);
      }

      // Check if sourceType matches any of the target checks
      // targetCheck can be a string or an array of strings
      const targetChecks = Array.isArray(targetCheck) ? targetCheck : [targetCheck];
      
      // If sourceType matches any target check, allow connection
      for (const check of targetChecks) {
        if (check && this.checkTypeCompatibility(sourceType, check)) {
          return true;
        }
      }

      // No match found - connection not allowed
      console.log(`🚫 [StrictChecker] Blocage: source='${sourceType}' ne correspond pas à target='${targetChecks.join(',')}'`);
      return false;
    }

    // Fall back to standard check
    return super.doTypeChecks(a, b);
  }

  /**
   * Checks if two types are compatible.
   * 
   * @param sourceType The type from the source block (from getBlockType()).
   * @param targetType The type expected by the target connection.
   * @returns True if types are compatible, false otherwise.
   * @private
   */
  private checkTypeCompatibility(sourceType: string, targetType: string): boolean {
    // Exact match
    if (sourceType === targetType) {
      return true;
    }

    // Special case: Boolean type matching
    // Blockly uses 'Boolean' (capital B), we use 'bool'
    if ((sourceType === 'Boolean' || sourceType === 'bool') && 
        (targetType === 'Boolean' || targetType === 'bool')) {
      return true;
    }

    // Special case: null/undefined types
    if (sourceType === 'null' || sourceType === 'undefined' || 
        targetType === 'null' || targetType === 'undefined') {
      // null/undefined can only connect to null/undefined
      return sourceType === targetType;
    }

    // Default: strict equality
    return sourceType === targetType;
  }
}

/**
 * Registers the StrictConnectionChecker as the default ConnectionChecker for a workspace.
 * 
 * @param workspace The Blockly workspace to configure.
 */
export function registerStrictConnectionChecker(workspace: Blockly.Workspace): void {
  if (!workspace) {
    console.error('Cannot register StrictConnectionChecker: workspace is null');
    return;
  }

  // Create a new instance of the strict checker
  const strictChecker = new StrictConnectionChecker();
  
  // Set the connection checker on the workspace
  // Blockly uses connectionChecker property on the workspace
  (workspace as any).connectionChecker = strictChecker;
  
  // Also try to set it via the workspace SVG if available
  const workspaceSvg = workspace as Blockly.WorkspaceSvg;
  if (workspaceSvg && typeof (workspaceSvg as any).setConnectionChecker === 'function') {
    (workspaceSvg as any).setConnectionChecker(strictChecker);
  }
  
  console.log('✅ StrictConnectionChecker registered and active');
}
