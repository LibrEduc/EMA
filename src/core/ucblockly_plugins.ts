/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Configurable Blockly workspace plugins (no demo DOM).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { Backpack } from "@blockly/workspace-backpack";
import { ContentHighlight } from "@blockly/workspace-content-highlight";
import { Modal } from "@blockly/plugin-modal";
import { CrossTabCopyPaste } from "@blockly/plugin-cross-tab-copy-paste";
import { PositionedMinimap } from "@blockly/workspace-minimap";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
import { SoundToggleControl } from "./sound_toggle_control";
import { resolvePluginOptions } from "./default_options";
import type { UcBlocklyPluginOptions } from "./types";
import { applyShortcutPreferences } from "../shortcut_preferences";

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

/** LocalStorage key dedicated to µcBlockly (avoids clashing with other Blockly demos). */
const CROSS_TAB_STORAGE_KEY = "ucbBlocklyStash";

/**
 * Cross-tab copy/paste registers on global Blockly registries (not per workspace).
 * Keep a process-wide guard so remounting a workspace does not double-register.
 */
let crossTabCopyPasteInstalled = false;

const installCrossTabCopyPaste = (): void => {
  if (crossTabCopyPasteInstalled) {
    return;
  }
  const plugin = new CrossTabCopyPaste();
  plugin.init(
    { contextMenu: true, shortcut: true },
    () => {
      console.warn(
        "[µcBlockly] Cross-tab paste failed (TypeError). " +
          "The clipboard may contain an unsupported or unknown block type.",
      );
    },
    CROSS_TAB_STORAGE_KEY,
  );

  // Prefer cross-tab copy over the redundant "Duplicate" entry.
  try {
    Blockly.ContextMenuRegistry.registry.unregister("blockDuplicate");
  } catch {
    // already removed or never registered
  }

  const copyItem =
    Blockly.ContextMenuRegistry.registry.getItem("blockCopyToStorage");
  const pasteItem =
    Blockly.ContextMenuRegistry.registry.getItem("blockPasteFromStorage");
  if (copyItem) {
    copyItem.weight = 2;
  }
  if (pasteItem) {
    pasteItem.weight = 3;
  }

  crossTabCopyPasteInstalled = true;
  // Re-apply after COPY/CUT/PASTE were replaced by the plugin.
  applyShortcutPreferences();
};

/**
 * Manages optional Blockly workspace plugins from {@link UcBlocklyPluginOptions}.
 */
export class UcBlocklyPluginHost {
  private pluginOptions = resolvePluginOptions();
  private pluginsInitialized = false;
  private pluginsWorkspace: Blockly.Workspace | null = null;
  private contentHighlightActive = false;
  private minimapResyncGeneration = 0;
  private onMinimapResync:
    | ((event: Blockly.Events.Abstract) => void)
    | null = null;

  private pluginBackpack: Backpack | null = null;
  private pluginContentHighlight: ContentHighlight | null = null;
  private pluginMinimap: PositionedMinimap | null = null;
  private pluginModal: Modal | null = null;
  private pluginWorkspaceSearch: { init: () => void; dispose: () => void } | null = null;
  private pluginZoomToFit: ZoomToFitControl | null = null;
  private pluginSoundToggle: SoundToggleControl | null = null;

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
    this.safeDispose(() => this.pluginContentHighlight?.dispose());
    this.pluginContentHighlight = null;
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
      if (this.onMinimapResync) {
        workspace.removeChangeListener(this.onMinimapResync);
        this.onMinimapResync = null;
      }
      this.minimapResyncGeneration += 1;
      this.safeDispose(() => this.pluginMinimap?.dispose());
      this.safeDispose(() => this.pluginContentHighlight?.dispose());
      this.pluginContentHighlight = null;
      this.safeDispose(() => this.pluginBackpack?.dispose());
      this.safeDispose(() => this.pluginModal?.dispose());
      this.safeDispose(() => this.pluginWorkspaceSearch?.dispose());
      this.safeDispose(() => this.pluginZoomToFit?.dispose());
      this.safeDispose(() => this.pluginSoundToggle?.dispose());
      this.pluginBackpack = null;
      this.pluginMinimap = null;
      this.pluginModal = null;
      this.pluginZoomToFit = null;
      this.pluginWorkspaceSearch = null;
      this.pluginSoundToggle = null;
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

    // Global registries: install once for the page lifetime.
    if (opts.crossTabCopyPaste) {
      installCrossTabCopyPaste();
    }

    if (opts.backpack) {
      this.pluginBackpack = new Backpack(svgWorkspace, DEFAULT_BACKPACK_OPTIONS);
      this.pluginBackpack.init();
    }
    if (opts.modal) {
      this.pluginModal = new Modal(svgWorkspace);
      this.pluginModal.init();
    }
    if (opts.workspaceSearch) {
      const search = new WorkspaceSearch(svgWorkspace);
      search.init();
      this.pluginWorkspaceSearch = search;
    }
    if (opts.zoomToFit) {
      this.pluginZoomToFit = new ZoomToFitControl(svgWorkspace);
      this.pluginZoomToFit.init();
    }
    if (opts.soundToggle) {
      this.pluginSoundToggle = new SoundToggleControl(svgWorkspace);
      this.pluginSoundToggle.init();
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
        this.pluginMinimap = new PositionedMinimap(svgWorkspace);
        Blockly.svgResize(svgWorkspace);
        this.pluginMinimap.init();
        this.setMinimapVisible(opts.minimapVisible);
        this.installMinimapResync(svgWorkspace);
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

  /**
   * Minimap event mirroring can leave a ghost block at the trash position after
   * delete. Drop orphans that are no longer on the primary workspace, then zoom.
   */
  private installMinimapResync(workspace: Blockly.WorkspaceSvg): void {
    if (this.onMinimapResync) {
      workspace.removeChangeListener(this.onMinimapResync);
    }
    this.onMinimapResync = (event: Blockly.Events.Abstract): void => {
      if (
        event.type !== Blockly.Events.BLOCK_DELETE &&
        event.type !== Blockly.Events.COMMENT_DELETE
      ) {
        return;
      }
      const generation = ++this.minimapResyncGeneration;
      void Blockly.renderManagement.finishQueuedRenders().then(() => {
        if (generation !== this.minimapResyncGeneration) {
          return;
        }
        requestAnimationFrame(() => {
          if (generation !== this.minimapResyncGeneration) {
            return;
          }
          this.purgeMinimapOrphans(workspace);
        });
      });
    };
    workspace.addChangeListener(this.onMinimapResync);
  }

  private purgeMinimapOrphans(primary: Blockly.WorkspaceSvg): void {
    const minimap = (
      this.pluginMinimap as unknown as {
        minimapWorkspace?: Blockly.WorkspaceSvg | null;
      }
    ).minimapWorkspace;
    if (!minimap) {
      return;
    }

    const primaryIds = new Set(
      primary.getAllBlocks(false).map((block) => block.id),
    );
    for (const block of minimap.getAllBlocks(false)) {
      if (!primaryIds.has(block.id)) {
        block.dispose(false);
      }
    }

    const primaryCommentIds = new Set(
      primary.getTopComments(false).map((comment) => comment.id),
    );
    for (const comment of minimap.getTopComments(false)) {
      if (!primaryCommentIds.has(comment.id)) {
        comment.dispose();
      }
    }

    minimap.zoomToFit();
  }
}
