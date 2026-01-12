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
export declare const BLOCK_TYPES_VERSION = "1.0.0";
/**
 * Compatibilité de types - Définit quels types peuvent être convertis implicitement
 *
 * Exemple :
 * - 'float' peut recevoir 'int' (promotion implicite)
 * - 'int' ne peut pas recevoir 'float' (perte de précision)
 *
 * Format : { type_cible: [types_compatibles] }
 * Les types compatibles incluent toujours le type lui-même.
 */
export declare const TYPE_COMPATIBILITY: Record<string, string[]>;
/**
 * Obtenir les types compatibles pour un type donné
 * @param targetType - Le type cible
 * @returns Liste des types compatibles (inclut toujours le type lui-même)
 */
export declare function getCompatibleTypes(targetType: string | null | undefined): string[];
/**
 * Vérifier si un type source est compatible avec un type cible
 * @param sourceType - Le type source (celui qui est connecté)
 * @param targetType - Le type cible (celui qui est attendu)
 * @returns true si sourceType est compatible avec targetType
 */
export declare function isTypeCompatible(sourceType: string | null | undefined, targetType: string | null | undefined): boolean;
/**
 * Registre des types de blocs
 * Basé sur les informations extraites de BlocklyArduino dans src/types/
 */
export declare const BLOCK_TYPES: {
    readonly logic_compare: "bool";
    readonly logic_operation: "bool";
    readonly logic_negate: "bool";
    readonly logic_boolean: "bool";
    readonly logic_null: "null";
    readonly logic_ternary: "__DYNAMIC__ternary";
    readonly math_number: "__DYNAMIC__identifyNumber";
    readonly inout_angle_maths: "int";
    readonly math_arithmetic: "int";
    readonly math_interval: "int";
    readonly math_single: "float";
    readonly math_trig: "float";
    readonly math_constant: "float";
    readonly math_number_property: "bool";
    readonly math_round: "float";
    readonly math_modulo: "int";
    readonly math_random_int: "int";
    readonly math_random_float: "float";
    readonly text: "string";
    readonly text_char: "string";
    readonly text_join: "string";
    readonly text_append: "string";
    readonly text_length: "int";
    readonly text_isEmpty: "bool";
};
//# sourceMappingURL=block_types.d.ts.map