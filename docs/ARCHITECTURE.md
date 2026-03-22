# µcBlockly – Project architecture and contributor guide

This document helps new contributors understand the codebase layout, conventions, and where to change things.

## Overview

**µcBlockly** is a visual programming environment (Blockly-based) that generates Arduino/C code. Users assemble blocks in the workspace; the Arduino generator turns the block tree into C++ code. The app also includes a code editor (Monaco), board profiles, and optional plugins (minimap, backpack, search, etc.).

## Source layout (`src/`)

```
src/
├── index.ts                    # Entry point: Blockly/Arduino global exposure, workspace init, UI wiring
├── blockly_application_type.ts # Core app class: inject, options, plugins, persistence, language
├── blockly_patches.ts          # Defensive patches for Blockly (e.g. removeTopBlock during drag)
├── toolbox.ts                  # Toolbox structure: categories, block lists, board-specific toolbox
├── toolbox_search_i18n.ts      # i18n wrapper for @blockly/toolbox-search (Blockly.Msg)
├── options.ts                  # Theme extension (libre/board styles), themeMappings
├── tools.ts                    # URL/query helpers (addReplaceParamToUrl, setPluginsInURL)
├── language.ts                 # Language switching, toolbox translation, URL lang param
├── types.d.ts                  # Ambient declarations (Blockly plugins, Monaco, etc.)
├── boards.ts                   # Board profiles (pins, PWM, serial, etc.) – data + helpers
├── code_editor.ts              # Lazy Monaco editor (generated C++ panel); shared µcB_codeEditor
├── workspace_resize.ts         # Blockly.svgResize + registerWorkspaceForSvgResize (no import from index)
├── workspace_flex.ts           # Flex resizers, panel toggles, saveLayoutToSessionStorage, µcB_addFlexResizerEvents
├── workspace_layout_utils.ts   # Flex helpers (parsePositiveFlex, snapNearZeroFlex, layout keys)
├── a11y_labels.ts              # getA11yLabel for layout UI (avoids importing language.ts from flex stack)
│
├── categories/blockly/         # Block *definitions* (UI blocks, fields, mutators)
│   ├── index.ts                # Entry: defineBlocklyArduinoCompatBlocks, defineAllTypedVariableBlocks
│   ├── array.ts                # Array/list blocks (S4e-style)
│   ├── board.ts                # Board blocks (pins, serial, etc.)
│   ├── colour.ts               # Colour blocks
│   ├── libre.ts                # “Libre” / free-text blocks (ex Blockly@rduino null category)
│   ├── logic.ts                # Logic/compare blocks
│   ├── math.ts                 # Math blocks
│   ├── text.ts                 # Text blocks
│   ├── variables.ts            # Typed variables (get/set/define/local), extensions
│   ├── shared.ts               # Shared block helpers
│   └── field_*.ts              # Custom fields (colour picker, HSV sliders)
│
├── generators/arduino/         # Arduino *code generation* (block → C++ string)
│   ├── arduino_generator.ts    # Main generator class (variables, functions, loops, finish)
│   ├── generators/arduino.ts    # Entry: arduinoGenerator, registers all block generators
│   ├── block_types.ts          # Type compatibility (int/float/bool/string/…), TYPE_COMPATIBILITY
│   ├── block_types_registry.ts # Applies block types to Blockly (setCheck), BLOCK_TYPE_REGISTRY
│   ├── block_types/            # Per-category type definitions (static + __DYNAMIC__)
│   │   ├── index.ts            # Aggregates all block types
│   │   ├── array.ts, board.ts, colour.ts, libre.ts, loops.ts, math.ts, procedures.ts, text.ts, variables.ts, logic.ts
│   ├── blocks/                 # Per-block code generators (one file per category)
│   │   ├── array.ts, board.ts, colour.ts, libre.ts, loops.ts, logic.ts, math.ts, procedures.ts, text.ts, variables.ts, variables_typed.ts, text_helpers.ts, math_helpers.ts
│   ├── configure_standard_blocks.ts # Standard Blockly blocks (controls_if, procedures, etc.) type checks
│   ├── strict_connection_checker.ts # Optional strict connection checker (block type compatibility)
│   ├── strict_type_enforcer.ts # Type enforcer (e.g. variable types)
│   ├── typed_variables_flyout.ts   # Typed variables category in toolbox
│   ├── variable_utils.ts       # Variable type normalization
│   ├── arduino_types.ts        # Arduino type metadata (default values, etc.)
│   └── debug.ts                # debugLog (no-op unless enabled)
│
└── languages/                  # UI strings (Blockly.Msg, toolbox labels)
    ├── languageMap.ts          # Language list and mapping
    ├── en.ts, fr.ts, es.ts, ar.ts
    ├── array_messages.ts       # Array block messages (mergeArrayMessages)
    └── board_messages.ts       # Board block messages (mergeBoardMessages)
```

