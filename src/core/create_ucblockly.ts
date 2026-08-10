/**
 * @packageDocumentation
 * @module UcBlocklyCore
 * @description Main embed API — inject Blockly + Arduino generator into a container.
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
import { refreshBoardPinDropdowns } from "../categories/blockly";
import { arduinoGenerator } from "../generators/arduino";
import {
  installProgramStructureEnforcer,
  syncProgramStructureAfterLoad,
  uninstallProgramStructureEnforcer,
} from "../program_structure_enforcer";
import {
  installStrictTypeEnforcer,
  uninstallStrictTypeEnforcer,
} from "../generators/arduino/strict_type_enforcer";
import { registerStrictConnectionCheckerInRegistry } from "../generators/arduino/strict_connection_checker";
import { patchFieldVariableValidation, patchVariableMapCreateVariable } from "../blockly_patches";
import { changeLanguageToolbox } from "../language";
import { themeMappings } from "../options";
import { resolveEnforcerOptions } from "./default_options";
import { applyUcBlocklyLocale } from "./locale";
import { registerUcBlocklyKernel } from "./register";
import type { UcBlocklyInstance, UcBlocklyOptions, UcBlocklyTheme } from "./types";
import { sanitizeSerializedWorkspaceState } from "./workspace_state";

const INJECTION_HOST_CLASS = "ucblockly-injection-host";

let strictConnectionCheckerRegistered = false;

function ensureStrictConnectionCheckerRegistered(): void {
  if (!strictConnectionCheckerRegistered) {
    registerStrictConnectionCheckerInRegistry();
    strictConnectionCheckerRegistered = true;
  }
}

function resolveTheme(theme: UcBlocklyTheme | undefined): Blockly.Theme {
  if (theme !== undefined && typeof theme !== "string") {
    return theme;
  }
  const key = theme ?? "classic";
  return themeMappings[key as keyof typeof themeMappings] ?? themeMappings.classic;
}

function ensureInjectionHost(container: HTMLElement): HTMLElement {
  const style = container.style;
  if (!style.position || style.position === "static") {
    style.position = "relative";
  }
  if (!style.width) {
    style.width = "100%";
  }
  if (!style.height && !style.minHeight) {
    style.minHeight = "300px";
  }

  let host = container.querySelector(`.${INJECTION_HOST_CLASS}`) as HTMLElement | null;
  if (!host) {
    host = document.createElement("div");
    host.className = INJECTION_HOST_CLASS;
    host.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(host);
  }
  return host;
}

/**
 * Creates a µcBlockly editor inside `container` without requiring demo shell DOM ids.
 *
 * @param container - Host element; a child div is created for Blockly injection unless
 *   `options.injectionTarget` is set.
 * @param options - Toolbox, language, theme, and optional callbacks.
 * @returns API handle with workspace, code generation, and serialization.
 */
export function createUcBlockly(
  container: HTMLElement,
  options: UcBlocklyOptions,
): UcBlocklyInstance {
  registerUcBlocklyKernel(options.registration);
  const enforcers = resolveEnforcerOptions(options.enforcers);
  if (enforcers.strictConnectionChecker) {
    ensureStrictConnectionCheckerRegistered();
  }

  const language = options.language ?? "fr";
  applyUcBlocklyLocale(language);

  const localizeToolbox = options.localizeToolbox !== false;
  const toolbox = localizeToolbox
    ? changeLanguageToolbox(language, options.toolbox)
    : options.toolbox;

  const injectionDiv = options.injectionTarget ?? ensureInjectionHost(container);
  if (options.injectionTarget) {
    const style = injectionDiv.style;
    if (!style.position || style.position === "static") {
      style.position = "relative";
    }
    // Pourcentage CSS sur parent sans hauteur explicite → clientHeight 0 → toolbox invisible.
    if (injectionDiv.clientHeight < 40 && !style.minHeight) {
      style.minHeight = "300px";
    }
  }

  const hostWorkspaceOptions = options.workspaceOptions ?? {};
  const workspaceOptions: Blockly.BlocklyOptions = {
    scrollbars: true,
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
    media: options.media ?? "./media/",
    theme: resolveTheme(options.theme),
    toolbox,
    ...hostWorkspaceOptions,
  };

  // Grille : défaut ON seulement si l’hôte ne la définit pas.
  // `grid: null` / `undefined` explicite via `in` → pas de grille.
  if (!Object.prototype.hasOwnProperty.call(hostWorkspaceOptions, "grid")) {
    workspaceOptions.grid = {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    };
  } else if (
    hostWorkspaceOptions.grid === null ||
    hostWorkspaceOptions.grid === undefined
  ) {
    delete workspaceOptions.grid;
  }

  const workspace = Blockly.inject(injectionDiv, workspaceOptions);
  patchFieldVariableValidation();
  patchVariableMapCreateVariable(workspace);

  const strictTypes = enforcers.strictTypes;
  const programStructure = enforcers.programStructure;

  if (strictTypes) {
    installStrictTypeEnforcer(workspace, {
      mode: "disconnect",
      scope: "variables-only",
    });
  }
  if (programStructure) {
    installProgramStructureEnforcer(workspace);
  }

  let codegenTimer: number | null = null;

  const getCode = (): string => arduinoGenerator.workspaceToCode(workspace);

  const notifyCodeChange = (): void => {
    options.onCodeChange?.(getCode());
  };

  if (options.onCodeChange) {
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || (workspace as Blockly.WorkspaceSvg).isDragging()) {
        return;
      }
      if (event.type === Blockly.Events.FINISHED_LOADING) {
        return;
      }
      if (codegenTimer !== null) {
        window.clearTimeout(codegenTimer);
      }
      codegenTimer = window.setTimeout(() => {
        notifyCodeChange();
        codegenTimer = null;
      }, 150);
    });
  }

  return {
    workspace,
    getCode,
    saveWorkspace(): object {
      const data = Blockly.serialization.workspaces.save(workspace);
      sanitizeSerializedWorkspaceState(data);
      return data;
    },
    loadWorkspace(state: object): void {
      sanitizeSerializedWorkspaceState(state);
      workspace.clear();
      Blockly.serialization.workspaces.load(state, workspace);
      refreshBoardPinDropdowns(workspace);
      syncProgramStructureAfterLoad(workspace, programStructure);
      notifyCodeChange();
    },
    resize(): void {
      Blockly.svgResize(workspace as Blockly.WorkspaceSvg);
    },
    dispose(): void {
      if (codegenTimer !== null) {
        window.clearTimeout(codegenTimer);
        codegenTimer = null;
      }
      if (strictTypes) {
        uninstallStrictTypeEnforcer(workspace);
      }
      if (programStructure) {
        uninstallProgramStructureEnforcer(workspace);
      }
      workspace.dispose();
    },
  };
}
