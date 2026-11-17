# EMA

Coquille autour de [µcBlockly](https://github.com/A-S-T-U-C-E/ucBlockly) — environnement pour robot MAE et accessoires.

## Choix UI (fixés)

- Thème **Zelos** + renderer **Zelos** (pas de liste déroulante)
- Toolbox **continue** permanente (pas de case à cocher)
- Mode **flyout ouvert** contrôlable (interrupteur dans l’en-tête, mémorisé)
- Cible code **C Arduino** / **MicroPython** (radio en en-tête)
- Pas de surbrillance, pas d’éditeur Monaco, pas de mode debug

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
| `npm run typecheck` | Vérification des types TypeScript           |
| `npm test`          | Tests du générateur MicroPython (Vitest)    |
| `npm run preview`   | Sert le build de production en local        |
| `npm run media`     | Recopie les médias Blockly dans `public/`   |
