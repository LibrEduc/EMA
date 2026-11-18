# EMA

Coquille autour de [µcBlockly](https://github.com/A-S-T-U-C-E/ucBlockly) — environnement pour robot MAE et accessoires.

## Mode élève (défaut)

- Thème **Zelos** + toolbox **continue**
- Libellés simples (« Programme ton robot », « Garder les blocs ouverts »)
- Gros boutons **Annuler** / **Recommencer**
- Code en tiroir (« Voir le code ») — les blocs restent prioritaires
- Langue + Robot (C) / Robot (Python) dans **Réglages** (enseignant)
- Pas de minimap / sac à dos / Monaco / debug / surbrillance
- Cibles tactiles ≥ 44 px (`pointer: coarse`)

## Démarrage

Il faut Node 20.19, ou 22.12 et plus. Le fichier `.nvmrc` donne la version utilisée par la CI.

```bash
git submodule update --init --recursive
npm install
npm run dev
```

`npm install` installe aussi les dépendances de µcBlockly et copie les médias Blockly.

## Scripts

| Commande            | Rôle                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Serveur de développement Vite               |
| `npm run build`     | Build production                            |
| `npm run electron:build` | Build du renderer pour chargement `file://` |
| `npm run electron:start` | Lance l'app Electron après le build         |
| `npm run electron:run` | Build et lance l'application Electron      |
| `npm run test:electron` | Build et smoke test des menus Electron     |
| `npm run typecheck` | Vérification des types TypeScript           |
| `npm test`          | Tests MicroPython (Vitest) et menus Electron |
| `npm run media`     | Recopie les médias Blockly dans `public/`   |

L’application Electron reprend les actions disponibles dans la coquille EMA : annulation/rétablissement, redémarrage, ouverture/enregistrement des espaces Blockly `.µcb`/JSON (`Ctrl/Cmd+O`, `Ctrl/Cmd+S`), cible de code, langue, affichage et accessibilité. Le bandeau web est masqué dans la fenêtre Electron ; les mêmes réglages restent dans le menu natif.

## GitHub Pages

Workflow : `.github/workflows/pages.yml` (push `main` + lancement manuel).

URL prévue : https://libreduc.github.io/EMA/

Prérequis :
1. Dépôt **public** (Pages gratuit) *ou* plan qui autorise Pages sur dépôt privé
2. **Settings → Pages → Source = GitHub Actions**
3. Secret `UCBLOCKLY_READ_TOKEN` (voir ci-dessous)

## Accès au sous-module depuis GitHub Actions

`A-S-T-U-C-E/ucBlockly` est privé : le jeton par défaut d'Actions ne peut pas le cloner. Les workflows `ci.yml` et `pages.yml` lisent un secret `UCBLOCKLY_READ_TOKEN`.

1. Créer un jeton *fine-grained* limité au dépôt `A-S-T-U-C-E/ucBlockly`, permission **Contents : Read-only**
2. L'enregistrer dans **Settings → Secrets and variables → Actions** sous le nom `UCBLOCKLY_READ_TOKEN`

Si ucBlockly devient public, le secret et l'étape « Fetch ucBlockly » ne servent plus.
