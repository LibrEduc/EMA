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
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import {
  configureListVariableField,
  getArrayIndexBlocklyChecks,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
  getDeclareContenuBlocklyChecks,
  getDeclareElementBlocklyChecks,
  getArrayListUntypedWarningText,
  getDuplicateListDeclarationWarningText,
  handleVariablesSetChange,
  syncListVariableFromField,
} from "./shared";
import { getArduinoTypeDropdownOptions } from "./variables";
import { getInternalTypeForArduinoType } from "../../generators/arduino/block_types";
import {
  hasArrayListConnectedElements,
  inferArrayElementTypeFromBlock,
  inferArrayGetIndexElementType,
} from "../../generators/arduino/block_types_registry";
import {
  claimVariableDeclaration,
  getOrCreateKindedVariable,
  isListDeclareBlockType,
  LIST_DEFAULT_VARIABLE_NAME,
  LIST_VARIABLE_TYPE,
  releaseVariableDeclaration,
} from "../../generators/arduino/variable_utils";

let arrayBlocksRegistered = false;

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

const ARRAY_LIST_LITERAL_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_UNE_LISTE", "a list consisting of");

const ARRAY_WITH_CONTAINING_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_WITH_CONTAINING", "containing");

const ARRAY_DEFAULT_VAR_NAME = LIST_DEFAULT_VARIABLE_NAME;

/** Lie le champ VAR à la variable liste (réutilise le nom via VariableMap, comme les scalaires). */
function bindArrayWithDefaultVariable(block: Blockly.Block): void {
  const workspace = block.workspace;
  if (!workspace) {
    return;
  }
  const variableModel = getOrCreateKindedVariable(
    workspace,
    ARRAY_DEFAULT_VAR_NAME,
    LIST_VARIABLE_TYPE,
  );
  if (variableModel?.getId()) {
    block.setFieldValue(variableModel.getId(), "VAR");
    syncListVariableFromField(block, "VAR");
  }
}

/**
 * Claims / releases list declaration ownership (same pattern as variables_const).
 * @returns true when a duplicate-owner warning was set.
 */
export const syncListDeclarationOwnership = (block: Blockly.Block): boolean => {
  if (!block.workspace || block.isInFlyout || !isListDeclareBlockType(block.type)) {
    return false;
  }
  const variableId = block.getFieldValue("VAR");
  if (!variableId) {
    return false;
  }
  const variable = block.workspace.getVariableMap().getVariableById(variableId);
  if (!variable) {
    return false;
  }
  const claim = claimVariableDeclaration(variable, block.id);
  if (claim === "owned_by_other") {
    block.setWarningText(getDuplicateListDeclarationWarningText());
    return true;
  }
  return false;
};

/**
 * Affiche un avertissement si ce bloc n'est pas le propriétaire de la déclaration.
 * @returns true when a duplicate warning was set.
 */
export const syncListDeclarationUniqueness = (block: Blockly.Block): boolean => {
  return syncListDeclarationOwnership(block);
};

/** Applique warning ownership (+ non typé pour Array_with). */
export const applyListDeclarationBlockWarning = (block: Blockly.Block): void => {
  if (syncListDeclarationOwnership(block)) {
    return;
  }
  if (block.type === "Array_with") {
    syncArrayListUntypedWarning(block);
    return;
  }
  if (isListDeclareBlockType(block.type)) {
    block.setWarningText(null);
  }
};

/** Revalide l'ownership des déclarations de listes sur tout le workspace. */
export const revalidateListDeclarationUniqueness = (
  workspace: Blockly.Workspace,
): void => {
  for (const block of workspace.getAllBlocks(false)) {
    if (!isListDeclareBlockType(block.type)) {
      continue;
    }
    applyListDeclarationBlockWarning(block);
  }
};

