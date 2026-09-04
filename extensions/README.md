# Extensions µcBlockly / BlocklyDuino

**Priorité : chargement runtime sans rebuild** — dépôt d’un dossier dans `extensions/`, découverte au démarrage (serveur web ou Electron). Webpack ne sert qu’au prototypage.

Guide détaillé : **[docs/AJOUTER_EXTENSION.md](../docs/AJOUTER_EXTENSION.md)**.

## UX cible

1. Créer `extensions/<id>/` avec `manifest.json` où **`"id"` = nom du dossier**
2. Ajouter `"<id>"` dans `extensions/index.json` (même chaîne)
3. Recharger l’app — pas de recompilation du noyau

## `index.json` : nom de dossier (= id)

```json
{ "extensions": ["servo"] }
```

On inscrit le **nom du dossier**, qui **doit** égaler `manifest.id`.  
Le loader lève une erreur si les deux diffèrent (harmonisation forcée).

Le loader injecte dans `defineBlocks(ctx)` : `Blockly`, `getBlocklyMsgOr`, options de pins, **`FieldInstance`**, **`Instances`**, **`updateInstancePresenceWarning`**, et `style`.

Modèle conceptuel et API : **[docs/INSTANCES.md](../docs/INSTANCES.md)**.

## Structure d’un pack (runtime)

```
extensions/
  index.json
  servo/                       # id === "servo"
    manifest.json
    blocks.js
    generator.arduino.js
    toolbox.fragment.json      # parent / mode pour sous-catégorie
    theme.json
    block_types.json
    i18n/{en,fr,es,ar}.json
    *.ts                       # édition seule
```

## Toolbox : `toolboxParent` / `toolboxMode`

Champs du **manifest** (ou `parent` / `mode` dans `toolbox.fragment.json` — le fragment **prime**).

| Objectif | Config |
|----------|--------|
| **Racine** de la toolbox | Ne pas mettre `toolboxParent` / `toolboxMode`, ni `parent` / `mode` dans le fragment |
| **Sous-catégorie** | `"toolboxParent": "CAT_BOARD"` (+ optionnel `"toolboxMode": "subcategory"`, défaut si parent présent) |
| **Append** (blocs dans une catégorie existante) | `"toolboxParent": "CAT_BOARD_BASE"` + `"toolboxMode": "append"` |

Exemple sous-catégorie :

```json
"toolboxParent": "CAT_BOARD",
"toolboxMode": "subcategory"
```

Exemple racine (pack `servo` actuel) : omettre ces deux clés (et retirer `parent` / `mode` du fragment).

Détails et JSON complets : [docs/AJOUTER_EXTENSION.md](../docs/AJOUTER_EXTENSION.md#toolbox--toolboxparent-toolboxmode-et-racine).

## Contrats ESM

```js
export function defineBlocks({ Blockly, getBlocklyMsgOr, FieldInstance, updateInstancePresenceWarning, style }) { … }
export function registerArduinoGenerators({ arduinoGenerator, Order }) { … }
```

Pas d’`import` direct de µcBlockly dans le pack.

## Déploiements

| Environnement | Servir `extensions/` |
|---------------|----------------------|
| Serveur web | Statique `/extensions/` |
| Electron | Même URL, ou `ExtensionIo` fs |
| Webpack (proto) | `CopyWebpackPlugin` + `devServer.static` |

## API noyau

```ts
import {
  loadExtensions,
  mergeExtensionsIntoToolbox,
  applyExtensionMessages,
} from "µcBlockly/core";
```

## Exemple

[`servo/`](./servo/) — catégorie **racine** `CAT_SERVO`, blocs à **instances** (FieldInstance) comme Blockly@rduino.
