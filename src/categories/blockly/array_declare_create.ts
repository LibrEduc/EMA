/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareCreate
 * @description Blockly definition for the Array_create (1D–5D) block.
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
import {
  configureListVariableField,
  getBlocklyMsgOr,
} from "./shared";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import {
  ARRAY_DEFAULT_VAR_NAME,
  handleArrayListVariableSync,
  revalidateGetIndexBlocksForVariable,
} from "./array_sync";
import {
  notifyListBlockTypeFromParent,
  syncArrayCreateInputsCheck,
} from "./array_declare_shared";

type ArrayCreateBlock = Blockly.Block & {
  updateShape_?: (opt: string) => void;
};

/**
 * Registers the Array_create block (typed array 1D–5D with FieldVariable).
 * @param getTypeOptions Arduino scalar type dropdown options.
 */
export function defineArrayCreateBlock(
  getTypeOptions: () => Blockly.MenuOption[],
): void {
  Blockly.Blocks["Array_create"] = {
    init: function (this: ArrayCreateBlock) {
      this.appendDummyInput()
        .appendField(
          getBlocklyMsgOr("ARRAY_CREATE", "define") +
            getBlocklyMsgOr("ARRAY_ARRAY", "array"),
        )
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"))
        .appendField(new Blockly.FieldDropdown(getTypeOptions), "type");
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.appendDummyInput()
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_dim", "dimensions"))
        .appendField(
          new Blockly.FieldDropdown(
            [
              ["1", "1"],
              ["2", "2"],
              ["3", "3"],
              ["4", "4"],
              ["5", "5"],
            ],
            function (this: Blockly.FieldDropdown, option: string) {
              const block = this.getSourceBlock() as ArrayCreateBlock;
              block.updateShape_?.(option);
              return option;
            },
          ),
          "dim",
        );
      this.appendValueInput("D0")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new Blockly.FieldDropdown([
            [getBlocklyMsgOr("ARRAY_taille", "size"), "c1"],
            [getBlocklyMsgOr("ARRAY_contenu", "contains"), "c2"],
          ]),
          "choix",
        );
      this.updateShape_?.(this.getFieldValue("dim") || "1");
      syncArrayCreateInputsCheck(this);
      this.setInputsInline(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP2", "Create array"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
    },
    onchange: function (this: ArrayCreateBlock, event: Blockly.Events.Abstract) {
      if (event.isUiEvent) {
        return;
      }
      const workspace = this.workspace as Blockly.WorkspaceSvg | null;
      if (workspace?.isDragging?.()) {
        return;
      }
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field"
      ) {
        const fieldName = (event as Blockly.Events.BlockChange).name;
        if (fieldName === "dim") {
          this.updateShape_?.(this.getFieldValue("dim"));
        }
        if (fieldName === "type" || fieldName === "choix" || fieldName === "dim") {
          syncArrayCreateInputsCheck(this);
          if (fieldName === "type" || fieldName === "choix") {
            notifyListBlockTypeFromParent(this);
          }
          if (fieldName === "type") {
            const varId = this.getFieldValue("VAR");
            if (varId) {
              revalidateGetIndexBlocksForVariable(this.workspace, varId, event);
            }
          }
        }
      }
      handleArrayListVariableSync(this, event);
    },
    updateShape_: function (this: ArrayCreateBlock, option: string) {
      for (let i = 1; i < 7; i++) {
        if (this.getInput("D" + i)) {
          this.removeInput("D" + i);
        }
      }
      switch (option) {
        case "2":
          this.appendValueInput("D1");
          break;
        case "3":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          break;
        case "4":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          this.appendValueInput("D3");
          break;
        case "5":
          this.appendValueInput("D1");
          this.appendValueInput("D2");
          this.appendValueInput("D3");
          this.appendValueInput("D4");
          break;
      }
      syncArrayCreateInputsCheck(this);
    },
    mutationToDom: function (this: Blockly.Block) {
      const container = document.createElement("mutation");
      container.setAttribute("dim", this.getFieldValue("dim"));
      return container;
    },
    domToMutation: function (this: ArrayCreateBlock, xmlElement: Element) {
      this.updateShape_?.(xmlElement.getAttribute("dim") ?? "1");
    },
  };
}
