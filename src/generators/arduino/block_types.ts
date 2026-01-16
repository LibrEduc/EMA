/**
 * @fileoverview Registre centralisé des types de blocs Blockly pour Arduino
 * @description Ce fichier contient toutes les définitions de types de blocs.
 * Les types statiques sont définis comme des chaînes de caractères (ex: "int", "float", "bool").
 * Les types dynamiques utilisent le préfixe "__DYNAMIC__" suivi du nom de la fonction.
 * 
 * Pour ajouter un nouveau type de bloc :
 * 1. Ajoutez une entrée dans l'objet BLOCK_TYPES
 * 2. Pour un type statique : "nom_du_bloc": "int"
 * 3. Pour un type dynamique : "nom_du_bloc": "__DYNAMIC__nom_fonction"
 * 4. Si c'est un type dynamique, créez la fonction dans DYNAMIC_TYPE_FUNCTIONS dans block_types_registry.ts
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
  'string': ['string'], // string n'accepte que string
  'char': ['char'], // char n'accepte que char
  
  // Types spéciaux
  'null': ['null'], // null n'accepte que null
  'array': ['array'], // array n'accepte que array
};

const EXCLUDED_DROPDOWN_TYPES = new Set(['null', 'array']);

export const VARIABLE_TYPE_OPTIONS = Object.keys(TYPE_COMPATIBILITY).filter(
  (type) => !EXCLUDED_DROPDOWN_TYPES.has(type),
);

export function getVariableTypeOptions(): string[] {
  return [...VARIABLE_TYPE_OPTIONS];
}

/**
 * Obtenir les types compatibles pour un type donné
 * @param targetType - Le type cible
 * @returns Liste des types compatibles (inclut toujours le type lui-même)
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
export const BLOCK_TYPES = {
  // ============================================
  // Blocs logiques
  // ============================================
  logic_compare: 'bool',
  logic_operation: 'bool',
  logic_negate: 'bool',
  logic_boolean: 'bool',
  logic_null: 'null',
  logic_ternary: 'bool', // Le test renvoie un booléen

  // ============================================
  // Blocs mathématiques
  // ============================================
  math_number: '__DYNAMIC__identifyNumber', // Type déterminé par la valeur (int ou float)
  inout_angle_maths: 'int',
  math_arithmetic: 'int',
  math_interval: 'int',
  math_single: 'float', // Fonctions mathématiques simples (sin, cos, etc.)
  math_trig: 'float', // Fonctions trigonométriques
  math_constant: 'float', // Constantes mathématiques (PI, E, etc.)
  math_number_property: 'bool', // Propriétés des nombres (pair, impair, etc.)
  math_round: 'float', // Arrondi
  math_modulo: 'int', // Modulo
  math_random_int: 'int', // Nombre aléatoire entier
  math_random_float: 'float', // Nombre aléatoire décimal

  // ============================================
  // Blocs texte
  // ============================================
  text: 'string',
  text_char: 'string',
  text_join: 'string', // Concaténation de chaînes
  text_append: 'string', // Ajout de texte
  text_length: 'int', // Longueur d'une chaîne
  text_isEmpty: 'bool', // Test si chaîne vide
} as const;

