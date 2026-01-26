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

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see {@link https://www.gnu.org/licenses/}.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { SeparatorAxis } from "blockly/core/flyout_separator";
import type * as Monaco from "monaco-editor";
import "@blockly/block-plus-minus";
import "@blockly/toolbox-search";

// Configuration de Monaco Editor pour utilisation locale (chemins relatifs)
// Force la définition de MonacoEnvironment pour s'assurer que les chemins sont corrects
const globalWindow = window as Window & {
  MonacoEnvironment?: {
    getWorkerUrl: (moduleId: string, label: string) => string;
  };
  Blockly?: typeof Blockly;
};

globalWindow.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    if (label === 'json') {
      return './json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  }
};

// Exposer Blockly globalement IMMÉDIATEMENT après l'import
if (typeof window !== 'undefined') {
  // Exposer Blockly et toutes ses propriétés
  globalWindow.Blockly = Blockly;

  // Exposer également les propriétés principales individuellement
  globalWindow.Blockly = {
    ...Blockly,
    Blocks: Blockly.Blocks,
    VERSION: Blockly.VERSION,
    inject: Blockly.inject,
    Workspace: Blockly.Workspace,
    WorkspaceSvg: Blockly.WorkspaceSvg,
    svgResize: Blockly.svgResize,
    registry: Blockly.registry,
    ToolboxCategory: Blockly.ToolboxCategory,
    Names: Blockly.Names,
    Variables: Blockly.Variables,
    utils: Blockly.utils
  };

  console.log('✅ Blockly et toutes ses propriétés exposés globalement immédiatement');
  console.log('Propriétés disponibles:', Object.keys(globalWindow.Blockly));
}

/**
 * Defines typed variable blocks once Blockly is available.
 * @returns True when blocks were registered, false when Blockly is unavailable.
 */
function defineTypedVariableBlocks() {
  if (typeof Blockly !== 'undefined') {
    defineAllTypedVariableBlocks();
    return true;
  }
  return false;
}

import { arduinoGenerator } from "./generators/arduino";
import { defineAllTypedVariableBlocks } from "./generators/arduino/block_definitions";
import { applyBlockTypesFromRegistry } from "./generators/arduino/block_types_registry";
import { configureStandardBlocks } from "./generators/arduino/configure_standard_blocks";
import {
  HTML_populateLanguages,
  changeLanguageToolbox,
  getLangParamFromUrl,
  HTML_changeLanguage,
} from "./language";
import { languagesMap } from "./languages/languageMap";

// Exposer arduinoGenerator globalement IMMÉDIATEMENT après l'import
if (typeof window !== 'undefined') {
  // Exposer arduinoGenerator et ses propriétés principales
  const exposedArduinoGenerator = arduinoGenerator;
  (globalWindow as typeof globalWindow & {
    arduinoGenerator?: typeof arduinoGenerator;
  }).arduinoGenerator = exposedArduinoGenerator;

  console.log('✅ arduinoGenerator et toutes ses propriétés exposés globalement immédiatement');
  console.log('Propriétés arduinoGenerator disponibles:', Object.keys(exposedArduinoGenerator));
}
import { setPluginsInURL } from "./tools";
import { basic_toolbox } from "./toolbox";
import { BlocklyApplication } from "./blockly_application_type";
//plugins
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
//import { KeyboardNavigation } from '@blockly/keyboard-navigation';
//KeyboardNavigation.registerKeyboardNavigationStyles();
import "./css/index.css";
import "./css/µcBlockly.css";

// Cache DOM elements
const elements = {
  workspaceContentArea: document.getElementById("div_workspace_content_area")!,
  workspaceContentBlockly: document.getElementById(
    "div_workspace_content_blockly",
  )!,
  contentCode: document.getElementById("div_content_code")!,
  contentMonacoEditor: document.getElementById("div_content_monacoEditor")!,
  languageMenu: document.getElementById("languageMenu") as HTMLSelectElement,
  themeMenu: document.getElementById("themeMenu") as HTMLSelectElement,
  rendererMenu: document.getElementById("rendererMenu") as HTMLSelectElement,
  pluginMinimap: document.getElementById("pluginMinimap") as HTMLInputElement,
  pluginHighlight: document.getElementById(
    "pluginHighlight",
  ) as HTMLInputElement,
  saveButton: document.getElementById("saveButton") as HTMLElement,
  loadButton: document.getElementById("loadButton") as HTMLElement,
  loadFileInput: document.getElementById("loadFileInput") as HTMLInputElement,
  undoButton: document.getElementById("undoButton") as HTMLElement,
  redoButton: document.getElementById("redoButton") as HTMLElement,
  pluginContinuousToolbox: document.getElementById(
    "pluginContinuousToolbox",
  ) as HTMLInputElement,
  alwaysOpenedToolboxFlyout: document.getElementById(
    "alwaysOpenedToolboxFlyout",
  ) as HTMLInputElement,
  codeEditorSwitch: document.getElementById(
    "codeEditorSwitch",
  ) as HTMLInputElement,
  debugSwitch: document.getElementById("debugSwitch") as HTMLInputElement,
};

// Verify all required elements exist
const requiredElements = [
  "div_workspace_content_area",
  "div_workspace_content_blockly",
  "div_content_code",
  "div_content_monacoEditor",
  "languageMenu",
  "themeMenu",
  "rendererMenu",
  "pluginMinimap",
  "pluginHighlight",
  "saveButton",
  "loadButton",
  "loadFileInput",
  "undoButton",
  "redoButton",
  "pluginContinuousToolbox",
  "codeEditorSwitch",
  "debugSwitch",
];

requiredElements.forEach((id) => {
  if (!document.getElementById(id)) {
    console.error(`Required element with id '${id}' not found in DOM`);
  }
});

/**
 * Lazily initializes Monaco Editor to avoid heavy startup cost.
 */
export class LazyMonacoEditor {
  private editor?: Monaco.editor.IStandaloneCodeEditor;
  private pendingValue: string | null = null;
  private initializing: Promise<void> | null = null;

  /**
   * Initializes the Monaco editor if it is not already created.
   * @param container - DOM element that hosts the editor.
   * @returns Resolves when the editor is ready.
   */
  async ensureInitialized(container: HTMLElement): Promise<void> {
    if (this.editor) {
      return;
    }
    if (this.initializing) {
      await this.initializing;
      return;
    }
    this.initializing = (async () => {
      const monaco = await import("monaco-editor");
      this.editor = monaco.editor.create(container, {
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        language: "cpp",
        lineNumbers: "on",
        readOnly: false,
        scrollBeyondLastLine: false,
      });
      if (this.pendingValue !== null) {
        this.editor.setValue(this.pendingValue);
        this.pendingValue = null;
      }
    })();
    await this.initializing;
  }

  /**
   * Sets the editor content, deferring until initialization if needed.
   * @param value - Full editor text content.
   */
  setValue(value: string): void {
    if (this.editor) {
      this.editor.setValue(value);
      return;
    }
    this.pendingValue = value;
  }
}

// Initialize Monaco Editor lazily
export const µcB_codeEditor = new LazyMonacoEditor();
if (elements.contentMonacoEditor) {
  elements.contentMonacoEditor.style.display = "none";
}

// Initialize Blockly Application
// Ensure custom blocks are registered before toolbox injection.
defineTypedVariableBlocks();
const µcB: BlocklyApplication = new BlocklyApplication(
  basic_toolbox,
  {
    grid: {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    },
    scrollbars: true,
    toolbox: changeLanguageToolbox(getLangParamFromUrl(), basic_toolbox),
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 6,
      minScale: 0.1,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: true,
  },
  elements.workspaceContentBlockly,
);

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
µcB.LANGUAGE_NAME = {
  ar: "العربية",
  en: "English",
  es: "Español",
  fr: "Français",
};

/**
 * List of RTL languages.
 */
µcB.LANGUAGE_RTL = ["ar", "fa", "he", "lki"];

/**
 * Updates workspace SVG size and position to match layout.
 * @remarks
 * Computes offset and dimensions from the layout container and calls
 * Blockly.svgResize to update rendering.
 */
export const µcB_workspaceOnResize = (): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    console.warn("Workspace elements not found, skipping resize");
    return;
  }

  let { offsetLeft: x, offsetTop: y } = elements.workspaceContentArea;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += element.offsetLeft;
    y += element.offsetTop;
  }
  const { offsetWidth: width, offsetHeight: height } =
    elements.workspaceContentArea;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${x}px`,
    top: `${y}px`,
  });
  Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
};

/**
 * Persists layout flex grow values to session storage.
 */
const saveLayoutToSessionStorage = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (element && window.sessionStorage) {
      const flexGrowValue = element.style.flexGrow || "1";
      window.sessionStorage.setItem(key, flexGrowValue);
    }
  });
};

/**
 * Handles flex resizing via mouse drag.
 * @param mouseDown - Initial mouse down event on the resizer.
 * @param sizeProp - Size property to adjust ("offsetWidth" or "offsetHeight").
 * @param posProp - Mouse position property ("pageX" or "pageY").
 */
const µcB_workspaceManageResize = (
  mouseDown: Event,
  sizeProp: string,
  posProp: string,
): void => {
  const recall: HTMLElement = mouseDown.target as HTMLElement;
  const prev = recall?.previousElementSibling as HTMLInputElement | null;
  const next = recall?.nextElementSibling as HTMLInputElement | null;
  if (!prev || !next) {
    return;
  }
  mouseDown.preventDefault();
  interface IElement {
    [key: string]: string;
  }
  let prevSize: number = Number((prev as unknown as IElement)[sizeProp]);
  let nextSize: number = Number((next as unknown as IElement)[sizeProp]);
  const sumSize: number = prevSize + nextSize;
  const prevGrow: number = Number(prev.style.flexGrow);
  const nextGrow: number = Number(next.style.flexGrow);
  const sumGrow: number = prevGrow + nextGrow;
  let lastPos: number = Number((mouseDown as unknown as IElement)[posProp]);

  /**
   * Adjusts flex grow while dragging.
   * @param mouseMove - Mouse move event during resize.
   */
  const onMouseMove = (mouseMove: Event): void => {
    let pos: number = Number((mouseMove as unknown as IElement)[posProp]);
    const difference: number = pos - lastPos;
    prevSize += difference;
    nextSize -= difference;
    if (prevSize < 0) {
      nextSize += prevSize;
      pos -= prevSize;
      prevSize = 0;
    }
    if (nextSize < 0) {
      prevSize += nextSize;
      pos += nextSize;
      nextSize = 0;
    }
    const prevGrowNew: number = sumGrow * (prevSize / sumSize);
    const nextGrowNew: number = sumGrow * (nextSize / sumSize);
    prev.style.flexGrow = String(prevGrowNew);
    next.style.flexGrow = String(nextGrowNew);
    lastPos = pos;
    µcB_workspaceOnResize();
  };

  /**
   * Cleans up listeners and persists layout after resize.
   */
  const onMouseUp = (): void => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.cursor = "default";
    if (String(posProp) === "pageX") {
      recall.style.cursor = "ew-resize";
    } else {
      recall.style.cursor = "ns-resize";
    }
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    saveLayoutToSessionStorage();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

/**
 * Attaches mouse handlers to flex resizer elements.
 * @remarks
 * Detects resizer orientation from parent classes and delegates to the
 * resize handler.
 */
export const µcB_addFlexResizerEvents = (): void => {
  document.body.addEventListener("mousedown", function (mouseDown: Event) {
    const html = document.querySelector("html") as HTMLElement;
    const mouseTarget = mouseDown.target as HTMLElement;
    if (mouseTarget.nodeType !== 1 || mouseTarget.tagName !== "FLEX-RESIZER") {
      return;
    }
    const parentNode = mouseTarget.parentNode as HTMLElement;
    const resizeHorizontal: boolean =
      parentNode.classList.contains("wrapper_element");
    const resizeVertical: boolean =
      parentNode.classList.contains("wrapper_global");
    if (resizeHorizontal && resizeVertical) {
      return;
    } else if (resizeHorizontal) {
      mouseTarget.style.cursor = "col-resize";
      html.style.cursor = "col-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetWidth", "pageX");
    } else if (resizeVertical) {
      mouseTarget.style.cursor = "row-resize";
      html.style.cursor = "row-resize"; // avoid cursor's flickering
      µcB_workspaceManageResize(mouseDown, "offsetHeight", "pageY");
    }
    Blockly.svgResize(µcB.workspace as Blockly.WorkspaceSvg);
  });
};

/**
 * Custom flyout inflater for category placeholders.
 */
class CategoryFlyoutInflater implements Blockly.IFlyoutInflater {
  /**
   * Creates a flyout item for category separators.
   * @param _state - Unused state data.
   * @param flyout - The flyout instance requesting items.
   */
  load(_state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    void _state;
    const axis = flyout.horizontalLayout ? SeparatorAxis.X : SeparatorAxis.Y;
    const separator = new Blockly.FlyoutSeparator(0, axis);
    return new Blockly.FlyoutItem(separator, this.getType());
  }

  /**
   * Returns the gap after this item.
   * @param _state - Unused state data.
   * @param _defaultGap - Default gap size.
   */
  gapForItem(_state: object, _defaultGap: number): number {
    void _state;
    void _defaultGap;
    return 0;
  }

  /**
   * Disposes a flyout item.
   * @param _item - Item to dispose.
   */
  disposeItem(_item: Blockly.FlyoutItem): void {
    void _item;
    // No-op: empty placeholder item.
  }

  /**
   * Returns the registered type string.
   */
  getType(): string {
    return "category";
  }
}

/**
 * Registers components needed for the continuous toolbox.
 * @public
 * @remarks
 * Registers ContinuousCategory, ContinuousMetrics, ContinuousFlyout,
 * ContinuousToolbox, and custom flyout inflaters. Also injects CSS
 * for the continuous toolbox appearance.
 */
export const registerContinuousToolboxComponents = (): void => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    ContinuousCategory,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    ContinuousMetrics,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout",
    ContinuousFlyout,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    "ContinuousToolbox",
    ContinuousToolbox,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    RecyclableBlockFlyoutInflater,
    true,
  );
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "category",
    CategoryFlyoutInflater,
    true,
  );

  // Ajouter les styles CSS pour surcharger l'apparence de la toolbox
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 auto 0.125rem;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }
    .blocklyToolboxCategory {
      height: initial;
      padding: 3px 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
    }
    .blocklyTreeLabel {
      margin: auto;
    }
    .blocklyToolboxCategoryLabel {
      text-align: center;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Unregisters continuous toolbox components and restores defaults.
 * @public
 * @remarks
 * Removes custom CSS styles, restores standard Blockly categories
 * and flyout inflaters, and unregisters the continuous toolbox components.
 */
export const unregisterContinuousToolboxComponents = (): void => {
  // Supprimer les styles CSS personnalisés pour revenir au style normal de Blockly
  const customStyles = document.querySelectorAll("style");
  customStyles.forEach((style) => {
    if (style.textContent?.includes(".categoryBubble")) {
      style.remove();
    }
  });
  // Restaurer la catégorie standard de Blockly
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    Blockly.ToolboxCategory,
    true,
  );
  // Restaurer l'inflater de bloc par défaut
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    Blockly.BlockFlyoutInflater,
    true,
  );
  // Supprimer l'inflater "category" spécifique à la toolbox continue
  try {
    Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, "category");
  } catch {
    // Ignore if already unregistered
  }
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 0.5rem 0 0;
      border-radius: 0%;
      width: 8px;
      height: 16px;
      min-height: 16px;
      flex-shrink: 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .blocklyToolboxCategoryLabel {
      vertical-align: middle;
    }
  `;
  document.head.appendChild(style);
};
/**
 * Wires UI controls (menus, toggles) to application behavior.
 */
