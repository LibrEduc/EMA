# EMA

Coquille autour de [µcBlockly](https://github.com/A-S-T-U-C-E/ucBlockly) — environnement pour robot MAE et accessoires.

## Choix UI (fixés)

- Thème **Zelos** + renderer **Zelos** (pas de liste déroulante)
- Toolbox **continue** permanente (pas de case à cocher)
- Mode **flyout ouvert** contrôlable (interrupteur dans l’en-tête, mémorisé)
- Cible code **C Arduino** / **MicroPython** (radio en en-tête)
- Pas de surbrillance, pas d’éditeur Monaco, pas de mode debug

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
