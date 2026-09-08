/**
 * @packageDocumentation
 * @module Types
 * @description TypeScript type definitions and declarations for µcBlockly
 * @remarks
 * Provides ambient type declarations for workspace usage.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

declare module "@blockly/block-plus-minus";
declare module "@blockly/block-plus-minus/src/field_plus" {
  export function createPlusField(args?: unknown): import("blockly").Field<unknown>;
}
declare module "@blockly/block-plus-minus/src/field_minus" {
  export function createMinusField(args?: unknown): import("blockly").Field<unknown>;
}
declare module "@blockly/workspace-backpack";
declare module "@blockly/workspace-minimap";
declare module "@blockly/zoom-to-fit";
declare module "@blockly/continuous-toolbox";
declare module "@blockly/plugin-workspace-search";
declare module "@blockly/workspace-content-highlight" {
  import type { WorkspaceSvg } from "blockly";
  export class ContentHighlight {
    constructor(workspace?: WorkspaceSvg);
    init(padding?: number): void;
    dispose(): void;
  }
}
declare module "@blockly/plugin-modal";
declare module "@blockly/toolbox-search";
declare module "@blockly/theme-dark";
declare module "@blockly/theme-modern";
declare module "@blockly/theme-highcontrast";
declare module "@blockly/theme-deuteranopia";
declare module "@blockly/theme-tritanopia";
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
