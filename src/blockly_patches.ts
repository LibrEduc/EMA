/**
 * @packageDocumentation
 * @module BlocklyPatches
 * @description Runtime patches and overrides for Blockly behaviors.
 * @remarks
 * Applies compatibility tweaks and µcBlockly-specific adjustments.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

const INPUT_VALUE = 1;
const OUTPUT_VALUE = 2;

/**
 * Returns true when connecting a value output to the variables_const value input.
 */
function isValueToConstInput(
  a: Blockly.Connection | null,
  b: Blockly.Connection | null,
): boolean {
  if (!a || !b) return false;
  const out =
    (a as { type: number }).type === OUTPUT_VALUE
      ? a
      : (b as { type: number }).type === OUTPUT_VALUE
        ? b
        : null;
  const inp =
    (a as { type: number }).type === INPUT_VALUE
      ? a
      : (b as { type: number }).type === INPUT_VALUE
        ? b
        : null;
  if (!out || !inp) return false;
  const block = inp.getSourceBlock();
  return block != null && block.type === "variables_const";
}

// ─── Extensions (µcBlockly features) ────────────────────────────────────────

/**
 * Extends ConnectionChecker so that connecting any value block to variables_const
 * is always allowed.
 */
export function patchConnectionCheckerForConstBlock(): void {
  try {
    const DefaultChecker = (Blockly as unknown as { ConnectionChecker: new (p?: Blockly.Workspace) => Blockly.ConnectionChecker }).ConnectionChecker;
    if (!DefaultChecker?.prototype) return;
    const proto = DefaultChecker.prototype as Blockly.ConnectionChecker & {
      canConnect: (a: Blockly.Connection | null, b: Blockly.Connection | null, isDragging: boolean, opt_distance?: number) => boolean;
      canConnectWithReason: (a: Blockly.Connection | null, b: Blockly.Connection | null, isDragging: boolean, opt_distance?: number) => number;
      __ucbPatchedConstBlock?: boolean;
    };
    if (proto.__ucbPatchedConstBlock) return;

    const originalCanConnect = proto.canConnect;
    proto.canConnect = function (a, b, isDragging, opt_distance) {
      if (isValueToConstInput(a, b)) return true;
      return originalCanConnect.call(this, a, b, isDragging, opt_distance);
    };

    const originalCanConnectWithReason = proto.canConnectWithReason;
    const CAN_CONNECT = (Blockly.Connection as { CAN_CONNECT: number }).CAN_CONNECT;
    proto.canConnectWithReason = function (a, b, isDragging, opt_distance) {
      if (isValueToConstInput(a, b)) return CAN_CONNECT;
      return originalCanConnectWithReason.call(this, a, b, isDragging, opt_distance);
    };

    proto.__ucbPatchedConstBlock = true;
  } catch (e) {
    console.debug("Error patching ConnectionChecker for const block:", e);
  }
}

/**
 * Extends VariableMap.createVariable to normalize types and avoid duplicates.
 */
export function patchVariableMapCreateVariable(workspace: Blockly.Workspace): void {
  try {
    const variableMap = workspace.getVariableMap();
    const originalCreateVariable = variableMap.createVariable.bind(variableMap);
    const variableMapWithOverride = variableMap as Blockly.VariableMap & {
      createVariable: (name: string, opt_type?: string | null, opt_id?: string | null) => Blockly.IVariableModel<Blockly.IVariableState>;
    };
    variableMapWithOverride.createVariable = (name: string, opt_type?: string | null, opt_id?: string | null) => {
      const type = opt_type === null || opt_type === "null" ? "" : opt_type;
      const id = opt_id === null ? undefined : opt_id;
      if (!id) {
        const existing = variableMap.getAllVariables().find((variable) => variable && variable.getName() === name);
        if (existing) return existing;
      }
      return originalCreateVariable(name, type, id);
    };
  } catch (e) {
    console.debug("Error patching VariableMap.createVariable:", e);
  }
}

/**
 * Extends FieldVariable validation and initModel for flyout/insertion-marker handling.
 */
