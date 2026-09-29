/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Defensive Workspace/Gesture/ConnectionDB patches.
 */

import * as Blockly from "blockly";

// ─── Defensive patches ─────────────────────────────────────────────────────────────
// During drag, Blockly calls previewMarker → connect_ → setParent → removeTopBlock.
// If the block (e.g. Array_list_3) is not yet in topBlocks, removeTopBlock throws.
// We absorb the error to avoid a crash.

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