const HTML_onChange = (): void => {
  elements.languageMenu.onchange = () => {
    const rtl: boolean = µcB.changeLanguage(true);
    µcB.WORKSPACE_OPTIONS["rtl"] = rtl;
    µcB.workspaceReboot();
  };

  elements.themeMenu.onchange = () => {
    µcB.changeTheme(elements.themeMenu.value);
  };

  elements.rendererMenu.onchange = () => {
    µcB.changeRenderer(elements.rendererMenu.value);
  };

  elements.pluginMinimap.onchange = () => {
    const minimap = document.getElementsByClassName(
      "blockly-minimap",
    )[0] as HTMLElement;
    if (minimap) {
      minimap.style.visibility = elements.pluginMinimap.checked
        ? "visible"
        : "hidden";
    }
    setPluginsInURL("pluginMinimap", "minimap");
  };

  elements.pluginHighlight.onchange = () => {
    if (elements.pluginHighlight.checked) {
      µcB.plugin_contentHighlight = new ContentHighlight(µcB.workspace);
      µcB.plugin_contentHighlight.init();
    } else {
      µcB.plugin_contentHighlight.dispose();
    }
    setPluginsInURL("pluginHighlight", "highlight");
  };

  // Save/Load file handlers
  if (elements.saveButton) {
    elements.saveButton.onclick = () => {
      const filename = `workspace_${new Date().toISOString().slice(0, 10)}.json`;
      µcB.workspaceSaveToFile(filename);
    };
  }

  if (elements.loadButton && elements.loadFileInput) {
    elements.loadButton.onclick = () => {
      elements.loadFileInput.click();
    };

    elements.loadFileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Check if workspace has existing blocks
        const hasExistingBlocks = µcB.workspace.getAllBlocks(false).length > 0;
        
        if (hasExistingBlocks) {
          // Ask user: merge or replace
          // Get current language for translation
          const currentLang = getLangParamFromUrl();
          const langMap = languagesMap[currentLang] || languagesMap['en'];
          const mergeMessage = currentLang === 'fr' 
            ? 'Le workspace contient déjà des blocs.\n\nCliquez sur "OK" pour fusionner avec les blocs existants.\nCliquez sur "Annuler" pour remplacer tous les blocs.'
            : currentLang === 'es'
            ? 'El workspace ya contiene bloques.\n\nHaga clic en "OK" para fusionar con los bloques existentes.\nHaga clic en "Cancelar" para reemplazar todos los bloques.'
            : currentLang === 'ar'
            ? 'يحتوي مساحة العمل بالفعل على كتل.\n\nانقر فوق "موافق" للدمج مع الكتل الموجودة.\nانقر فوق "إلغاء" لاستبدال جميع الكتل.'
            : 'The workspace already contains blocks.\n\nClick "OK" to merge with existing blocks.\nClick "Cancel" to replace all blocks.';
          const merge = confirm(mergeMessage);
          µcB.workspaceLoadFromFile(file, merge);
        } else {
          // No existing blocks, just load
          µcB.workspaceLoadFromFile(file, false);
        }
        // Reset input value to allow reloading the same file
        target.value = '';
      }
    };
  }

  elements.undoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(false);
    }
  };

  elements.redoButton.onclick = () => {
    const workspace = µcB.workspace as Blockly.WorkspaceSvg | undefined;
    if (workspace) {
      workspace.undo(true);
    }
  };

  elements.pluginContinuousToolbox.onchange = () => {
    if (elements.pluginContinuousToolbox.checked) {
      registerContinuousToolboxComponents();
      µcB.WORKSPACE_OPTIONS["plugins"] = {
        flyoutsVerticalToolbox: "ContinuousFlyout",
        metricsManager: "ContinuousMetrics",
        toolbox: "ContinuousToolbox",
      };
    } else {
      unregisterContinuousToolboxComponents();
      delete µcB.WORKSPACE_OPTIONS["plugins"];
    }
    setPluginsInURL("pluginContinuousToolbox", "ctoolbox");
    µcB.workspaceReboot();
  };

  elements.alwaysOpenedToolboxFlyout.onchange = () => {
    µcB.applyAlwaysOpenedToolboxFlyout();
    setPluginsInURL("alwaysOpenedToolboxFlyout", "flyout");
  };

  elements.codeEditorSwitch.onchange = () => {
    if (elements.codeEditorSwitch.checked) {
      if (elements.contentCode) elements.contentCode.style.display = "none";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "block";
        elements.contentMonacoEditor.style.height = "100%";
        elements.contentMonacoEditor.style.width = "100%";
        void µcB_codeEditor.ensureInitialized(elements.contentMonacoEditor);
      }
    } else {
      if (elements.contentCode) elements.contentCode.style.display = "block";
      if (elements.contentMonacoEditor) {
        elements.contentMonacoEditor.style.display = "none";
      }
    }
    setPluginsInURL("codeEditorSwitch", "codeEditor");
  };

  elements.debugSwitch.onchange = () => {
    const enabled = elements.debugSwitch.checked;
    (globalThis as { __UCB_DEBUG__?: boolean }).__UCB_DEBUG__ = enabled;
    try {
      if (enabled) {
        window.localStorage?.setItem("ucbDebug", "1");
      } else {
        window.localStorage?.removeItem("ucbDebug");
      }
    } catch {
      // Ignore storage errors
    }
    setPluginsInURL("debugSwitch", "debug");
  };
};

