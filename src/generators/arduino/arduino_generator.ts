/**
 * @packageDocumentation
 * @module Arduino.Generator
 * @description Complete helper functions for generating Arduino for blocks.
 * @remarks
 * Defines the Arduino generator and block-to-code mappings.
 * Lot A/B/C split: pins, scrub, init vars, validate, debug helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  formatArduinoSketch,
  validatePinUsageWarnings,
} from "./arduino_code_format";
import { Order } from "./order";
import { recordPinUsage, type PinUsageMap } from "./arduino_generator_pins";
import {
  multilineQuoteArduinoString,
  quoteArduinoString,
  scrubArduinoBlockCode,
  scrubBlockCode,
  scrubNakedValue as scrubNakedValueLine,
} from "./arduino_generator_scrub";
import { collectAndDeclareInitVariables } from "./arduino_generator_init_vars";
import {
  buildArduinoGeneratorDebugState,
  createEmptyArduinoGeneratorBags,
} from "./arduino_generator_debug";
import {
  formatUserFunctionDefinition,
  validateGeneratedArduinoCode,
} from "./arduino_generator_validate";

export { Order } from "./order";

/**
 * Arduino code generator class.
 * Extends Blockly.CodeGenerator to provide Arduino-specific code generation.
 */
export class ArduinoGenerator extends Blockly.CodeGenerator {
  // Create a dictionary of definitions to be printed at the top of the sketch
  private includes_ = Object.create(null);
  // Create a dictionary of global definitions to be printed after variables
  private defines_ = Object.create(null);
  // Create a dictionary of variables
  private variables_ = Object.create(null);
  // Create a dictionary of variable types for proper declaration
  private variableTypes_ = Object.create(null);
  // Local variables keyed by scope id
  private localVariables_: Record<string, Record<string, string>> = Object.create(null);
  // Create a dictionary of functions from the code generator
  private codeFunctions_ = Object.create(null);
  // Create a dictionary of functions created by the user
  private userFunctions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions)
  protected functionNames_ = Object.create(null);
  // Create a dictionary of setups to be printed in the setup() function
  private setups_ = Object.create(null);
  // Create a dictionary of setups to be printed in the loop() function
  private loop_ = Object.create(null);
  // Create a dictionary of pins to check if their use conflicts
  private pins_: PinUsageMap = Object.create(null);
  /** Array declarations from Array_declare and Array_create blocks. */
  private arrayDeclarations_: string[] = [];
  /** Lignes émises par le bloc « define » (commentaires, etc.) avant setup/loop. */
  private preamble_: Record<string, string> = Object.create(null);

  /**
   * List of outer-inner pairings that do NOT require parentheses.
   */
  ORDER_OVERRIDES: [Order, Order][] = [
    // (foo()).bar -> foo().bar
    // (foo())[0] -> foo()[0]
    [Order.FUNCTION_CALL, Order.MEMBER],
    // (foo())() -> foo()()
    [Order.FUNCTION_CALL, Order.FUNCTION_CALL],
    // (foo.bar).baz -> foo.bar.baz
    // (foo.bar)[0] -> foo.bar[0]
    // (foo[0]).bar -> foo[0].bar
    // (foo[0])[1] -> foo[0][1]
    [Order.MEMBER, Order.MEMBER],
    // (foo.bar)() -> foo.bar()
    // (foo[0])() -> foo[0]()
    [Order.MEMBER, Order.FUNCTION_CALL],

    // !(!foo) -> !!foo
    [Order.LOGICAL_NOT, Order.LOGICAL_NOT],
    // a * (b * c) -> a * b * c
    [Order.MULTIPLICATION, Order.MULTIPLICATION],
    // a + (b + c) -> a + b + c
    [Order.ADDITION, Order.ADDITION],
    // a && (b && c) -> a && b && c
    [Order.LOGICAL_AND, Order.LOGICAL_AND],
    // a || (b || c) -> a || b || c
    [Order.LOGICAL_OR, Order.LOGICAL_OR],
  ];

  constructor(name = "Arduino") {
    super(name);

    for (const key in Order) {
      // Must assign Order[key] to a temporary to get the type guard to work;
      // see https://github.com/microsoft/TypeScript/issues/10530.
      const value = Order[key];
      // Skip reverse-lookup entries in the enum.  Due to
      // https://github.com/microsoft/TypeScript/issues/55713 this (as
      // of TypeScript 5.5.2) actually narrows the type of value to
      // never - but that still allows the following assignment to
      // succeed.
      if (typeof value === "string") continue;
      (this as unknown as Record<string, Order>)["ORDER_" + key] = value;
    }

    this.addReservedWords(
      "setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto," +
      "define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,integer," +
      "constants,floating,point,void,boolean,char,unsigned,byte,int,word,long," +
      "float,double,string,String,array,static,volatile,const,sizeof,pinMode," +
      "digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone," +
      "noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds," +
      "min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random," +
      "lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt," +
      "detachInterrupt,interrupts,noInterrupts" +
      Object.getOwnPropertyNames(globalThis).join(","),
    );
  }

  /**
   * Initialise the database of variable names.
   *
   * @param workspace - Workspace to generate code from.
   */
  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.resetGeneratorBags_();

    if (!this.nameDB_) {
      this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
    } else {
      this.nameDB_.reset();
    }

    this.nameDB_.setVariableMap(workspace.getVariableMap());
    this.nameDB_.populateVariables(workspace);
    this.nameDB_.populateProcedures(workspace);

    collectAndDeclareInitVariables(workspace, {
      nameDB: this.nameDB_,
      valueToCode: (block, name, order) =>
        this.valueToCode(block, name, order) || "",
      addArrayDeclaration: (declaration) =>
        this.addArrayDeclaration(declaration),
      setVariablesDefinition: (code) => {
        this.definitions_["variables"] = code;
      },
    });
  }

  /** Resets all mutable generator bags to empty dictionaries. */
  private resetGeneratorBags_(): void {
    const bags = createEmptyArduinoGeneratorBags();
    this.includes_ = bags.includes;
    this.defines_ = bags.defines;
    this.variables_ = bags.variables;
    this.variableTypes_ = bags.variableTypes;
    this.arrayDeclarations_ = bags.arrayDeclarations;
    this.preamble_ = bags.preamble;
    this.localVariables_ = bags.localVariables;
    this.codeFunctions_ = bags.codeFunctions;
    this.userFunctions_ = bags.userFunctions;
    this.functionNames_ = bags.functionNames;
    this.setups_ = bags.setups;
    this.loop_ = bags.loop;
    this.pins_ = bags.pins;
  }

  /**
   * Prepend the generated code with the variable definitions.
   *
   * @param code - Generated code.
   * @returns Completed code.
   */
  finish(code: string): string {
    const includes = Object.values(this.includes_);
    const defines = Object.values(this.defines_);
    const preamble = Object.values(this.preamble_);
    // Get variables from definitions_ (set in init()) and arrayDeclarations_
    const variablesDeclaration = this.definitions_["variables"] || '';
    const variables = [
      ...this.arrayDeclarations_,
      ...(variablesDeclaration ? [variablesDeclaration] : []),
    ];
    const codeFunctions = Object.values(this.codeFunctions_);
    const userFunctions = Object.values(this.userFunctions_);
    const functionNames = Object.values(this.functionNames_);
    const setups = Object.values(this.setups_);
    const loop = Object.values(this.loop_);
    // const pins = Object.values(this.pins_); // Used in validatePinUsage()

    // Call Blockly.CodeGenerator's finish.
    super.finish(code);

    this.nameDB_!.reset();

    // Validate pin usage and add warnings
    const pinWarnings = this.validatePinUsage();

    // Format the code with proper spacing and organization
    const newcode = formatArduinoSketch(
      {
        includes,
        defines,
        preamble,
        variables,
        codeFunctions,
        userFunctions,
        functionNames,
        setups,
        loop,
        code,
        pinWarnings,
      },
      this.INDENT ?? "  ",
    );

    return newcode;
  }

  /**
   * Validate pin usage and return warnings.
   * @returns Array of warning messages.
   */
  private validatePinUsage(): string[] {
    return validatePinUsageWarnings(this.getPinUsages());
  }

  addInclude(tag: string, code: string): void {
    if (this.includes_[tag] === undefined) {
      this.includes_[tag] = code;
    }
  }

  addDefinition(tag: string, code: string): void {
    if (this.defines_[tag] === undefined) {
      this.defines_[tag] = code;
    }
  }

  /** Contenu du bloc « define » Blockly@rduino (zone globale avant setup/loop). */
  addPreamble(tag: string, code: string): void {
    if (this.preamble_[tag] === undefined) {
      this.preamble_[tag] = code;
    }
  }

  addVariable(tag: string, code: string): void {
    if (this.variables_[tag] === undefined) {
      this.variables_[tag] = code;
    }
  }

  /**
   * Add an array declaration (from Array_declare or Array_create).
   * Merged into the variables section in finish().
   */
  addArrayDeclaration(declaration: string): void {
    this.arrayDeclarations_.push(declaration);
  }

  addLocalVariable(scopeId: string, tag: string, code: string): void {
    if (!this.localVariables_[scopeId]) {
      this.localVariables_[scopeId] = Object.create(null);
    }
    if (this.localVariables_[scopeId][tag] === undefined) {
      this.localVariables_[scopeId][tag] = code;
    }
  }

  getLocalVariables(scopeId: string): string[] {
    return Object.values(this.localVariables_[scopeId] || {});
  }

  /**
   * Set the type of a variable for proper declaration.
   * @param varName - Variable name.
   * @param varType - Variable type (int, float, bool, char, etc.).
   */
  setVariableType(varName: string, varType: string): void {
    this.variableTypes_[varName] = varType;
  }

  /**
   * Get the type of a variable.
   * @param varName - Variable name.
   * @returns Variable type or 'int' as default.
   */
  getVariableType(varName: string): string {
    return this.variableTypes_[varName] || 'int';
  }

  addCodeFunction(tag: string, code: string): void {
    if (this.codeFunctions_[tag] === undefined) {
      this.codeFunctions_[tag] = code;
    }
  }

  addUserFunction(tag: string, code: string): void {
    if (this.userFunctions_[tag] === undefined) {
      this.userFunctions_[tag] = code;
    }
  }

  /**
   * Add a user-defined function with proper Arduino syntax.
   * @param functionName - Name of the function.
   * @param parameters - Array of parameter names.
   * @param returnType - Return type of the function.
   * @param body - Function body code.
   * @param blockId - ID of the block defining this function.
   */
  addUserFunctionDefinition(
    functionName: string,
    parameters: string[],
    returnType: string,
    body: string,
    blockId: string
  ): void {
    const functionCode = formatUserFunctionDefinition(
      functionName,
      parameters,
      returnType,
      body,
    );

    this.userFunctions_[`function_${functionName}_${blockId}`] = functionCode;

    if (!this.functionNames_[functionName]) {
      this.functionNames_[functionName] = {
        parameters: parameters,
        returnType: returnType,
        blockId: blockId
      };
    }
  }

  /**
   * Check if a function name is already defined.
   * @param functionName - Name to check.
   * @returns True if function exists, false otherwise.
   */
  isFunctionDefined(functionName: string): boolean {
    return this.functionNames_[functionName] !== undefined;
  }

  /**
   * Validate the generated code for common Arduino issues.
   * @returns Object containing validation results and warnings.
   */
  validateGeneratedCode(): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    return validateGeneratedArduinoCode(
      Object.keys(this.variables_),
      this.variables_,
      [],
      Object.keys(this.functionNames_),
      this.validatePinUsage(),
    );
  }

  addFunctionNames(tag: string, code: string): void {
    if (this.functionNames_[tag] === undefined) {
      this.functionNames_[tag] = code;
    }
  }

  addSetup(tag: string, code: string): void {
    if (this.setups_[tag] === undefined) {
      this.setups_[tag] = code;
    }
  }

  addLoop(tag: string, code: string): void {
    if (this.loop_[tag] === undefined) {
      this.loop_[tag] = code;
    }
  }

  /**
   * Add pin usage and check for conflicts.
   * @param pinNumber - Pin number to use.
   * @param pinMode - Pin mode (INPUT, OUTPUT, INPUT_PULLUP).
   * @param blockId - ID of the block using this pin.
   * @returns True if pin can be used, false if conflict.
   */
  addPinUsage(pinNumber: string, pinMode: string, blockId: string): boolean {
    const result = recordPinUsage(this.pins_, pinNumber, pinMode, blockId);
    if (result.status === "conflict") {
      return false;
    }
    if (result.status === "new") {
      this.addSetup(result.setupTag, result.setupCode);
    }
    return true;
  }

  /**
   * Get all pin usages for validation.
   * @returns Object containing pin usage information.
   */
  getPinUsages(): PinUsageMap {
    return this.pins_;
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.  A trailing semicolon is needed to make this legal.
   * @param line - Line of generated code.
   * @returns Legal line of code.
   */
  scrubNakedValue(line: string): string {
    return scrubNakedValueLine(line);
  }

  /**
   * Encode a string as a properly escaped Arduino string, complete with quotes.
   * @param string - Text to encode.
   * @returns Arduino string.
   */
  quote_(string: string): string {
    return quoteArduinoString(string);
  }

  /**
   * Encode a string as a properly escaped multiline Arduino string, complete
   * with quotes.
   * @param string - Text to encode.
   * @returns Arduino string.
   */
  multiline_quote_(string: string): string {
    return multilineQuoteArduinoString(string);
  }

  /**
   * Common tasks for generating Arduino from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   * @param block - The current block.
   * @param code - The Arduino code created for this block.
   * @param thisOnly - True to generate code for only this statement.
   * @returns Arduino code with comments and subsequent blocks added.
   */
  scrub_(block: Blockly.Block, code: string, thisOnly = false): string {
    return scrubBlockCode(this, block, code, thisOnly);
  }

  /**
   * Enhanced comment handling with Arduino-specific formatting.
   * @param block - The current block.
   * @param code - The Arduino code created for this block.
   * @param thisOnly - True to generate code for only this statement.
   * @returns Arduino code with enhanced comments and subsequent blocks added.
   */
  scrubArduino_(block: Blockly.Block, code: string, thisOnly = false): string {
    return scrubArduinoBlockCode(this, block, code, thisOnly);
  }

  /**
   * Debug method to check generator state and identify issues.
   * @returns Object containing debug information.
   */
  debugGeneratorState(): {
    includes: Record<string, string>;
    defines: Record<string, string>;
    preamble: Record<string, string>;
    variables: Record<string, string>;
    codeFunctions: Record<string, string>;
    userFunctions: Record<string, string>;
    functionNames: Record<string, unknown>;
    setups: Record<string, string>;
    loop: Record<string, string>;
    pins: Record<string, unknown>;
    variableTypes: Record<string, string>;
    localVariables: Record<string, Record<string, string>>;
    registeredGenerators: string[];
  } {
    return buildArduinoGeneratorDebugState(
      {
        includes: this.includes_,
        defines: this.defines_,
        preamble: this.preamble_,
        variables: this.variables_,
        codeFunctions: this.codeFunctions_,
        userFunctions: this.userFunctions_,
        functionNames: this.functionNames_,
        setups: this.setups_,
        loop: this.loop_,
        pins: this.pins_,
        variableTypes: this.variableTypes_,
        localVariables: this.localVariables_,
      },
      Object.keys(this.forBlock),
    );
  }

  /**
   * Check if a specific block type has a registered generator.
   * @param blockType - Type of block to check.
   * @returns True if generator exists, false otherwise.
   */
  hasGeneratorForBlockType(blockType: string): boolean {
    return this.forBlock[blockType] !== undefined;
  }

  /**
   * Get list of all registered block generators.
   * @returns Array of registered block type names.
   */
  getRegisteredBlockTypes(): string[] {
    return Object.keys(this.forBlock);
  }

  /**
   * Reset generator state for debugging purposes.
   */
  resetForDebug(): void {
    this.resetGeneratorBags_();
    if (this.nameDB_) {
      this.nameDB_.reset();
    }
  }
}
