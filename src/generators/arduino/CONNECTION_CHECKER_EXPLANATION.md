# Comment fonctionne le ConnectionChecker de Blockly

## Problème actuel

Malgré l'implémentation de `getBlockType()` dans nos blocs `variables_get_dynamic`, les connexions incompatibles sont toujours possibles. Cela suggère que Blockly n'utilise pas automatiquement `getBlockType()` pour vérifier les connexions.

## Comment Blockly vérifie les connexions

Blockly utilise un système de vérification de connexions basé sur :

1. **`setCheck()` sur les connexions d'entrée** : Définit quels types sont acceptés
2. **`getBlockType()` sur les blocs sources** : Définit le type de sortie d'un bloc
3. **`ConnectionChecker`** : Compare les deux pour autoriser ou refuser la connexion

### Le ConnectionChecker standard

Le `ConnectionChecker` par défaut de Blockly fonctionne ainsi :

```javascript
// Pseudo-code du ConnectionChecker standard
canConnect(sourceConnection, targetConnection) {
  // 1. Vérifie que les types de connexion sont compatibles (OUTPUT -> INPUT)
  if (sourceConnection.type !== OPPOSITE_TYPE[targetConnection.type]) {
    return false;
  }
  
  // 2. Vérifie les checks de type
  const sourceType = sourceConnection.getCheck();
  const targetType = targetConnection.getCheck();
  
  // Si les deux sont null, connexion autorisée
  if (!sourceType && !targetType) {
    return true;
  }
  
  // Si l'un est null, connexion autorisée (pas de restriction)
  if (!sourceType || !targetType) {
    return true;
  }
  
  // Compare les types
  return this.doTypeChecks_(sourceType, targetType);
}
```

**Problème** : Le `ConnectionChecker` standard utilise `connection.getCheck()`, pas `block.getBlockType()` !

### Pourquoi `getBlockType()` ne fonctionne pas automatiquement

Le `ConnectionChecker` standard ne vérifie que :
- `sourceConnection.getCheck()` : Le type défini sur la connexion de sortie
- `targetConnection.getCheck()` : Le type défini sur la connexion d'entrée

Il **ne vérifie pas** `sourceBlock.getBlockType()` automatiquement.

## Solution : Plugin Strict Connection Checker

Un plugin `strict-connection-checker` pourrait :

1. **Étendre le `ConnectionChecker`** pour utiliser `getBlockType()` :
   ```javascript
   class StrictConnectionChecker extends Blockly.ConnectionChecker {
     canConnect(sourceConnection, targetConnection) {
       // Appelle la méthode parente
       const canConnect = super.canConnect(sourceConnection, targetConnection);
       if (!canConnect) {
         return false;
       }
       
       // Vérification supplémentaire avec getBlockType()
       const sourceBlock = sourceConnection.getSourceBlock();
       const targetBlock = targetConnection.getSourceBlock();
       
       if (sourceBlock && typeof sourceBlock.getBlockType === 'function') {
         const sourceType = sourceBlock.getBlockType();
         const targetCheck = targetConnection.getCheck();
         
         // Si getBlockType() retourne un type, vérifier la compatibilité
         if (sourceType && targetCheck) {
           return this.doTypeChecks_(sourceType, targetCheck);
         }
       }
       
       return canConnect;
     }
   }
   ```

2. **Avantages** :
   - Utilise `getBlockType()` pour déterminer le type dynamique
   - Empêche les connexions incompatibles même si `setCheck()` n'est pas défini
   - Compatible avec les blocs qui ont des types dynamiques (comme nos variables)

3. **Ce qu'il apporterait** :
   - ✅ Empêche les connexions incompatibles basées sur `getBlockType()`
   - ✅ Fonctionne avec des types dynamiques (variables typées)
   - ✅ Plus strict que le ConnectionChecker standard
   - ✅ Compatible avec l'écosystème Blockly existant

## Solution alternative : Utiliser `setOutput()` avec le type

Au lieu de compter uniquement sur `getBlockType()`, on pourrait aussi utiliser `setOutput(true, type)` dans `init()` et le mettre à jour dans `onchange()` :

```typescript
init: function(this: Blockly.Block) {
  this.appendDummyInput()
      .appendField(new Blockly.FieldVariable(null), 'VAR');
  this.setOutput(true, null); // Sera mis à jour dans onchange()
  // ...
},
onchange: function(this: Blockly.Block, event: Blockly.Events.Abstract) {
  const variableId = this.getFieldValue('VAR');
  const variable = this.workspace.getVariableMap().getVariableById(variableId);
  if (variable && variable.getType()) {
    const blocklyType = variable.getType() === 'bool' ? 'Boolean' : variable.getType();
    // Mettre à jour le type de sortie
    this.setOutput(true, blocklyType);
  } else {
    this.setOutput(true, null);
  }
}
```

**Note** : `setOutput(true, type)` définit le `check` sur la connexion de sortie, ce que le `ConnectionChecker` standard vérifie.

## Recommandation

1. **Court terme** : Utiliser `setOutput(true, type)` dans `onchange()` pour mettre à jour le type de sortie
2. **Long terme** : Implémenter un `ConnectionChecker` personnalisé qui utilise `getBlockType()` pour une vérification plus robuste
