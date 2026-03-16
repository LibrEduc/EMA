# Contributing to µcBlockly

Thank you for considering contributing. This short guide will help you get started.

## Before you start

1. **Read the architecture**  
   See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
   - Source layout (`src/` and subfolders)
   - Conventions (comments, JSDoc, block definitions vs code generation)
   - Where to change what (new blocks, types, toolbox, boards, languages, themes)

2. **Set up the project**  
   - `npm install`  
   - `npm run dev` for development with hot reload  
   - `npm run build` for production build  
   - `npm run docs` to generate API docs (TypeDoc) in `docs/api/`

3. **Code style**  
   - Comments and JSDoc in **English**  
   - Use `@description`, `@param`, `@returns` for public APIs  
   - Run `npm run lint` and fix reported issues  

## Common tasks

| Task | Where to look |
|------|----------------|
| Add or change a block (UI) | `src/categories/blockly/` + `index.ts` |
| Add or change code generation for a block | `src/generators/arduino/blocks/` + `src/generators/arduino.ts` |
| Add block types / compatibility | `src/generators/arduino/block_types/`, `block_types.ts`, `block_types_registry.ts` |
| Change toolbox or categories | `src/toolbox.ts` |
| Add a board or change pins | `src/boards.ts` |
| Add or edit a language | `src/languages/` |

## Reporting issues and pull requests

- **Bugs and feature requests**: use the [GitHub issue tracker](https://github.com/A-S-T-U-C-E/ucBlockly/issues).  
- **Pull requests**: welcome. Please keep changes focused and reference any related issue.  

Keeping [ARCHITECTURE.md](./ARCHITECTURE.md) and this file up to date when you change the project layout or workflow is appreciated.
