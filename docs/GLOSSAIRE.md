# Glossaire µcBlockly (débutant)

Termes utiles pour lire le code et les guides.

| Terme | Sens |
|-------|------|
| **Bloc** | Pièce visuelle Blockly (définition dans `categories/blockly/`). |
| **Générateur** | Fonction qui transforme un bloc en code C++ Arduino (`generators/arduino/blocks/`). |
| **Check / type** | Contrainte de connexion entre blocs (`Number`, `String`, types Arduino internes). |
| **Toolbox** | Menu latéral des catégories / blocs (`toolbox/categories/`). |
| **Flyout** | Panneau qui s’ouvre depuis une catégorie pour glisser des blocs. |
| **Workspace** | Zone où l’on assemble le programme. |
| **Carte / board** | Microcontrôleur cible ; pins dans `board_profiles/` ; logique UI dans `boards.ts`. |
| **Profil** | Données pins/CPU d’une carte (`BoardProfile`). |
| **Pack / extension** | Catégorie matérielle chargée à l’exécution (`extensions/`), sans rebuild du noyau. |
| **Instance** | Nom partagé entre blocs d’un même périphérique (`FieldInstance`, [INSTANCES.md](./INSTANCES.md)). |
| **Noyau (core)** | API embeddable (`src/core/`) — pas la démo HTML. |
| **Host** | Shell produit (toolbar, fichiers…) réutilisable hors démo (`src/host/`). |
| **Démo** | Application standalone (`src/index.ts` + `src/demo/`) — boot UI, pas le métier blocs. |
| **Kernel register** | Enregistrement unique des blocs / générateurs avant inject (`registerUcBlocklyKernel`). |
| **Mutator** | UI pour ajouter/retirer des branches (if, switch, listes…). |
| **Scrub** | Nettoyage / formatage du code généré dans le moteur Arduino. |

Voir aussi [DEBUTER_CODE.md](./DEBUTER_CODE.md).
