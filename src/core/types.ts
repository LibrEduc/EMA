/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Public API types for embedding µcBlockly.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type * as Blockly from "blockly";
import type { ToolboxConfiguration } from "../toolbox";

/** Blockly theme name (see `themeMappings`) or a custom Blockly theme instance. */
export type UcBlocklyTheme = string | Blockly.Theme;

/** Optional enforcers applied after workspace injection. */
export interface UcBlocklyEnforcerOptions {
  /** Typed variable connection checks (default: true). */
  strictTypes?: boolean;
  /** setup/loop structure rules (default: true). */
  programStructure?: boolean;
  /** Strict connection checker plugin (default: false). */
  strictConnectionChecker?: boolean;
}

/** Optional Blockly workspace plugins (demo toggles map to these flags). */
export interface UcBlocklyPluginOptions {
  backpack?: boolean;
  contentHighlight?: boolean;
  minimap?: boolean;
  /** Visible when minimap is enabled (default: true). */
  minimapVisible?: boolean;
  modal?: boolean;
  workspaceSearch?: boolean;
  zoomToFit?: boolean;
  shadowBlockConverter?: boolean;
  /**
   * Cross-tab copy/paste via localStorage (Ctrl/Cmd+C/X/V + context menu).
   * Replaces Blockly's built-in clipboard shortcuts when enabled (default: true).
   */
  crossTabCopyPaste?: boolean;
  /** Bottom-right speaker control to mute/unmute Blockly sounds (default: true). */
  soundToggle?: boolean;
}

/** One-time block / generator registration flags. */
export interface UcBlocklyRegistrationOptions {
  typedVariables?: boolean;
  blockTypesRegistry?: boolean;
  configureStandardBlocks?: boolean;
  blockLevels?: boolean;
}

/** Options for {@link createUcBlockly}. */
export interface UcBlocklyOptions {
  /** Toolbox JSON (required). */
  toolbox: ToolboxConfiguration;
  /** UI language code (default: `"fr"`). */
  language?: string;
  /** Blockly theme (default: `"classic"`). */
  theme?: UcBlocklyTheme;
  /** Translate toolbox category labels for {@link language} (default: true). */
  localizeToolbox?: boolean;
  /** Blockly media path (default: `"./media/"`). */
  media?: string;
  /** Inject into this element instead of auto-creating a host div. */
  injectionTarget?: HTMLElement;
  /** Merged into Blockly inject options (toolbox/theme/media applied first). */
  workspaceOptions?: Omit<Blockly.BlocklyOptions, "toolbox" | "theme" | "media">;
  enforcers?: UcBlocklyEnforcerOptions;
  registration?: UcBlocklyRegistrationOptions;
  /** Blockly workspace plugins (backpack, minimap, search, …). */
  plugins?: UcBlocklyPluginOptions;
  /** Called when generated Arduino code changes (debounced). */
  onCodeChange?: (code: string) => void;
}

/** Handle returned by {@link createUcBlockly}. */
export interface UcBlocklyInstance {
  readonly workspace: Blockly.Workspace;
  getCode(): string;
  saveWorkspace(): object;
  loadWorkspace(state: object): void;
  resize(): void;
  dispose(): void;
}

/** Configuration for {@link UcBlocklyWorkspaceManager} (workspace layer, no demo DOM). */
export interface UcBlocklyWorkspaceManagerOptions {
  /** Base toolbox before board/language resolution. */
  baseToolbox: ToolboxConfiguration;
  /** Blockly inject options (toolbox/theme may be overridden on mount). */
  workspaceOptions: Record<string, unknown>;
  language: string;
  injectionDiv: HTMLElement;
  enforcers?: UcBlocklyEnforcerOptions;
  plugins?: UcBlocklyPluginOptions;
  onCodeChange?: (code: string) => void;
  /** When true, defer minimap init until after layout (continuous toolbox reboot). */
  deferMinimapInit?: boolean;
}
