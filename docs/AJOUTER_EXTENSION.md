# Ajouter une extension (pack runtime)

Guide pour ajouter des blocs **sans recompiler** le noyau µcBlockly / BlocklyDuino : déposer un dossier sous `extensions/`.

Complète [`extensions/README.md`](../extensions/README.md). Pour une intégration **compilée dans le noyau**, voir plutôt [AJOUTER_CATEGORIE_SERVOMOTEUR.md](./AJOUTER_CATEGORIE_SERVOMOTEUR.md).

## Règle d’or : dossier = `manifest.id`

Dans `extensions/index.json`, on inscrit le **nom du dossier**.

Ce nom **doit être identique** à `manifest.id`. Le loader refuse le pack sinon.

| Correct | Incorrect |
|---------|-----------|
| dossier `servo/` + `"id": "servo"` + `index.json`: `"servo"` | dossier `ServoPack/` + `"id": "servo"` |
| | `"id": "servo"` mais index `"servomotor"` |

```json
// extensions/index.json
{ "extensions": ["servo", "grove"] }
```

```
extensions/
  index.json
  servo/          ← même chaîne que manifest.id
    manifest.json ← "id": "servo"
  grove/
    manifest.json ← "id": "grove"
```

## Checklist contributeur

1. Créer `extensions/<id>/` (minuscules, `[a-z0-9_-]+`)
2. Renseigner `manifest.json` avec **`"id": "<id>"`** (égal au dossier)
3. Ajouter `"<id>"` dans `extensions/index.json`
4. Fournir au minimum :
   - `blocks.js` **ou** `blocks.json`
   - `generator.arduino.js`
   - `toolbox.fragment.json`
   - `i18n/en.json` (+ fr/es/ar recommandés)
5. Optionnel : `theme.json`, `block_types.json`, `generator.micropython.js`
6. Recharger l’app (serveur web / Electron / `npm run dev`) — **pas** de rebuild du noyau

## Structure du pack

```
extensions/<id>/
  manifest.json
  blocks.js                 # export function defineBlocks(ctx)
  generator.arduino.js      # export function registerArduinoGenerators(ctx)
  generator.micropython.js  # optionnel
  toolbox.fragment.json
  theme.json                # optionnel
  block_types.json          # optionnel
  i18n/{en,fr,es,ar}.json
  *.ts                      # source d’édition (non chargé au runtime)
```

Les `.ts` sont pour Factory / revue de code. Au runtime, seuls **JSON + ESM `.js`** sont lus.

## Toolbox : `toolboxParent`, `toolboxMode`, et racine

Trois façons de brancher le pack dans la toolbox. Les champs existent en **double** :

| Rôle | Dans `manifest.json` | Dans `toolbox.fragment.json` |
|------|----------------------|------------------------------|
| Catégorie parente | `toolboxParent` | `parent` |
| Mode d’insertion | `toolboxMode` | `mode` |

**Priorité :** si le fragment définit `parent` / `mode`, ils **écrasent** le manifest.  
Sinon, le loader utilise `toolboxParent` / `toolboxMode` du manifest.

Valeurs de mode :

| Valeur | Effet |
|--------|--------|
| *(absent)* + **pas** de parent | Catégorie **à la racine** de la toolbox |
| `"subcategory"` (défaut **dès qu’un parent est défini**) | Nouvelle sous-catégorie sous le parent |
| `"append"` | Les `contents` (blocs) sont ajoutés **dans** la catégorie parente, sans créer de sous-catégorie |

---

### 1. Se mettre à la racine de la toolbox

**Ne pas** déclarer `toolboxParent` / `toolboxMode` dans le manifest, **ni** `parent` / `mode` dans le fragment.

**Manifest (extrait) :**

```json
{
  "id": "servo",
  "categoryKey": "CAT_SERVO"
}
```

*(Pas de `toolboxParent`, pas de `toolboxMode`.)*

**`toolbox.fragment.json` :**

```json
{
  "kind": "category",
  "name": "CAT_SERVO",
  "categorystyle": "servo_category",
  "contents": [
    { "kind": "block", "type": "servo_move" }
  ]
}
```

*(Pas de `"parent"`, pas de `"mode"`.)*

Résultat : une nouvelle entrée au **premier niveau** de la toolbox, au même titre que Libre, Arduino, Logique, etc.

Pour repasser un pack (ex. `servo`) de sous-catégorie à la racine : supprimer `toolboxParent` / `toolboxMode` du manifest **et** `parent` / `mode` du fragment.

---

### 2. Sous-catégorie d’une catégorie existante

Exemple : sous **Arduino** (`CAT_BOARD`) — pour un autre pack matériel.

