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
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { getBlocklyMsgOr } from "./shared";

export type ArrayWithMutatorBlock = Blockly.Block & {
  itemCount_: number;
  topInput_: Blockly.Input | null;
  updateShape_: (targetCount: number) => void;
  addPart_: () => void;
  removePart_: () => void;
  updateMinus_: () => void;
  plus: () => void;
  minus: () => void;
};

export const ARRAY_LIST_LITERAL_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_UNE_LISTE", "a list consisting of");

export const ARRAY_WITH_CONTAINING_LABEL = (): string =>
  getBlocklyMsgOr("ARRAY_WITH_CONTAINING", "containing");

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

export function registerArrayListMutator(
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
