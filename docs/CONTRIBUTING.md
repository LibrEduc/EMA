<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Contributing to µcBlockly

</div>

Thank you for considering contributing. This short guide will help you get started.

> **Débutant ?** Commence par **[DEBUTER_CODE.md](./DEBUTER_CODE.md)** (carte des guides + dossiers).  
> Glossaire : **[GLOSSAIRE.md](./GLOSSAIRE.md)**. Tutoriel micro-bloc : **[TUTORIEL_MICRO_BLOC.md](./TUTORIEL_MICRO_BLOC.md)**.

## Checklist — 1ère contribution (≈ 15 min)

1. `npm install`
2. `npm run dev` — ouvrir la démo, créer 2–3 blocs, vérifier le code généré
3. Lire [DEBUTER_CODE.md](./DEBUTER_CODE.md) (surtout « ne commence pas par `index.ts` »)
4. Choisir **un** objectif dans le tableau ci-dessous (toolbox / extension / micro-bloc)
5. Modifier **un seul** fichier concerné en premier (ex. une catégorie toolbox)
6. `npm run build:lib` puis `npm run test`
7. Si i18n touché : `npm run check-translations`
8. PR courte : quoi + pourquoi ; lier le guide suivi

## Before you start

**Compatibility:** µcBlockly **v3** requires **Blockly 13** (`blockly` ^13 and aligned `@blockly/*` plugins). See the root [README](../README.md) and [KERNEL.md](./KERNEL.md).

1. **Read the architecture**  
   See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
   - Source layout (`src/` and subfolders: `core/`, `host/`, `demo/`)
   - Conventions (comments, TSDoc / TypeDoc, block definitions vs code generation)
   - Where to change what (new blocks, types, toolbox, boards, languages, themes)

2. **Set up the project**  
   - `npm install`  
   - `npm run dev` for development with hot reload  
   - `npm run build` for production build (demo + core bundle)  
   - `npm run build:core` for the embeddable kernel only  
   - `npm run docs` to generate API documentation (TypeDoc) in `docs/api/` — see [TYPEDOC.md](./TYPEDOC.md)

3. **Quality checks before a PR**  
   - `npm run lint` — ESLint (including `eslint-plugin-tsdoc` for comment syntax)  
   - `npm run test` — Arduino generator and Blockly@rduino converter tests  
   - `npm run check-translations` — after editing `src/languages/`  
   - `npm run build:lib` — ensure TypeScript compiles  

4. **Code style**  
   - See **[CONVENTIONS.md](./CONVENTIONS.md)** (shared with BlocklyDuino v3 and Factory v3): headers, file split, inline comments, TSDoc.  
   - Documentation comments (**TSDoc**, consumed by [TypeDoc](https://typedoc.org/)) in **English**  
   - Use `@packageDocumentation`, `@description`, `@remarks`, `@param`, `@returns` for public APIs (see [TYPEDOC.md](./TYPEDOC.md))  

## Common tasks

| Task | Where to look |
|------|----------------|
| **Orient / beginner map** | **[DEBUTER_CODE.md](./DEBUTER_CODE.md)** |
| Add or change a block (UI + C++ + type) | **[AJOUTER_BLOC_NOYAU.md](./AJOUTER_BLOC_NOYAU.md)** → `categories/blockly/` + `generators/arduino/blocks/` |
| Add or change a block (UI only pointer) | `src/categories/blockly/` + `index.ts` |
| Add or change code generation for a block | `src/generators/arduino/blocks/` + `src/generators/arduino.ts` |
| Add block types / compatibility | `src/generators/arduino/block_types/`, `block_types.ts`, `block_types_registry.ts` — [TYPES_ET_COMPATIBILITES.md](./TYPES_ET_COMPATIBILITES.md) |
| Change toolbox or categories | **[MODIFIER_TOOLBOX.md](./MODIFIER_TOOLBOX.md)** → `src/toolbox/categories/` |
| Add a board or change pins | `src/boards.ts` / `src/board_profiles/` |
| Add or edit a language | `src/languages/` — then `npm run check-translations` |
| Convert Blockly@rduino project | `npm run convert-rduino` — see [CONVERT_RDUINO.md](./CONVERT_RDUINO.md) |
| Add a new toolbox category (e.g. servo) | **[AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md)** (pack runtime, recommandé) ; noyau = [AJOUTER_CATEGORIE_SERVOMOTEUR.md](./AJOUTER_CATEGORIE_SERVOMOTEUR.md) |
| Named instances (FieldInstance) | [INSTANCES.md](./INSTANCES.md) |
| Add a runtime extension pack | [AJOUTER_EXTENSION.md](./AJOUTER_EXTENSION.md) + `extensions/` + `npm run build:extensions` |
| File split / where modules went | [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md) |
| Regenerate functions inventory | `npm run extract-functions` → `docs/functions-list.md` |

## Reporting issues and pull requests

- **Bugs and feature requests**: use the [GitHub issue tracker](https://github.com/A-S-T-U-C-E/ucBlockly/issues).  
- **Pull requests**: welcome. Please keep changes focused and reference any related issue.  

Keeping [ARCHITECTURE.md](./ARCHITECTURE.md) and this file up to date when you change the project layout or workflow is appreciated.
