#!/usr/bin/env node

/**
 * Vérification des traductions µcBlockly (fr, en, es, ar).
 *
 * Usage : `npm run check-translations` (ou `node scripts/check-translations.cjs`)
 *
 * ## Périmètre vérifié
 *
 * 1. **Clés personnalisées** (`CUSTOM_KEYS`) dans `src/languages/{fr,en,es,ar}.ts`
 *    — messages µcBlockly hors catalogue Blockly standard (variables typées, cast,
 *    boucles personnalisées, couleurs HSV, etc.).
 *
 * 2. **`array_messages.ts`** — messages des blocs listes/tableaux S4e (`ARRAY_*`).
 *
 * 3. **`board_messages.ts`** — parité des clés `ARDUINO_*` / `SERIAL_*` entre les
 *    4 langues (référence = anglais).
 *
 * 4. **`blockly_a11y_messages.ts`** — raccourcis et hints Blockly 13 (fr, en, es, ar).
 *
 * ## Hors périmètre (non vérifié par ce script)
 *
 * - Messages Blockly natifs fournis par la bibliothèque `blockly` (ex. `CONTROLS_IF_MSG_IF`).
 * - Clés fusionnées dynamiquement dans `blockly_application_type.ts` sans être listées ici.
 * - Fichiers HTML / UI hors `src/languages/`.
 *
 * Pour ajouter une nouvelle clé : l'inscrire dans les 4 fichiers de langue concernés
 * **et** dans `CUSTOM_KEYS` ou `ARRAY_MESSAGES_KEYS` ci-dessous.
 */

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['fr', 'en', 'es', 'ar'];
const LANG_DIR = path.join(__dirname, '../src/languages');
const CATEGORIES_DIR = path.join(__dirname, '../src/categories/blockly');
const ARRAY_MESSAGES_FILE = path.join(__dirname, '../src/languages/array_messages.ts');
const BOARD_MESSAGES_FILE = path.join(__dirname, '../src/languages/board_messages.ts');
const BLOCKLY_A11Y_MESSAGES_FILE = path.join(__dirname, '../src/languages/blockly_a11y_messages.ts');

// Clés personnalisées qui doivent être dans nos fichiers de langues (pas dans Blockly.Msg standard)
const CUSTOM_KEYS = new Set([
  // Variables personnalisées
  'VARIABLES_GET_ITEM',
  'VARIABLES_AS',
  'VARIABLES_LOCAL',
  'VARIABLES_LOCAL_TOOLTIP',
  'VARIABLES_CAST_AS_TYPE',
  'VARIABLES_CAST_TOOLTIP',
  'VAR_CAST_TYPE_CHAR',
  'VAR_CAST_TYPE_STRING',
  'VAR_CAST_TYPE_BOOL',
  'VAR_CAST_TYPE_BYTE',
  'VAR_CAST_TYPE_INT',
  'VAR_CAST_TYPE_UINT',
  'VAR_CAST_TYPE_VINT',
  'VAR_CAST_TYPE_LONG',
  'VAR_CAST_TYPE_ULONG',
  'VAR_CAST_TYPE_FLOAT',
  'VARIABLES_SET_CONST',
  'VARIABLES_SET_CONST_AT',
  'VARIABLES_SET_CONST_TOOLTIP',
  'VARIABLES_SET_CONST_HELPURL',
  'VARIABLES_SET_INIT',
  'VARIABLES_SET_INIT_TOOLTIP',
  'VARIABLES_SET_INIT_HELPURL',
  'VARIABLES_DEFINE',
  'VARIABLES_CONST_WARNING',
  
  // Typed variables
  'TYPED_VAR_SET_LABEL',
  'TYPED_VAR_TO_LABEL',
  'TYPED_VAR_TYPE_SET_LABEL',
  'TYPED_VAR_TYPE_TO_LABEL',
  'TYPED_VAR_UNTYPED_WARNING',
  'TYPED_VAR_TYPE_MISMATCH',
  
  // Array personnalisées (celles qui ne sont pas dans array_messages.ts)
  'ARRAY_UNE_LISTE',
  'ARRAY_WITH_TOOLTIP',
  'ARRAY_WITH_HELPURL',
  'ARRAY_BITMAP_AS_LIST',
  'ARRAY_BITMAP_COLS',
  'ARRAY_BITMAP_ROWS',
  'ARRAY_BITMAP_TOOLTIP',
  'ARRAY_BITMAP_HELPURL',
  'ARRAY_SET',
  'ARRAY_SET_TO',
  'ARRAY_SET_TOOLTIP',
  'ARRAY_SET_HELPURL',
  'ARRAY_BITMAP_GET_TOOLTIP',
  'ARRAY_BITMAP_GET_HELPURL',
  
  // Math personnalisées
  'MATH_CHANGE_LABEL',
  'MATH_CHANGE_BY',
  'MATH_CHANGE_VAR_WARNING',
  'MATH_PERCENT_TOOLTIP',
  'MATH_PERCENT_HELPURL',
  'MATH_ANGLE',
  'INOUT_ANGLE_MATHS_TOOLTIP',
  'MATH_INTERVAL_TOOLTIP',
  
  // Logic personnalisées (switch)
  'CONTROLS_SWITCH_HELPURL',
  'CONTROLS_SWITCH_VAR_TITLE',
  'CONTROLS_SWITCH_VAR_TAIL',
  'CONTROLS_SWITCH_MSG_CASEBREAK',
  'CONTROLS_SWITCH_MSG_DO',
  'CONTROLS_SWITCH_MSG_DEFAULT',
  'CONTROLS_SWITCH_MSG_SWITCHVAR',
  'CONTROLS_SWITCH_VAR_TOOLTIP',
  'CONTROLS_SWITCH_CASEBREAK_TOOLTIP',
  'CONTROLS_SWITCH_DEFAULT_TOOLTIP',
  'CONTROLS_SWITCH_TOOLTIP_1',
  'CONTROLS_SWITCH_TOOLTIP_2',
  'CONTROLS_SWITCH_TOOLTIP_3',
  'CONTROLS_SWITCH_TOOLTIP_4',

  // Boucle for-each (libellés sans %1/%2 Blockly)
  'CONTROLS_FOREACH_LIST_EMPTY',
  'UCB_FOREACH_EACH',
  'UCB_FOREACH_IN',
  'UCB_FOREACH_DO',
  'UCB_FOREACH_TOOLTIP',
  'UCB_FOREACH_HELPURL',
  
  // Arduino
  'ARDUINO_BASE_DEFINE_CONST_TOOLTIP',
  'ARDUINO_BASE_DEFINE_CONST_HELPURL',

  // Couleur (icônes accessibilité)
  'COLOUR_ICON_PALETTE',
  'COLOUR_ICON_WHEEL',
  'COLOUR_ICON_HSV',

  // Common
  '_AT',
]);

