/**
 * @packageDocumentation
 * @module ShareableProcedures
 * @description shareable-procedures option (disabled by default; incompatible with block-plus-minus procedures).
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

let shareableProceduresRegistered = false;

/**
 * True after {@link registerShareableProcedures} (plugin procedure blocks are active).
 */
export const isShareableProceduresEnabled = (): boolean => shareableProceduresRegistered;

/**
 * Replaces Blockly procedure blocks with those from the shareable-procedures plugin.
 * Incompatible with `@blockly/block-plus-minus` procedures — do not enable both.
 */
export const registerShareableProcedures = async (): Promise<void> => {
  if (shareableProceduresRegistered) {
    return;
  }
  const { activateShareableProcedures } = await import("./shareable_procedures_loader");
  activateShareableProcedures();
  shareableProceduresRegistered = true;
};

/**
 * Finds the definition block associated with a call (explicit model or legacy name).
 */
export const findProcedureDefinitionBlock = (
  workspace: Blockly.Workspace,
  callBlock: Blockly.Block,
): Blockly.Block | null => {
  const callLike = callBlock as Blockly.Block & {
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
    getProcedureCall?: () => string;
  };
  const callModel = callLike.getProcedureModel?.();
  if (callModel) {
    for (const block of workspace.getAllBlocks(false)) {
      const defLike = block as Blockly.Block & {
        isProcedureDef?: () => boolean;
        getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
      };
      if (
        defLike.isProcedureDef?.() &&
        defLike.getProcedureModel?.()?.getId() === callModel.getId()
      ) {
        return block;
      }
    }
    return null;
  }
  const defName = callLike.getProcedureCall?.() || callBlock.getFieldValue?.("NAME");
  if (!defName) {
    return null;
  }
  return Blockly.Procedures.getDefinition(defName, workspace);
};
