/**
 * @packageDocumentation
 * @module Arduino
 * @description Arduino generator helpers for µcBlockly blocks
 * @remarks
 * Exposes the generator instance and wiring helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ArduinoGenerator } from './arduino/arduino_generator';
import * as logic from './arduino/blocks/logic';
import * as loops from './arduino/blocks/loops';
import * as array from './arduino/blocks/array';
import * as math from './arduino/blocks/math';
import * as colour from './arduino/blocks/colour';
import * as procedures from './arduino/blocks/procedures';
import * as text from './arduino/blocks/text';
import * as variables from './arduino/blocks/variables';
import * as variablesTyped from './arduino/blocks/variables_typed';
import * as libre from './arduino/blocks/libre';
import * as board from './arduino/blocks/board';

export * from './arduino/arduino_generator';
export * from './arduino/arduino_types';
export * from './arduino/block_types_registry';

/** Arduino code generator instance for all registered block emitters. */
export const arduinoGenerator: ArduinoGenerator = new ArduinoGenerator();
// Add reserved words.  This list should include all words mentioned
// in RESERVED WORDS: comments in the imports above.
arduinoGenerator.addReservedWords('math,random,Number');

// Install per-block-type generator functions:
const { commentFromField: _commentFromField, ...libreGenerators } = libre;
const generators: typeof arduinoGenerator.forBlock = {
  ...logic,
  ...loops,
  ...array,
  ...math,
  ...colour,
  ...procedures,
  ...text,
  ...variables,
  ...variablesTyped,
  ...libreGenerators,
  ...board,
};

// Register each generator explicitly
for (const name in generators) {
  arduinoGenerator.forBlock[name] = generators[name];
}
