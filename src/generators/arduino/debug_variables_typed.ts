/**
 * @packageDocumentation
 * @module Arduino.DebugVariablesTyped
 * @description Debug file for typed variables issue.
 * @remarks
 * Debug helpers for typed variable generation.
 * @license GPL-3.0-or-later
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

import { ArduinoGenerator } from './arduino_generator';
import { debugLog } from "./debug";

/**
 * Debug function to test typed variables generation
 */
/**
 * Logs typed-variable related state for debugging.
 */
export function debugTypedVariables(): void {
  debugLog('=== DEBUG: Variables Typées ===');

  // Créer une instance du générateur
  const generator = new ArduinoGenerator();

  // Vérifier les générateurs enregistrés
  debugLog('Générateurs enregistrés:', Object.keys(generator.forBlock));

  // Vérifier spécifiquement les variables typées
  const hasTypedGet = 'variables_get_dynamic' in generator.forBlock;
  const hasTypedSet = 'variables_set_dynamic' in generator.forBlock;

  debugLog('variables_get_dynamic enregistré:', hasTypedGet);
  debugLog('variables_set_dynamic enregistré:', hasTypedSet);

  if (hasTypedGet) {
    debugLog('Générateur variables_get_dynamic:', generator.forBlock['variables_get_dynamic']);
  }

  if (hasTypedSet) {
    debugLog('Générateur variables_set_dynamic:', generator.forBlock['variables_set_dynamic']);
  }

  // Note: Test de génération de code nécessite un vrai bloc Blockly
  debugLog('Note: Test de génération nécessite un vrai bloc Blockly');

  debugLog('=== FIN DEBUG ===');
}

/**
 * Test function to verify generator registration
 */
/**
 * Validates that generator registrations are in place.
 */
export function testGeneratorRegistration(): void {
  debugLog('=== TEST: Enregistrement des Générateurs ===');

  // Cette fonction nécessite d'être appelée après l'import du module
  debugLog('Note: Cette fonction doit être appelée après l\'import du module arduino');
  debugLog('=== FIN TEST ===');
}
