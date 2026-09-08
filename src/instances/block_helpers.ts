/**
 * @packageDocumentation
 * @module Instances.BlockHelpers
 * @description Warning helper + optional Block.prototype patch for instances.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getBlocklyMsgOr } from "../categories/blockly/shared";
import {
  getInstancesFromBlock,
  isInstancePresent,
  renameInstancesOnBlock,
} from "./instances";

export {
  getInstancesFromBlock,
  renameInstancesOnBlock,
} from "./instances";

/**
 * Warning on usage blocks when no other block declares the selected instance. Call from block `onchange`.
 * @param block - Blockly block instance.
 * @param fieldName - Field name on the block.
 * @param instanceType - Logical instance type (e.g. `Servo`).
 * @param componentLabel - The `componentLabel` argument.
 */
export function updateInstancePresenceWarning(
  block: Blockly.Block,
  fieldName: string,
  instanceType: string,
  componentLabel?: string,
): void {
  if (!block.workspace) {
    return;
  }
  const instanceName = block.getFieldValue(fieldName) as string;
  if (!instanceName) {
    block.setWarningText(null);
    return;
  }
  if (isInstancePresent(instanceName, instanceType, block)) {
    block.setWarningText(null);
    return;
  }
  const template = getBlocklyMsgOr(
    "COMPONENT_WARN",
    'Component "%2" needs a configuration block%1',
  );
  const label = componentLabel ?? "";
  const prefix = label ? ` (${label})` : "";
  block.setWarningText(
    template.replace("%1", prefix).replace("%2", instanceName),
  );
}

type BlockWithInstances = Blockly.Block & {
  getInstances?: (opt_instanceType?: string) => string[];
  renameInstance?: (
    oldName: string,
    newName: string,
    instanceType: string,
  ) => void;
  __ucbInstanceMethods?: boolean;
};

/**
 * Patches `Block.prototype` with getInstances / renameInstance (@rduino API).
 */
export function installBlockInstanceMethods(): void {
  const proto = Blockly.Block.prototype as BlockWithInstances;
  if (proto.__ucbInstanceMethods) {
    return;
  }
  proto.__ucbInstanceMethods = true;
  proto.getInstances = function (
    this: Blockly.Block,
    opt_instanceType?: string,
  ): string[] {
    return getInstancesFromBlock(this, opt_instanceType);
  };
  proto.renameInstance = function (
    this: Blockly.Block,
    oldName: string,
    newName: string,
    instanceType: string,
  ): void {
    renameInstancesOnBlock(this, oldName, newName, instanceType);
  };
}
