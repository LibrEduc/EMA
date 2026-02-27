/**
 * @packageDocumentation
 * @module Arduino.Generators.Libre
 * @description Générateurs Arduino pour les blocs « libre » (ex-catégorie null Blockly@rduino).
 * @remarks
 * Les blocs libres n’émettent pas de code par défaut ; le texte sert de commentaire ou de repère.
 * @license GPL-3.0-or-later
 */

import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "../arduino_generator";
import { Order } from "../arduino_generator";

/**
 * Génère un commentaire C++ à partir du champ TEXT du bloc (si non vide).
 */
function commentFromField(block: Block, fieldName: string): string {
  const text = (block.getFieldValue(fieldName) as string) || "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return "// " + trimmed.replace(/\n/g, "\n// ") + "\n";
}

export function libre_in(_block: Block, _generator: ArduinoGenerator): [string, Order] {
  return ["0", Order.ATOMIC];
}

export function libre_out(block: Block, generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_in_out(block: Block, _generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_start(block: Block, generator: ArduinoGenerator): string {
  return commentFromField(block, "TEXT");
}

export function libre_end(block: Block, generator: ArduinoGenerator): string {
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