/** Synchronise le type Blockly `list` et l'ownership de déclaration. */
function handleArrayListVariableSync(
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
    event.type === Blockly.Events.BLOCK_DELETE &&
    isListDeclareBlockType(block.type)
  ) {
    // Block may already be disposed; release via event ids when possible.
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === block.id
  ) {
    if (isListDeclareBlockType(block.type) && event.recordUndo) {
      bindArrayWithDefaultVariable(block);
    } else {
      syncListVariableFromField(block, "VAR");
    }
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_CHANGE &&
    (event as Blockly.Events.BlockChange).element === "field" &&
    (event as Blockly.Events.BlockChange).name === "VAR"
  ) {
    const change = event as Blockly.Events.BlockChange;
    if (isListDeclareBlockType(block.type) && change.oldValue) {
      const previous = workspace
        ?.getVariableMap()
        .getVariableById(String(change.oldValue));
      releaseVariableDeclaration(previous, block.id);
    }
    syncListVariableFromField(block, "VAR");
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
    return;
  }
  if (
    event.type === Blockly.Events.BLOCK_DELETE ||
    event.type === Blockly.Events.BLOCK_CREATE
  ) {
    if (workspace) {
      revalidateListDeclarationUniqueness(workspace);
    }
  }
}

/** Met à jour la sortie des blocs d'accès index et propage le typage vers le parent set. */
function arrayGetIndexOutputSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  const elementType = inferArrayGetIndexElementType(this);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getBlocklyCompatibleChecks(elementType)
      : null;
  this.setOutput(true, checks);
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  if (
    parent &&
    (parent.type === "variables_set_dynamic" || parent.type === "variables_set")
  ) {
    handleVariablesSetChange(parent, event, parent.type);
  }
}

/** Revalide les blocs getIndex / modify qui référencent une variable liste. */
function revalidateGetIndexBlocksForVariable(
  workspace: Blockly.Workspace,
  variableId: string,
  event: Blockly.Events.Abstract,
): void {
  for (const block of workspace.getAllBlocks(false)) {
    if (block.getFieldValue("VAR") !== variableId) {
      continue;
    }
    if (
      block.type === "Array_getIndex_in_list" ||
      block.type === "Array_getIndex_in_array"
    ) {
      arrayGetIndexOutputSyncOnChange.call(block, event);
    } else if (
      block.type === "Array_modify" ||
      block.type === "Array_fix"
    ) {
      syncArrayListAssignValueInputCheck(block);
      syncArrayIndexInputChecks(block);
    }
  }
}

/** Restreint les entrées D* aux entiers (index 0-based). */
function syncArrayIndexInputChecks(block: Blockly.Block): void {
  const dim = parseInt(block.getFieldValue("dim") || "1", 10);
  const checks = getArrayIndexBlocklyChecks();
  for (let i = 0; i < dim; i++) {
    const inp = block.getInput("D" + i);
    if (inp?.connection) {
      inp.connection.setCheck(checks);
    }
  }
}

/** Restreint l'entrée « value » au type élément du tableau sélectionné. */
function syncArrayListAssignValueInputCheck(block: Blockly.Block): void {
  const elementType = inferArrayGetIndexElementType(block);
  const checks =
    elementType && elementType !== "__NO_TYPE__"
      ? getDeclareElementBlocklyChecks(elementType)
      : null;
  const valueInput = block.getInput("value");
  if (valueInput?.connection) {
    valueInput.connection.setCheck(checks);
  }
}

function arrayListAssignAndIndexSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  if (event.isUiEvent) {
    return;
  }
  const workspace = this.workspace as Blockly.WorkspaceSvg | null;
  if (workspace?.isDragging?.()) {
    return;
  }
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_DELETE
  ) {
    return;
  }
  syncArrayIndexInputChecks(this);
  if (this.type === "Array_fix" || this.type === "Array_modify") {
    syncArrayListAssignValueInputCheck(this);
  }
}

/** Restreint l'entrée « value » au type élément du tableau sélectionné. */
function arrayModifyValueCheckSyncOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  arrayListAssignAndIndexSyncOnChange.call(this, event);
}

function handleArrayModifyOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayModifyValueCheckSyncOnChange.call(block, event);
}

function handleArrayGetIndexOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayGetIndexOutputSyncOnChange.call(block, event);
  if (block.type === "Array_getIndex_in_array") {
    arrayListAssignAndIndexSyncOnChange.call(block, event);
  }
}

function handleArrayFixOnChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
  handleArrayListVariableSync(block, event);
  arrayListAssignAndIndexSyncOnChange.call(block, event);
}

/**
 * Met à jour les checks des entrées ADD d'un bloc liste (littéral ou define).
 */
