# Analyse du Plugin de Variables Typées

## Vue d'ensemble

Le plugin `typed-variable-modal` permet de créer des variables avec un type spécifique dans Blockly. Cette analyse explique comment l'information de typage est gérée et comment les connexions incompatibles entre blocs sont empêchées.

## 1. Gestion de l'information de typage

### 1.1 Création de variables typées

Le plugin `TypedVariableModal` fournit une interface modale pour créer des variables avec un type associé :

```170:200:exemples/typed-variable-modal/src/TypedVariableModal.js
  onConfirm_() {
    const text = this.getValidInput_();
    const type = this.getSelectedType_() || '';
    if (text) {
      const existing = Blockly.Variables.nameUsedWithAnyType(
        text,
        this.workspace_,
      );
      if (existing) {
        let msg = '';
        if (existing.type === type) {
          msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace(
            '%1',
            existing.name,
          );
        } else {
          msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
          msg = msg
            .replace('%1', existing.name)
            .replace('%2', this.getDisplayName_(existing.type));
        }
        Blockly.dialog.alert(msg);
      } else {
        // No conflict
        this.workspace_.createVariable(text, type);
        this.hide();
      }
    } else {
      Blockly.dialog.alert(Blockly.Msg['TYPED_VAR_MODAL_INVALID_NAME']);
    }
  }
```

**Points clés :**
- La variable est créée avec `workspace.createVariable(text, type)` où `type` est le type sélectionné (ligne 194)
- Blockly stocke le type dans le `VariableModel` de la variable
- Avant la création, le plugin vérifie qu'une variable avec le même nom n'existe pas déjà avec un type différent

### 1.2 Stockage du type

Le type de la variable est stocké dans le `VariableModel` de Blockly. Chaque variable dans Blockly a :
- Un **nom** (ID unique)
- Un **type** (optionnel, défini lors de la création)
- Des **propriétés** (métadonnées)

Le type est accessible via :
- `variable.getType()` : retourne le type de la variable
- `variable.getName()` : retourne le nom de la variable
- `variable.getId()` : retourne l'ID unique de la variable

### 1.3 Utilisation des variables typées

Les variables typées sont utilisées avec les blocs `variables_get_dynamic` et `variables_set_dynamic` :

```62:62:exemples/typed-variable-modal/test/index.js
    const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
```

La méthode `Blockly.VariablesDynamic.flyoutCategoryBlocks()` génère automatiquement les blocs pour toutes les variables typées du workspace.

## 2. Prévention des connexions incompatibles

### 2.1 Système de vérification de types de Blockly

Blockly utilise un système de **vérification de types** pour empêcher les connexions incompatibles. Ce système fonctionne à deux niveaux :

#### A. Vérification au niveau des connexions (`setCheck`)

Chaque connexion (input/output) peut être configurée pour accepter uniquement certains types :

```typescript
// Exemple : un bloc qui accepte uniquement des nombres
this.appendValueInput('VALUE')
    .setCheck('Number');  // Accepte uniquement des blocs de type Number

// Exemple : un bloc qui accepte plusieurs types
this.appendValueInput('VALUE')
    .setCheck(['Number', 'String']);  // Accepte Number ou String
```

#### B. Définition du type de sortie des blocs (`getBlockType`)

Chaque bloc peut définir son type de sortie via la méthode `getBlockType()` :

```69:82:exemples/BlocklyArduino/blocks/BlocklyArduino/variables.js
    getBlockType: function () {
        return [Blockly.Types.UNDEF, this.getFieldValue('VAR')];
    },
    /**
     * Gets the stored type of the variable indicated in the argument. As only one
     * variable is stored in this block, no need to check input
     * @this Blockly.
     * @param {!string} varName Name of this block variable to check type.
     * @return {!string} String to indicate the type of this block.
     */
    getVarType: function (varName) {
        //return [Blockly.Types.UNDEF, this.getFieldValue('VAR')];
        return Blockly.Types.getChildBlockType(this)
    }
```

### 2.2 Comment Blockly empêche les connexions incompatibles

Lorsqu'un utilisateur tente de connecter deux blocs, Blockly effectue les vérifications suivantes :

1. **Récupération du type de sortie du bloc source** :
   - Blockly appelle `getBlockType()` sur le bloc source pour obtenir son type de sortie

