/**
 * @packageDocumentation
 * @module Arduino.Generators.Libre
 * @description Arduino generators for "libre" blocks (legacy rduino null category).
 * @remarks
 * Libre blocks do not emit code by default; the text is used as a comment or marker.
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

import type { Block } from "blockly/core";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

/**
 * Generates a C++ comment from the block's TEXT field (if non-empty).
 */
export function commentFromField(block: Block, fieldName: string): string {
  const text = (block.getFieldValue(fieldName) as string) || "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return "// " + trimmed.replace(/\n/g, "\n// ") + "\n";
}

export function libre_in(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["0", Order.ATOMIC];
}

export function libre_out(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_in_out(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_start(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_end(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_loop(block: Block, generator: ArduinoGenerator): string {
  const loop = generator.statementToCode(block, "LOOP") || "";
  return commentFromField(block, "TEXT") + loop;
}

export function libre_loop_with_return(block: Block, generator: ArduinoGenerator): string {
  const loop = generator.statementToCode(block, "LOOP") || "";
  return commentFromField(block, "TEXT") + loop;
}

export function libre_loop_inside(block: Block, generator: ArduinoGenerator): string {
  const loop = generator.statementToCode(block, "LOOP") || "";
  return commentFromField(block, "TEXT") + loop;
}

export function libre_loop_inside_in(block: Block, generator: ArduinoGenerator): string {
  const loop = generator.statementToCode(block, "LOOP") || "";
  return commentFromField(block, "TEXT") + loop;
}

export function libre_loop_inside_in_mutator(block: Block, generator: ArduinoGenerator): string {
  let code = commentFromField(block, "TEXT");
  for (let i = 0; ; i++) {
    const input = block.getInput("LOOP" + i);
    if (!input) break;
    code += generator.statementToCode(block, "LOOP" + i) || "";
  }
  return code;
}

export function libre_loop_do_inside(block: Block, generator: ArduinoGenerator): string {
  const doBlock = generator.statementToCode(block, "DO") || "";
  return commentFromField(block, "TEXT") + doBlock;
}

export function libre_loop_do_inside_in(block: Block, generator: ArduinoGenerator): string {
  const doBlock = generator.statementToCode(block, "DO") || "";
  return commentFromField(block, "TEXT") + doBlock;
}
