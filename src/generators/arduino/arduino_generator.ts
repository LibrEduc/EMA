/**
 * @packageDocumentation Complete helper functions for generating Arduino for blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

export enum Order {
  ATOMIC = 0, // 0 "" ...
  NEW = 1.1, // new
  MEMBER = 1.2, // . []
  FUNCTION_CALL = 2, // ()
  INCREMENT = 3.1, // ++
  DECREMENT = 3.2, // --
  BITWISE_NOT = 4.1, // ~
  UNARY_PLUS = 4.2, // +
  UNARY_NEGATION = 4.3, // -
  LOGICAL_NOT = 4.4, // !
  TYPEOF = 4.5, // typeof
  VOID = 4.6, // void
  DELETE = 4.7, // delete
  AWAIT = 4.8, // await
  EXPONENTIATION = 5.0, // **
  MULTIPLICATION = 5.1, // *
  DIVISION = 5.2, // /
  MODULUS = 5.3, // %
  SUBTRACTION = 6.1, // -
  ADDITION = 6.2, // +
  BITWISE_SHIFT = 7, // << >> >>>
  RELATIONAL = 8, // < <= > >=
  IN = 8.1, // in
  INSTANCEOF = 8.2, // instanceof
  EQUALITY = 9, // == != === !==
  BITWISE_AND = 10, // &
  BITWISE_XOR = 11, // ^
  BITWISE_OR = 12, // |
  LOGICAL_AND = 13, // &&
  LOGICAL_OR = 14, // ||
  CONDITIONAL = 15, // ?:
  ASSIGNMENT = 16, // = += -= **= *= /= %= <<= >>= ...
  YIELD = 17, // yield
  COMMA = 18, // ,
  NONE = 99, // (...)
}

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
  private pins_ = Object.create(null);

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

    this.includes_ = Object.create(null);
    this.defines_ = Object.create(null);
    this.variables_ = Object.create(null);
    this.variableTypes_ = Object.create(null);
    this.localVariables_ = Object.create(null);
    this.codeFunctions_ = Object.create(null);
    this.userFunctions_ = Object.create(null);
    this.functionNames_ = Object.create(null);
    this.setups_ = Object.create(null);
    this.loop_ = Object.create(null);
    this.pins_ = Object.create(null);

    if (!this.nameDB_) {
      this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
    } else {
      this.nameDB_.reset();
    }

    this.nameDB_.setVariableMap(workspace.getVariableMap());
    this.nameDB_.populateVariables(workspace);
    this.nameDB_.populateProcedures(workspace);

    const declaredVariableIds = new Set<string>();
    for (const block of workspace.getAllBlocks(false)) {
      if (
        block.type === "variables_const" ||
        block.type === "variables_set_init"
      ) {
        const varId = block.getFieldValue?.("VAR");
        if (varId) {
          declaredVariableIds.add(varId);
        }
      }
    }

    const procedureArgIds = new Set<string>();
    const procedureArgNames = new Set<string>();
    for (const block of workspace.getAllBlocks(false)) {
      if (
        block.type !== "procedures_defreturn" &&
        block.type !== "procedures_defnoreturn"
      ) {
        continue;
      }
      const argModels = (block as Blockly.Block & {
        argumentVarModels_?: Blockly.VariableModel[];
        getProcedureModel?: () =>
          | (Blockly.Procedures.IProcedureModel & {
            getParameters?: () => { getId?: () => string }[];
          })
          | null;
      }).argumentVarModels_;
      if (argModels && argModels.length > 0) {
        for (const model of argModels) {
          if (model?.getId) {
            procedureArgIds.add(model.getId());
          }
          const name = model?.getName?.();
          if (name) {
            procedureArgNames.add(name);
          }
        }
      }
      const procModel = (block as Blockly.Block & {
        getProcedureModel?: () =>
          | (Blockly.Procedures.IProcedureModel & {
            getParameters?: () => { getId?: () => string; getName?: () => string }[];
          })
          | null;
      }).getProcedureModel?.();
      const procParams = procModel?.getParameters?.() || [];
      for (const param of procParams) {
        const paramId = param?.getId?.();
        if (paramId) {
          procedureArgIds.add(paramId);
        }
        const paramName = param?.getName?.();
        if (paramName) {
          procedureArgNames.add(paramName);
        }
      }
    }
    const normalizedProcedureArgNames = new Set<string>();
    for (const name of procedureArgNames) {
      normalizedProcedureArgNames.add(
        this.nameDB_!.getName(name, Blockly.Names.NameType.VARIABLE),
      );
    }

    // Map to store variable names with their types
    const variableNamesByType: Record<string, string[]> = {};

    // Add developer variables (not created or named by the user).
    const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
    for (const devVar of devVarList) {
      const varName = this.nameDB_!.getName(
        devVar,
        Blockly.Names.NameType.DEVELOPER_VARIABLE,
      );
      // Developer variables default to 'int'
      const varType = 'int';
      if (!variableNamesByType[varType]) {
        variableNamesByType[varType] = [];
      }
      variableNamesByType[varType].push(varName);
    }

    const localVariableIds = new Set<string>();
    const globalVariableIds = new Set<string>();
    for (const block of workspace.getAllBlocks(false)) {
      if (block.type !== "variables_set_dynamic") {
        continue;
      }
      const blockVarId = block.getFieldValue?.("VAR");
      if (!blockVarId) {
        continue;
      }
      const valueBlock = block.getInputTargetBlock?.("VALUE");
      const isLocal = valueBlock?.type === "variables_local";
      if (isLocal) {
        localVariableIds.add(blockVarId);
      } else {
        globalVariableIds.add(blockVarId);
      }
    }

    const normalizeBlocklyType = (rawType: string | null | undefined): string | null => {
      if (!rawType) return null;
      if (rawType === "__NO_TYPE__" || rawType === "null" || rawType === "undefined") {
        return null;
      }
      if (rawType === "Boolean") return "bool";
      if (rawType === "Number") return "int";
      if (rawType === "String") return "string";
      return rawType;
    };

    const getOutputBlockType = (valueBlock: Blockly.Block | null): string | null => {
      if (!valueBlock) return null;
      const typedBlock = valueBlock as Blockly.Block & { getBlockType?: () => string | null };
      const rawType = typedBlock.getBlockType ? typedBlock.getBlockType() : null;
      const normalized = normalizeBlocklyType(rawType || "");
      if (normalized) return normalized;
      const check = valueBlock.outputConnection?.getCheck();
      if (Array.isArray(check)) {
        return normalizeBlocklyType(check[0]);
      }
      return normalizeBlocklyType(check || null);
    };

    const inferredTypesByVarId = new Map<string, string>();
    for (const block of workspace.getAllBlocks(false)) {
      if (
        block.type !== "variables_set_dynamic" &&
        block.type !== "variables_set"
      ) {
        continue;
      }
      const varId = block.getFieldValue?.("VAR");
      if (!varId) {
        continue;
      }
      const valueBlock = block.getInputTargetBlock?.("VALUE");
      const inferredType = getOutputBlockType(valueBlock);
      if (inferredType) {
        inferredTypesByVarId.set(varId, inferredType);
      }
    }

    const getProcedureParamNames = (block: Blockly.Block): Set<string> => {
      const names = new Set<string>();
      const vars = (block as Blockly.Block & { getVars?: () => string[] | null }).getVars?.();
      if (Array.isArray(vars)) {
        for (const name of vars) {
          if (name) {
            names.add(name);
            names.add(
              this.nameDB_!.getName(name, Blockly.Names.NameType.VARIABLE),
            );
          }
        }
      }
      const model = (block as Blockly.Block & {
        getProcedureModel?: () =>
          | (Blockly.Procedures.IProcedureModel & {
            getParameters?: () => { getName?: () => string }[];
          })
          | null;
      }).getProcedureModel?.();
      const params = model?.getParameters?.() || [];
      for (const param of params) {
        const name = param?.getName?.();
        if (name) {
          names.add(name);
          names.add(
            this.nameDB_!.getName(name, Blockly.Names.NameType.VARIABLE),
          );
        }
      }
      return names;
    };

    const isUseWithinMatchingProcedure = (
      block: Blockly.Block,
      variableName: string,
    ): boolean => {
      if (
        block.type === "procedures_defreturn" ||
        block.type === "procedures_defnoreturn"
      ) {
        const paramNames = getProcedureParamNames(block);
        return paramNames.has(variableName);
      }
      let parent = block.getSurroundParent?.() || null;
      while (parent) {
        if (
          parent.type === "procedures_defreturn" ||
          parent.type === "procedures_defnoreturn"
        ) {
          const paramNames = getProcedureParamNames(parent);
          return paramNames.has(variableName);
        }
        parent = parent.getSurroundParent?.() || null;
      }
      return false;
    };

    // Add user variables, but only ones that are being used.
    const variables = Blockly.Variables.allUsedVarModels(workspace);
    for (const variable of variables) {
      if (!variable) {
        continue;
      }
      const variableUses = Blockly.Variables.getVariableUsesById(
        workspace,
        variable.getId(),
      );
      if (
        variableUses &&
        variableUses.length > 0 &&
        variableUses.every((use) =>
          isUseWithinMatchingProcedure(use, variable.getName()),
        )
      ) {
        continue;
      }
      if (procedureArgIds.has(variable.getId())) {
        continue;
      }
      if (declaredVariableIds.has(variable.getId())) {
        continue;
      }
      if (
        localVariableIds.has(variable.getId()) &&
        !globalVariableIds.has(variable.getId())
      ) {
        continue;
      }
      const varName = this.nameDB_!.getName(
        variable.getId(),
        Blockly.Names.NameType.VARIABLE,
      );
      if (normalizedProcedureArgNames.has(varName)) {
        continue;
      }

      // Normalize variable type to avoid emitting 'undefined' in declarations.
      const rawType = variable.getType();
      const inferredType = inferredTypesByVarId.get(variable.getId());
      const typeKey = normalizeBlocklyType(rawType || "") || inferredType || "__NO_TYPE__";
      if (!variableNamesByType[typeKey]) {
        variableNamesByType[typeKey] = [];
      }
      variableNamesByType[typeKey].push(varName);
    }

    // Declare all of the variables.
    if (Object.keys(variableNamesByType).length > 0) {
      // Create typed variable declarations
      const varDeclarations: string[] = [];
      for (const [varType, varNames] of Object.entries(variableNamesByType)) {
        if (varNames.length > 0) {
          varDeclarations.push(`${varType} ${varNames.join(', ')};`);
        }
      }

      if (varDeclarations.length > 0) {
        this.definitions_["variables"] = varDeclarations.join('\n');
      }
    }
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
    // Get variables from definitions_ (set in init()) instead of variables_
    const variablesDeclaration = this.definitions_["variables"] || '';
    const variables = variablesDeclaration ? [variablesDeclaration] : [];
    const codeFunctions = Object.values(this.codeFunctions_);
    const userFunctions = Object.values(this.userFunctions_);
    const functionNames = Object.values(this.functionNames_);
    const setups = Object.values(this.setups_);
    const loop = Object.values(this.loop_);
    // const pins = Object.values(this.pins_); // Utilisé dans validatePinUsage()

    // Call Blockly.CodeGenerator's finish.
    super.finish(code);

    this.nameDB_!.reset();

    // Validate pin usage and add warnings
    const pinWarnings = this.validatePinUsage();

    // Format the code with proper spacing and organization
    const newcode = this.formatArduinoCode({
      includes,
      defines,
      variables,
      codeFunctions,
      userFunctions,
      functionNames,
      setups,
      loop,
      code,
      pinWarnings
    });

    return newcode;
  }

  /**
   * Validate pin usage and return warnings.
   * @returns Array of warning messages.
   */
  private validatePinUsage(): string[] {
    const warnings: string[] = [];
    const pinUsages = this.getPinUsages();

    // Check for potential conflicts or issues
    for (const usage of Object.values(pinUsages)) {
      const pinNum = parseInt(usage.number);
      if (isNaN(pinNum) || pinNum < 0 || pinNum > 53) {
        warnings.push(`Warning: Pin ${usage.number} may be invalid for Arduino`);
      }
    }

    return warnings;
  }

  /**
   * Format Arduino code with proper structure and spacing.
   * @param sections - Object containing all code sections.
   * @returns Formatted Arduino code.
   */
  private formatArduinoCode(sections: {
    includes: unknown[],
    defines: unknown[],
    variables: unknown[],
    codeFunctions: unknown[],
    userFunctions: unknown[],
    functionNames: unknown[],
    setups: unknown[],
    loop: unknown[],
    code: string,
    pinWarnings: string[]
  }): string {
    const { includes, defines, variables, codeFunctions, userFunctions, setups, loop, code, pinWarnings } = sections;

    let arduinoCode = '';

    // Add header comment
    arduinoCode += '// Generated by µcBlockly Arduino Generator\n';
    arduinoCode += '// ' + new Date().toISOString() + '\n\n';

    // Add includes
    if (includes.length > 0) {
      arduinoCode += includes.join('\n') + '\n\n';
    }

    // Add defines
    if (defines.length > 0) {
      arduinoCode += defines.join('\n') + '\n\n';
    }

    // Add variables
    if (variables.length > 0) {
      arduinoCode += variables.join('\n') + '\n\n';
    }

    // Add helper functions
    if (codeFunctions.length > 0) {
      arduinoCode += codeFunctions.join('\n\n') + '\n\n';
    }

    // Add user functions
    if (userFunctions.length > 0) {
      arduinoCode += userFunctions.join('\n\n') + '\n\n';
    }

    // Add setup function
    arduinoCode += 'void setup() {\n';
    if (setups.length > 0) {
      arduinoCode += '  ' + setups.join('\n  ') + '\n';
    }
    arduinoCode += '}\n\n';

    // Add loop function
    arduinoCode += 'void loop() {\n';
    if (loop.length > 0) {
      arduinoCode += '  ' + loop.join('\n  ') + '\n';
    }
    if (code.trim()) {
      arduinoCode += '  ' + code.trim().split('\n').join('\n  ') + '\n';
    }
    arduinoCode += '}\n';

    // Add warnings if any
    if (pinWarnings.length > 0) {
      arduinoCode = '// WARNINGS:\n' + pinWarnings.map(w => '// ' + w).join('\n') + '\n\n' + arduinoCode;
    }

    return arduinoCode;
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

  addVariable(tag: string, code: string): void {
    if (this.variables_[tag] === undefined) {
      this.variables_[tag] = code;
    }
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
    const paramList = parameters.length > 0 ? parameters.join(', ') : '';
    const functionCode = `${returnType} ${functionName}(${paramList}) {\n${body}\n}`;

    this.userFunctions_[`function_${functionName}_${blockId}`] = functionCode;

    // Store function signature for validation
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
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for undefined variables
    const usedVariables = this.getUsedVariables();
    for (const varName of usedVariables) {
      if (!this.variables_[varName] && !this.isBuiltInVariable(varName)) {
        warnings.push(`Variable '${varName}' is used but not declared`);
      }
    }

    // Check for function calls to undefined functions
    const calledFunctions = this.getCalledFunctions();
    for (const funcName of calledFunctions) {
      if (!this.isFunctionDefined(funcName) && !this.isBuiltInFunction(funcName)) {
        warnings.push(`Function '${funcName}' is called but not defined`);
      }
    }

    // Check pin usage conflicts
    const pinWarnings = this.validatePinUsage();
    warnings.push(...pinWarnings);

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Get list of variables used in the code.
   * @returns Array of variable names.
   */
  private getUsedVariables(): string[] {
    // This would need to be implemented based on actual code analysis
    // For now, return variables from the workspace
    return Object.keys(this.variables_);
  }

  /**
   * Get list of functions called in the code.
   * @returns Array of function names.
   */
  private getCalledFunctions(): string[] {
    // This would need to be implemented based on actual code analysis
    // For now, return empty array
    return [];
  }

  /**
   * Check if a variable name is a built-in Arduino variable.
   * @param varName - Variable name to check.
   * @returns True if built-in, false otherwise.
   */
  private isBuiltInVariable(varName: string): boolean {
    const builtInVars = ['HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP'];
    return builtInVars.includes(varName);
  }

  /**
   * Check if a function name is a built-in Arduino function.
   * @param funcName - Function name to check.
   * @returns True if built-in, false otherwise.
   */
  private isBuiltInFunction(funcName: string): boolean {
    const builtInFuncs = [
      'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite',
      'delay', 'millis', 'Serial.begin', 'Serial.print', 'Serial.println'
    ];
    return builtInFuncs.includes(funcName);
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
    const pinKey = `pin_${pinNumber}`;

    if (this.pins_[pinKey]) {
      const existingUsage = this.pins_[pinKey];
      // Check if there's a conflict (different modes)
      if (existingUsage.mode !== pinMode) {
        console.warn(`Pin ${pinNumber} conflict: ${existingUsage.mode} vs ${pinMode}`);
        return false;
      }
      // Pin already configured with same mode
      return true;
    }

    // New pin usage
    this.pins_[pinKey] = {
      number: pinNumber,
      mode: pinMode,
      blockId: blockId
    };

    // Add pinMode setup
    this.addSetup(`pin_${pinNumber}_mode`, `pinMode(${pinNumber}, ${pinMode});`);

    return true;
  }

  /**
   * Get all pin usages for validation.
   * @returns Object containing pin usage information.
   */
  getPinUsages(): Record<string, { number: string, mode: string, blockId: string }> {
    return this.pins_;
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.  A trailing semicolon is needed to make this legal.
   * @param line - Line of generated code.
   * @returns Legal line of code.
   */
  scrubNakedValue(line: string): string {
    return line + "\n";
  }

  /**
   * Encode a string as a properly escaped Arduino string, complete with quotes.
   *
   * @param string - Text to encode.
   * @returns Arduino string.
   */
  quote_(string: string): string {
    string = string.replace(/\\/g, "\\\\").replace(/\n/g, "\\\n");

    let quote = "'";
    if (string.indexOf("'") !== -1) {
      if (string.indexOf('"') === -1) {
        quote = '"';
      } else {
        string = string.replace(/'/g, "\\'");
      }
    }
    return quote + string + quote;
  }

  /**
   * Encode a string as a properly escaped multiline Arduino string, complete
   * with quotes.
   *
   * @param string - Text to encode.
   * @returns Arduino string.
   */
  multiline_quote_(string: string): string {
    const lines = string.split(/\n/g).map(this.quote_);
    // Join with the following, plus a newline:
    // + '\n' +
    return lines.join(" + '\\n' + \n");
  }

  /**
   * Common tasks for generating Arduino from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   *
   * @param block - The current block.
   * @param code - The Arduino code created for this block.
   * @param thisOnly - True to generate code for only this statement.
   * @returns Arduino code with comments and subsequent blocks added.

   */
  scrub_(block: Blockly.Block, code: string, thisOnly = false): string {
    let commentCode = "";
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection?.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText();
      if (comment) {
        comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
        commentCode += this.prefixLines(comment + "\n", "// ");
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
          const childBlock = block.inputList[i].connection!.targetBlock();
          if (childBlock) {
            comment = this.allNestedComments(childBlock);
            if (comment) {
              commentCode += this.prefixLines(comment, "// ");
            }
          }
        }
      }
    }
    const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = thisOnly ? "" : this.blockToCode(nextBlock);
    return commentCode + code + nextCode;
  }

  /**
   * Enhanced comment handling with Arduino-specific formatting.
   * @param block - The current block.
   * @param code - The Arduino code created for this block.
   * @param thisOnly - True to generate code for only this statement.
   * @returns Arduino code with enhanced comments and subsequent blocks added.
   */
  scrubArduino_(block: Blockly.Block, code: string, thisOnly = false): string {
    let commentCode = "";

    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection?.targetConnection) {
      // Collect comment for this block with enhanced formatting.
      let comment = block.getCommentText();
      if (comment) {
        // Format comment for Arduino with proper wrapping
        comment = this.formatArduinoComment(comment);
        commentCode += this.prefixLines(comment + "\n", "// ");
      }

      // Add block type information for debugging
      const blockType = block.type;
      if (blockType && this.shouldAddBlockTypeComment(blockType)) {
        commentCode += this.prefixLines(`Block type: ${blockType}\n`, "// ");
      }

      // Collect comments for all value arguments.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
          const childBlock = block.inputList[i].connection!.targetBlock();
          if (childBlock) {
            const nestedComment = this.allNestedComments(childBlock);
            if (nestedComment) {
              commentCode += this.prefixLines(nestedComment, "// ");
            }
          }
        }
      }
    }

    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = thisOnly ? "" : this.blockToCode(nextBlock);

    return commentCode + code + nextCode;
  }

  /**
   * Format comment text for Arduino with proper line breaks and wrapping.
   * @param comment - Raw comment text.
   * @returns Formatted comment text.
   */
  private formatArduinoComment(comment: string): string {
    // Remove excessive whitespace and normalize line breaks
    comment = comment.trim().replace(/\s+/g, ' ');

    // Wrap long comments at appropriate length for Arduino IDE
    const maxLineLength = 80;
    if (comment.length <= maxLineLength) {
      return comment;
    }

    // Simple word wrapping
    const words = comment.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLineLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  }

  /**
   * Determine if block type comment should be added.
   * @param blockType - Type of the block.
   * @returns True if comment should be added.
   */
  private shouldAddBlockTypeComment(blockType: string): boolean {
    // Add block type comments for complex blocks that might need debugging
    const complexBlocks = ['controls_if', 'controls_repeat', 'procedures_defreturn', 'variables_set'];
    return complexBlocks.includes(blockType);
  }

  /**
   * Debug method to check generator state and identify issues.
   * @returns Object containing debug information.
   */
  debugGeneratorState(): {
    includes: Record<string, string>;
    defines: Record<string, string>;
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
    return {
      includes: this.includes_,
      defines: this.defines_,
      variables: this.variables_,
      codeFunctions: this.codeFunctions_,
      userFunctions: this.userFunctions_,
      functionNames: this.functionNames_,
      setups: this.setups_,
      loop: this.loop_,
      pins: this.pins_,
      variableTypes: this.variableTypes_,
      localVariables: this.localVariables_,
      registeredGenerators: Object.keys(this.forBlock)
    };
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
    this.includes_ = Object.create(null);
    this.defines_ = Object.create(null);
    this.variables_ = Object.create(null);
    this.variableTypes_ = Object.create(null);
    this.codeFunctions_ = Object.create(null);
    this.userFunctions_ = Object.create(null);
    this.functionNames_ = Object.create(null);
    this.setups_ = Object.create(null);
    this.loop_ = Object.create(null);
    this.pins_ = Object.create(null);
    this.localVariables_ = Object.create(null);

    if (this.nameDB_) {
      this.nameDB_.reset();
    }
  }
}