function syncArrayListAddInputChecks(
  block: Blockly.Block,
  checks: string[] | null,
): void {
  for (let j = 0; ; j++) {
    const inp = block.getInput("ADD" + j);
    if (!inp?.connection) break;
    inp.connection.setCheck(checks);
  }
}

function syncArrayListUntypedWarning(block: Blockly.Block): void {
  if (syncListDeclarationUniqueness(block)) {
    return;
  }
  const inferred = inferArrayElementTypeFromBlock(block);
  const incomplete =
    !hasArrayListConnectedElements(block) ||
    !inferred ||
    inferred === "__NO_TYPE__";
  block.setWarningText(incomplete ? getArrayListUntypedWarningText() : null);
}

/**
 * Bloc valeur `Array_list_literal` : type depuis le parent (declare/create) ou inféré.
 */
function arrayListLiteralTypeFromInputsOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
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
  let elementInternalType: string | null = null;
  let typeFromParent = false;
  const parent = this.outputConnection?.targetBlock?.() ?? null;
  const parentChoice = parent?.getFieldValue?.("choix");
  if (
    parent &&
    parentChoice === "c2" &&
    (parent.type === "Array_declare" || parent.type === "Array_create")
  ) {
    const declaredType = parent.getFieldValue?.("type");
    if (declaredType && declaredType !== "__NO_TYPE__") {
      elementInternalType = getInternalTypeForArduinoType(declaredType);
      typeFromParent = true;
    }
  }
  if (!typeFromParent) {
    const inferred = inferArrayElementTypeFromBlock(this);
    if (inferred && inferred !== "__NO_TYPE__") {
      elementInternalType = inferred;
    }
  }
  const checks = elementInternalType
    ? getDeclareElementBlocklyChecks(elementInternalType)
    : null;
  const blocklyOutputType =
    elementInternalType === "bool"
      ? "Boolean"
      : elementInternalType === "int" || elementInternalType === "float"
        ? "Number"
        : elementInternalType === "string"
          ? "String"
          : elementInternalType || null;
  syncArrayListAddInputChecks(this, checks);
  syncArrayListUntypedWarning(this);
  if (this.outputConnection) {
    const incomplete =
      !hasArrayListConnectedElements(this) ||
      !elementInternalType;
    if (incomplete) {
      this.setOutput(true, "__NO_TYPE__");
      return;
    }
    if (checks) {
      this.outputConnection.setCheck(checks);
    } else {
      this.outputConnection.setCheck(null);
    }
  } else if (elementInternalType) {
    this.setOutput(true, blocklyOutputType);
  } else {
    this.setOutput(true, "__NO_TYPE__");
  }
}

/**
 * Bloc instruction `Array_with` : infère le type des entrées ADD, sans sortie ni chaînage.
 */
function arrayWithDeclareTypeFromInputsOnChange(
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
): void {
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
  if (
    event.type === Blockly.Events.BLOCK_CREATE &&
    (event as Blockly.Events.BlockCreate).blockId === this.id
  ) {
    if (this.outputConnection) {
      this.setOutput(false);
    }
    if (this.previousConnection) {
      this.setPreviousStatement(false);
    }
    if (this.nextConnection) {
      this.setNextStatement(false);
    }
  }
  const inferred = inferArrayElementTypeFromBlock(this);
  const checks =
    inferred && inferred !== "__NO_TYPE__"
      ? getDeclareElementBlocklyChecks(inferred)
      : null;
  syncArrayListAddInputChecks(this, checks);
  applyListDeclarationBlockWarning(this);
  handleArrayListVariableSync(this, event);
  const varId = this.getFieldValue("VAR");
  if (varId && this.workspace) {
    revalidateGetIndexBlocksForVariable(this.workspace, varId, event);
  }
}