/**
 * Clears saved state and reloads the application to defaults.
 */
const resetAllParameters = (): void => {
  µcB.workspaceSetupPlugins(true);
  µcB.workspace.dispose();

  // Effacer toutes les données du sessionStorage
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
  // Effacer toutes les données du localStorage (si utilisé)
  if (window.localStorage) {
    window.localStorage.clear();
  }

  // Réinitialiser les tailles des divs aux valeurs par défaut
  document.getElementById("flex_container_up_right")!.style.flexGrow = "0";
  document.getElementById("flex_container_bottom")!.style.flexGrow = "0";
  document.getElementById("flex_container_up")!.style.flexGrow = "1";
  document.getElementById("flex_container_up_left")!.style.flexGrow = "1";

  const originalToolbox = µcB.stripCustomCategoriesForContinuousToolbox();
  µcB.workspace = Blockly.inject(
    document.getElementById("div_workspace_content_blockly")!,
    µcB.WORKSPACE_OPTIONS,
  );
  µcB.restoreWorkspaceAfterInject();
  µcB.workspaceSetupPlugins(false);
  µcB.restoreToolboxAfterInject(originalToolbox);

  // Recharger la page sur la racine
  window.location.href = "/";
};

/**
 * Executes a callback when the DOM is ready.
 * @param callback - Function to execute after DOM is loaded.
 */