export function patchFieldVariableValidation(): void {
  try {
    if (!Blockly.FieldVariable) return;
    type FieldVariableProto = Blockly.FieldVariable & {
      __ucbPatchedVariableValidation?: boolean;
      __ucbPatchedVariableInitModel?: boolean;
      doClassValidation_: (newValue: string | null) => string | null;
      initModel: () => void;
    };
    const proto = Blockly.FieldVariable.prototype as unknown as FieldVariableProto;
    if (!proto.__ucbPatchedVariableValidation) {
      const originalValidation = proto.doClassValidation_;
      proto.doClassValidation_ = function (this: Blockly.FieldVariable, newValue: string | null) {
        if (!newValue) return newValue;
        const field = this as Blockly.FieldVariable & { workspace_?: Blockly.WorkspaceSvg; getSourceBlock?: () => Blockly.Block | null };
        const workspace = field.getSourceBlock?.()?.workspace || field.workspace_;
        const variableMap = workspace?.getVariableMap?.();
        if (!variableMap) return originalValidation.call(this, newValue);
        const variable = variableMap.getVariableById(newValue);
        if (!variable) return null;
        return newValue;
      };
      proto.__ucbPatchedVariableValidation = true;
    }
    if (!proto.__ucbPatchedVariableInitModel) {
      const originalInitModel = proto.initModel;
      proto.initModel = function (this: Blockly.FieldVariable) {
        const field = this as Blockly.FieldVariable & { workspace_?: Blockly.WorkspaceSvg; value_?: string | null; getSourceBlock?: () => Blockly.Block | null };
        const block = field.getSourceBlock?.();
        const workspace = block?.workspace || field.workspace_;
        if (workspace?.isFlyout) return originalInitModel.call(this);
        if (block?.isInsertionMarker?.()) {
          field.value_ = null;
          return;
        }
        return originalInitModel.call(this);
      };
      proto.__ucbPatchedVariableInitModel = true;
    }
  } catch (e) {
    console.debug("Error patching FieldVariable:", e);
  }
}

// ─── Defensive patches ─────────────────────────────────────────────────────────────
// Lors du drag, Blockly appelle previewMarker → connect_ → setParent → removeTopBlock.
// Si le bloc (ex. Array_list_3) n'est pas encore dans topBlocks, removeTopBlock lance.
// On absorbe pour éviter le crash.

/**
 * Applies defensive patches (setParent, removeTypedBlock, removeTopBlock).
 */