// Messages shell (alertes, familles de cartes) — src/languages/*.ts
const SHELL_KEYS = new Set([
  'LOAD_MERGE_CONFIRM',
  'FILE_INVALID_FORMAT',
  'FILE_LOAD_ERROR',
  'FILE_READ_ERROR',
  'FILE_SAVE_ERROR',
  'BOARD_FAMILY_OTHER',
  'BOARD_FAMILY_ARDUINO_AVR',
  'BOARD_FAMILY_ESP8266',
  'BOARD_FAMILY_ESP32',
  'BOARD_FAMILY_FRANZININHO',
  'BOARD_FAMILY_PI_PICO',
  'BOARD_FAMILY_STM32_NUCLEO',
  'BOARD_FAMILY_TEENSY',
  'BOARD_FAMILY_MAKEBLOCK',
  'BOARD_FAMILY_DFROBOT',
  'BOARD_FAMILY_DAGU',
  'BOARD_FAMILY_PEGUINO',
  'BOARD_FAMILY_KITS',
  'SHORTCUTS_HELP_BUTTON',
  'SHORTCUTS_HELP_TOOLTIP',
  'SHORTCUTS_HELP_TITLE',
  'SHORTCUTS_HELP_CLOSE',
  'SHORTCUTS_HELP_SECTION_SHELL',
  'SHORTCUTS_HELP_SECTION_SCREENREADER',
  'SHORTCUTS_HELP_COL_ACTION',
  'SHORTCUTS_HELP_COL_KEYS',
  'SHORTCUTS_HELP_SHELL_SKIP',
  'SHORTCUTS_HELP_SHELL_AREAS',
  'SHORTCUTS_HELP_SHELL_ZONES',
  'SHORTCUTS_HELP_SHELL_SAVE',
  'SHORTCUTS_HELP_SHELL_OPEN',
  'SHORTCUTS_HELP_NAV_ARROWS',
  'SHORTCUTS_HELP_EDIT_COPY',
  'SHORTCUTS_HELP_EDIT_CUT',
  'SHORTCUTS_HELP_EDIT_PASTE',
  'SHORTCUTS_HELP_KEYS_DELETE',
  'SHORTCUTS_HELP_KEYS_CONFIRM',
  'SHORTCUTS_HELP_SECTION_NAV_ADVANCED',
  'KEYBOARD_TUTORIAL_BUTTON',
  'KEYBOARD_TUTORIAL_TOOLTIP',
  'KEYBOARD_TUTORIAL_TITLE',
  'KEYBOARD_TUTORIAL_CLOSE',
  'KEYBOARD_TUTORIAL_SKIP',
  'KEYBOARD_TUTORIAL_PREV',
  'KEYBOARD_TUTORIAL_NEXT',
  'KEYBOARD_TUTORIAL_DONT_SHOW',
  'KEYBOARD_TUTORIAL_STEP_1_TITLE',
  'KEYBOARD_TUTORIAL_STEP_1_BODY',
  'KEYBOARD_TUTORIAL_STEP_2_TITLE',
  'KEYBOARD_TUTORIAL_STEP_2_BODY',
  'KEYBOARD_TUTORIAL_STEP_3_TITLE',
  'KEYBOARD_TUTORIAL_STEP_3_BODY',
  'KEYBOARD_TUTORIAL_STEP_4_TITLE',
  'KEYBOARD_TUTORIAL_STEP_4_BODY',
  'KEYBOARD_TUTORIAL_STEP_5_TITLE',
  'KEYBOARD_TUTORIAL_STEP_5_BODY',
]);

