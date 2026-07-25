/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Configurable Blockly workspace plugins (no demo DOM).
 */

import * as Blockly from "blockly";
import { Backpack } from "@blockly/workspace-backpack";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
import { Modal } from "@blockly/plugin-modal";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
import { resolvePluginOptions } from "./default_options";
import type { UcBlocklyPluginOptions } from "./types";

const DEFAULT_BACKPACK_OPTIONS = {
  allowEmptyBackpackOpen: true,
  useFilledBackpackImage: true,
  skipSerializerRegistration: false,
  contextMenu: {
    emptyBackpack: true,
    removeFromBackpack: true,
    copyToBackpack: true,
    copyAllToBackpack: true,
    pasteAllToBackpack: true,
    disablePreconditionChecks: true,
  },
};

/**
 * Manages optional Blockly workspace plugins from {@link UcBlocklyPluginOptions}.
 */
export class UcBlocklyPluginHost {
  private pluginOptions = resolvePluginOptions();
  private pluginsInitialized = false;
  private pluginsWorkspace: Blockly.Workspace | null = null;
  private contentHighlightActive = false;

  private pluginBackpack = new Backpack();
  private pluginContentHighlight = new ContentHighlight();
  private pluginMinimap = new PositionedMinimap();
  private pluginModal = new Modal();
  private pluginWorkspaceSearch: { init: () => void; dispose: () => void } | null = null;
  private pluginZoomToFit = new ZoomToFitControl();

  /** Updates plugin flags (e.g. from demo checkboxes) before init. */
  setOptions(options?: UcBlocklyPluginOptions): void {
    this.pluginOptions = resolvePluginOptions(options);
  }

  getOptions(): Required<UcBlocklyPluginOptions> {
    return this.pluginOptions;
  }

  /**
   * Toggles content highlight without tearing down other plugins.
   * Blockly plugins (e.g. backpack) cannot re-register on the same workspace.
   */
  setContentHighlight(workspace: Blockly.Workspace, enabled: boolean): void {
    if (enabled === this.contentHighlightActive) {
      return;
    }
    this.pluginOptions = { ...this.pluginOptions, contentHighlight: enabled };
    if (enabled) {
      this.pluginContentHighlight = new ContentHighlight(
        workspace as Blockly.WorkspaceSvg,
      );
      this.pluginContentHighlight.init();
      this.contentHighlightActive = true;
      return;
    }
    this.safeDispose(() => this.pluginContentHighlight.dispose());
    this.contentHighlightActive = false;
  }

  /** Sets minimap DOM visibility when minimap plugin is active. */
  setMinimapVisible(visible: boolean): void {
    const minimapEl = document.getElementsByClassName(
      "blockly-minimap",
    )[0] as HTMLElement | undefined;
    if (minimapEl) {
      minimapEl.style.visibility = visible ? "visible" : "hidden";
    }
  }

  /**
   * Initializes or disposes workspace plugins.
   * @param workspace - Target workspace.
   * @param dispose - When true, disposes plugins.
   * @param onReady - Called after sync plugins; minimap may init later when deferred.
   * @param deferMinimap - Defer minimap until after layout paint.
   */
  setup(
    workspace: Blockly.Workspace,
    dispose: boolean,
    onReady?: () => void,
    deferMinimap = false,
  ): void {
    const opts = this.pluginOptions;
    if (dispose) {
      if (!this.pluginsInitialized) {
        this.pluginsWorkspace = null;
        return;
      }
      if (opts.shadowBlockConverter) {
        workspace.removeChangeListener(shadowBlockConversionChangeListener);
      }
      this.safeDispose(() => this.pluginMinimap.dispose());
      this.safeDispose(() => this.pluginContentHighlight.dispose());
      this.safeDispose(() => this.pluginBackpack.dispose());
      this.safeDispose(() => this.pluginModal.dispose());
      this.safeDispose(() => this.pluginWorkspaceSearch?.dispose());
      this.safeDispose(() => this.pluginZoomToFit.dispose());
      this.pluginsInitialized = false;
      this.pluginsWorkspace = null;
      this.contentHighlightActive = false;
      return;
    }

    if (this.pluginsInitialized && this.pluginsWorkspace === workspace) {
      return;
    }
    if (this.pluginsInitialized && this.pluginsWorkspace !== workspace) {
      this.setup(workspace, true);
    }

    const svgWorkspace = workspace as Blockly.WorkspaceSvg;

    if (opts.backpack) {
      this.pluginBackpack = new Backpack(svgWorkspace, DEFAULT_BACKPACK_OPTIONS);
      this.pluginBackpack.init();
    }
    if (opts.modal) {
      this.pluginModal = new Modal(workspace);
      this.pluginModal.init();
    }
    if (opts.workspaceSearch) {
      const search = new WorkspaceSearch(svgWorkspace);
      search.init();
      this.pluginWorkspaceSearch = search;
    }
    if (opts.zoomToFit) {
      this.pluginZoomToFit = new ZoomToFitControl(workspace);
      this.pluginZoomToFit.init();
    }
    if (opts.shadowBlockConverter) {
      workspace.addChangeListener(shadowBlockConversionChangeListener);
    }
    if (opts.contentHighlight) {
      this.pluginContentHighlight = new ContentHighlight(svgWorkspace);
      this.pluginContentHighlight.init();
      this.contentHighlightActive = true;
    }

    this.pluginsInitialized = true;
    this.pluginsWorkspace = workspace;

    const finishMinimap = (): void => {
      if (opts.minimap) {
        Blockly.svgResize(svgWorkspace);
        this.pluginMinimap = new PositionedMinimap(workspace);
        Blockly.svgResize(svgWorkspace);
        this.pluginMinimap.init();
        this.setMinimapVisible(opts.minimapVisible);
      }
      onReady?.();
    };

    if (opts.minimap && deferMinimap) {
      requestAnimationFrame(() => {
        requestAnimationFrame(finishMinimap);
      });
    } else {
      finishMinimap();
    }
  }

  private safeDispose(fn: () => void): void {
    try {
      fn();
    } catch {
      // no-op if never initialized
    }
  }
}
