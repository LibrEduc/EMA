/**
 * Shared ambient types for runtime extension packs (no imports from the kernel).
 * Used by `extensions/*/*.ts` before `npm run build:extensions`.
 */

export type ExtensionBlocklyLike = {
  Blocks: Record<string, unknown>;
  inputs: { Align: { RIGHT: number; LEFT: number; CENTRE: number } };
};

export type ExtensionBlocksContext = {
  Blockly: ExtensionBlocklyLike;
  getBlocklyMsgOr: (key: string, fallback: string) => string;
  getBlocklyCompatibleChecks?: (type: string) => string[];
  enforceIntOnlyValueInputs?: (
    block: { setWarningText: (t: string | null) => void },
    inputNames: string[],
    event: unknown,
  ) => string | undefined | void;
  FieldInstance: new (
    type: string,
    defaultName: string,
    a: boolean,
    b: boolean,
    c: boolean,
  ) => unknown;
  updateInstancePresenceWarning: (
    block: unknown,
    fieldName: string,
    instanceType: string,
  ) => void;
  style?: string;
};

export type ExtensionOrder = {
  ATOMIC: number;
  NONE?: number;
};

export type ExtensionArduinoGenerator = {
  forBlock: Record<
    string,
    (block: ExtensionBlock) => string | [string, number]
  >;
  valueToCode: (
    block: ExtensionBlock,
    name: string,
    order: number,
  ) => string;
  addInclude: (key: string, code: string) => void;
  addDefinition: (key: string, code: string) => void;
  addSetup: (key: string, code: string) => void;
};

export type ExtensionMicropythonGenerator = {
  forBlock: Record<
    string,
    (block: ExtensionBlock) => string | [string, number]
  >;
  valueToCode: (
    block: ExtensionBlock,
    name: string,
    order: number,
  ) => string;
  ensureMachinePin: () => void;
  addGlobalAssignment: (key: string, code: string) => void;
  addSetup: (key: string, code: string) => void;
};

export type ExtensionBlock = {
  getFieldValue: (name: string) => string;
};

export type ExtensionArduinoContext = {
  arduinoGenerator: ExtensionArduinoGenerator;
  Order: ExtensionOrder;
};

export type ExtensionMicropythonContext = {
  micropythonGenerator: ExtensionMicropythonGenerator;
  Order: ExtensionOrder;
};
