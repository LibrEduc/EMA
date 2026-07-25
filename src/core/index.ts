/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Public embed API for µcBlockly (kernel).
 *
 * @example
 * ```ts
 * import { createUcBlockly, basic_toolbox } from "ucblockly/core";
 *
 * const editor = createUcBlockly(document.getElementById("editor")!, {
 *   toolbox: basic_toolbox,
 *   language: "fr",
 *   onCodeChange: (code) => console.log(code),
 * });
 * ```
 */

export { createUcBlockly } from "./create_ucblockly";
export { registerUcBlocklyKernel, resetUcBlocklyKernelRegistrationForTests } from "./register";
export { applyUcBlocklyLocale } from "./locale";
export { sanitizeSerializedWorkspaceState } from "./workspace_state";
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

export { arduinoGenerator } from "../generators/arduino";
export { basic_toolbox, getToolboxForCurrentBoard, getToolboxWithoutBoardCategory } from "../toolbox";
export type { ToolboxConfiguration } from "../toolbox";