export function patchBlocklyDefensive(): void {
  // ConnectionDB.removeConnection (tolerate stale preview/flyout connections)
  try {
    const B = Blockly as unknown as {
      ConnectionDB?: {
        prototype?: {
          removeConnection?: (c: Blockly.Connection, yPos: number) => void;
          __ucbConnDb?: boolean;
        };
      };
    };
    const proto = B.ConnectionDB?.prototype;
    if (proto?.removeConnection && !proto.__ucbConnDb) {
      const original = proto.removeConnection;
      proto.removeConnection = function (connection: Blockly.Connection, yPos: number) {
        try {
          original.call(this, connection, yPos);
        } catch (err) {
          if (err instanceof Error && err.message.includes("Unable to find connection in connectionDB")) {
            return;
          }
          throw err;
        }
      };
      proto.__ucbConnDb = true;
    }
  } catch (e) {
    console.debug("Patch ConnectionDB.removeConnection:", e);
  }

  // BlockMove.currentLocation (block missing during drag-end replay)
  try {
    const Events = (Blockly as unknown as { Events?: Record<string, unknown> }).Events;
    const BlockMove = Events?.BlockMove as { prototype?: Record<string, unknown> };
    if (BlockMove?.prototype) {
      const proto = BlockMove.prototype as {
        currentLocation?: () => unknown;
        getEventWorkspace_?: () => Blockly.Workspace;
        blockId?: string;
        __ucb?: boolean;
      };
      if (!proto.__ucb && typeof proto.currentLocation === "function") {
        const orig = proto.currentLocation;
        proto.currentLocation = function (this: typeof proto) {
          const ws = this.getEventWorkspace_?.();
          if (ws && this.blockId && !ws.getBlockById(this.blockId)) {
            const CoordinateCtor = (Blockly.utils as unknown as {
              Coordinate?: new (x: number, y: number) => { x: number; y: number };
            }).Coordinate;
            return { coordinate: CoordinateCtor ? new CoordinateCtor(0, 0) : { x: 0, y: 0 } };
          }
          return orig.call(this);
        };
        proto.__ucb = true;
      }
    }
  } catch (e) {
    console.debug("Patch BlockMove.currentLocation:", e);
  }

  // WorkspaceSvg.getGesture (avoid duplicate gesture start that can leave preview ghosts)
  try {
    const proto = Blockly.WorkspaceSvg.prototype as unknown as {
      getGesture: (e: PointerEvent) => Blockly.Gesture | null;
      currentGesture_?: Blockly.Gesture | null;
      __ucb?: boolean;
    };
    if (proto.getGesture && !proto.__ucb) {
      const orig = proto.getGesture;
      proto.getGesture = function (this: typeof proto, e: PointerEvent) {
        if (e.type === "pointerdown" && this.currentGesture_?.hasStarted?.()) {
          return this.currentGesture_;
        }
        return orig.call(this, e);
      };
      proto.__ucb = true;
    }
  } catch (e) {
    console.debug("Patch WorkspaceSvg.getGesture:", e);
  }

  // Gesture (no-op on repeated starts + null-safe setTargetBlock)
  try {
    const Gesture = (Blockly as unknown as { Gesture?: { prototype?: Record<string, unknown> } }).Gesture;
    if (Gesture?.prototype) {
      const proto = Gesture.prototype as Record<string, unknown> & {
        hasStarted?: () => boolean;
        __ucb?: boolean;
      };
      if (!proto.__ucb) {
        for (const m of ["handleBlockStart", "handleWsStart", "handleFlyoutStart", "handleBubbleStart", "handleCommentStart"]) {
          const fn = proto[m] as ((e: PointerEvent, arg: unknown) => void) | undefined;
          if (typeof fn === "function") {
            proto[m] = function (this: typeof proto, e: PointerEvent, arg: unknown) {
              if (this.hasStarted?.()) return;
              fn.call(this, e, arg);
            };
          }
        }
        const setStartField = proto.setStartField as ((field: Blockly.Field | null) => void) | undefined;
        if (typeof setStartField === "function") {
          proto.setStartField = function (this: typeof proto, field: Blockly.Field | null) {
            if (this.hasStarted?.()) return;
            setStartField.call(this, field);
          };
        }
        const setTarget = proto.setTargetBlock as ((b: Blockly.BlockSvg | null) => void) | undefined;
        if (typeof setTarget === "function") {
          proto.setTargetBlock = function (this: Record<string, unknown>, block: Blockly.BlockSvg | null) {
            if (!block) {
              this.targetBlock = null;
              return;
            }
            setTarget.call(this as unknown as typeof proto, block);
          };
        }
        proto.__ucb = true;
      }
    }
  } catch (e) {
    console.debug("Patch Gesture:", e);
  }

  // Workspace.removeTypedBlock (block not in typedBlocksDB)
  try {
    const proto = Blockly.Workspace.prototype as unknown as { removeTypedBlock: (b: Blockly.Block) => void; typedBlocksDB?: Map<string, Blockly.Block[]>; __ucb?: boolean };
    if (proto.removeTypedBlock && !proto.__ucb) {
      proto.removeTypedBlock = function (this: typeof proto, block: Blockly.Block) {
        const type = block?.type;
        if (!type) return;
        const arr = this.typedBlocksDB?.get(type);
        if (!arr) return;
        const idx = arr.indexOf(block);
        if (idx >= 0) arr.splice(idx, 1);
        if (arr.length === 0) this.typedBlocksDB?.delete(type);
      };
      proto.__ucb = true;
    }
  } catch (e) {
    console.debug("Patch Workspace.removeTypedBlock:", e);
  }

  // Workspace.removeTopBlock (block not in top blocks - base class throws)
  try {
    const proto = Blockly.Workspace.prototype as unknown as { removeTopBlock: (b: Blockly.Block) => void; topBlocks?: Blockly.Block[]; __ucb?: boolean };
    if (proto.removeTopBlock && !proto.__ucb) {
      proto.removeTopBlock = function (this: Blockly.Workspace, block: Blockly.Block) {
        const arr = (this as unknown as { topBlocks?: Blockly.Block[] }).topBlocks;
        if (!arr) return;
        const idx = arr.indexOf(block);
        if (idx < 0) return;
        arr.splice(idx, 1);
      };
      proto.__ucb = true;
    }
  } catch (e) {
    console.debug("Patch Workspace.removeTopBlock:", e);
  }

  // WorkspaceSvg.removeTopBlock (some Blockly paths call SVG override)
  try {
    const proto = Blockly.WorkspaceSvg.prototype as unknown as {
      removeTopBlock?: (b: Blockly.Block) => void;
      topBlocks?: Blockly.Block[];
      __ucbTopSvg?: boolean;
    };
    if (proto.removeTopBlock && !proto.__ucbTopSvg) {
      proto.removeTopBlock = function (this: Blockly.WorkspaceSvg, block: Blockly.Block) {
        const arr = (this as unknown as { topBlocks?: Blockly.Block[] }).topBlocks;
        if (!arr) return;
        const idx = arr.indexOf(block);
        if (idx < 0) return;
        arr.splice(idx, 1);
      };
      proto.__ucbTopSvg = true;
    }
  } catch (e) {
    console.debug("Patch WorkspaceSvg.removeTopBlock:", e);
  }
}
