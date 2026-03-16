/**
 * @packageDocumentation
 * @module BlocklyCategories.Array
 * @description S4e-style array blocks for Arduino.
 * @remarks
 * Ported from s4e array.blocks - declaration, creation, array access C/Arduino.
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
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { getBlocklyMsgOr } from "./shared";
import { getBlocklyCompatibleChecks } from "./shared";
import { getVariableTypeDropdownOptions } from "./variables";
import { inferConnectedValueType } from "./shared";

let arrayBlocksRegistered = false;

/**
 * Infers the list block's element type: from parent (define list/array) when connected, otherwise from first ADD input.
 * Uses strict checks when type comes from parent so e.g. int does not accept float.
 */
function arrayWithTypeFromInputsOnChange(this: Blockly.Block, event: Blockly.Events.Abstract): void {
  if (event.isUiEvent) return;
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) return;
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  let firstType: string | null = null;
  let strict = false;
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  const parentChoice = parent?.getFieldValue?.("choix");
  if (
    parent &&
    parentChoice === "c2" &&
    (parent.type === "Array_declare" || parent.type === "Array_create")
  ) {
    const declaredType = parent.getFieldValue?.("type");
    if (declaredType && declaredType !== "__NO_TYPE__") {
      firstType = declaredType;
      strict = true;
    }
  }
  if (firstType === null) {
    let i = 0;
    for (;;) {
      const input = this.getInput("ADD" + i);
      if (!input) break;
      const target = input.connection?.targetBlock();
      const t = inferConnectedValueType(target ?? null);
      if (t && t !== "__NO_TYPE__") {
        firstType = t;
        break;
      }
      i++;
    }
  }
  const checks = firstType ? getBlocklyCompatibleChecks(firstType, strict) : null;
  const blocklyOutputType =
    firstType === "bool"
      ? "Boolean"
      : firstType === "int" || firstType === "float"
        ? "Number"
        : firstType === "string"
          ? "String"
          : firstType || null;
  for (let j = 0; ; j++) {
    const inp = this.getInput("ADD" + j);
    if (!inp?.connection) break;
    inp.connection.setCheck(checks);
  }
  this.setOutput(true, blocklyOutputType);
}

/**
 * Registers S4e-style array blocks (Array_create_with, Array_declare, Array_create,
 * Array_getIndex_in_list, Array_getIndex_in_array, Array_modify, Array_fix).
 */
