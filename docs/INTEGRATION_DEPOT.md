<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Intégrer le dépôt µcBlockly dans un autre projet

</div>

Ce document décrit **comment intégrer le dépôt µcBlockly** (tel quel, sans tout dupliquer) dans un autre projet qui s’appuierait dessus — par exemple une application qui embarque l’éditeur Blockly Arduino dans une page ou un onglet.

---

## 1. État actuel de µcBlockly

- **Noyau embeddable** : `src/core/` + API `createUcBlockly()` — voir [KERNEL.md](./KERNEL.md).
- **Démo autonome** : `src/index.ts` + Webpack → `dist/bundle/` (HTML + Monaco + shell).
- **Embed minimal** : `npm run build:core:bundle` → `dist/core/` (sans Monaco).
- **Exports npm** : `"."` / `"./core"` → noyau ; `"./host"` → aides produit ; `"./demo"` → entrée démo.
- **`"private": true`** : pas encore publié sur npm (P3).

La démo complète reste couplée au DOM (`requiredElements` dans `src/index.ts`). Les intégrations embeddables doivent utiliser **`µcBlockly/core`** uniquement.

---

## 2. Oui, c’est possible : trois approches

### 2.1 Intégration par iframe (recommandé si vous voulez peu toucher à µcBlockly)

**Idée** : votre projet contient µcBlockly (submodule ou copie), le build une fois, et affiche le résultat dans un **iframe**. Votre app est la « coque » (menu, auth, autre contenu) ; µcBlockly tourne dans l’iframe comme une app à part.

**Mise en œuvre :**

1. **Ajouter µcBlockly en submodule Git** (depuis votre dépôt) :
   ```bash
   git submodule add https://github.com/A-S-T-U-C-E/ucBlockly.git ucBlockly
   ```
   Ou cloner le dépôt dans un sous-dossier de votre projet.

2. **Build** : dans le dossier µcBlockly, exécuter `npm ci` puis `npm run build` (ou `build:local` si vous ouvrez en local). Le résultat est dans `ucBlockly/dist/bundle/` (ou `build/` en dev).

3. **Servir le bundle** : votre projet sert le contenu de `ucBlockly/dist/bundle/` sous une URL (ex. `/blockly/` ou un sous-répertoire statique).

4. **Intégration dans votre page** :
   ```html
   <iframe
     src="/blockly/"
     title="µcBlockly"
     style="width:100%; height:800px; border:0;"
   ></iframe>
   ```

5. **Communication (optionnel)** : si vous devez échanger des données (charger/sauvegarder un XML ou du JSON) entre la page parente et µcBlockly, utiliser `postMessage` entre la fenêtre parente et `iframe.contentWindow`.

**Avantages** : pas de modification du code µcBlockly, mises à jour du submodule + rebuild.  
**Inconvénients** : pas d’API directe (tout passe par l’iframe et éventuellement postMessage), et vous devez gérer le chemin du build (CI, déploiement).

---

### 2.2 Intégration par sous-dossier + build dans le pipeline du projet parent

**Idée** : comme en 2.1, µcBlockly est un sous-dossier (submodule ou clone). Votre outil de build (Webpack, Vite, etc.) ou votre script de déploiement **lance le build de µcBlockly** puis copie les artefacts où il faut.

**Mise en œuvre :**

1. Submodule ou copie du dépôt, par ex. dans `vendor/ucBlockly` ou `apps/blockly-editor`.
2. Dans le script de build ou la CI du **projet parent** :
   ```bash
   cd vendor/ucBlockly && npm ci && npm run build && cd ../..
   ```
3. Copier `vendor/ucBlockly/dist/bundle/*` vers le répertoire statique de votre app (ex. `public/blockly/`).
4. Dans votre app, ouvrir cette URL dans une iframe (comme en 2.1) ou rediriger une route vers `index.html` du bundle.

**Avantages** : un seul dépôt / une seule CI, intégration claire « µcBlockly = sous-projet buildé ».  
**Inconvénients** : même contraintes qu’en 2.1 (interface = iframe ou page entière).

---

### 2.3 Intégration par source (importer le code TypeScript de µcBlockly)

**Idée** : votre projet a son propre bundler (Webpack/Vite/…). Vous ajoutez µcBlockly en submodule et vous **importez directement des fichiers source** de µcBlockly (ex. `toolbox`, `generators`, `categories`) depuis votre code, au lieu d’utiliser le bundle autonome.

**Difficulté** : aujourd’hui, le point d’entrée de µcBlockly est une application complète qui :
- attend un DOM déjà en place (liste `requiredElements`) ;
- n’expose pas de fonction du type `init(container, options)`.

Pour une vraie intégration « lib », il faudrait soit :

- **Option A** : Dans **votre** projet, reproduire le même HTML que `public/index.html` (ou un équivalent minimal avec les mêmes ids), puis importer et exécuter le code d’init de µcBlockly (en exposant éventuellement une fonction `runUcBlockly()` depuis un fichier dédié). Votre bundler résout les imports vers `./ucBlockly/src/...`.  
  → Possible mais fragile (couplage aux ids du DOM et au flux d’init actuel).