// Clés dans blockly_a11y_messages.ts (Blockly 13 accessibilité)
const BLOCKLY_A11Y_MESSAGES_KEYS = new Set([
  'KEYBOARD_NAV_BLOCK_NAVIGATION_HINT',
  'KEYBOARD_NAV_CONSTRAINED_MOVE_HINT',
  'KEYBOARD_NAV_COPIED_HINT',
  'KEYBOARD_NAV_CUT_HINT',
  'KEYBOARD_NAV_FLYOUT_LABEL_HINT',
  'KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT',
  'KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT',
  'SCREENREADER_HINT',
  'SCREENREADER_MODE_DISABLED',
  'SCREENREADER_MODE_ENABLED',
  'SHORTCUTS_ABORT_MOVE',
  'SHORTCUTS_CLEANUP',
  'SHORTCUTS_CODE_NAVIGATION',
  'SHORTCUTS_DELETE',
  'SHORTCUTS_DISCONNECT',
  'SHORTCUTS_DUPLICATE',
  'SHORTCUTS_EDITING',
  'SHORTCUTS_ESCAPE',
  'SHORTCUTS_EXTENDED_INFORMATION',
  'SHORTCUTS_FINISH_MOVE',
  'SHORTCUTS_FOCUS_TOOLBOX',
  'SHORTCUTS_FOCUS_WORKSPACE',
  'SHORTCUTS_GENERAL',
  'SHORTCUTS_INFORMATION',
  'SHORTCUTS_JUMP_BLOCK_END',
  'SHORTCUTS_JUMP_BLOCK_START',
  'SHORTCUTS_JUMP_BOTTOM_STACK',
  'SHORTCUTS_JUMP_FIRST_BLOCK',
  'SHORTCUTS_JUMP_LAST_BLOCK',
  'SHORTCUTS_JUMP_TOP_STACK',
  'SHORTCUTS_MOVE_DOWN',
  'SHORTCUTS_MOVE_LEFT',
  'SHORTCUTS_MOVE_RIGHT',
  'SHORTCUTS_MOVE_UP',
  'SHORTCUTS_NEXT_HEADING',
  'SHORTCUTS_NEXT_STACK',
  'SHORTCUTS_PERFORM_ACTION',
  'SHORTCUTS_PREVIOUS_HEADING',
  'SHORTCUTS_PREVIOUS_STACK',
  'SHORTCUTS_SHOW_CONTEXT_MENU',
  'SHORTCUTS_SHOW_TOOLTIP',
  'SHORTCUTS_START_MOVE',
  'SHORTCUTS_START_MOVE_STACK',
  'SHORTCUTS_TOGGLE_SCREENREADER_MODE',
]);

