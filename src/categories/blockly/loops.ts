/**
 * @packageDocumentation
 * @module BlocklyCategories.Loops
 * @description Loop blocks adapted for µcBlockly.
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
import { LIST_DEFAULT_VARIABLE_NAME, LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import { findListDeclarationBlock, hasArrayListConnectedElements } from "../../generators/arduino/block_types_registry";
import {
  configureListVariableField,
  configureScalarVariableField,
  getBlocklyMsgOr,
  syncListVariableFromField,
} from "./shared";

let loopsBlocksRegistered = false;

const LIST_DEFAULT_VAR_NAME = LIST_DEFAULT_VARIABLE_NAME;
/** Loop variable (current element), distinct from the `item` list. */
const FOREACH_INDEX_VAR_NAME = "element";

function bindForEachDefaultVariables(block: Blockly.Block): void {
  const workspace = block.workspace;
  if (!workspace) {
    return;
  }
  const listVar = Blockly.Variables.getOrCreateVariablePackage(
    workspace,
    null,
    LIST_DEFAULT_VAR_NAME,
    LIST_VARIABLE_TYPE,
  );
  if (listVar?.getId()) {
    block.setFieldValue(listVar.getId(), "LIST");
    syncListVariableFromField(block, "LIST");
  }
  const iterVar = Blockly.Variables.getOrCreateVariablePackage(
    workspace,
    null,
    FOREACH_INDEX_VAR_NAME,
    "",
  );
  if (iterVar?.getId()) {
    block.setFieldValue(iterVar.getId(), "VAR");
  }
}

function handleControlsForEachOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = block.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === block.id
  ) {
    bindForEachDefaultVariables(block);
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CHANGE &&
    (event as Blockly.Events.BlockChange).element === "field" &&
    (event as Blockly.Events.BlockChange).name === "LIST"
  ) {
    syncListVariableFromField(block, "LIST");
  }
  const listId = block.getFieldValue("LIST");
  if (!listId) {
    block.setWarningText(
      getBlocklyMsgOr(
        "CONTROLS_FOREACH_LIST_EMPTY",
        "Create a list with a List block first.",
      ),
    );
    return;
  }
  const listVar = block.workspace?.getVariableMap().getVariableById(listId);
  if (!listVar || listVar.getType() !== LIST_VARIABLE_TYPE) {
    block.setWarningText(
      getBlocklyMsgOr(
        "CONTROLS_FOREACH_LIST_EMPTY",
        "Create a list with a List block first.",
      ),
    );
    return;
  }
  const declareBlock = findListDeclarationBlock(block.workspace, listId);
  if (!declareBlock || !hasArrayListConnectedElements(declareBlock)) {
    block.setWarningText(
      getBlocklyMsgOr(
        "CONTROLS_FOREACH_LIST_EMPTY",
        "Create a list with a List block first.",
      ),
    );
    return;
  }
  block.setWarningText(null);
}

/**
 * Redéfinit `controls_forEach` : menu des tableaux (variables `list`) au lieu d'une entrée valeur.
 */
export const defineLoopsBlocks = (): void => {
  if (loopsBlocksRegistered) {
    return;
  }
  loopsBlocksRegistered = true;

  Blockly.Blocks["controls_forEach"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput("HEADER")
        .appendField(getBlocklyMsgOr("UCB_FOREACH_EACH", "for each item"))
        .appendField(
          new Blockly.FieldVariable(
            FOREACH_INDEX_VAR_NAME,
            undefined,
            null,
            "",
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("UCB_FOREACH_IN", "in list"))
        .appendField(
          new Blockly.FieldVariable(
            LIST_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "LIST",
        );
      const iteratorField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (iteratorField) {
        configureScalarVariableField(iteratorField);
      }
      const listField = this.getField("LIST") as Blockly.FieldVariable | null;
      if (listField) {
        configureListVariableField(listField);
      }
      this.appendStatementInput("DO").appendField(
        getBlocklyMsgOr("UCB_FOREACH_DO", "do"),
      );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("loop_blocks");
      this.setTooltip(
        getBlocklyMsgOr(
          "UCB_FOREACH_TOOLTIP",
          "For each element in a list declared on the workspace.",
        ),
      );
      this.setHelpUrl(getBlocklyMsgOr("UCB_FOREACH_HELPURL", ""));
      bindForEachDefaultVariables(this);
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleControlsForEachOnChange(this, event);
    },
  };
  delete (Blockly.Blocks["controls_forEach"] as { jsonInit?: unknown }).jsonInit;
};
