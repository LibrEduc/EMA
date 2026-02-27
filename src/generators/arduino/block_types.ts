/**
 * @packageDocumentation
 * @module Arduino.BlockTypes
 * @description Type compatibility and dropdown options for typed blocks.
 * @remarks
 * Defines type compatibility rules for block connections.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @fileoverview Types de base pour le typage Blockly Arduino
 * @description Les définitions de types de blocs sont maintenant dans src/generators/arduino/block_types/.
 * Chaque catégorie exporte un objet de types, puis l'index les agrège.
 *
 * Pour ajouter un nouveau type de bloc :
 * 1. Choisissez le fichier de catégorie dans block_types/ (ou créez-en un)
 * 2. Ajoutez "nom_du_bloc": "int" (statique) ou "__DYNAMIC__nom_fonction" (dynamique)
 * 3. Si dynamique, ajoutez la fonction dans DYNAMIC_TYPE_FUNCTIONS dans block_types_registry.ts
 */

/**
 * Version du registre 2026-01-11
 */
export const BLOCK_TYPES_VERSION = '1.0.0';

/**
 * Compatibilité de types - Définit quels types peuvent être convertis implicitement
 * 
 * Exemple : 
 * - 'float' peut recevoir 'int' (promotion implicite)
 * - 'int' ne peut pas recevoir 'float' (perte de précision)
 * 
 * Format : `type_cible: [types_compatibles]`
 * Les types compatibles incluent toujours le type lui-même.
 */
export const TYPE_COMPATIBILITY: Record<string, string[]> = {
  // Types numériques
  'int': ['int'], // int n'accepte que int (pas de perte de précision)
  'float': ['float', 'int'], // float accepte float et int (promotion implicite)

  // Types booléens
  'bool': ['bool'], // bool n'accepte que bool

  // Types texte
  'string': ['string', 'char'], // string accepte string et char
  'char': ['char'], // char n'accepte que char

  // Types spéciaux
  'null': ['null'], // null n'accepte que null
  // Pas de type 'array' : les listes sont typées par leurs entrées (string, int, etc.)
};

const EXCLUDED_DROPDOWN_TYPES = new Set(['null', 'array']);

export const VARIABLE_TYPE_OPTIONS = Object.keys(TYPE_COMPATIBILITY).filter(
  (type) => !EXCLUDED_DROPDOWN_TYPES.has(type),
);

/**
 * Returns the list of variable types available in dropdowns.
 */
export function getVariableTypeOptions(): string[] {
  return [...VARIABLE_TYPE_OPTIONS];
}

/**
 * Obtenir les types compatibles pour un type donné
 * @param targetType - Le type cible
 * @returns Liste des types compatibles (inclut toujours le type lui-même)
 */
/**
 * Returns compatible types for a target type.
 * @param targetType - Target type to match.
 * @returns List of compatible types (includes the target type).
 */
export function getCompatibleTypes(targetType: string | null | undefined): string[] {
  if (!targetType) {
    return []; // Pas de type, pas de compatibilité
  }

  // Retourner les types compatibles depuis le mapping, ou juste le type lui-même par défaut
  return TYPE_COMPATIBILITY[targetType] || [targetType];
}

/**
 * Vérifier si un type source est compatible avec un type cible
 * @param sourceType - Le type source (celui qui est connecté)
 * @param targetType - Le type cible (celui qui est attendu)
 * @returns true si sourceType est compatible avec targetType
 */
/**
 * Checks if a source type can connect to a target type.
 * @param sourceType - Source type from a connected block.
 * @param targetType - Target expected type.
 * @returns True when compatible.
 */
export function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean {
  if (!sourceType || !targetType) {
    return false;
  }

  // Si les types sont identiques, ils sont compatibles
  if (sourceType === targetType) {
    return true;
  }

  // Vérifier si sourceType est dans la liste des types compatibles de targetType
  const compatibleTypes = getCompatibleTypes(targetType);
  return compatibleTypes.includes(sourceType);
}

/**
 * Registre des types de blocs
 * Basé sur les informations extraites de BlocklyArduino dans src/types/
 */