export const defineArrayBlocks = (): void => {
  if (arrayBlocksRegistered) {
    return;
  }
  arrayBlocksRegistered = true;
  const typeOptions = getVariableTypeDropdownOptions();

  Blockly.defineBlocksWithJsonArray([
    {
      type: "Array_with",
      message0: "%1",
      args0: [
        {
          type: "input_dummy",
          name: "EMPTY",
        },
      ],
      output: "Array",
      style: "list_blocks",
      tooltip: "%{BKY_ARRAY_WITH_TOOLTIP}",
      helpUrl: "%{BKY_ARRAY_WITH_HELPURL}",
      mutator: "array_with_plus_minus_mutator",
    },
  ]);

  const arrayWithMutator = {
    itemCount_: 0,
    topInput_: null as Blockly.Input | null,
    mutationToDom: function (this: Blockly.Block & { itemCount_: number }): Element {
      const container = Blockly.utils.xml.createElement("mutation");
      container.setAttribute("items", String(this.itemCount_));
      return container;
    },
    domToMutation: function (this: ArrayWithMutatorBlock, xmlElement: Element) {
      const targetCount = Number(xmlElement.getAttribute("items") || 0);
      this.updateShape_(targetCount);
    },
    saveExtraState: function (this: Blockly.Block & { itemCount_: number }) {
      return { itemCount: this.itemCount_ };
    },
    loadExtraState: function (
      this: ArrayWithMutatorBlock,
      state: { itemCount?: number },
    ) {
      this.updateShape_(state.itemCount ?? 0);
    },
    updateShape_: function (this: ArrayWithMutatorBlock, targetCount: number) {
      while (this.itemCount_ < targetCount) {
        this.addPart_();
      }
      while (this.itemCount_ > targetCount) {
        this.removePart_();
      }
      this.updateMinus_();
    },
    plus: function (this: ArrayWithMutatorBlock) {
      this.addPart_();
      this.updateMinus_();
    },
    minus: function (this: ArrayWithMutatorBlock) {
      if (this.itemCount_ === 0) return;
      this.removePart_();
      this.updateMinus_();
    },
    addPart_: function (this: ArrayWithMutatorBlock) {
      if (this.itemCount_ === 0) {
        if (this.getInput("EMPTY")) {
          this.removeInput("EMPTY");
        }
        this.topInput_ = this.appendValueInput("ADD" + this.itemCount_)
          .appendField(createPlusField(), "PLUS")
          .appendField(getBlocklyMsgOr("ARRAY_UNE_LISTE", "une liste constituée de"));
      } else {
        this.appendValueInput("ADD" + this.itemCount_);
      }
      this.itemCount_++;
    },
    removePart_: function (this: ArrayWithMutatorBlock) {
      this.itemCount_--;
      this.removeInput("ADD" + this.itemCount_);
      if (this.itemCount_ === 0) {
        this.topInput_ = this.appendDummyInput("EMPTY")
          .appendField(createPlusField(), "PLUS")
          .appendField(getBlocklyMsgOr("ARRAY_UNE_LISTE", "une liste constituée de"));
      }
    },
    updateMinus_: function (this: ArrayWithMutatorBlock) {
      const minusField = this.getField("MINUS");
      if (!minusField && this.itemCount_ > 0) {
        this.topInput_?.insertFieldAt(1, createMinusField(), "MINUS");
      } else if (minusField && this.itemCount_ < 1) {
        this.topInput_?.removeField("MINUS");
      }
    },
  };

  const arrayWithHelper = function (this: ArrayWithMutatorBlock) {
    this.getInput("EMPTY")?.insertFieldAt(0, createPlusField(), "PLUS");
    this.updateShape_(2);
  };

  Blockly.Extensions.registerMutator(
    "array_with_plus_minus_mutator",
    arrayWithMutator,
    arrayWithHelper,
  );

  (Blockly.Blocks["Array_with"] as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange =
    arrayWithTypeFromInputsOnChange;

  type ArrayWithMutatorBlock = Blockly.Block & {
    itemCount_: number;
    topInput_: Blockly.Input | null;
    updateShape_: (targetCount: number) => void;
    addPart_: () => void;
    removePart_: () => void;
    updateMinus_: () => void;
    plus: () => void;
    minus: () => void;
  };

  // Legacy alias for saved workspaces that still use Array_list_3.
  Blockly.Blocks["Array_list_3"] = Blockly.Blocks["Array_with"];

  // Array_getIndex_in_list - element at index of list value (variable or array expression)
  // Accept any typed list (String, Number, etc.), not only "Array".
  Blockly.Blocks["Array_getIndex_in_list"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("AT").setCheck("Number").appendField(getBlocklyMsgOr("ARRAY_GETINDEX_AT", "element at"));
      this.appendValueInput("VAR").setCheck(null).appendField(getBlocklyMsgOr("ARRAY_GETINDEX_ITEM", "in list"));
      this.setInputsInline(true);
      this.setOutput(true);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP", "Get element at index"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_GETINDEX_HELPURL", ""));
    },
  };

  // Array_modify - assign value to list[index]
  Blockly.Blocks["Array_modify"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("indice").setCheck("Number").appendField(getBlocklyMsgOr("ARRAY_MODIFY_INDICE", "element at index"));
      this.appendValueInput("name").setCheck(null).setAlign(Blockly.inputs.Align.RIGHT).appendField(getBlocklyMsgOr("ARRAY_MODIFY_NAME", "in array"));
      this.appendValueInput("value").setCheck(null).setAlign(Blockly.inputs.Align.RIGHT).appendField(getBlocklyMsgOr("ARRAY_MODIFY_VALUE", "value"));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_MODIFY_TOOLTIP", "Assign value to array element"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_MODIFY_HELPURL", ""));
    },
  };

  /** Notify connected list block (Array_with) to refresh its type from this define block. */
  function notifyListBlockTypeFromParent(block: Blockly.Block): void {
    const inputName = block.type === "Array_declare" ? "contenu" : "D0";
    const listBlock = block.getInputTargetBlock(inputName);
    if (listBlock?.type === "Array_with" || listBlock?.type === "Array_list_3") {
      (listBlock as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange?.(
        { type: Blockly.Events.BLOCK_CHANGE, isUiEvent: false } as Blockly.Events.Abstract,
      );
    }
  }

  // Array_declare - int arr[size]; or int arr[] = {...};
  Blockly.Blocks["Array_declare"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define"))
        .appendField(
          new Blockly.FieldDropdown([
            [getBlocklyMsgOr("ARRAY_LIST", "list"), "d1"],
            [getBlocklyMsgOr("ARRAY_ARRAY", "array"), "d2"],
          ]),
          "dim",
        )
        .appendField(new Blockly.FieldVariable(getBlocklyMsgOr("VARIABLES_GET_ITEM", "item")), "VAR")
        .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"))
        .appendField(new Blockly.FieldDropdown(typeOptions), "type");
      this.appendValueInput("contenu")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new Blockly.FieldDropdown([
            [getBlocklyMsgOr("ARRAY_TAILLE", "size"), "c1"],
            [getBlocklyMsgOr("ARRAY_CONTIENT", "contains"), "c2"],
          ]),
          "choix",
        )
        .setCheck(getBlocklyCompatibleChecks("int", true));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP2", "Declare array"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field" &&
        ((event as Blockly.Events.BlockChange).name === "type" ||
          (event as Blockly.Events.BlockChange).name === "choix")
      ) {
        const contenuInput = this.getInput("contenu");
        if (contenuInput?.connection) {
          if (this.getFieldValue("choix") === "c1") {
            contenuInput.connection.setCheck(getBlocklyCompatibleChecks("int", true));
          } else {
            contenuInput.connection.setCheck(null);
          }
        }
        notifyListBlockTypeFromParent(this);
      }
    },
  };

  // Array_create - create typed array 1D-5D (variable with FieldVariable)
  Blockly.Blocks["Array_create"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define") + getBlocklyMsgOr("ARRAY_ARRAY", "array"))
        .appendField(new Blockly.FieldVariable(getBlocklyMsgOr("VARIABLES_GET_ITEM", "item")), "VAR")
        .appendField(getBlocklyMsgOr("VARIABLES_AS", "as"))
        .appendField(new Blockly.FieldDropdown(typeOptions), "type");
      this.appendDummyInput()
        .setAlign(Blockly.inputs.Align.RIGHT)
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
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          new Blockly.FieldDropdown([
            [getBlocklyMsgOr("ARRAY_taille", "size"), "c1"],
            [getBlocklyMsgOr("ARRAY_contenu", "contains"), "c2"],
          ]),
          "choix",
        )
        .setCheck(getBlocklyCompatibleChecks("int", true));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP2", "Create array"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      if (
        event.type === Blockly.Events.BLOCK_CHANGE &&
        (event as Blockly.Events.BlockChange).element === "field" &&
        ((event as Blockly.Events.BlockChange).name === "type" ||
          (event as Blockly.Events.BlockChange).name === "choix")
      ) {
        const d0Input = this.getInput("D0");
        if (d0Input?.connection) {
          if (this.getFieldValue("choix") === "c1") {
            d0Input.connection.setCheck(getBlocklyCompatibleChecks("int", true));
          } else {
            d0Input.connection.setCheck(null);
          }
        }
        notifyListBlockTypeFromParent(this);
      }
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

  // Array_fix - assign value to declared array element
  Blockly.Blocks["Array_fix"] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_FIX", "set element"))
        .appendField(new Blockly.FieldVariable(getBlocklyMsgOr("VARIABLES_GET_ITEM", "item")), "VAR")
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
      this.appendValueInput("value").setAlign(Blockly.inputs.Align.RIGHT).appendField(getBlocklyMsgOr("_AT", "to"));
      this.appendValueInput("D0").setCheck("Number").setAlign(Blockly.inputs.Align.RIGHT).appendField(getBlocklyMsgOr("ARRAY_index", "index"));
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP3", "Set array element"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
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
        .appendField(new Blockly.FieldVariable(getBlocklyMsgOr("VARIABLES_GET_ITEM", "item")), "VAR")
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
      this.appendValueInput("D0").setCheck("Number").setAlign(Blockly.inputs.Align.RIGHT).appendField(getBlocklyMsgOr("ARRAY_index", "index"));
      this.setOutput(true);
      this.setInputsInline(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP1", "Get array element"));
      this.setHelpUrl(getBlocklyMsgOr("HELPURL", ""));
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
};
