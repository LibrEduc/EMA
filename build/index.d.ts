/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly application
 * @remarks
 * Bootstraps Blockly, registers blocks, and wires UI event handlers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */
import "@blockly/block-plus-minus";
import "@blockly/toolbox-search";
import "./css/index.css";
import "./css/µcBlockly.css";
/**
 * Registers components needed for the continuous toolbox.
 * @public
 * @remarks
 * Registers ContinuousCategory, ContinuousMetrics, ContinuousFlyout,
 * ContinuousToolbox, and custom flyout inflaters. Also injects CSS
 * for the continuous toolbox appearance.
 */
export declare const registerContinuousToolboxComponents: () => void;
/**
 * Unregisters continuous toolbox components and restores defaults.
 * @public
 * @remarks
 * Removes custom CSS styles, restores standard Blockly categories
 * and flyout inflaters, and unregisters the continuous toolbox components.
 */
export declare const unregisterContinuousToolboxComponents: () => void;
/** Public API surface (same exports as before the workspace module split). */
export { LazyMonacoEditor, µcB_codeEditor } from "./code_editor";
export { µcB_workspaceOnResize } from "./workspace_resize";
export { µcB_addFlexResizerEvents } from "./workspace_flex";
//# sourceMappingURL=index.d.ts.map