2. **Vérification de compatibilité avec la connexion d'entrée** :
   - Blockly vérifie si le type de sortie correspond aux types acceptés par `setCheck()` de la connexion d'entrée

3. **Décision de connexion** :
   - Si les types sont compatibles : la connexion est autorisée
   - Si les types sont incompatibles : Blockly refuse la connexion visuellement (pas de connexion possible)

### 2.3 Exemple concret avec des variables typées

Prenons l'exemple d'un système avec deux types : "Penguin" et "Giraffe" :

```42:45:exemples/typed-variable-modal/test/index.js
  const types = [
    ['Penguin', 'PENGUIN'],
    ['Giraffe', 'GIRAFFE'],
  ];
```

**Scénario 1 : Connexion compatible**
- Bloc `variables_get_dynamic` avec variable de type "PENGUIN"
- Bloc qui accepte le type "PENGUIN" via `setCheck('PENGUIN')`
- ✅ Connexion autorisée

**Scénario 2 : Connexion incompatible**
- Bloc `variables_get_dynamic` avec variable de type "PENGUIN"
- Bloc qui accepte uniquement le type "GIRAFFE" via `setCheck('GIRAFFE')`
- ❌ Connexion refusée par Blockly

### 2.4 Mécanisme de vérification dans Blockly

Blockly utilise le système de **type checking** intégré :

1. **Lors de la création d'une connexion** :
   - La méthode `Connection.checkType_()` est appelée
   - Elle compare le type de sortie avec les types acceptés

2. **Types spéciaux** :
   - `null` : accepte tous les types
   - `['Type1', 'Type2']` : accepte Type1 OU Type2
   - `'Type'` : accepte uniquement Type
   - Variables typées : le type est récupéré depuis le `VariableModel`

### 2.5 Limitations actuelles dans le code existant

Dans le code actuel de `µcBlockly`, les blocs `variables_get_dynamic` et `variables_set_dynamic` sont définis sans vérification de type stricte :

```84:110:src/index.ts
    Blockly.Blocks['variables_get_dynamic'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldVariable('item'), 'VAR');
        this.setOutput(true, null);  // ⚠️ null = accepte tous les types
        this.setColour(330);
        this.setTooltip('Gets the value of a typed variable');
        this.setHelpUrl('');
      }
    };

    // Bloc pour définir la valeur d'une variable typée
    Blockly.Blocks['variables_set_dynamic'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('set')
            .appendField(new Blockly.FieldVariable('item'), 'VAR')
            .appendField('to');
        this.appendValueInput('VALUE')
            .setCheck(null);  // ⚠️ null = accepte tous les types
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip('Sets the value of a typed variable');
        this.setHelpUrl('');
      }
    };
```

**Problème identifié :**
- `setOutput(true, null)` : le bloc peut être connecté à n'importe quelle entrée
- `setCheck(null)` : le bloc accepte n'importe quel type en entrée
- Il n'y a **pas de vérification de type** entre le type de la variable et les connexions

## 3. Recommandations pour implémenter la vérification de types

Pour implémenter correctement la vérification de types avec les variables typées, il faudrait :

### 3.1 Ajouter `getBlockType()` aux blocs de variables

```typescript
Blockly.Blocks['variables_get_dynamic'] = {
  init: function() {
    // ... code existant ...
  },
  getBlockType: function() {
    // Récupérer le type de la variable depuis le VariableModel
    const variableId = this.getFieldValue('VAR');
    const variable = this.workspace.getVariableById(variableId);
    if (variable && variable.getType()) {
      return variable.getType();  // Retourne le type de la variable
    }
    return null;  // Type inconnu
  }
};
```

### 3.2 Utiliser `setCheck()` avec le type de la variable

Pour le bloc `variables_set_dynamic`, il faudrait vérifier dynamiquement le type :

```typescript
Blockly.Blocks['variables_set_dynamic'] = {
  init: function() {
    // ... code existant ...
    this.appendValueInput('VALUE')
        .setCheck(null);  // Nécessite une vérification dynamique
  },
  onchange: function() {
    // Vérifier que la valeur assignée correspond au type de la variable
    const variableId = this.getFieldValue('VAR');
    const variable = this.workspace.getVariableById(variableId);
    if (variable && variable.getType()) {
      const valueBlock = this.getInputTargetBlock('VALUE');
      if (valueBlock) {
        const valueType = valueBlock.getBlockType();
        if (valueType !== variable.getType()) {
          this.setWarningText('Type incompatible');
        }
      }
    }
  }
};
```

