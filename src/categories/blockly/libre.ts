/**
 * @packageDocumentation
 * @module BlocklyCategories.Libre
 * @description "Libre" blocks (legacy rduino null category).
 * @remarks
 * Blocks with free-text field for comments or custom code.
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

const LIBRE_STYLE = "libre_blocks";

type LibreLoopMutatorBlock = Blockly.Block & {
  loopCount_: number;
  topStatementInput_: Blockly.Input | null;
  updateShape_: (targetCount: number) => void;
  addPart_: () => void;
  removePart_: () => void;
  updateMinus_: () => void;
  plus: () => void;
  minus: () => void;
};

let libreBlocksRegistered = false;

/**
 * Registers the Libre category blocks (legacy rduino null category).
 */
export const defineLibreBlocks = (): void => {
  if (libreBlocksRegistered) return;
  libreBlocksRegistered = true;

  const tooltip = (): string =>
    getBlocklyMsgOr("LIBRE_TOOLTIP", "Free block: text or comment for your code.");

  // Value block (output Number) with text field
  Blockly.Blocks["libre_in"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setOutput(true, "Number");
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Statement block with text field
  Blockly.Blocks["libre_out"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Statement block with value input and text field
  Blockly.Blocks["libre_in_out"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Stack start (no previous, has next)
  Blockly.Blocks["libre_start"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setInputsInline(true);
      this.setPreviousStatement(false, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Fin de pile (previous oui, pas de next)
  Blockly.Blocks["libre_end"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(false, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Boucle (statement input LOOP, pas de prev/next)
  Blockly.Blocks["libre_loop"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("LOOP");
      this.setInputsInline(false);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Loop block (duplicate for "with return" usage in LOOP)
  Blockly.Blocks["libre_loop_with_return"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("LOOP");
        this.appendValueInput("VALUE")
          .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setInputsInline(false);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Loop in the middle (prev/next + statement LOOP)
  Blockly.Blocks["libre_loop_inside"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("LOOP");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Loop in the middle with value input
  Blockly.Blocks["libre_loop_inside_in"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("LOOP");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // Loop in the middle with value input and +/- mutator (multiple LOOP slots)
  Blockly.defineBlocksWithJsonArray([
    {
      type: "libre_loop_inside_in_mutator",
      message0: "%1",
      args0: [{ type: "input_dummy", name: "EMPTY" }],
      previousStatement: true,
      nextStatement: true,
      style: LIBRE_STYLE,
      tooltip: "%{BKY_LIBRE_TOOLTIP}",
      helpUrl: "",
      mutator: "libre_loop_inside_in_mutator",
    },
  ]);

  const libreLoopInsideInMutator = {
    loopCount_: 0,
    topStatementInput_: null as Blockly.Input | null,
    mutationToDom(this: Blockly.Block & { loopCount_: number }): Element {
      const container = Blockly.utils.xml.createElement("mutation");
      container.setAttribute("loops", String(this.loopCount_));
      return container;
    },
    domToMutation(this: LibreLoopMutatorBlock, xmlElement: Element) {
      const targetCount = Math.max(1, Number(xmlElement.getAttribute("loops") || 0) || 1);
      this.updateShape_(targetCount);
    },
    saveExtraState(this: Blockly.Block & { loopCount_: number }) {
      return { loopCount: this.loopCount_ };
    },
    loadExtraState(this: LibreLoopMutatorBlock, state: { loopCount?: number }) {
      this.updateShape_(Math.max(1, state.loopCount ?? 1));
    },
    updateShape_(this: LibreLoopMutatorBlock, targetCount: number) {
      while (this.loopCount_ < targetCount) this.addPart_();
      while (this.loopCount_ > targetCount) this.removePart_();
      this.updateMinus_();
    },
    plus(this: LibreLoopMutatorBlock) {
      this.addPart_();
      this.updateMinus_();
    },
    minus(this: LibreLoopMutatorBlock) {
      if (this.loopCount_ <= 1) return;
      this.removePart_();
      this.updateMinus_();
    },
    addPart_(this: LibreLoopMutatorBlock) {
      if (this.loopCount_ === 0) {
        if (this.getInput("EMPTY")) this.removeInput("EMPTY");
        this.topStatementInput_ = this.appendStatementInput("LOOP0")
          .appendField(createPlusField(), "PLUS")
          .appendField(getBlocklyMsgOr("LIBRE_LOOP_DO", "faire"));
      } else {
        this.appendStatementInput("LOOP" + this.loopCount_);
      }
      this.loopCount_++;
    },
    removePart_(this: LibreLoopMutatorBlock) {
      this.loopCount_--;
      this.removeInput("LOOP" + this.loopCount_);
      if (this.loopCount_ === 0) {
        this.topStatementInput_ = null;
      }
    },
    updateMinus_(this: LibreLoopMutatorBlock) {
      const minusField = this.getField("MINUS");
      if (!minusField && this.loopCount_ > 1) {
        this.topStatementInput_?.insertFieldAt(1, createMinusField(), "MINUS");
      } else if (minusField && this.loopCount_ <= 1) {
        this.topStatementInput_?.removeField("MINUS");
      }
    },
  };

  const libreLoopInsideInMutatorHelper = function (this: LibreLoopMutatorBlock) {
    if (this.getInput("EMPTY")) this.removeInput("EMPTY");
    this.appendValueInput("VALUE")
      .appendField(new Blockly.FieldTextInput(""), "TEXT");
    this.updateShape_(1);
  };

  Blockly.Extensions.registerMutator(
    "libre_loop_inside_in_mutator",
    libreLoopInsideInMutator,
    libreLoopInsideInMutatorHelper,
  );

  // "Do" loop block (field + DO statement with its own field)
  Blockly.Blocks["libre_loop_do_inside"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("DO")
        .appendField(new Blockly.FieldTextInput(""), "TEXT_DO");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };

  // "Do" loop block with value input
  Blockly.Blocks["libre_loop_do_inside_in"] = {
    init(this: Blockly.Block) {
      this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.appendStatementInput("DO")
        .appendField(new Blockly.FieldTextInput(""), "TEXT_DO");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(LIBRE_STYLE);
      this.setTooltip(tooltip());
    },
  };
};
