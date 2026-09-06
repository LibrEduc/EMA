/**
 * @packageDocumentation
 * @module BlocklyA11yExtensions
 * @description Blockly 13 a11y extensions: advanced navigation shortcuts and screen reader mode persistence.
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

import * as Blockly from "blockly";
import { applyShortcutPreferences } from "./shortcut_preferences";

type WorkspaceSvg = Blockly.WorkspaceSvg;
type WorkspaceGetter = () => WorkspaceSvg | null | undefined;

const SCREENREADER_STORAGE_KEY = "ucbScreenreaderMode";
export const KEYBOARD_TUTORIAL_DISMISSED_KEY = "ucbKeyboardTutorialDismissed";

let extensionsInitialized = false;
let screenreaderModeEnabled = false;
let refreshWorkspaceA11y: (() => void) | null = null;

const readScreenreaderMode = (): boolean => {
  try {
    return window.localStorage?.getItem(SCREENREADER_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const persistScreenreaderMode = (enabled: boolean): void => {
  screenreaderModeEnabled = enabled;
  try {
    if (enabled) {
      window.localStorage?.setItem(SCREENREADER_STORAGE_KEY, "1");
    } else {
      window.localStorage?.removeItem(SCREENREADER_STORAGE_KEY);
    }
  } catch {
    // localStorage indisponible (mode privé, quota…)
  }
};

/**
 * Indique si le mode lecteur d'écran Blockly est actif.
 * @returns True when the condition holds.
 */
export const getScreenreaderModeEnabled = (): boolean => screenreaderModeEnabled;

const screenreaderToggleLabel = (): string => "Alt+Shift+A";

const applyScreenreaderModeToWorkspace = (
  workspace: WorkspaceSvg,
  enabled: boolean,
): void => {
  Blockly.keyboardNavigationController.setScopeChangeAudioCuesEnabled(enabled);
  workspace.getNavigator().setNavigationLoops(!enabled);
  workspace.getToolbox()?.getNavigator().setNavigationLoops(!enabled);
  workspace.getFlyout()?.getWorkspace().getNavigator().setNavigationLoops(!enabled);
};

const announceScreenreaderMode = (workspace: WorkspaceSvg, enabled: boolean): void => {
  const msg = Blockly.Msg as Record<string, string>;
  const template = enabled
    ? msg.SCREENREADER_MODE_ENABLED
    : msg.SCREENREADER_MODE_DISABLED;
  Blockly.Toast.show(workspace, {
    message: (template ?? "").replace("%1", screenreaderToggleLabel()),
    duration: 7,
    id: "screenreaderHint",
  });
};

const toggleScreenreaderMode = (workspace: WorkspaceSvg): void => {
  const next = !screenreaderModeEnabled;
  applyScreenreaderModeToWorkspace(workspace, next);
  persistScreenreaderMode(next);
  announceScreenreaderMode(workspace, next);
};

const registerPersistentScreenreaderToggle = (): void => {
  const registry = Blockly.ShortcutRegistry.registry;
  const name = Blockly.ShortcutItems.names.TOGGLE_SCREENREADER;
  registry.unregister(name);

  const keyCode = registry.createSerializedKey(Blockly.utils.KeyCodes.A, [
    Blockly.utils.KeyCodes.ALT,
    Blockly.utils.KeyCodes.SHIFT,
  ]);

  registry.register(
    {
      name,
      preconditionFn: () => true,
      callback: (workspace, event) => {
        toggleScreenreaderMode(workspace);
        event.preventDefault();
        return true;
      },
      keyCodes: [keyCode],
      allowCollision: true,
      displayText: () =>
        (Blockly.Msg as Record<string, string>).SHORTCUTS_TOGGLE_SCREENREADER_MODE ??
        "Toggle screenreader mode",
    },
    true,
  );
};

const initBlocklyA11yExtensionsOnce = (): void => {
  if (extensionsInitialized) {
    return;
  }
  extensionsInitialized = true;
  Blockly.ShortcutItems.registerNavigationShortcuts();
  screenreaderModeEnabled = readScreenreaderMode();
  registerPersistentScreenreaderToggle();
  applyShortcutPreferences();
};

/**
 * Applique le mode lecteur d'écran mémorisé sur un workspace (y compris après reboot).
 * @param workspace - Blockly workspace.
 */
export const attachBlocklyA11yToWorkspace = (workspace: WorkspaceSvg): void => {
  if (screenreaderModeEnabled) {
    applyScreenreaderModeToWorkspace(workspace, true);
  }
};

/**
 * Active les raccourcis de navigation avancés et la persistance du mode lecteur d'écran.
 * @param getter - Accessor callback.
 */
export const registerBlocklyA11yExtensions = (getter: WorkspaceGetter): void => {
  initBlocklyA11yExtensionsOnce();
  refreshWorkspaceA11y = () => {
    const workspace = getter();
    if (workspace) {
      attachBlocklyA11yToWorkspace(workspace);
    }
  };
  refreshWorkspaceA11y();
};

/**
 * Réapplique l'état a11y après recréation du workspace Blockly.
 */
export const refreshBlocklyA11yExtensions = (): void => {
  refreshWorkspaceA11y?.();
};

/**
 * Le tutoriel clavier a été marqué comme « ne plus afficher ».
 * @returns True when the condition holds.
 */
export const isKeyboardTutorialDismissed = (): boolean => {
  try {
    return window.localStorage?.getItem(KEYBOARD_TUTORIAL_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Mémorise que l'utilisateur ne souhaite plus le tutoriel automatique.
 */
export const dismissKeyboardTutorial = (): void => {
  try {
    window.localStorage?.setItem(KEYBOARD_TUTORIAL_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
};
