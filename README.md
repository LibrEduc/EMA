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

```bash
git submodule update --init --recursive
npm install
npm run media
npm run dev
```

## Scripts

| Commande        | Rôle                          |
| --------------- | ----------------------------- |
| `npm run media` | Copie les médias Blockly      |
| `npm run dev`   | Serveur de développement Vite |
| `npm run build` | Build production              |

## GitHub Pages

Workflow : `.github/workflows/pages.yml` (push `main` + lancement manuel).

URL prévue : https://libreduc.github.io/EMA/

Prérequis :
1. Dépôt **public** (Pages gratuit) *ou* plan qui autorise Pages sur dépôt privé
2. **Settings → Pages → Source = GitHub Actions**