function createArrayListMutator(listLabel: () => string) {
  return {
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
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField(createPlusField(), "PLUS")
          .appendField(listLabel());
      } else {
        this.appendValueInput("ADD" + this.itemCount_).setAlign(Blockly.inputs.Align.RIGHT);
      }
      this.itemCount_++;
    },
    removePart_: function (this: ArrayWithMutatorBlock) {
      this.itemCount_--;
      this.removeInput("ADD" + this.itemCount_);
      if (this.itemCount_ === 0) {
        this.topInput_ = this.appendDummyInput("EMPTY")
          .appendField(createPlusField(), "PLUS")
          .appendField(listLabel());
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
}

function registerArrayListMutator(
  mutatorName: string,
  listLabel: () => string,
): void {
  const mutator = createArrayListMutator(listLabel);
  const helper = function (this: ArrayWithMutatorBlock) {
    this.getInput("EMPTY")?.insertFieldAt(0, createPlusField(), "PLUS");
    this.updateShape_(0);
  };
  Blockly.Extensions.registerMutator(mutatorName, mutator, helper);
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
  const getTypeOptions = (): Blockly.MenuOption[] =>
    getArduinoTypeDropdownOptions();

  registerArrayListMutator("array_with_plus_minus_mutator", ARRAY_WITH_CONTAINING_LABEL);
  registerArrayListMutator("array_list_literal_mutator", ARRAY_LIST_LITERAL_LABEL);

  Blockly.Blocks["Array_with"] = {
    init: function (this: ArrayWithMutatorBlock) {
      this.appendDummyInput("HEADER")
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
        .appendField(getBlocklyMsgOr("ARRAY_WITH_AS_LIST", "as a list"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      bindArrayWithDefaultVariable(this);
      this.setInputsInline(false);
      this.setOutput(false);
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_WITH_TOOLTIP", ""));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_WITH_HELPURL", ""));
      this.appendDummyInput("EMPTY");
      Blockly.Extensions.apply("array_with_plus_minus_mutator", this, true);
    },
  };

  Blockly.defineBlocksWithJsonArray([
    {
      type: "Array_list_literal",
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
      mutator: "array_list_literal_mutator",
    },
  ]);

  (Blockly.Blocks["Array_with"] as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange =
    arrayWithDeclareTypeFromInputsOnChange;
  (Blockly.Blocks["Array_list_literal"] as Blockly.Block & { onchange?: (e: Blockly.Events.Abstract) => void }).onchange =
    arrayListLiteralTypeFromInputsOnChange;

  Blockly.Blocks["Array_list_3"] = Blockly.Blocks["Array_list_literal"];

  // Array_getIndex_in_list - element at index of a list variable (1D)
  Blockly.Blocks["Array_getIndex_in_list"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("AT")
        .setCheck("Number")
        .appendField(getBlocklyMsgOr("ARRAY_GETINDEX_AT", "element at"));
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_GETINDEX_ITEM", "in list"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        );
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(true);
      this.setOutput(true);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_GETINDEX_TOOLTIP", "Get element at index"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_GETINDEX_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayGetIndexOnChange(this, event);
    },
  };

  // Array_modify - assign value to list[index]
  Blockly.Blocks["Array_modify"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("indice")
        .setCheck("Number")
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_INDICE", "element at index"));
      this.appendDummyInput()
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_NAME", "in array"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        );
      this.appendValueInput("value")
        .setCheck(null)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("ARRAY_MODIFY_VALUE", "value"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(getBlocklyMsgOr("ARRAY_MODIFY_TOOLTIP", "Assign value to array element"));
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_MODIFY_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayModifyOnChange(this, event);
    },
  };

  // Array_set - like variables_set: set [list] to [value] (whole list)
  Blockly.Blocks["Array_set"] = {
    init: function (this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField(getBlocklyMsgOr("ARRAY_SET", "set"))
        .appendField(
          new Blockly.FieldVariable(
            ARRAY_DEFAULT_VAR_NAME,
            undefined,
            null,
            LIST_VARIABLE_TYPE,
          ),
          "VAR",
        )
        .appendField(getBlocklyMsgOr("ARRAY_SET_TO", "to"));
      const varField = this.getField("VAR") as Blockly.FieldVariable | null;
      if (varField) {
        configureListVariableField(varField);
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle("list_blocks");
      this.setTooltip(
        getBlocklyMsgOr(
          "ARRAY_SET_TOOLTIP",
          "Assign a whole list (e.g. from a bitmap or list literal).",
        ),
      );
      this.setHelpUrl(getBlocklyMsgOr("ARRAY_SET_HELPURL", ""));
    },
    onchange: function (this: Blockly.Block, event: Blockly.Events.Abstract) {
      handleArrayListVariableSync(this, event);
    },
  };

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
};
