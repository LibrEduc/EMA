<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Conversion Blockly@rduino → µcBlockly

</div>

Ce document décrit le script **`npm run convert-rduino`**, qui transforme une sauvegarde Blockly@rduino (XML / `.B@`) en workspace JSON chargeable dans µcBlockly.

## Usage

```bash
npm run convert-rduino -- <fichier-entree> [fichier-sortie.json]
```

Exemple :

```bash
npm run convert-rduino -- examples/blink.xml out/workspace.json
```

- **Entrée** : `.xml`, `.B@` ou tout export XML Blockly@rduino (« enregistrer projet »).
- **Sortie** : JSON compatible avec **Ouvrir** dans µcBlockly (`workspace.json` par défaut si le second argument est omis).

## Comportement

| Cas | Traitement |
|-----|------------|
| Blocs Arduino de base | Mappés vers les types µcBlockly via `scripts/lib/rduino-block-map.mjs` |
| Blocs « définitions » orange (`base_define_bloc`) | Dépliés en blocs racine |
| Piles sans `setup` / `loop` | Enveloppées dans `board_base_setup_loop` (corps `loop`) sauf si `UCB_NO_WRAP=1` |
| Extensions (Grove, mBot, TechnoZone, …) | Conservées sous leur nom d’origine si non mappées — peuvent ne pas charger ; voir `unmappedBlockTypes` dans la sortie |

## Variable d'environnement

```bash
UCB_NO_WRAP=1 npm run convert-rduino -- projet.xml out.json
```

Ne pas envelopper les blocs orphelins dans `setup`/`loop`.

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `scripts/convert-rduino-workspace.mjs` | Point d’entrée CLI |
| `scripts/lib/rduino-block-map.mjs` | Table de correspondance des types de blocs |
| `scripts/lib/rduino-xml-to-ucb-json.mjs` | Parsing XML → JSON workspace |
| `tests/rduino-convert.test.ts` | Tests (blink, analogique, Starter_Kit_prj7) |

## Limites connues

- Couverture limitée au **cœur Arduino** ; les extensions matérielles nécessitent d’étendre la table de mapping.
- Les projets très anciens ou fortement personnalisés peuvent exiger une reprise manuelle de certains blocs.

## Voir aussi

- [ARCHITECTURE.md](./ARCHITECTURE.md) — scripts npm ;
- [INTEGRATION_DEPOT.md](./INTEGRATION_DEPOT.md) — intégration du dépôt.