const DomIsLoaded = (callback: () => void): void => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

/**
 * Defers non-critical DOM initialization work.
 * @param callback - Work to schedule when idle or after a short timeout.
 */
const scheduleNonCriticalDomInit = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  setTimeout(callback, 0);
};
// The `DomIsLoaded` function prepares everything needed by structure of DOM.
DomIsLoaded((): void => {
  // Définir les blocs de variables typées après que Blockly soit chargé
  if (defineTypedVariableBlocks()) {
    console.log('✅ Blocs de variables typées définis au bon moment');
  } else {
    console.log('⚠️ Blockly pas encore disponible, retry dans 100ms...');
    // Retry après un délai
    setTimeout(() => {
      if (defineTypedVariableBlocks()) {
        console.log('✅ Blocs de variables typées définis après retry');
      } else {
        console.error('❌ Impossible de définir les blocs de variables typées');
      }
    }, 100);
  }

  // Appliquer les types de blocs depuis le registre
  if (typeof Blockly !== 'undefined') {
    applyBlockTypesFromRegistry();
    // Configurer les blocs standards (controls_if, etc.)
    configureStandardBlocks();
  }

  HTML_populateLanguages(µcB);
  µcB.changeLanguage(false);
  µcB.workspaceInit();
});

/* The `window.onload` event is triggered when the entire page has finished loading, including all
resources such as images and scripts. */
window.onload = (): void => {
  // Blockly et arduinoGenerator sont déjà exposés globalement
  console.log('🔄 window.onload - Vérification des composants...');

  // S'assurer que les blocs de variables typées sont définis
  if (!Blockly.Blocks['variables_get_dynamic'] || !Blockly.Blocks['variables_set_dynamic']) {
    console.log('🔄 Redéfinition des blocs de variables typées dans window.onload...');
    defineTypedVariableBlocks();
  }

  HTML_onChange();
  const code = arduinoGenerator.workspaceToCode(µcB.workspace);
  µcB_codeEditor.setValue(code);
  if (elements.contentCode) {
    elements.contentCode.textContent = code;
  }

  // Restore saved layout
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    const savedValue = window.sessionStorage.getItem(key);
    if (savedValue && element) {
      // Restaurer la valeur flexGrow pour maintenir la compatibilité avec le système de resizers
      element.style.flexGrow = savedValue;
    }
  });

  µcB.workspaceSetupPlugins(false);

  // Attendre que le DOM soit complètement stabilisé avant d'appeler workspaceOnResize
  // Utiliser requestAnimationFrame pour s'assurer que le layout est calculé
  requestAnimationFrame(() => {
    µcB_workspaceOnResize();
    µcB.setParamsBlockly();
    µcB.workspaceLoadBlocks("mainWorkspace_blocks");
    (µcB.workspace as Blockly.WorkspaceSvg).scrollCenter();
    µcB.pluginsSetupWorkspace();
    scheduleNonCriticalDomInit(() => {
      // Initialize minimap
      const minimap = document.getElementsByClassName(
        "blockly-minimap",
      )[0] as HTMLElement;
      const searchParams = new URLSearchParams(window.location.search);
      const paramsURL = searchParams.get("options")
        ? searchParams.get("options")!.split(",").filter(Boolean)
        : [];
      const minimapParam = searchParams.get("minimap");
      const minimapFromUrl = minimapParam !== null
        && minimapParam !== "0"
        && minimapParam !== "false";
      const minimapEnabled =
        window.sessionStorage.getItem("pluginMinimap") === "true" ||
        paramsURL.includes("minimap") ||
        minimapFromUrl;
      if (minimap) {
        minimap.style.visibility = minimapEnabled ? "visible" : "hidden";
        elements.pluginMinimap.checked = minimapEnabled;
      }

      const continuousEnabled =
        window.sessionStorage.getItem("pluginContinuousToolbox") === "true" ||
        new URLSearchParams(window.location.search)
          .get("options")
          ?.split(",")
          .includes("ctoolbox");
      if (!continuousEnabled) {
        // Initialize toolbox categories for standard toolbox
        const categories = Array.from(
          document.getElementsByClassName(
            "blocklyTreeRowContentContainer",
          ) as HTMLCollectionOf<HTMLElement>,
        );
        categories.forEach((category) => {
          category.style.flexDirection = "row";
        });

        const toolboxContents = document.getElementsByClassName(
          "blocklyToolboxContents",
        )[0] as HTMLElement;
        if (toolboxContents) {
          toolboxContents.style.alignItems = "start";
        }
      }

      // Attacher l'événement de clic sur le titre pour réinitialiser tous les paramètres
      const titleElement = document.getElementById("title");
      if (titleElement) {
        titleElement.addEventListener("click", resetAllParameters);
        // Ajouter un style pour indiquer que c'est cliquable
        titleElement.style.cursor = "pointer";

        // Créer un span avec la classe lang pour la traduction automatique
        const titleSpan = document.createElement("span");
        titleSpan.className = "lang";
        titleSpan.setAttribute("key", "RESET_TITLE");
        titleSpan.textContent = "Click to reset all parameters";

        // Appliquer la traduction selon la langue actuelle
        const currentLang = getLangParamFromUrl();
        HTML_changeLanguage(currentLang);

        // Définir le tooltip avec le texte traduit
        titleElement.title = titleSpan.textContent;
      }
    });
  });

};

/* The above code is a TypeScript code snippet that sets the `onbeforeunload` event handler for the
window object. This event is triggered when the user is about to leave the current page, and save windows position in UI. */
window.onbeforeunload = (): void => {
  saveLayoutToSessionStorage();
  µcB.workspaceSaveBlocks("mainWorkspace_blocks");
  µcB.workspaceSetupPlugins(true);
};
