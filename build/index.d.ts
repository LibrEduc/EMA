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
 * Lazily initializes Monaco Editor to avoid heavy startup cost.
 */
export declare class LazyMonacoEditor {
    private editor?;
    private pendingValue;
    private initializing;
    /**
     * Initializes the Monaco editor if it is not already created.
     * @param container - DOM element that hosts the editor.
     * @returns Resolves when the editor is ready.
     */
    ensureInitialized(container: HTMLElement): Promise<void>;
    /**
     * Sets the editor content, deferring until initialization if needed.
     * @param value - Full editor text content.
     */
    setValue(value: string): void;
}
export declare const µcB_codeEditor: LazyMonacoEditor;
/**
 * Updates workspace SVG size and position to match layout.
 * @remarks
 * Computes offset and dimensions from the layout container and calls
 * Blockly.svgResize to update rendering.
 */
export declare const µcB_workspaceOnResize: () => void;
/**
 * Attaches mouse handlers to flex resizer elements.
 * @remarks
 * Detects resizer orientation from parent classes and delegates to the
 * resize handler.
 */
export declare const µcB_addFlexResizerEvents: () => void;
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
//# sourceMappingURL=index.d.ts.map