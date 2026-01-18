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
export declare const BLOCK_TYPES_VERSION = "1.0.0";
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
export declare const TYPE_COMPATIBILITY: Record<string, string[]>;
export declare const VARIABLE_TYPE_OPTIONS: string[];
export declare function getVariableTypeOptions(): string[];
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
//# sourceMappingURL=block_types.d.ts.map