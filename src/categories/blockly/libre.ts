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
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getBlocklyMsgOr } from "./shared";
import {
  createPartListPlusMinusMutator,
  createPlusField,
  registerMutatorOnce,
  type CountablePlusMinusBlock,
} from "./plus_minus_mutator";

const LIBRE_STYLE = "libre_blocks";

type LibreLoopMutatorBlock = CountablePlusMinusBlock & {
  loopCount_: number;
  topStatementInput_: Blockly.Input | null;
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

  const libreLoopInsideInMutator = createPartListPlusMinusMutator({
    countProperty: "loopCount_",
    topInputProperty: "topStatementInput_",
    xmlAttribute: "loops",
    stateKey: "loopCount",
    partInputName: (index) => "LOOP" + index,
    minCount: 1,
    emptyInputName: "EMPTY",
    normalizeLoadedCount: (raw) => Math.max(1, raw || 1),
    appendFirstPart: (block) =>
      block
        .appendStatementInput("LOOP0")
        .appendField(createPlusField(), "PLUS")
        .appendField(getBlocklyMsgOr("LIBRE_LOOP_DO", "faire")),
    appendExtraPart: (block, index) => {
      block.appendStatementInput("LOOP" + index);
    },
  });

  registerMutatorOnce(
    "libre_loop_inside_in_mutator",
    libreLoopInsideInMutator,
    function (this: Blockly.Block) {
      const block = this as LibreLoopMutatorBlock;
      if (block.getInput("EMPTY")) block.removeInput("EMPTY");
      block
        .appendValueInput("VALUE")
        .appendField(new Blockly.FieldTextInput(""), "TEXT");
      block.updateShape_(1);
    },
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
