# Extension — Servomoteurs (runtime)

Pack déposable : dossier **`servo/`** + `manifest.id`: **`"servo"`** + entrée **`"servo"`** dans `index.json` (les trois doivent correspondre).

Chargé au démarrage **sans rebuild**.

### Placement toolbox (config actuelle)

Sous-catégorie de `CAT_BOARD` :

```json
"toolboxParent": "CAT_BOARD",
"toolboxMode": "subcategory"
```

(équivalent dans `toolbox.fragment.json` : `"parent": "CAT_BOARD"`, `"mode": "subcategory"`)

Pour une catégorie **à la racine** : supprimer `toolboxParent` / `toolboxMode` du manifest **et** `parent` / `mode` du fragment.

Voir [AJOUTER_EXTENSION.md](../../docs/AJOUTER_EXTENSION.md#toolbox--toolboxparent-toolboxmode-et-racine).

| Type | Arduino |
|------|---------|
| `servo_move` | `#include <Servo.h>` + `attach` + `write` |
| `servo_read_degrees` | `servo_N.read()` |
