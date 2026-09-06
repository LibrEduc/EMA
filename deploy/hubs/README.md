# Hubs statiques LibrEduc / Blockly / ASTUCE

Trois `index.html` autonomes — **ne pas** croiser les liens ASTUCE depuis LibrEduc ou Blockly.

| Déployer sur | Fichier | Couleur | Iframe blog | Pointe vers ASTUCE ? |
|--------------|---------|---------|-------------|----------------------|
| **www.libreduc.cc** | `libreduc/index.html` | bleu | `libreduc.cc/blog/news/` | **Non** |
| **blockly.libreduc.cc** | `blockly/index.html` | vert | `libreduc.cc/blog/blockly/` | **Non** |
| **www.astuce.technology** | `astuce/index.html` | bordeaux | `libreduc.cc/blog/astuce/` | N/A (peut pointer vers LibrEduc + Blockly) |

## Déploiement

```text
www.libreduc.cc/          ←  hubs/libreduc/index.html  (+ favicon)
blockly.libreduc.cc/      ←  hubs/blockly/index.html   (+ favicon)
www.astuce.technology/    ←  hubs/astuce/index.html    (+ favicon)
```

Sauvegarder chaque `index.html` existant avant remplacement.

## Charte URL

```
www.libreduc.cc          portail réseau
blockly.libreduc.cc      pédagogie Blockly
www.astuce.technology    site professionnel (unidirectionnel → LibrEduc/Blockly)
wiki.libreduc.cc         documentation
forum.libreduc.cc        entraide
```

Les blogs WordPress restent pour l’instant sous `libreduc.cc/blog/…` (contenu) ; les hubs sont les façades par domaine.

## Ancien dossier

`deploy/libreduc-hub/` est obsolète — utiliser `deploy/hubs/libreduc/`.
