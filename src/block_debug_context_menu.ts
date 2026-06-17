/**
 * @packageDocumentation
 * @module BlockDebugContextMenu
 * @description Entrées de menu contextuel (clic droit) visibles en mode debug.
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { isDebugEnabled } from "./generators/arduino/debug";
import { arduinoGenerator } from "./generators/arduino";
import {
  VARIABLES_DEFINE_BLOCK_TYPE,
  VARIABLES_DEFINE_LEGACY_BLOCK_TYPE,
} from "./generators/arduino/variable_utils";

/** Fonction d'enregistrement Blockly associée à un type de bloc (blocs µcBlockly). */
const BLOCK_DEFINITION_FUNCTIONS: Readonly<Record<string, string>> = {
  Array_with: "defineArrayBlocks",
  Array_list_literal: "defineArrayBlocks",
  Array_list_3: "defineArrayBlocks",
  Array_declare: "defineArrayBlocks",
  Array_create: "defineArrayBlocks",
  Array_modify: "defineArrayBlocks",
  Array_fix: "defineArrayBlocks",
  Array_getIndex_in_list: "defineArrayBlocks",
  Array_getIndex_in_array: "defineArrayBlocks",
  controls_forEach: "defineLoopsBlocks",
  variables_get_dynamic: "defineVariablesGetDynamicBlock",
  variables_set_dynamic: "defineVariablesSetDynamicBlock",
  variables_cast: "defineVariablesCastBlock",
  variables_local: "defineVariablesLocalBlock",
  variables_set_type: "defineVariablesSetTypeBlock",
  variables_const: "defineVariablesConstBlock",
  variables_set_init: "defineVariablesSetInitBlock",
  [VARIABLES_DEFINE_BLOCK_TYPE]: "defineVariablesDefineBlock",
  [VARIABLES_DEFINE_LEGACY_BLOCK_TYPE]: "defineVariablesDefineBlock",
  controls_switch: "defineControlsSwitchBlocks",
  board_base_setup: "defineBoardBlocks",
  board_base_loop: "defineBoardBlocks",
  board_base_setup_loop: "defineBoardBlocks",
};

export type BlockDefinitionWithDebug = {
  debugDefinitionFn?: string;
};

let installed = false;

function getContextBlock(
  scope: Blockly.ContextMenuRegistry.Scope,
): Blockly.Block | null {
  if (scope.block) {
    return scope.block;
  }
  const node = scope.focusedNode;
  if (node instanceof Blockly.BlockSvg) {
    return node;
  }
  return null;
}

function isBlockContext(scope: Blockly.ContextMenuRegistry.Scope): boolean {
  return getContextBlock(scope) !== null;
}

function debugPrecondition(
  scope: Blockly.ContextMenuRegistry.Scope,
): "enabled" | "disabled" | "hidden" {
  if (!isDebugEnabled() || !isBlockContext(scope)) {
    return "hidden";
  }
  return "disabled";
}

function resolveDefinitionFn(blockType: string): string | null {
  const def = Blockly.Blocks[blockType] as BlockDefinitionWithDebug | undefined;
  if (def?.debugDefinitionFn) {
    return def.debugDefinitionFn;
  }
  return BLOCK_DEFINITION_FUNCTIONS[blockType] ?? null;
}

function resolveGeneratorFn(blockType: string): string | null {
  if (Object.prototype.hasOwnProperty.call(arduinoGenerator.forBlock, blockType)) {
    return blockType;
  }
  return null;
}

function copyBlockType(scope: Blockly.ContextMenuRegistry.Scope): void {
  const block = getContextBlock(scope);
  if (!block?.type) {
    return;
  }
  void navigator.clipboard?.writeText(block.type);
}

/**
 * Enregistre les entrées de menu contextuel debug (une seule fois).
 */
export function installBlockDebugContextMenu(): void {
  if (installed) {
    return;
  }
  installed = true;

  const registry = Blockly.ContextMenuRegistry.registry;

  registry.register({
    id: "ucb_debug_block_type",
    weight: -120,
    preconditionFn(scope) {
      return debugPrecondition(scope);
    },
    displayText(scope) {
      const block = getContextBlock(scope);
      return block ? `type · ${block.type}` : "type · ?";
    },
    callback() {
      /* affichage seulement */
    },
  });

  registry.register({
    id: "ucb_debug_block_generator",
    weight: -119,
    preconditionFn(scope) {
      if (!isDebugEnabled() || !isBlockContext(scope)) {
        return "hidden";
      }
      const block = getContextBlock(scope);
      return block && resolveGeneratorFn(block.type) ? "disabled" : "hidden";
    },
    displayText(scope) {
      const block = getContextBlock(scope);
      const gen = block ? resolveGeneratorFn(block.type) : null;
      return gen ? `generator · ${gen}` : "generator · —";
    },
    callback() {
      /* affichage seulement */
    },
  });

  registry.register({
    id: "ucb_debug_block_definition",
    weight: -118,
    preconditionFn(scope) {
      if (!isDebugEnabled() || !isBlockContext(scope)) {
        return "hidden";
      }
      const block = getContextBlock(scope);
      return block && resolveDefinitionFn(block.type) ? "disabled" : "hidden";
    },
    displayText(scope) {
      const block = getContextBlock(scope);
      const fn = block ? resolveDefinitionFn(block.type) : null;
      return fn ? `define · ${fn}` : "define · —";
    },
    callback() {
      /* affichage seulement */
    },
  });

  registry.register({
    id: "ucb_debug_block_copy_type",
    weight: -117,
    preconditionFn(scope) {
      if (!isDebugEnabled() || !isBlockContext(scope)) {
        return "hidden";
      }
      return "enabled";
    },
    displayText: () => "Copier le type (presse-papier)",
    callback: copyBlockType,
  });
}

/**
 * Annoter les définitions Blockly avec debugDefinitionFn (optionnel, après enregistrement).
 */
export function applyBlockDebugMetadata(): void {
  for (const [blockType, fnName] of Object.entries(BLOCK_DEFINITION_FUNCTIONS)) {
    const def = Blockly.Blocks[blockType] as BlockDefinitionWithDebug | undefined;
    if (def && !def.debugDefinitionFn) {
      def.debugDefinitionFn = fnName;
    }
  }
}
