/**
 * @packageDocumentation
 * @module Types
 * @description Ambient declarations for packages without usable TypeScript types.
 * @remarks
 * Do not stub @blockly packages that already ship `.d.ts` (e.g. continuous-toolbox):
 * an empty `declare module` replaces real exports and breaks host typecheck.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license AGPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

declare module "@blockly/block-plus-minus";
declare module "@blockly/block-plus-minus/src/field_plus" {
  export function createPlusField(args?: unknown): import("blockly").Field<unknown>;
}
declare module "@blockly/block-plus-minus/src/field_minus" {
  export function createMinusField(args?: unknown): import("blockly").Field<unknown>;
}
declare module "@blockly/plugin-modal" {
  import type { Workspace } from "blockly";
  export class Modal {
    constructor(workspace?: Workspace);
    init(): void;
    dispose(): void;
  }
}

declare module "monaco-python-grammar" {
  export const conf: unknown;
  export const language: { keywords: string[] };
}

declare module "*.css";
declare module "@jaames/iro" {
  export const ColorPicker: new (
    selector: string,
    options: { width: number; height: number; color: string },
  ) => {
    on: (eventName: string, handler: (color: { hexString: string }) => void) => void;
  };
  const iroDefault: {
    ColorPicker: new (
      selector: string,
      options: { width: number; height: number; color: string },
    ) => {
      on: (eventName: string, handler: (color: { hexString: string }) => void) => void;
    };
  };
  export default iroDefault;
}
