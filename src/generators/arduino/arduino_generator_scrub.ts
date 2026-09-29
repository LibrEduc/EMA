/**
 * @packageDocumentation
 * @module Arduino.Generator.Scrub
 * @description Quote and scrub helpers for ArduinoGenerator.
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

/**
 * Host hooks required by scrub helpers (methods from Blockly.CodeGenerator).
 */
export type ScrubHost = {
  COMMENT_WRAP: number;
  prefixLines(text: string, prefix: string): string;
  allNestedComments(block: Blockly.Block): string;
  blockToCode(block: Blockly.Block | null): string | [string, number];
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. A trailing newline keeps the line legal in a sketch body.
 * @param line - Line of generated code.
 * @returns Legal line of code.
 */
export function scrubNakedValue(line: string): string {
  return line + "\n";
}

/**
 * Encode a string as a properly escaped Arduino string, complete with quotes.
 * @param string - Text to encode.
 * @returns Arduino string.
 */
export function quoteArduinoString(string: string): string {
  string = string.replace(/\\/g, "\\\\").replace(/\n/g, "\\\n");

  let quote = "'";
  if (string.indexOf("'") !== -1) {
    if (string.indexOf('"') === -1) {
      quote = '"';
    } else {
      string = string.replace(/'/g, "\\'");
    }
  }
  return quote + string + quote;
}

/**
 * Encode a string as a properly escaped multiline Arduino string.
 * @param string - Text to encode.
 * @returns Arduino string.
 */
export function multilineQuoteArduinoString(string: string): string {
  const lines = string.split(/\n/g).map(quoteArduinoString);
  return lines.join(" + '\\n' + \n");
}

/**
 * Format comment text for Arduino with proper line breaks and wrapping.
 * @param comment - Raw comment text.
 * @returns Formatted comment text.
 */
export function formatArduinoComment(comment: string): string {
  comment = comment.trim().replace(/\s+/g, " ");

  const maxLineLength = 80;
  if (comment.length <= maxLineLength) {
    return comment;
  }

  const words = comment.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).length <= maxLineLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.join("\n");
}

/**
 * Whether a debug block-type comment should be emitted for scrubArduino_.
 * @param blockType - Type of the block.
 * @returns True when the comment should be added.
 */
export function shouldAddBlockTypeComment(blockType: string): boolean {
  const complexBlocks = [
    "controls_if",
    "controls_repeat",
    "procedures_defreturn",
    "variables_set",
  ];
  return complexBlocks.includes(blockType);
}

/**
 * Common scrub: comments + following statements (Blockly-style).
 * @param host - Generator host for comment/next helpers.
 * @param block - The current block.
 * @param code - The Arduino code created for this block.
 * @param thisOnly - True to generate code for only this statement.
 * @returns Arduino code with comments and subsequent blocks added.
 */
export function scrubBlockCode(
  host: ScrubHost,
  block: Blockly.Block,
  code: string,
  thisOnly = false,
): string {
  let commentCode = "";
  if (!block.outputConnection?.targetConnection) {
    let comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment, host.COMMENT_WRAP - 3);
      commentCode += host.prefixLines(comment + "\n", "// ");
    }
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
        const childBlock = block.inputList[i].connection!.targetBlock();
        if (childBlock) {
          comment = host.allNestedComments(childBlock);
          if (comment) {
            commentCode += host.prefixLines(comment, "// ");
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = thisOnly ? "" : host.blockToCode(nextBlock);
  return commentCode + code + nextCode;
}

/**
 * Arduino-enhanced scrub with formatted comments and optional block-type tags.
 * @param host - Generator host for comment/next helpers.
 * @param block - The current block.
 * @param code - The Arduino code created for this block.
 * @param thisOnly - True to generate code for only this statement.
 * @returns Arduino code with enhanced comments and subsequent blocks added.
 */
export function scrubArduinoBlockCode(
  host: ScrubHost,
  block: Blockly.Block,
  code: string,
  thisOnly = false,
): string {
  let commentCode = "";

  if (!block.outputConnection?.targetConnection) {
    let comment = block.getCommentText();
    if (comment) {
      comment = formatArduinoComment(comment);
      commentCode += host.prefixLines(comment + "\n", "// ");
    }

    const blockType = block.type;
    if (blockType && shouldAddBlockTypeComment(blockType)) {
      commentCode += host.prefixLines(`Block type: ${blockType}\n`, "// ");
    }

    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
        const childBlock = block.inputList[i].connection!.targetBlock();
        if (childBlock) {
          const nestedComment = host.allNestedComments(childBlock);
          if (nestedComment) {
            commentCode += host.prefixLines(nestedComment, "// ");
          }
        }
      }
    }
  }

  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = thisOnly ? "" : host.blockToCode(nextBlock);

  return commentCode + code + nextCode;
}
