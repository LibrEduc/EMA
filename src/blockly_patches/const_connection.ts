/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Allow any value into variables_const.
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
 * Extends ConnectionChecker so that connecting any value block to variables_const is always allowed.
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