## 4. Implémentation de la vérification de types

### 4.1 Bloc `variables_get_dynamic`

**Fonctionnalités ajoutées :**
1. **`getBlockType()`** : Retourne le type de la variable stockée dans le bloc
2. **`onchange()`** : Met à jour dynamiquement `setCheck()` sur la connexion de sortie selon le type de la variable

**Code implémenté :**
```typescript
getBlockType: function(this: Blockly.Block): string | null {
  const variableId = this.getFieldValue('VAR');
  if (!variableId) return null;
  
  const variable = this.workspace.getVariableMap().getVariableById(variableId);
  if (variable && variable.getType()) {
    return variable.getType();
  }
  return null;
}

onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
  // Met à jour setCheck() sur la connexion de sortie selon le type de la variable
  const variable = this.workspace.getVariableMap().getVariableById(variableId);
  if (variable && variable.getType()) {
    this.outputConnection.setCheck(variable.getType());
  } else {
    this.outputConnection.setCheck(null); // Accepte tous les types
  }
}
```

**Effets :**
- La connexion de sortie du bloc `variables_get_dynamic` est configurée pour accepter uniquement le type de la variable
- Blockly empêche automatiquement les connexions incompatibles

### 4.2 Bloc `variables_set_dynamic`

**Fonctionnalités ajoutées :**
1. **`onchange()`** : Met à jour dynamiquement `setCheck()` sur la connexion d'entrée selon le type de la variable

**Code implémenté :**
```typescript
onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
  const variable = this.workspace.getVariableMap().getVariableById(variableId);
  const varType = variable?.getType();
  
  if (varType) {
    // Configure l'input pour accepter uniquement le type de la variable
    this.getInput('VALUE')?.connection?.setCheck(varType);
  } else {
    // Pas de type défini, accepte tous les types
    this.getInput('VALUE')?.connection?.setCheck(null);
  }
}
```

**Effets :**
- La connexion d'entrée `VALUE` est configurée pour accepter uniquement le type de la variable
- Blockly empêche automatiquement les connexions de blocs incompatibles
- Si une variable n'a pas de type, tous les types sont acceptés

### 4.3 Fonctionnement du système

**Flux de vérification :**
1. **Création de variable typée** : Le type est stocké dans le `VariableModel`
2. **Sélection de variable dans un bloc** : `onchange()` est déclenché
3. **Récupération du type** : Le type est récupéré via `getVariableMap().getVariableById()`
4. **Configuration de `setCheck()`** : La connexion est configurée avec le type
5. **Vérification automatique** : Blockly empêche les connexions incompatibles

**Exemple concret :**
- Variable `myVar` de type `"int"`
- Bloc `variables_get_dynamic` avec `myVar` sélectionné
- `outputConnection.setCheck("int")` est appelé
- Seuls les blocs qui acceptent le type `"int"` peuvent être connectés

### 4.4 Modifications des fichiers

**Fichiers modifiés :**
1. `src/generators/arduino/block_definitions.ts`
   - Ajout de `getBlockType()` et `onchange()` pour `variables_get_dynamic`
   - Ajout de `onchange()` pour `variables_set_dynamic`

2. `src/index.ts`
   - Remplacement de la fonction dupliquée `defineTypedVariableBlocks()` par un appel à `defineAllTypedVariableBlocks()`
   - Import de `defineAllTypedVariableBlocks` depuis `block_definitions.ts`

## 5. Conclusion

Le plugin `typed-variable-modal` gère le typage des variables en :
1. **Stockant le type** dans le `VariableModel` lors de la création
2. **Utilisant** `Blockly.VariablesDynamic` pour générer les blocs
3. **Permettant** à Blockly d'utiliser le système de type checking intégré

**La vérification de types est maintenant implémentée :**
- ✅ `getBlockType()` ajouté aux blocs `variables_get_dynamic`
- ✅ `onchange()` implémenté pour les deux blocs
- ✅ `setCheck()` mis à jour dynamiquement selon le type de la variable
- ✅ Blockly empêche automatiquement les connexions incompatibles

Le système de vérification de types de Blockly fonctionne maintenant correctement avec les variables typées, empêchant les connexions de blocs incompatibles et améliorant la robustesse du code généré.
