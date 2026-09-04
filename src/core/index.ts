/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Public embed API for µcBlockly (kernel).
 * @example
 * ```ts
 * import { createUcBlockly, basic_toolbox } from "ucblockly/core";
 * ```
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export { createUcBlockly } from "./create_ucblockly";
export { registerUcBlocklyKernel, resetUcBlocklyKernelRegistrationForTests } from "./register";
export { applyUcBlocklyLocale } from "./locale";
export { sanitizeSerializedWorkspaceState } from "./workspace_state";
export {
  UCBLOCKLY_WORKSPACE_FILE_ACCEPT,
  UCBLOCKLY_WORKSPACE_FILE_EXT,
  UCBLOCKLY_WORKSPACE_FILE_MIME,
  defaultUcBlocklyWorkspaceFilename,
} from "../workspace_file";
export {
  syncProgramStructureAfterLoad,
  NOT_IN_PROGRAM_DISABLED_REASON,
} from "../program_structure_enforcer";
export {
  DEFAULT_UCBLOCKLY_PLUGINS,
  DEFAULT_UCBLOCKLY_ENFORCERS,
  resolvePluginOptions,
  resolveEnforcerOptions,
} from "./default_options";
export { UcBlocklyPluginHost } from "./ucblockly_plugins";
export { UcBlocklyWorkspaceManager } from "./ucblockly_workspace_manager";
export type {
  UcBlocklyInstance,
  UcBlocklyOptions,
  UcBlocklyTheme,
  UcBlocklyEnforcerOptions,
  UcBlocklyPluginOptions,
  UcBlocklyRegistrationOptions,
  UcBlocklyWorkspaceManagerOptions,
} from "./types";

export { arduinoGenerator, Order } from "../generators/arduino";
export {
  ARDUINO_TYPE_KEYS,
  type ArduinoTypeKey,
} from "../generators/arduino/block_types";
export { LIST_VARIABLE_TYPE } from "../generators/arduino/variable_utils";
export {
  FieldInstance,
  Instances,
  INSTANCE_NAME_TYPE,
  registerUcBlocklyInstances,
  updateInstancePresenceWarning,
  allInstancesOf,
  isInstancePresent,
  renameInstance,
  generateUniqueName,
} from "../instances";
export { basic_toolbox, getToolboxForCurrentBoard, getToolboxWithoutBoardCategory, getToolboxWithoutSearch } from "../toolbox";
export type { ToolboxConfiguration } from "../toolbox";

export {
  loadExtensions,
  applyExtensionMessages,
  loadExtensionPack,
  createHttpExtensionIo,
  mergeExtensionsIntoToolbox,
  getLoadedExtensions,
  getExtensionMessagesForLang,
} from "../extensions";
export type {
  ExtensionManifest,
  ExtensionIo,
  LoadedExtension,
  LoadExtensionsOptions,
} from "../extensions";