## Conventions

- **Comments (TSDoc / TypeDoc)**: In English. Use `@description`, `@remarks`, `@param`, `@returns` for public APIs. File-level `@packageDocumentation` (with optional `@module`) describes the module for the generated API site. Avoid legacy **`@fileoverview`** (JSDoc); fold that text into `@remarks` or `@description`.
- **License header**: Each source file starts with `@packageDocumentation` where applicable, then the GPL-3.0-or-later license block. Author/copyright (e.g. ASTUCE) is kept as-is.
- **Block definitions vs code generation**:
  - **categories/blockly/** = what the user sees (block shape, fields, connections). Register with `Blockly.Blocks["block_type"] = { init() { … } }` or `Blockly.defineBlocksWithJsonArray`.
  - **generators/arduino/blocks/** = how each block becomes C++ (e.g. `arduinoGenerator.forBlock["block_type"] = function(block, generator) { return "code"; }`).
- **Block types**: Typing (int/float/bool/string/…) is defined in **block_types/** and **block_types.ts** (compatibility). **block_types_registry.ts** applies `setCheck` to blocks so connections respect types.
- **Board-specific behaviour**: **boards.ts** holds board profiles (pins, PWM, serial, etc.). **toolbox.ts** uses `getToolboxForCurrentBoard()` to build the toolbox for the selected board. Pin dropdowns and validators are wired from **categories/blockly/board.ts** and refreshed via `refreshBoardPinDropdowns`.

## Key flows

1. **Startup**: `index.ts` exposes Blockly and arduinoGenerator on `window`, then loads the app (e.g. `BlocklyApplication`). Block definitions (categories/blockly), block types (block_types_registry), and standard block config (configure_standard_blocks) are applied when Blockly is ready.
2. **Workspace inject**: `blockly_application_type.ts` injects the workspace (toolbox, theme, options), restores saved blocks if any, and registers plugins (minimap, backpack, search, etc.).
3. **Code generation**: User clicks “Generate code” (or equivalent) → `arduinoGenerator.workspaceToCode(workspace)` walks the block tree and calls the per-block generators in **generators/arduino/blocks/**.
4. **Language**: `language.ts` and **languages/** handle UI language and toolbox translation; URL param and dropdown drive the current language.

## Where to change what

| Goal | Main files |
|------|------------|
| Add a new block (UI) | `categories/blockly/<category>.ts`, then register in `categories/blockly/index.ts` |
| Add block type / compatibility | `generators/arduino/block_types/` + `block_types.ts`, then `block_types_registry.ts` |
| Generate code for a block | `generators/arduino/blocks/<category>.ts` + register in `generators/arduino.ts` |
| Change toolbox structure | `toolbox.ts` (basic_toolbox, getToolboxForCurrentBoard) |
| Add a board | `boards.ts` (BOARD_PROFILES + helpers) |
| New UI language | `languages/languageMap.ts` + new file `languages/<code>.ts`, merge messages |
| Theme / colours | `options.ts`, `theme_black_and_white.ts`, `theme_seshat.ts` |
| Patches to Blockly core | `blockly_patches.ts` |

## Build and docs

- `npm run build` – compile TypeScript and bundle (Webpack).
- `npm run docs` – generate API documentation with **TypeDoc** into `docs/api/` (landing page config: [TYPEDOC.md](./TYPEDOC.md), [typedoc.json](../typedoc.json)).
- `npm run dev` – development server with hot reload.

Keeping comments, headers, and this architecture doc up to date will help new contributors navigate and improve the project.