**Manifest :**

```json
{
  "id": "grove",
  "toolboxParent": "CAT_BOARD",
  "toolboxMode": "subcategory"
}
```

`toolboxMode: "subcategory"` est le **défaut** dès qu’un parent est défini : tu peux l’omettre.

**Équivalent (ou complément) dans `toolbox.fragment.json` :**

```json
{
  "kind": "category",
  "name": "CAT_GROVE",
  "parent": "CAT_BOARD",
  "mode": "subcategory",
  "categorystyle": "grove_category",
  "contents": [ … ]
}
```

Résultat : `CAT_BOARD` → `CAT_GROVE` → blocs.

Si le parent est introuvable, le loader journalise un **warning** et ajoute la catégorie **à la racine**.

---

### 3. Ajouter des blocs dans une catégorie existante (`append`)

Sans créer de sous-catégorie : injecter directement les blocs dans le parent.

**Manifest :**

```json
{
  "toolboxParent": "CAT_BOARD_BASE",
  "toolboxMode": "append"
}
```

**Fragment :**

```json
{
  "kind": "category",
  "name": "CAT_BOARD_BASE",
  "parent": "CAT_BOARD_BASE",
  "mode": "append",
  "contents": [
    { "kind": "block", "type": "mon_bloc" }
  ]
}
```

En mode `append`, seuls les `contents` sont poussés dans le parent (`name` reste un libellé logique).

---

### Récap rapide

| Objectif | Manifest | Fragment |
|----------|----------|----------|
| **Racine** | *rien* | *pas* de `parent` / `mode` |
| **Sous-catégorie** | `toolboxParent` + (optionnel) `toolboxMode: "subcategory"` | ou `parent` + `mode: "subcategory"` |
| **Append** | `toolboxParent` + `toolboxMode: "append"` | ou `parent` + `mode: "append"` |

### Clés de catégories existantes (rappel)

Exemples dans `src/toolbox.ts` : `CAT_LIBRE`, `CAT_BOARD`, `CAT_BOARD_BASE`, `CAT_BOARD_IN`, `CAT_LOGIC`, `CAT_LOOPS`, `CAT_MATH`, `CAT_TEXT`, `CAT_ARRAY`, `CAT_COLOR`, `CAT_VARIABLES`, `CAT_PROCEDURES`, …

## Contrats ESM

Pour le modèle **instance** (FieldInstance, collisions avec les variables, génération) : **[INSTANCES.md](./INSTANCES.md)**.

```js
// blocks.js
export function defineBlocks({
  Blockly,
  getBlocklyMsgOr,
  getPwmPinOptions,
  FieldInstance,
  Instances,
  updateInstancePresenceWarning,
  style,
}) {
  Blockly.Blocks["servo_attach"] = {
    init() {
      this.appendDummyInput()
        .appendField(
          new FieldInstance("Servo", "SERVO", false, false, false),
          "SERVO_NAME",
        );
    },
  };
  Blockly.Blocks["servo_move"] = {
    init() { /* FieldInstance('Servo', …) */ },
    onchange() {
      updateInstancePresenceWarning(this, "SERVO_NAME", "Servo");
    },
  };
}

// generator.arduino.js
export function registerArduinoGenerators({ arduinoGenerator, Order }) {
  arduinoGenerator.forBlock["servo_move"] = function (block) { /* … */ };
}
```

Le pack **ne doit pas** faire `import` de `µcBlockly` : le loader injecte le contexte (`FieldInstance`, `Instances`, …).

## i18n

Fichiers `i18n/<lang>.json` fusionnés dans `Blockly.Msg` au démarrage (et au changement de langue). Inclure au minimum la clé de catégorie (`CAT_SERVO`) et les libellés de blocs.

## Thème

`theme.json` ajoute `categoryStyles` / `blockStyles` aux thèmes µcBlockly (avant inject workspace). Utiliser les mêmes noms que `style.category` / `style.blocks` du manifest.

## Pins carte

Dans le manifest :

```json
"pinDropdowns": {
  "servo_move": "pwm",
  "servo_read_degrees": "pwm"
}
```

Les menus se mettent à jour avec `refreshBoardPinDropdowns` au changement de carte.

## Vérification

1. Console navigateur : pas d’erreur `id mismatch` / `Failed to load extension`
2. Toolbox : catégorie ou sous-catégorie visible
3. Un bloc produit le C++ / MicroPython attendu

## Exemple de référence

[`extensions/servo/`](../extensions/servo/) — servomoteurs style Blockly@rduino (instances), catégorie **racine** `CAT_SERVO`.
