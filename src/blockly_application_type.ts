/**
 * @packageDocumentation
 * @module BlocklyApplication
 * @description Re-exports the demo shell ({@link BlocklyApplication}).
 * @remarks Workspace lifecycle is in {@link UcBlocklyWorkspaceManager} (`µcBlockly/core`).
 */

export {
  BlocklyApplication,
      div_workspace_content_blockly,
} from "./demo/blockly_application_shell";

export type { BlocklyApplicationType } from "./demo/blockly_application_shell";
