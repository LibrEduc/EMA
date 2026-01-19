/**
 * @packageDocumentation
 * @module µcBlockly
 * @description Main entry point for µcBlockly application
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */
import "@blockly/block-plus-minus";
import "@blockly/toolbox-search";
import "./css/index.css";
import "./css/µcBlockly.css";
declare class LazyMonacoEditor {
    private editor?;
    private pendingValue;
    private initializing;
    ensureInitialized(container: HTMLElement): Promise<void>;
    setValue(value: string): void;
}
export declare const µcB_codeEditor: LazyMonacoEditor;
/**
 * Handles the resizing of the workspace.
 * This function calculates the offset position of the workspace content area,
 * and assigns these values, along with its width and height, to the workspace content blockly.
 * It then triggers a resize event on the Blockly workspace.
 */
export declare const µcB_workspaceOnResize: () => void;
/**
 * The function `µcB_addFlexResizerEvents` adds event listeners for resizing elements horizontally or
 * vertically based on their parent's class.
 * @returns In the provided code snippet, the `µcB_addFlexResizerEvents` function is returning `void`,
 * which means it does not return any value. The function sets up event listeners for mouse events on
 * the document body, specifically for the "mousedown" event. When the mouse is clicked, it checks if
 * the target element is a "FLEX-RESIZER" element and then performs certain
 */
export declare const µcB_addFlexResizerEvents: () => void;
export declare const registerContinuousToolboxComponents: () => void;
export declare const unregisterContinuousToolboxComponents: () => void;
export {};
//# sourceMappingURL=index.d.ts.map