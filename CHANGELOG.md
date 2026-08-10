# Journal des modifications

## 3.0.0 — 29 juillet 2026

Version majeure basée sur **Blockly 13**. À lire avant de mettre à jour un projet existant.

### Attention — rupture de compatibilité
- µcBlockly 3 ne fonctionne **pas** avec Blockly 12. Il faut Blockly 13 et les extensions `@blockly/*` en version 13.
- Si votre application utilise encore Blockly 12, restez sur µcBlockly **2.x**.

### Intégration dans une autre application
- **Noyau** (`µcBlockly/core`) : API pour intégrer l’éditeur dans une page (`createUcBlockly`, gestionnaire d’espace de travail).
- **Aides produit** (`µcBlockly/host`) : thèmes d’interface, accessibilité, éditeur de code, etc.
- **Démo** : l’interface complète de démonstration est séparée du noyau (menus, panneaux, stockage de session).

### Accessibilité et clavier
- Navigation au clavier alignée sur Blockly 13.
- Interface de la démo adaptée (repères, tutoriel, libellés pour lecteurs d’écran).
- Traductions : français, anglais, espagnol, arabe.
- Raccourcis clavier personnalisables (mémorisés dans le navigateur) et panneau d’aide modifiable.

### Fonctions de l’éditeur
- Copier-coller de blocs **entre onglets** du navigateur.
- Bouton pour activer ou couper le son.
- Nouveau thème « hacker ».
- Nouveaux types de champs : image matricielle (bitmap), listes déroulantes en grille, listes dépendantes.
- Mise en évidence de la zone des blocs (plugin highlight) : la zone se recalcule correctement après une suppression à la corbeille.

### Programme Arduino
- Blocs **setup** et **loop** pour structurer le programme ; contrôle qui empêche de mal les placer.
- Espace de travail **vide** : plus de `setup` / `loop` générés automatiquement s’il n’y a aucun bloc.
- Catégorie « libre », choix de la carte Arduino, variables typées, listes et `switch` améliorés.

## 2.1.5, 2026-06-13
- update with Blockly v12.5
- meilleure prise en charge LTR / RTL pour les libellés des options
- favicon et icônes dérivées du logo (`npm run generate-favicon`)
- script de conversion Blockly@rduino (`npm run convert-rduino`) — voir `docs/CONVERT_RDUINO.md`
- tests de génération (`npm test`) et vérification des traductions (`npm run check-translations`)
- `controls_switch` : mutateur block-plus-minus ; `default:` émis seulement si le cas a du contenu
- listes vides : plus de `{0,0}` ; type `__NO_TYPE__` et avertissement `ARRAY_LIST_UNTYPED_WARNING`
- déduplication i18n / types variables (`shared`, `variables` → `configure_standard_blocks`)
- documentation mise à jour (README et tous les fichiers `docs/`)

## 2.1.1, 2026-03-13
- amélioration de la barre d’options (groupement des plugins, spans/checkbox alignés)
- meilleure prise en charge LTR / RTL pour les libellés des options

## 2.1.0, 2026-02-17
- variable typing
- array category
- color category
- math category
- text category
- board selection

## 2.0.2, 2025-08-13
- update with Blockly v12.2
- fix switch toolboxes, categories and continuous 'Scratch like'

## 2.0.1, 2023-06-25
- updated with Blockly v11.1.1
- change toolbox between categories and continuous 'Scratch like'
- fix bugs
- add comments on workspace

## 2.0.0, 2023-09-09
- up to date with Blockly v10
- use Blockly sample app in Typescript
- add translation in arabic, english, spanish, french
- add Monaco editor for code

## 1.0.0 (Apr 16, 2019)
First release