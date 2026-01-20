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
export declare enum Order {
    ATOMIC = 0,// 0 "" ...
    NEW = 1.1,// new
    MEMBER = 1.2,// . []
    FUNCTION_CALL = 2,// ()
    INCREMENT = 3.1,// ++
    DECREMENT = 3.2,// --
    BITWISE_NOT = 4.1,// ~
    UNARY_PLUS = 4.2,// +
    UNARY_NEGATION = 4.3,// -
    LOGICAL_NOT = 4.4,// !
    TYPEOF = 4.5,// typeof
    VOID = 4.6,// void
    DELETE = 4.7,// delete
    AWAIT = 4.8,// await
    EXPONENTIATION = 5,// **
    MULTIPLICATION = 5.1,// *
    DIVISION = 5.2,// /
    MODULUS = 5.3,// %
    SUBTRACTION = 6.1,// -
    ADDITION = 6.2,// +
    BITWISE_SHIFT = 7,// << >> >>>
    RELATIONAL = 8,// < <= > >=
    IN = 8.1,// in
    INSTANCEOF = 8.2,// instanceof
    EQUALITY = 9,// == != === !==
    BITWISE_AND = 10,// &
    BITWISE_XOR = 11,// ^
    BITWISE_OR = 12,// |
    LOGICAL_AND = 13,// &&
    LOGICAL_OR = 14,// ||
    CONDITIONAL = 15,// ?:
    ASSIGNMENT = 16,// = += -= **= *= /= %= <<= >>= ...
    YIELD = 17,// yield
    COMMA = 18,// ,
    NONE = 99
}
/**
 * Arduino code generator class.
 * Extends Blockly.CodeGenerator to provide Arduino-specific code generation.
 */
export declare class ArduinoGenerator extends Blockly.CodeGenerator {
    private includes_;
    private defines_;
    private variables_;
    private variableTypes_;
    private localVariables_;
    private codeFunctions_;
    private userFunctions_;
    protected functionNames_: any;
    private setups_;
    private loop_;
    private pins_;
    /**
     * List of outer-inner pairings that do NOT require parentheses.
     */
    ORDER_OVERRIDES: [Order, Order][];
    constructor(name?: string);
    /**
     * Initialise the database of variable names.
     *
     * @param workspace - Workspace to generate code from.
     */
    init(workspace: Blockly.Workspace): void;
    /**
     * Prepend the generated code with the variable definitions.
     *
     * @param code - Generated code.
     * @returns Completed code.
     */
    finish(code: string): string;
    /**
     * Validate pin usage and return warnings.
     * @returns Array of warning messages.
     */
    private validatePinUsage;
    /**
     * Format Arduino code with proper structure and spacing.
     * @param sections - Object containing all code sections.
     * @returns Formatted Arduino code.
     */
    private formatArduinoCode;
    addInclude(tag: string, code: string): void;
    addDefinition(tag: string, code: string): void;
    addVariable(tag: string, code: string): void;
    addLocalVariable(scopeId: string, tag: string, code: string): void;
    getLocalVariables(scopeId: string): string[];
    /**
     * Set the type of a variable for proper declaration.
     * @param varName - Variable name.
     * @param varType - Variable type (int, float, bool, char, etc.).
     */
    setVariableType(varName: string, varType: string): void;
    /**
     * Get the type of a variable.
     * @param varName - Variable name.
     * @returns Variable type or 'int' as default.
     */
    getVariableType(varName: string): string;
    addCodeFunction(tag: string, code: string): void;
    addUserFunction(tag: string, code: string): void;
    /**
     * Add a user-defined function with proper Arduino syntax.
     * @param functionName - Name of the function.
     * @param parameters - Array of parameter names.
     * @param returnType - Return type of the function.
     * @param body - Function body code.
     * @param blockId - ID of the block defining this function.
     */
    addUserFunctionDefinition(functionName: string, parameters: string[], returnType: string, body: string, blockId: string): void;
    /**
     * Check if a function name is already defined.
     * @param functionName - Name to check.
     * @returns True if function exists, false otherwise.
     */
    isFunctionDefined(functionName: string): boolean;
    /**
     * Validate the generated code for common Arduino issues.
     * @returns Object containing validation results and warnings.
     */
    validateGeneratedCode(): {
        isValid: boolean;
        warnings: string[];
        errors: string[];
    };
    /**
     * Get list of variables used in the code.
     * @returns Array of variable names.
     */
    private getUsedVariables;
    /**
     * Get list of functions called in the code.
     * @returns Array of function names.
     */
    private getCalledFunctions;
    /**
     * Check if a variable name is a built-in Arduino variable.
     * @param varName - Variable name to check.
     * @returns True if built-in, false otherwise.
     */
    private isBuiltInVariable;
    /**
     * Check if a function name is a built-in Arduino function.
     * @param funcName - Function name to check.
     * @returns True if built-in, false otherwise.
     */
    private isBuiltInFunction;
    addFunctionNames(tag: string, code: string): void;
    addSetup(tag: string, code: string): void;
    addLoop(tag: string, code: string): void;
    /**
     * Add pin usage and check for conflicts.
     * @param pinNumber - Pin number to use.
     * @param pinMode - Pin mode (INPUT, OUTPUT, INPUT_PULLUP).
     * @param blockId - ID of the block using this pin.
     * @returns True if pin can be used, false if conflict.
     */
    addPinUsage(pinNumber: string, pinMode: string, blockId: string): boolean;
    /**
     * Get all pin usages for validation.
     * @returns Object containing pin usage information.
     */
    getPinUsages(): Record<string, {
        number: string;
        mode: string;
        blockId: string;
    }>;
    /**
     * Naked values are top-level blocks with outputs that aren't plugged into
     * anything.  A trailing semicolon is needed to make this legal.
     * @param line - Line of generated code.
     * @returns Legal line of code.
     */
    scrubNakedValue(line: string): string;
    /**
     * Encode a string as a properly escaped Arduino string, complete with quotes.
     *
     * @param string - Text to encode.
     * @returns Arduino string.
     */
    quote_(string: string): string;
    /**
     * Encode a string as a properly escaped multiline Arduino string, complete
     * with quotes.
     *
     * @param string - Text to encode.
     * @returns Arduino string.
     */
    multiline_quote_(string: string): string;
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
    scrub_(block: Blockly.Block, code: string, thisOnly?: boolean): string;
    /**
     * Enhanced comment handling with Arduino-specific formatting.
     * @param block - The current block.
     * @param code - The Arduino code created for this block.
     * @param thisOnly - True to generate code for only this statement.
     * @returns Arduino code with enhanced comments and subsequent blocks added.
     */
    scrubArduino_(block: Blockly.Block, code: string, thisOnly?: boolean): string;
    /**
     * Format comment text for Arduino with proper line breaks and wrapping.
     * @param comment - Raw comment text.
     * @returns Formatted comment text.
     */
    private formatArduinoComment;
    /**
     * Determine if block type comment should be added.
     * @param blockType - Type of the block.
     * @returns True if comment should be added.
     */
    private shouldAddBlockTypeComment;
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
    };
    /**
     * Check if a specific block type has a registered generator.
     * @param blockType - Type of block to check.
     * @returns True if generator exists, false otherwise.
     */
    hasGeneratorForBlockType(blockType: string): boolean;
    /**
     * Get list of all registered block generators.
     * @returns Array of registered block type names.
     */
    getRegisteredBlockTypes(): string[];
    /**
     * Reset generator state for debugging purposes.
     */
    resetForDebug(): void;
}
//# sourceMappingURL=arduino_generator.d.ts.map