/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.DeclareDefs
 * @description Block definitions for Array_declare, create, form, and getIndex_in_array.
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
  getArrayIndexBlocklyChecks,
  getBlocklyMsgOr,
  getDeclareContenuBlocklyChecks,
} from "./shared";
import { LIST_VARIABLE_TYPE } from "../../generators/arduino/variable_utils";
import {
  ARRAY_DEFAULT_VAR_NAME,
  bindArrayWithDefaultVariable,
  handleArrayFixOnChange,
  handleArrayGetIndexOnChange,
  handleArrayListVariableSync,
  revalidateGetIndexBlocksForVariable,
  revalidateListDeclarationUniqueness,
  syncArrayIndexInputChecks,
  syncArrayListAssignValueInputCheck,
} from "./array_sync";

/**
 * Registers Array_declare, Array_create, Array_fix, and Array_getIndex_in_array.
 * @param getTypeOptions Arduino scalar type dropdown options.
 */
export function defineArrayDeclareBlocks(
  getTypeOptions: () => Blockly.MenuOption[],
): void {
  /** Notify connected list blocks to refresh type from parent define/create block. */
  function getArrayCreateDimensionInputNames(block: Blockly.Block): string[] {
    const dim = parseInt(block.getFieldValue("dim") || "1", 10);
    const names: string[] = [];
    for (let i = 0; i < dim; i++) {
      if (block.getInput("D" + i)) {
        names.push("D" + i);
      }
    }
    return names;
  }

  function notifyListBlockTypeFromParent(block: Blockly.Block): void {
    const inputNames =
      block.type === "Array_declare"
        ? ["contenu", "contenu2"]
        : getArrayCreateDimensionInputNames(block);
    for (const inputName of inputNames) {
      const listBlock = block.getInputTargetBlock(inputName);
      if (
        listBlock?.type === "Array_list_literal" ||
        listBlock?.type === "Array_list_3"
      ) {
        (listBlock as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange?.(
          { type: Blockly.Events.BLOCK_CHANGE, isUiEvent: false } as Blockly.Events.Abstract,
        );
      }
    }
  }

  // Array_declare - int arr[size]; or int arr[] = {...};
  type ArrayDeclareBlock = Blockly.Block & {
    updateDeclareShape_?: (dim: string) => void;
  };

  function syncArrayDeclareContenuCheck(block: Blockly.Block): void {
    const choix = block.getFieldValue("choix");
    const typeField = block.getFieldValue("type") || "int";
    const checks = getDeclareContenuBlocklyChecks(choix, typeField);
    for (const inputName of ["contenu", "contenu2"]) {
      const contenuInput = block.getInput(inputName);
      if (contenuInput?.connection) {
        contenuInput.connection.setCheck(checks);
      }
    }
  }

  function syncArrayCreateInputsCheck(block: Blockly.Block): void {
    const choix = block.getFieldValue("choix");
    const typeField = block.getFieldValue("type") || "int";
    const checks = getDeclareContenuBlocklyChecks(choix, typeField);
    for (const inputName of getArrayCreateDimensionInputNames(block)) {
      const dimInput = block.getInput(inputName);
      if (dimInput?.connection) {
        dimInput.connection.setCheck(checks);
      }
    }
  }

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

  // Array_create - create typed array 1D-5D (variable with FieldVariable)
  type ArrayCreateBlock = Blockly.Block & {
    updateShape_?: (opt: string) => void;
  };

  Blockly.Blocks["Array_create"] = {
    init: function (this: ArrayCreateBlock) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define") + getBlocklyMsgOr("ARRAY_ARRAY", "array"))
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
            [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]],
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
        case "2": this.appendValueInput("D1"); break;
        case "3": this.appendValueInput("D1"); this.appendValueInput("D2"); break;
        case "4": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); break;
        case "5": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); this.appendValueInput("D4"); break;
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

  // Array_fix - assign value to declared array element
  Blockly.Blocks["Array_fix"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_FIX", "set element"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_dim", "dimensions"))
        .appendField(
          new Blockly.FieldDropdown(
            [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]],
            function (this: Blockly.FieldDropdown, option: string) {
              const block = this.getSourceBlock() as Blockly.Block & { updateShape_?: (opt: string) => void };
              block?.updateShape_?.(option);
              return option;
            },
          ),
          "dim",
        );
      this.appendValueInput("value")
        .setCheck(null)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("_AT", "to"));
      this.appendValueInput("D0")
        .setCheck(getArrayIndexBlocklyChecks())
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_index", "index"));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP3", "Set array element"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayFixOnChange(this, event);
    },
    updateShape_: function (this: Blockly.Block, option: string) {
      for (let i = 1; i < 7; i++) {
        if (this.getInput("D" + i)) this.removeInput("D" + i);
      }
      switch (option) {
        case "2": this.appendValueInput("D1"); break;
        case "3": this.appendValueInput("D1"); this.appendValueInput("D2"); break;
        case "4": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); break;
        case "5": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); this.appendValueInput("D4"); break;
      }
      syncArrayIndexInputChecks(this);
      syncArrayListAssignValueInputCheck(this);
    },
    mutationToDom: function (this: Blockly.Block) {
      const container = document.createElement("mutation");
      container.setAttribute("dim", this.getFieldValue("dim"));
      return container;
    },
    domToMutation: function (this: Blockly.Block & { updateShape_?: (opt: string) => void }, xmlElement: Element) {
      this.updateShape_?.(xmlElement.getAttribute("dim") ?? "1");
    },
  };

  // Array_getIndex_in_array - get element from declared array (FieldVariable)
  Blockly.Blocks["Array_getIndex_in_array"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_GETINDEX_ITEM", "element of"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_dim", "dimensions"))
        .appendField(
          new Blockly.FieldDropdown(
            [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]],
            function (this: Blockly.FieldDropdown, option: string) {
              const block = this.getSourceBlock() as Blockly.Block & { updateShape_?: (opt: string) => void };
              block?.updateShape_?.(option);
              return option;
            },
          ),
          "dim",
        );
      this.appendValueInput("D0")
        .setCheck(getArrayIndexBlocklyChecks())
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_index", "index"));
      this.setOutput(true);
      this.setInputsInline(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP1", "Get array element"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayGetIndexOnChange(this, event);
    },
    updateShape_: function (this: Blockly.Block, option: string) {
      for (let i = 1; i < 7; i++) {
        if (this.getInput("D" + i)) this.removeInput("D" + i);
      }
      switch (option) {
        case "2": this.appendValueInput("D1"); break;
        case "3": this.appendValueInput("D1"); this.appendValueInput("D2"); break;
        case "4": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); break;
        case "5": this.appendValueInput("D1"); this.appendValueInput("D2"); this.appendValueInput("D3"); this.appendValueInput("D4"); break;
      }
      syncArrayIndexInputChecks(this);
    },
    mutationToDom: function (this: Blockly.Block) {
      const container = document.createElement("mutation");
      container.setAttribute("dim", this.getFieldValue("dim"));
      return container;
    },
    domToMutation: function (this: Blockly.Block & { updateShape_?: (opt: string) => void }, xmlElement: Element) {
      this.updateShape_?.(xmlElement.getAttribute("dim") ?? "1");
    },
  };
}
