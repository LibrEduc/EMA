<div align="center">

<img src="../public/assets/logo_µcBlockly.png" alt="µcBlockly" width="64" height="64">

# Accessibilité — µcBlockly

</div>

µcBlockly est un **outil auteur** Blockly pour Arduino. L’accessibilité repose sur trois couches : la **coque HTML** (barre d’outils, panneaux), les **champs personnalisés** (couleur, variables typées), et le **moteur Blockly** (navigation clavier native prévue en v13).

**Niveau visé :** alignement progressif sur [WCAG 2.2 niveau AA](https://www.w3.org/TR/WCAG22/) et les [bonnes pratiques Blockly](https://docs.blockly.com/guides/app-integration/accessibility/best-practices/), en complément des [Accessibility Conformance Reports (ACR)](https://docs.blockly.com/guides/app-integration/accessibility/compliance/) de Google Blockly.

**Contact :** [Sébastien Canet (LinkedIn)](https://www.linkedin.com/in/sebcanet/) — dépôt [A-S-T-U-C-E/ucBlockly](https://github.com/A-S-T-U-C-E/ucBlockly).

---

## État des priorités

| Lot | Contenu | État |
|-----|---------|------|
| P0 — Champs custom | `getAriaValue()` sur sélecteurs couleur, éditeurs iro accessibles | Fait |
| P1 — Coque UI | Skip link, landmarks, boutons sémantiques, menu zones Ctrl+B, raccourcis fichier | Fait |
| P1 — Doc | Cette page, raccourcis, conformité | Fait |
| P2 — Thèmes | Sync coque + Monaco, contraste, persistance thème | Fait |
| P0 — Blockly v13 | Navigation clavier cœur, migration paquets | À venir |

---

## Coque HTML

### Lien d’évitement

Au premier **Tab** après chargement, le lien **« Aller au workspace Blockly »** (`A11Y_SKIP_TO_WORKSPACE`) place le focus sur `<main id="blockly-workspace-main">`.

### Repères (landmarks)

| Zone | Repère |
|------|--------|
| Barre supérieure | `role="banner"` (`#app_topbar`) |
| Workspace | `<main id="blockly-workspace-main">` |
| Code généré | `role="region"` sur `#div_content_code` |
| Console | `role="log"` + `aria-live="polite"` sur `#content_console` |
| Séparateurs flex | `role="separator"` avec `aria-orientation` |

Implémentation : `src/shell_a11y.ts`, `src/a11y_labels.ts`, `src/index.ts` (`applyA11yAttributes`).

### Menu de zones (Ctrl+B / Cmd+B)

1. **Ctrl+B** (Windows/Linux) ou **Cmd+B** (macOS) — ouvre le menu.
2. Message annoncé via `#shortcuts` (`aria-live="polite"`).
3. Touches **1** à **5** :
   - **1** — barre d’outils
   - **2** — boîte à outils Blockly
   - **3** — workspace
   - **4** — panneau code
   - **5** — console
4. **Échap** — annule.

### Barre d’outils

Enregistrer, Charger, Annuler et Rétablir sont des `<button type="button">` focusables, avec `aria-label` et infobulles i18n incluant les raccourcis fichier le cas échéant.

Les listes déroulantes (langue, thème, rendu, carte) portent un `aria-label` localisé. Le groupe d’options plugins est un `role="group"`. Les liens externes annoncent l’ouverture dans un nouvel onglet.

`lang`, `xml:lang` et `dir` sur `<html>` sont synchronisés à chaque changement de langue (RTL pour l’arabe).

---

## Raccourcis clavier

### Coque µcBlockly

| Raccourci | Action |
|-----------|--------|
| **Tab** (premier focus) | Lien d’évitement vers le workspace |
| **Ctrl+B** / **Cmd+B** | Menu de navigation par zones |
| **Ctrl+S** / **Cmd+S** | Enregistrer le workspace (hors champs de saisie texte) |
| **Ctrl+O** / **Cmd+O** | Ouvrir un fichier (hors champs de saisie texte) |
| **1** – **5** (après Ctrl+B) | Focus zone 1 à 5 |
| **Échap** (menu zones ouvert) | Fermer le menu zones |

### Blockly (workspace)

Les raccourcis par défaut de Blockly s’appliquent dans le workspace (copier/coller, suppression, etc.). Référence officielle : [Blockly keyboard shortcuts](https://docs.blockly.com/guides/configure/web/keyboard_shortcuts).

Plugins actifs :

- **Recherche workspace** — `@blockly/plugin-workspace-search`
- **Recherche toolbox** — `@blockly/toolbox-search`

> La navigation clavier Blockly v13 intégrée n’est pas encore activée (migration 12 → 13 en cours). L’ancien plugin `@blockly/keyboard-navigation` reste désactivé (conflit copier/coller documenté dans le code).

### Zoom

Le zoom Blockly est activé jusqu’à **600 %** (`maxScale: 6`), au-delà du seuil 200 % recommandé pour l’accessibilité.

---

## Thèmes et contraste (P2)

### Thèmes recommandés pour l’accessibilité visuelle

| Thème (menu) | Usage |
|--------------|--------|
| **deuteranopia** | Daltonisme rouge–vert (deutéranopie) |
| **tritanopia** | Daltonisme bleu–jaune (tritanopie) |
| **high_contrast** | Contraste élevé Blockly + coque |
| **dark** | Mode sombre |
| **blackWhite** | Monochrome (contraste maximal des blocs) |

Les thèmes **seshat**, **classic**, **modern**, **zelos** suivent aussi la synchronisation coque.

### Synchronisation coque ↔ Blockly ↔ Monaco

`syncUiPaletteTheme()` (`src/ui_palette_theme.ts`) :

- dérive les couleurs des panneaux, barre d’outils et séparateurs depuis `componentStyles` du thème Blockly actif ;
- impose un **contraste minimal** (texte barre d’outils ≥ 4,5:1) ;
- pose `data-ui-theme` sur `<html>` (`light` | `dark` | `high-contrast`) ;
- aligne l’éditeur Monaco (`vs`, `vs-dark`, `hc-black`) via `µcB_codeEditor.applyTheme()`.

Le thème **noir et blanc** définit des `componentStyles` explicites pour une coque lisible.

### Persistance

Le thème choisi est mémorisé dans :

- l’URL (`?theme=…`) ;
- `sessionStorage` (`paramTheme`).

Le changement de langue ou de carte ne réinitialise pas le thème.

---

## Champs personnalisés (P0)

| Champ | Fichier | ARIA |
|-------|---------|------|
| Sélecteur couleur (picker) | `field_colour_picker.ts` | `getAriaTypeName`, `getAriaValue`, éditeur iro |
| Sélecteur couleur HSV | `field_colour_hsv_sliders.ts` | idem + curseurs étiquetés |
| Helpers | `field_colour_a11y.ts` | format hex + RGB pour lecteurs d’écran |

Tests : `tests/field-colour-a11y.test.ts`.

Les **blocs Arduino custom** ajoutés par des tiers doivent implémenter les mêmes API pour les champs qu’ils créent ([doc Blockly — ARIA value](https://docs.blockly.com/guides/create-custom-blocks/fields/customizing-fields/creating/#aria-value)).

---

## Conformité Blockly (ACR)

µcBlockly s’appuie sur Blockly **12.5.1**. Les rapports de conformité Google couvrent le **cœur Blockly** ; les extensions µcBlockly (coque, blocs Arduino, champs couleur) relèvent de la responsabilité de ce projet.

| Ressource | Lien |
|-----------|------|
| Principes POUR | [Blockly accessibility principles](https://docs.blockly.com/guides/design/accessibility/) |
| Bonnes pratiques intégration | [App integration — accessibility](https://docs.blockly.com/guides/app-integration/accessibility/best-practices/) |
| Conformité & ACR | [Compliance](https://docs.blockly.com/guides/app-integration/accessibility/compliance/) |
| Inspiration coque | [MakeCode Accessibility](https://makecode.com/accessibility) |

---

## Limites connues

- Navigation clavier **dans les blocs** : en attente de Blockly **v13** et résolution du conflit copier/coller.
- **Tutoriel clavier** interactif : non implémenté (public adulte — documentation statique fournie ici).
- **Annonces** du code généré à chaque modification : non activées (risque de spam lecteur d’écran). Une annonce brève suit l’enregistrement fichier (Ctrl+S).
- Éléments layout **`<flex>`** custom : peu sémantiques ; les repères ARIA compensent partiellement.
- **RTL** : arabe supporté pour l’UI ; vérifier manuellement la cohérence toolbox + coque.

---

## Tests manuels suggérés

1. Clavier seul : skip link → Ctrl+B → zone 3 → créer un bloc → Ctrl+S → ouvrir sélecteur couleur → générer du code.
2. Lecteur d’écran (NVDA, Narrator, VoiceOver) sur menu zones et champs couleur.
3. Chaque thème d’accessibilité : lisibilité barre d’outils, panneau code (pré + Monaco), workspace.
4. Zoom navigateur 200 % : pas de chevauchement bloquant des panneaux.

Commandes projet : `npm test`, `npm run check-translations`, `npm run lint`.

---

Voir aussi : [Architecture](ARCHITECTURE.md) · [README](../README.md)
