/**
 * @packageDocumentation Complete helper functions for generating Arduino for blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {ArduinoGenerator} from './arduino/arduino_generator';
/* import * as colour from './arduino/colour.js';
import * as lists from './arduino/lists.js'; */
import * as logic from './arduino/logic';
import * as variables from './arduino/variables';
import * as variablesTyped from './arduino/variables_typed';
/* import * as loops from './arduino/loops.js';
import * as math from './arduino/math.js';
import * as procedures from './arduino/procedures.js';
import * as text from './arduino/text.js'; */

export * from './arduino/arduino_generator';
export * from './arduino/arduino_types';
export * from './arduino/diagnostic';
export * from './arduino/test_generator';
export * from './arduino/debug_variables_typed';
export * from './arduino/block_definitions';
export * from './arduino/block_types_registry';

/**
 * Arduino code generator instance.
 * {@type ArduinoGenerator}
 */
export const arduinoGenerator: ArduinoGenerator = new ArduinoGenerator();
// Add reserved words.  This list should include all words mentioned
// in RESERVED WORDS: comments in the imports above.
arduinoGenerator.addReservedWords('math,random,Number');

// Install per-block-type generator functions:
const generators: typeof arduinoGenerator.forBlock = {
  ...logic,
  ...variables,
  ...variablesTyped,
};

// Enregistrer explicitement chaque générateur
for (const name in generators) {
  arduinoGenerator.forBlock[name] = generators[name];
}

// Supprimer les enregistrements en double qui peuvent causer des conflits
// arduinoGenerator.forBlock['variables_get_dynamic'] = variablesTyped.variables_get_dynamic;
// arduinoGenerator.forBlock['variables_set_dynamic'] = variablesTyped.variables_set_dynamic;
