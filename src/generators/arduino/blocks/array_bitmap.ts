/**
 * @packageDocumentation
 * @module Arduino.Generators.Array.Bitmap
 * @description Arduino generators for Array_bitmap and Array_bitmap_get.
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
import { ArduinoGenerator, Order } from "../arduino_generator";
import { isPrimaryListDeclarationBlock } from "../block_types_registry";
import {
  emitGlobalDeclarationError,
  readBitmapGrid,
} from "./array_helpers";

/**
 * Array_bitmap - global 2D byte array from FieldBitmap (rows x cols of 0/1).
 */
export const Array_bitmap = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): string {
  if (!isPrimaryListDeclarationBlock(block)) {
    return "";
  }
  const varName = generator.getVariableName(block.getFieldValue("VAR"));
  if (!varName || varName === "variable") {
    return emitGlobalDeclarationError(generator, "// Error: Invalid variable name");
  }
  const { cols, rows, rowsCode } = readBitmapGrid(block, generator);
  const declaration =
    "byte " +
    varName +
    "[" +
    rows +
    "][" +
    cols +
    "] = {\n  " +
    rowsCode +
    "\n};";
  generator.addArrayDeclaration(declaration);
  generator.addVariable(varName, declaration);
  return "";
};

/**
 * Array_bitmap_get - value: 2D 0/1 initializer from FieldBitmap.
 */
export const Array_bitmap_get = function (
  block: Blockly.Block,
  generator: ArduinoGenerator,
): [string, number] {
  const { rowsCode } = readBitmapGrid(block, generator);
  return ["{\n  " + rowsCode + "\n}", Order.ATOMIC];
};

