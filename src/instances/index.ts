/**
 * @packageDocumentation
 * @module Instances
 * @description Public API for named component instances (FieldInstance + Instances).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { installBlockInstanceMethods } from "./block_helpers";
import { registerFieldInstance } from "./field_instance";
import { patchVariableUiAgainstInstances } from "./name_guard";

export {
  INSTANCE_NAME_TYPE,
  Instances,
  allInstances,
  allInstancesOf,
  convertToUniqueName,
  convertToUniqueNameBlock,
  findInstanceNameCollision,
  findVariableNameCollision,
  generateUniqueName,
  getAnyInstanceOf,
  getInstancesFromBlock,
  isInstanceField,
  isInstancePresent,
  renameInstance,
  renameInstancesOnBlock,
  type InstanceFieldLike,
} from "./instances";

export {
  FieldInstance,
  registerFieldInstance,
  type FieldInstanceConfig,
  type FieldInstanceFromJsonConfig,
} from "./field_instance";

export {
  installBlockInstanceMethods,
  updateInstancePresenceWarning,
} from "./block_helpers";

export { mergeInstanceMessages } from "./messages";
export { patchVariableUiAgainstInstances } from "./name_guard";

/**
 * Registers FieldInstance + Block.prototype helpers. Idempotent. Called from `registerUcBlocklyKernel`.
 */
export function registerUcBlocklyInstances(): void {
  registerFieldInstance();
  installBlockInstanceMethods();
  patchVariableUiAgainstInstances();
}
