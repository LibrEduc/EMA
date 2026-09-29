/**
 * @packageDocumentation
 * @module BlocklyCategories.ArrayBitmap
 * @description List block filled from a FieldBitmap grid (columns x rows).
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
import { FieldBitmap } from "./field_bitmap";
import {
  createEmptyBitmapGrid,
  resizeBitmapGrid,
  clampDim,
} from "./array_bitmap_grid";
import {
  getOrCreateKindedVariable,
  LIST_DEFAULT_VARIABLE_NAME,
  LIST_VARIABLE_TYPE,
  releaseVariableDeclaration,
} from "../../generators/arduino/variable_utils";
import {
  applyListDeclarationBlockWarning,
  revalidateListDeclarationUniqueness,
} from "./array";
import {
  configureListVariableField,
  getArrayIndexBlocklyChecks,
  getBlocklyMsgOr,
  syncListVariableFromField,
} from "./shared";

const ARRAY_BITMAP_DEFAULT_VAR = LIST_DEFAULT_VARIABLE_NAME;
const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 8;

type ArrayBitmapBlock = Blockly.Block & {
  syncBitmapSize_?: () => void;
};

export { createEmptyBitmapGrid, resizeBitmapGrid, clampDim } from "./array_bitmap_grid";

/**
 * Reads a dimension from a value input (prefers math_number NUM).
 * @param block - Blockly block instance.
 * @param inputName - Name string.
 * @param fallback - The `fallback` argument.
 * @returns Numeric result.
 */
export const readBitmapDimInput = (
  block: Blockly.Block,
  inputName: string,
  fallback: number,
): number => {
  const target = block.getInputTargetBlock(inputName);
  if (target?.type === "math_number") {
    return clampDim(Number(target.getFieldValue("NUM")));
  }
  if (target) {
    const raw = target.getFieldValue("NUM");
    if (raw !== null && raw !== undefined && raw !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return clampDim(parsed);
      }
    }
  }
  return clampDim(fallback);
};

const attachMathNumberShadow = (
  input: Blockly.Input | null,
  value: number,
): void => {
  if (!input?.connection) {
    return;
  }
  input.connection.setShadowState({
    type: "math_number",
    fields: { NUM: value },
  });
};

const bindDefaultListVariable = (block: Blockly.Block): void => {
  const workspace = block.workspace;
  if (!workspace) {
    return;
  }
  const variableModel = getOrCreateKindedVariable(
    workspace,
    ARRAY_BITMAP_DEFAULT_VAR,
    LIST_VARIABLE_TYPE,
  );
  if (variableModel?.getId()) {
    block.setFieldValue(variableModel.getId(), "VAR");
    syncListVariableFromField(block, "VAR");
  }
};

const isBitmapDimEvent = (
  block: ArrayBitmapBlock,
  event: Blockly.Events.Abstract,
): boolean => {
  if (event.type === Blockly.Events.BLOCK_MOVE) {
    const move = event as Blockly.Events.BlockMove;
    return move.newParentId === block.id || move.oldParentId === block.id;
  }
  if (
    event.type === Blockly.Events.BLOCK_CHANGE ||
    event.type === Blockly.Events.BLOCK_CREATE ||
    event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
  ) {
    const blockId = (event as { blockId?: string }).blockId;
    if (!blockId) {
      return false;
    }
    if (blockId === block.id) {
      return true;
    }
    return (
      block.getInputTargetBlock("COLS")?.id === blockId ||
      block.getInputTargetBlock("ROWS")?.id === blockId
    );
  }
  return false;
};

const syncBitmapFieldSize = (block: ArrayBitmapBlock): void => {
  const cols = readBitmapDimInput(block, "COLS", DEFAULT_COLS);
  const rows = readBitmapDimInput(block, "ROWS", DEFAULT_ROWS);
  const prev = Blockly.Events.getRecordUndo();
  Blockly.Events.setRecordUndo(false);
  try {
    for (const inputName of ["COLS", "ROWS"] as const) {
      const target = block.getInputTargetBlock(inputName);
      if (target?.type === "math_number") {
        const clamped = inputName === "COLS" ? cols : rows;
        if (Number(target.getFieldValue("NUM")) !== clamped) {
          target.setFieldValue(String(clamped), "NUM");
        }
      }
    }
  } finally {
    Blockly.Events.setRecordUndo(prev);
  }

  const gridInput = block.getInput("GRID");
  const bitmapField = block.getField("BITMAP") as InstanceType<
    typeof FieldBitmap
  > | null;
  if (!gridInput || !bitmapField) {
    return;
  }
  if (
    bitmapField.getImageWidth() === cols &&
    bitmapField.getImageHeight() === rows
  ) {
    return;
  }
  const next = resizeBitmapGrid(bitmapField.getValue(), rows, cols);
  gridInput.removeField("BITMAP");
  gridInput.appendField(
    new FieldBitmap(next, undefined, {
      width: cols,
      height: rows,
      buttons: { clear: true, randomize: false },
      fieldHeight: 96,
    }) as unknown as Blockly.Field,
    "BITMAP",
  );
};

