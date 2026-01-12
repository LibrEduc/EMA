# Registre des Types de Blocs

## Vue d'ensemble

Ce système permet de définir et appliquer automatiquement les types à tous les blocs Blockly basés sur les informations extraites de BlocklyArduino dans le dossier `src/types/`.

**Le registre est maintenant chargé depuis un fichier TypeScript** (`block_types.ts`) pour faciliter la maintenance et permettre de gérer facilement des centaines de définitions de blocs.

**Le système inclut également un mécanisme de compatibilité de types** qui gère les conversions implicites (ex: `int` → `float`).

## Structure

### 1. Fichier JSON de configuration (`block_types.json`)

Le fichier `src/generators/arduino/block_types.json` contient toutes les définitions de types de blocs :

```json
{
  "comment": "Registre centralisé des types de blocs Blockly pour Arduino",
  "version": "1.0.0",
  "types": {
    "logic_compare": "bool",
    "logic_operation": "bool",
    "math_number": "__DYNAMIC__identifyNumber",
    "text": "string"
  },
  "dynamicTypes": {
    "comment": "Types dynamiques qui nécessitent une fonction pour déterminer le type",
    "ternary": "Retourne le type de la branche THEN ou ELSE",
    "identifyNumber": "Identifie si un nombre est int ou float"
  }
}
```

**Format :**
- **Types statiques** : `"nom_du_bloc": "type"` (ex: `"logic_compare": "bool"`)
- **Types dynamiques** : `"nom_du_bloc": "__DYNAMIC__nom_fonction"` (ex: `"math_number": "__DYNAMIC__identifyNumber"`)

**Types disponibles :**
- `"int"` - Nombre entier
- `"float"` - Nombre décimal
- `"bool"` - Booléen
- `"string"` - Chaîne de caractères
- `"char"` - Caractère
- `"null"` - Null
- `"array"` - Tableau

### 2. Fichier source TypeScript (`block_types_registry.ts`)

Le fichier `src/generators/arduino/block_types_registry.ts` :

1. **Charge le fichier JSON** à l'import
2. **Définit les fonctions pour les types dynamiques** dans `DYNAMIC_TYPE_FUNCTIONS`
3. **Construit le registre** en convertissant les entrées JSON en fonctions TypeScript
4. **Applique les types aux blocs** via `applyBlockTypesFromRegistry()`

**Fonctions dynamiques disponibles :**
- `ternary` - Détermine le type basé sur les branches THEN/ELSE
- `identifyNumber` - Identifie si un nombre est int ou float

### 3. Fichiers source BlocklyArduino (`src/types/`)

Les fichiers dans `src/types/` contiennent les définitions de types extraites de BlocklyArduino :
- `blockly_logic.js` - Types pour les blocs logiques
- `blockly_maths.js` - Types pour les blocs mathématiques
- `blockly_text.js` - Types pour les blocs texte
- `blockly_loops.js` - Types pour les blocs de boucles

Ces fichiers servent de référence pour remplir `block_types.json`.

## Utilisation

### Ajouter un nouveau type de bloc

Pour ajouter un nouveau type de bloc au registre :

1. **Ouvrir `block_types.json`**

2. **Ajouter une entrée dans la section `types`** :

```json
{
  "types": {
    "mon_nouveau_bloc": "int"
  }
}
```

3. **Pour un type dynamique**, utiliser le préfixe `__DYNAMIC__` :

```json
{
  "types": {
    "mon_bloc_dynamique": "__DYNAMIC__maFonction"
  }
}
```

4. **Si nécessaire, créer une fonction dynamique** dans `block_types_registry.ts` :

```typescript
const DYNAMIC_TYPE_FUNCTIONS: Record<string, BlockTypeFunction> = {
  // ... fonctions existantes ...
  'maFonction': (block: Blockly.Block): string => {
    // Votre logique ici
    return 'int';
  },
};
```

5. **Recompiler le projet** avec `npm run build`

### Types statiques vs dynamiques

#### Types statiques (simples)

Pour les blocs qui retournent toujours le même type :

```json
{
  "types": {
    "logic_compare": "bool",
    "text": "string",
    "math_arithmetic": "int"
  }
}
```

#### Types dynamiques (fonctions)

Pour les blocs dont le type dépend de la configuration ou des connexions :

```json
{
  "types": {
    "math_number": "__DYNAMIC__identifyNumber",
    "logic_ternary": "__DYNAMIC__ternary"
  }
}
```

Les fonctions dynamiques sont définies dans `DYNAMIC_TYPE_FUNCTIONS` dans `block_types_registry.ts`.

### Application automatique

Les types sont appliqués automatiquement lors du chargement de l'application dans `src/index.ts` :

```typescript
DomIsLoaded((): void => {
  // ... autres initialisations ...
  
  // Appliquer les types de blocs depuis le registre
  if (typeof Blockly !== 'undefined') {
    applyBlockTypesFromRegistry();
  }
  
  // ... reste de l'initialisation ...
});
```

## Avantages de l'approche JSON

### 1. Facilité de maintenance

- **Fichier JSON facile à éditer** - Pas besoin de connaissances TypeScript avancées
- **Structure simple** - Format clair et lisible
- **Versioning** - Facile à suivre les changements avec Git

### 2. Scalabilité