- **Option B** : **Modifier µcBlockly** (dans votre fork ou dans le dépôt intégré) pour ajouter un **point d’entrée « bibliothèque »** :
  - un fichier du type `src/ucblockly-api.ts` qui exporte une fonction `inject(container: HTMLElement, options?: UcBlocklyOptions)` ;
  - cette fonction crée en JS les divs nécessaires à l’intérieur de `container`, puis exécute la logique d’init actuelle (workspace, toolbox, générateur, etc.).
  - Dans le projet parent, vous feriez : `import { inject } from './ucBlockly/src/ucblockly-api'; inject(document.getElementById('blockly-root'), {});`

**Mise en œuvre minimale (Option A, sans modifier µcBlockly) :**

1. Submodule : `git submodule add https://github.com/A-S-T-U-C-E/ucBlockly.git ucBlockly`
2. Dans votre config Webpack (ou Vite), ajouter un alias pour résoudre les imports vers le sous-dossier :
   ```js
   resolve: {
     alias: {
       'ucblockly': path.resolve(__dirname, 'ucBlockly/src'),
     },
   },
   ```
3. Dans votre page, inclure un clone du HTML requis par µcBlockly (ou un template qui génère les bons ids).
4. Importer le point d’entrée de µcBlockly **après** que le DOM soit prêt :
   ```js
   import './ucBlockly/src/index.ts';
   ```
   Cela exécutera l’app entière ; il faut que votre page fournisse bien tous les éléments attendus.

**Avantages** : un seul bundle, pas d’iframe.  
**Inconvénients** : dépendances (Blockly, Monaco, etc.) partagées avec le reste de votre app, et sans Option B le couplage au DOM reste fort.

---

## 3. Synthèse

| Besoin | Approche recommandée |
|--------|----------------------|
| Intégrer µcBlockly « tel quel » avec le moins de changements | **2.1 Iframe** (submodule + build, afficher le bundle dans une iframe). |
| Automatiser le build et le déploiement dans un gros projet | **2.2** (submodule + build dans la CI / script du parent, puis iframe ou route). |
| Intégrer au même document (pas d’iframe), sans modifier µcBlockly | **2.3 Option A** (même DOM, import du `index.ts`). |
| Intégrer au même document avec une API propre (init dans un div) | **2.3 Option B** (ajouter dans µcBlockly un entry « lib » du type `inject(container, options)`). |

---

## 4. API noyau `createUcBlockly` (P0)

Le point d’entrée embed est disponible dans `src/core/` et compilé vers `build/src/core/` :

```ts
import {
  createUcBlockly,
  basic_toolbox,
} from "./core/index.js"; // ou "µcBlockly/core" via package exports

const editor = createUcBlockly(document.getElementById("editor")!, {
  toolbox: basic_toolbox,
  language: "fr",
  theme: "classic",
  media: "./media/",
  onCodeChange: (code) => {
    document.getElementById("code")!.textContent = code;
  },
});

// editor.getCode(), editor.saveWorkspace(), editor.loadWorkspace(state), editor.dispose()
```

- Pas de `getElementById` imposé pour le workspace (seul un conteneur est requis).
- La démo complète (`src/index.ts` + `BlocklyApplication`) reste inchangée pour l’instant.

## 5. Évolution possible : package npm « lib »

Pour qu’un autre projet puisse un jour faire simplement :

```bash
npm install ucblockly
```

```js
import { inject } from 'ucblockly';
inject(document.getElementById('editor'), { toolbox: '...', language: 'fr' });
```

il faudrait dans µcBlockly :

1. ~~Un **second point d’entrée** (ex. `src/ucblockly-api.ts`)~~ → **fait (P0)** : `src/core/create_ucblockly.ts` + `createUcBlockly()`.
2. ~~Un **build « lib »**~~ → **fait (P2)** : `npm run build:core` + `build:core:bundle` → `dist/core/` (sans Monaco). Voir [KERNEL.md](./KERNEL.md).
3. Dans `package.json` : retirer `"private": true` et publier sur npm (P3).

`package.json` expose `"."` / `"./core"` vers `build/src/core/index.js`. Le bundle navigateur embed est dans `dist/core/`.

Cela ne change pas le fonctionnement actuel de l’app autonome ; ça ajoute une couche réutilisable pour l’intégration dans un autre projet.

---

En résumé : **oui, il est possible d’intégrer le dépôt µcBlockly dans un autre projet**. La méthode la plus simple et la plus robuste aujourd’hui est l’**iframe** (submodule + build). Pour une intégration « dans la page » sans iframe, il faut soit reproduire le DOM attendu et importer le code (2.3 A), soit étendre µcBlockly avec un point d’entrée type « lib » (2.3 B / section 4).