// Clés dans array_messages.ts
const ARRAY_MESSAGES_KEYS = new Set([
  'ARRAY_CREATE_EMPTY_TITLE',
  'ARRAY_CREATE_WITH',
  'ARRAY_CREATE_WITH_INPUT_WITH',
  'ARRAY_CREATE_WITH_ITEM_TITLE',
  'ARRAY_CREATE_WITH_ITEM_TOOLTIP',
  'ARRAY_CREATE_WITH_TOOLTIP',
  'ARRAY_CREATE_WITH_HELPURL',
  'ARRAY_CREATE_WITH_CONTAINER_TITLE_ADD',
  'ARRAY_CREATE_WITH_CONTAINER_TOOLTIP',
  'ARRAY_GETINDEX_AT',
  'ARRAY_GETINDEX_ITEM',
  'ARRAY_GETINDEX_TOOLTIP',
  'ARRAY_GETINDEX_TOOLTIP1',
  'ARRAY_GETINDEX_TOOLTIP2',
  'ARRAY_GETINDEX_TOOLTIP3',
  'ARRAY_GETINDEX_HELPURL',
  'ARRAY_MODIFY_INDICE',
  'ARRAY_MODIFY_NAME',
  'ARRAY_MODIFY_VALUE',
  'ARRAY_MODIFY_TOOLTIP',
  'ARRAY_MODIFY_HELPURL',
  'ARRAY_CREATE',
  'ARRAY_LIST',
  'ARRAY_LIST_UNTYPED_WARNING',
  'ARRAY_LIST_DUPLICATE_WARNING',
  'ARRAY_ARRAY',
  'ARRAY_TAILLE',
  'ARRAY_CONTIENT',
  'ARRAY_dim',
  'ARRAY_index',
  'ARRAY_taille',
  'ARRAY_contenu',
  'ARRAY_FIX',
  '_AT',
  'HELPURL',
]);

/**
 * Lit un fichier de langue TypeScript et extrait les clés
 */
function extractKeysFromLangFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  
  // Recherche les clés dans le format: KEY: "value",
  const regex = /(\w+):\s*["'`][^"'`]*["'`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    // Ignore les clés de métadonnées comme 'fr', 'en', etc.
    if (key.length > 1 && key !== 'fr' && key !== 'en' && key !== 'es' && key !== 'ar') {
      keys.add(key);
    }
  }
  
  return keys;
}

/**
 * Lit un fichier de messages (array_messages.ts, board_messages.ts) et extrait les clés par langue.
 */
function extractMessagesKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  for (const lang of LANGUAGES) {
    result[lang] = new Set();
    const langRegex = new RegExp(`\\n  ${lang}:\\s*\\{([\\s\\S]*?)\\n  \\},`, 'm');
    const langMatch = content.match(langRegex);
    if (langMatch) {
      const langContent = langMatch[1];
      const keyRegex = /^\s+(\w+):/gm;
      let match;
      while ((match = keyRegex.exec(langContent)) !== null) {
        result[lang].add(match[1]);
      }
    }
  }

  return result;
}

/**
 * Lit array_messages.ts et extrait les clés pour chaque langue
 */
function extractArrayMessagesKeys() {
  return extractMessagesKeysFromFile(ARRAY_MESSAGES_FILE);
}

/**
 * Lit board_messages.ts et extrait les clés pour chaque langue
 */
function extractBoardMessagesKeys() {
  return extractMessagesKeysFromFile(BOARD_MESSAGES_FILE);
}

/**
 * Lit blockly_a11y_messages.ts et extrait les clés pour chaque langue
 */
function extractBlocklyA11yMessagesKeys() {
  const result = extractMessagesKeysFromFile(BLOCKLY_A11Y_MESSAGES_FILE);
  const content = fs.readFileSync(BLOCKLY_A11Y_MESSAGES_FILE, 'utf8');
  const enConstMatch = content.match(/const EN[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (enConstMatch) {
    const keyRegex = /^\s+(\w+):/gm;
    let match;
    while ((match = keyRegex.exec(enConstMatch[1])) !== null) {
      result.en.add(match[1]);
    }
  }
  return result;
}

/**
 * Vérifie les traductions
 */
function checkTranslations() {
  console.log('🔍 Vérification des traductions µcBlockly (fr, en, es, ar)\n');
  console.log('Périmètre :');
  console.log(`  • ${CUSTOM_KEYS.size} clés personnalisées (src/languages/*.ts)`);
  console.log(`  • ${SHELL_KEYS.size} clés shell (alertes, familles cartes)`);
  console.log(`  • ${ARRAY_MESSAGES_KEYS.size} clés array_messages.ts`);
  console.log(`  • ${BLOCKLY_A11Y_MESSAGES_KEYS.size} clés blockly_a11y_messages.ts`);
  console.log('  • Parité board_messages.ts (ARDUINO_* / SERIAL_*)');
  console.log('  • Hors périmètre : messages Blockly natifs (bibliothèque blockly)\n');
  
  const langKeys = {};
  const missingKeys = {};
  const arrayMessagesKeys = extractArrayMessagesKeys();
  const blocklyA11yMessagesKeys = extractBlocklyA11yMessagesKeys();
  const boardMessagesKeys = extractBoardMessagesKeys();
  const boardReferenceKeys = boardMessagesKeys.en || new Set();
  
  // Charger les clés de chaque fichier de langue
  for (const lang of LANGUAGES) {
    const langFile = path.join(LANG_DIR, `${lang}.ts`);
    langKeys[lang] = extractKeysFromLangFile(langFile);
    missingKeys[lang] = {
      main: [],
      shell: [],
      array: [],
      a11y: [],
      board: [],
    };
  }
  
  // Vérifier les clés personnalisées (pas dans Blockly.Msg standard)
  console.log('📋 Vérification des clés personnalisées...');
  for (const key of CUSTOM_KEYS) {
    for (const lang of LANGUAGES) {
      if (!langKeys[lang].has(key)) {
        missingKeys[lang].main.push(key);
      }
    }
  }

  // Vérifier les messages shell (UI)
  console.log('📋 Vérification des clés shell...');
  for (const key of SHELL_KEYS) {
    for (const lang of LANGUAGES) {
      if (!langKeys[lang].has(key)) {
        missingKeys[lang].shell.push(key);
      }
    }
  }
  
  // Vérifier les clés d'array_messages
  console.log('📋 Vérification des clés array_messages...');
  for (const key of ARRAY_MESSAGES_KEYS) {
    for (const lang of LANGUAGES) {
      if (!arrayMessagesKeys[lang].has(key)) {
        missingKeys[lang].array.push(key);
      }
    }
  }

  // Vérifier les clés blockly_a11y_messages
  console.log('📋 Vérification des clés blockly_a11y_messages...');
  for (const key of BLOCKLY_A11Y_MESSAGES_KEYS) {
    for (const lang of LANGUAGES) {
      if (!blocklyA11yMessagesKeys[lang].has(key)) {
        missingKeys[lang].a11y.push(key);
      }
    }
  }

  // Vérifier la parité des clés board_messages (référence = en)
  console.log('📋 Vérification des clés board_messages...');
  for (const lang of LANGUAGES) {
    for (const key of boardReferenceKeys) {
      if (!boardMessagesKeys[lang].has(key)) {
        missingKeys[lang].board.push(key);
      }
    }
    for (const key of boardMessagesKeys[lang]) {
      if (!boardReferenceKeys.has(key)) {
        missingKeys[lang].board.push(`+${key} (extra vs en)`);
      }
    }
  }
  
  // Afficher les résultats
  let hasErrors = false;
  for (const lang of LANGUAGES) {
    const mainMissing = missingKeys[lang].main.length;
    const shellMissing = missingKeys[lang].shell.length;
    const arrayMissing = missingKeys[lang].array.length;
    const a11yMissing = missingKeys[lang].a11y.length;
    const boardMissing = missingKeys[lang].board.length;
    
    if (mainMissing > 0 || shellMissing > 0 || arrayMissing > 0 || a11yMissing > 0 || boardMissing > 0) {
      hasErrors = true;
      console.log(`\n❌ ${lang.toUpperCase()}:`);
      if (mainMissing > 0) {
        console.log(`   Clés principales manquantes (${mainMissing}):`);
        missingKeys[lang].main.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
      if (shellMissing > 0) {
        console.log(`   Clés shell manquantes (${shellMissing}):`);
        missingKeys[lang].shell.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
      if (arrayMissing > 0) {
        console.log(`   Clés array_messages manquantes (${arrayMissing}):`);
        missingKeys[lang].array.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
      if (a11yMissing > 0) {
        console.log(`   Clés blockly_a11y_messages manquantes (${a11yMissing}):`);
        missingKeys[lang].a11y.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
      if (boardMissing > 0) {
        console.log(`   Clés board_messages manquantes ou en trop (${boardMissing}):`);
        missingKeys[lang].board.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
    } else {
      console.log(`\n✅ ${lang.toUpperCase()}: Toutes les traductions sont présentes`);
    }
  }
  
  if (!hasErrors) {
    console.log('\n✨ Toutes les traductions sont complètes dans les 4 langues !');
    return 0;
  } else {
    console.log('\n⚠️  Certaines traductions sont manquantes. Veuillez les ajouter.');
    return 1;
  }
}

// Exécuter la vérification
const exitCode = checkTranslations();
process.exit(exitCode);
