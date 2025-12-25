/**
 * @packageDocumentation Debug file for typed variables issue
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

import { ArduinoGenerator } from './arduino_generator';

/**
 * Debug function to test typed variables generation
 */
export function debugTypedVariables(): void {
  console.log('=== DEBUG: Variables Typées ===');
  
  // Créer une instance du générateur
  const generator = new ArduinoGenerator();
  
  // Vérifier les générateurs enregistrés
  console.log('Générateurs enregistrés:', Object.keys(generator.forBlock));
  
  // Vérifier spécifiquement les variables typées
  const hasTypedGet = 'variables_get_dynamic' in generator.forBlock;
  const hasTypedSet = 'variables_set_dynamic' in generator.forBlock;
  
  console.log('variables_get_dynamic enregistré:', hasTypedGet);
  console.log('variables_set_dynamic enregistré:', hasTypedSet);
  
  if (hasTypedGet) {
    console.log('Générateur variables_get_dynamic:', generator.forBlock['variables_get_dynamic']);
  }
  
  if (hasTypedSet) {
    console.log('Générateur variables_set_dynamic:', generator.forBlock['variables_set_dynamic']);
  }
  
  // Note: Test de génération de code nécessite un vrai bloc Blockly
  console.log('Note: Test de génération nécessite un vrai bloc Blockly');
  
  console.log('=== FIN DEBUG ===');
}

/**
 * Test function to verify generator registration
 */
export function testGeneratorRegistration(): void {
  console.log('=== TEST: Enregistrement des Générateurs ===');
  
  // Cette fonction nécessite d'être appelée après l'import du module
  console.log('Note: Cette fonction doit être appelée après l\'import du module arduino');
  console.log('=== FIN TEST ===');
}