const appendBitmapDimAndGridInputs = (block: Blockly.Block): void => {
  const initial = createEmptyBitmapGrid(DEFAULT_ROWS, DEFAULT_COLS);
  const colsInput = block
    .appendValueInput("COLS")
    .setCheck(getArrayIndexBlocklyChecks())
    .appendField(getBlocklyMsgOr("ARRAY_BITMAP_COLS", "columns"));
  const rowsInput = block
    .appendValueInput("ROWS")
    .setCheck(getArrayIndexBlocklyChecks())
    .appendField(getBlocklyMsgOr("ARRAY_BITMAP_ROWS", "rows"));
  attachMathNumberShadow(colsInput, DEFAULT_COLS);
  attachMathNumberShadow(rowsInput, DEFAULT_ROWS);
  block.appendDummyInput("GRID").appendField(
    new FieldBitmap(initial, undefined, {
      width: DEFAULT_COLS,
      height: DEFAULT_ROWS,
      buttons: { clear: true, randomize: false },
      fieldHeight: 96,
    }) as unknown as Blockly.Field,
    "BITMAP",
  );
};

/**
 * Registers Array_bitmap (declaration) and Array_bitmap_get (value grid).
 */
export const defineArrayBitmapBlock = (): void => {
  if (!Blockly.Blocks["Array_bitmap"]) {
    Blockly.Blocks["Array_bitmap"] = {
      init: function (this: ArrayBitmapBlock) {
        this.appendDummyInput("HEADER")
          .appendField(getBlocklyMsgOr("ARRAY_CREATE", "define"))
          .appendField(
            new Blockly.FieldVariable(
              ARRAY_BITMAP_DEFAULT_VAR,
              undefined,
              null,
              LIST_VARIABLE_TYPE,
            ),
            "VAR",
          )
          .appendField(
            getBlocklyMsgOr("ARRAY_BITMAP_AS_LIST", "as a bitmap list"),
          );

        appendBitmapDimAndGridInputs(this);

        const varField = this.getField("VAR") as Blockly.FieldVariable | null;
        if (varField) {
          configureListVariableField(varField);
        }
        bindDefaultListVariable(this);

        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setStyle("list_blocks");
        this.setTooltip(
          getBlocklyMsgOr(
            "ARRAY_BITMAP_TOOLTIP",
            "Global 2D byte list filled from a drawable bitmap.",
          ),
        );
        this.setHelpUrl(getBlocklyMsgOr("ARRAY_BITMAP_HELPURL", ""));
      },

      syncBitmapSize_: function (this: ArrayBitmapBlock) {
        syncBitmapFieldSize(this);
      },

      onchange: function (
        this: ArrayBitmapBlock,
        event: Blockly.Events.Abstract,
      ) {
        if (!this.workspace || this.isInFlyout) {
          return;
        }
        if (event.isUiEvent) {
          return;
        }
        if (event.type === Blockly.Events.BLOCK_CREATE) {
          const create = event as Blockly.Events.BlockCreate;
          if (create.blockId === this.id) {
            if (create.recordUndo) {
              bindDefaultListVariable(this);
            } else {
              syncListVariableFromField(this, "VAR");
            }
            this.syncBitmapSize_?.();
          } else if (isBitmapDimEvent(this, event)) {
            this.syncBitmapSize_?.();
          }
          revalidateListDeclarationUniqueness(this.workspace);
          return;
        }
        if (event.type === Blockly.Events.BLOCK_DELETE) {
          revalidateListDeclarationUniqueness(this.workspace);
          return;
        }
        if (
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.BLOCK_CHANGE ||
          event.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
        ) {
          if (isBitmapDimEvent(this, event)) {
            this.syncBitmapSize_?.();
          }
        }
        if (event.type !== Blockly.Events.BLOCK_CHANGE) {
          if (
            event.type !== Blockly.Events.BLOCK_MOVE &&
            event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
          ) {
            return;
          }
          applyListDeclarationBlockWarning(this);
          return;
        }
        const change = event as Blockly.Events.BlockChange;
        if (change.blockId === this.id && change.name === "VAR") {
          if (change.oldValue) {
            const previous = this.workspace
              .getVariableMap()
              .getVariableById(String(change.oldValue));
            releaseVariableDeclaration(previous, this.id);
          }
          syncListVariableFromField(this, "VAR");
          revalidateListDeclarationUniqueness(this.workspace);
          return;
        }
        applyListDeclarationBlockWarning(this);
      },
    };
  }

  // Array_bitmap_get - plugin-style value: columns / rows / FieldBitmap
  if (!Blockly.Blocks["Array_bitmap_get"]) {
    Blockly.Blocks["Array_bitmap_get"] = {
      init: function (this: ArrayBitmapBlock) {
        appendBitmapDimAndGridInputs(this);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setStyle("list_blocks");
        this.setTooltip(
          getBlocklyMsgOr(
            "ARRAY_BITMAP_GET_TOOLTIP",
            "Bitmap value (2D 0/1 grid) to assign to a list.",
          ),
        );
        this.setHelpUrl(getBlocklyMsgOr("ARRAY_BITMAP_GET_HELPURL", ""));
      },

      syncBitmapSize_: function (this: ArrayBitmapBlock) {
        syncBitmapFieldSize(this);
      },

      onchange: function (
        this: ArrayBitmapBlock,
        event: Blockly.Events.Abstract,
      ) {
        if (!this.workspace || this.isInFlyout || event.isUiEvent) {
          return;
        }
        if (
          event.type === Blockly.Events.BLOCK_CREATE &&
          (event as Blockly.Events.BlockCreate).blockId === this.id
        ) {
          this.syncBitmapSize_?.();
          return;
        }
        if (isBitmapDimEvent(this, event)) {
          this.syncBitmapSize_?.();
        }
      },
    };
  }
};