- **Gestion de centaines de blocs** - Le fichier JSON peut contenir des centaines d'entrées
- **Performance** - Le registre est construit une seule fois à l'import
- **Organisation** - Facile d'organiser par catégories (commentaires dans le JSON)

### 3. Flexibilité

- **Types statiques** - Faciles à ajouter directement dans le JSON
- **Types dynamiques** - Supportés via le préfixe `__DYNAMIC__`
- **Extensible** - Facile d'ajouter de nouvelles fonctions dynamiques

## Types actuellement définis

### Blocs logiques
- `logic_compare` → `bool`
- `logic_operation` → `bool`
- `logic_negate` → `bool`
- `logic_boolean` → `bool`
- `logic_null` → `null`
- `logic_ternary` → `__DYNAMIC__ternary`

### Blocs mathématiques
- `math_number` → `__DYNAMIC__identifyNumber`
- `math_arithmetic` → `int`
- `math_single` → `float`
- `math_trig` → `float`
- `math_constant` → `float`
- `math_number_property` → `bool`
- `math_round` → `float`
- `math_modulo` → `int`
- `math_random_int` → `int`
- `math_random_float` → `float`

### Blocs texte
- `text` → `string`
- `text_char` → `string`
- `text_join` → `string`
- `text_append` → `string`
- `text_length` → `int`
- `text_isEmpty` → `bool`

## Fonctionnalités

### 1. Détection automatique des types numériques

La fonction `identifyNumber()` détermine automatiquement si un nombre est un entier (`int`) ou un décimal (`float`) :

```typescript
function identifyNumber(numString: string): string {
  // Vérifie la présence d'un point décimal ou notation scientifique
  if (numString.includes('.') || numString.includes('e') || numString.includes('E')) {
    return 'float';
  }
  
  // Vérifie si c'est un entier
  const num = Number.parseFloat(numString);
  if (!Number.isNaN(num) && num % 1 === 0) {
    return 'int';
  }
  
  return 'float';
}
```

### 2. Types dynamiques

Certains blocs nécessitent des types dynamiques basés sur leurs valeurs ou connexions :
- `math_number` : Type déterminé par la valeur du nombre
- `logic_ternary` : Type déterminé par les branches THEN/ELSE

### 3. Extension facile

Le système est conçu pour être facilement extensible :
- Ajoutez simplement une entrée dans `block_types.json`
- Le système appliquera automatiquement le type au bloc correspondant

## Migration depuis l'ancien système

Si vous avez utilisé l'ancien système avec les types définis directement dans le code TypeScript :

1. **Copiez les définitions** depuis `BLOCK_TYPE_REGISTRY` dans `block_types.json`
2. **Convertissez les fonctions** en références `__DYNAMIC__` si nécessaire
3. **Ajoutez les fonctions dynamiques** dans `DYNAMIC_TYPE_FUNCTIONS` si elles n'existent pas
4. **Recompilez** avec `npm run build`

## Système de Compatibilité de Types

### Vue d'ensemble

Le système de compatibilité de types permet de gérer les conversions implicites entre types. Par exemple :
- Un bloc `float` peut recevoir un bloc `int` (promotion implicite)
- Un bloc `int` ne peut pas recevoir un bloc `float` (perte de précision)

### Configuration

La compatibilité est définie dans `block_types.ts` via `TYPE_COMPATIBILITY` :

```typescript
export const TYPE_COMPATIBILITY: Record<string, string[]> = {
  'int': ['int'], // int n'accepte que int
  'float': ['float', 'int'], // float accepte float et int
  'bool': ['bool'],
  'string': ['string'],
  // ...
};
```

### Utilisation

Le système utilise automatiquement la compatibilité lors de la configuration de `setCheck()` :

```typescript
// Dans block_definitions.ts
const compatibleTypes = getCompatibleTypesForCheck(typeToUse);
valueInput.connection.setCheck(compatibleTypes);
```

**Exemple concret :**
- Variable de type `float` → accepte les blocs `float` ET `int`
- Variable de type `int` → accepte uniquement les blocs `int`

### Fonctions disponibles

- `getCompatibleTypes(targetType)` : Retourne la liste des types compatibles
- `isTypeCompatible(sourceType, targetType)` : Vérifie si deux types sont compatibles
- `getCompatibleTypesForCheck(type)` : Retourne les types compatibles formatés pour `setCheck()`

### Ajouter une nouvelle compatibilité

Pour ajouter une nouvelle règle de compatibilité :

1. **Ouvrir `block_types.ts`**
2. **Ajouter/modifier une entrée dans `TYPE_COMPATIBILITY`** :

```typescript
export const TYPE_COMPATIBILITY: Record<string, string[]> = {
  // ... types existants ...
  'mon_type': ['mon_type', 'autre_type_compatible'],
};
```

3. **Recompiler** avec `npm run build`

## Prochaines étapes

Pour compléter le système :

1. **Ajouter tous les blocs manquants** : Vérifier tous les blocs dans `src/types/` et les ajouter à `block_types.ts`
2. **Gérer les types complexes** : Implémenter la gestion des tableaux et types complexes
3. **Étendre la compatibilité** : Ajouter d'autres règles de compatibilité si nécessaire (ex: char → string)
4. **Validation des connexions** : Utiliser `getBlockType()` pour valider les connexions entre blocs
