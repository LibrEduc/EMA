/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareDeclare
 * @description Blockly definition for the Array_declare (define list/array) block.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  configureListVariableField,
  getBlocklyMsgOr,
} from "./shared";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import {
  ARRAY_DEFAULT_VAR_NAME,
  bindArrayWithDefaultVariable,
  handleArrayListVariableSync,
  revalidateGetIndexBlocksForVariable,
  revalidateListDeclarationUniqueness,
} from "./array_sync";
import {
  notifyListBlockTypeFromParent,
  syncArrayDeclareContenuCheck,
} from "./array_declare_shared";

type ArrayDeclareBlock = Blockly.Block & {
  updateDeclareShape_?: (dim: string) => void;
};

/**
 * Registers the Array_declare block (int arr[size]; or int arr[] = {...}).
 * @param getTypeOptions Arduino scalar type dropdown options.
 */
export function defineArrayDeclareBlock(
  getTypeOptions: () => Blockly.MenuOption[],
): void {
  Blockly.Blocks["Array_declare"] = {
    init: function (this: ArrayDeclareBlock) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define"))
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
        .appendField(new Blockly.FieldDropdown(getTypeOptions), "type")
        .appendField(
          new Blockly.FieldDropdown(
            [
              [getBlocklyMsgOr("ARRAY_LIST", "list"), "d1"],
              [getBlocklyMsgOr("ARRAY_ARRAY", "array"), "d2"],
            ],
            function (this: Blockly.FieldDropdown, option: string) {
              const block = this.getSourceBlock() as ArrayDeclareBlock;
              block.updateDeclareShape_?.(option);
              return option;
            },
          ),
          "dim",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.appendValueInput("contenu")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new Blockly.FieldDropdown([
            [getBlocklyMsgOr("ARRAY_TAILLE", "size"), "c1"],
            [getBlocklyMsgOr("ARRAY_CONTIENT", "contains"), "c2"],
          ]),
          "choix",
        );
      this.updateDeclareShape_?.(this.getFieldValue("dim") || "d1");
      this.setInputsInline(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP2", "Declare array"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
    },
    updateDeclareShape_: function (this: ArrayDeclareBlock, dim: string) {
      if (dim === "d2") {
        if (!this.getInput("contenu2")) {
          this.appendValueInput("contenu2").setAlign(Blockly.inputs.Align.RIGHT);
        }
      } else if (this.getInput("contenu2")) {
        this.removeInput("contenu2");
      }
      syncArrayDeclareContenuCheck(this);
    },
    mutationToDom: function (this: Blockly.Block) {
      const container = Blockly.utils.xml.createElement("mutation");
      container.setAttribute("dim", this.getFieldValue("dim"));
      return container;
    },
    domToMutation: function (this: ArrayDeclareBlock, xmlElement: Element) {
      this.updateDeclareShape_?.(xmlElement.getAttribute("dim") ?? "d1");
    },
    onchange: function (this: ArrayDeclareBlock, event: Blockly.Events.Abstract) {
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
          this.updateDeclareShape_?.(this.getFieldValue("dim"));
        }
        if (fieldName === "type" || fieldName === "choix" || fieldName === "dim") {
          syncArrayDeclareContenuCheck(this);
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
      if (
        event.type === Blockly.Events.BLOCK_CREATE &&
        (event as Blockly.Events.BlockCreate).blockId === this.id
      ) {
        bindArrayWithDefaultVariable(this);
      }
      if (this.workspace) {
        revalidateListDeclarationUniqueness(this.workspace);
      }
    },
  };
}
