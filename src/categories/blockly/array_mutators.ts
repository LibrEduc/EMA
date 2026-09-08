/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Mutators
 * @description Plus/minus mutators for Array_with and Array_list_literal blocks.
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
import { getBlocklyMsgOr } from "./shared";
import {
  createPartListPlusMinusMutator,
  createPlusField,
  registerMutatorOnce,
  type CountablePlusMinusBlock,
} from "./plus_minus_mutator";

export type ArrayWithMutatorBlock = CountablePlusMinusBlock & {
  itemCount_: number;
  topInput_: Blockly.Input | null;
};

export const ARRAY_LIST_LITERAL_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_UNE_LISTE", "a list consisting of");

export const ARRAY_WITH_CONTAINING_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_WITH_CONTAINING", "containing");

/**
 * Registers a list-style +/- mutator (ADD0… / EMPTY).
 * @param mutatorName - Extension registry name.
 * @param listLabel - Label next to the PLUS field.
 */
export function registerArrayListMutator(
  mutatorName: string,
  listLabel: () => string,
): void {
  const mutator = createPartListPlusMinusMutator({
    countProperty: "itemCount_",
    topInputProperty: "topInput_",
    xmlAttribute: "items",
    stateKey: "itemCount",
    partInputName: (index) => "ADD" + index,
    minCount: 0,
    emptyInputName: "EMPTY",
    appendFirstPart: (block) =>
      block
        .appendValueInput("ADD0")
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(createPlusField(), "PLUS")
        .appendField(listLabel()),
    appendExtraPart: (block, index) => {
      block
        .appendValueInput("ADD" + index)
        .setAlign(Blockly.inputs.Align.RIGHT);
    },
    appendEmptyState: (block) =>
      block
        .appendDummyInput("EMPTY")
        .appendField(createPlusField(), "PLUS")
        .appendField(listLabel()),
  });

  registerMutatorOnce(mutatorName, mutator, function (this: Blockly.Block) {
    const block = this as ArrayWithMutatorBlock;
    block.getInput("EMPTY")?.insertFieldAt(0, createPlusField(), "PLUS");
    block.updateShape_(0);
  });
}
