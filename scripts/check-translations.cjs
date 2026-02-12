#!/usr/bin/env node

/**
 * Script pour vérifier que toutes les clés de traduction utilisées dans les blocs
 * sont présentes dans les 4 fichiers de langues (fr, en, es, ar).
 */

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['fr', 'en', 'es', 'ar'];
const LANG_DIR = path.join(__dirname, '../src/languages');
const CATEGORIES_DIR = path.join(__dirname, '../src/categories/blockly');
const ARRAY_MESSAGES_FILE = path.join(__dirname, '../src/languages/array_messages.ts');

// Clés personnalisées qui doivent être dans nos fichiers de langues (pas dans Blockly.Msg standard)
const CUSTOM_KEYS = new Set([
  // Variables personnalisées
  'VARIABLES_GET_ITEM',
  'VARIABLES_AS',
  'VARIABLES_LOCAL',
  'VARIABLES_LOCAL_TOOLTIP',
  'VARIABLES_SET_CONST',
  'VARIABLES_SET_CONST_AT',
  'VARIABLES_SET_CONST_TOOLTIP',
  'VARIABLES_SET_CONST_HELPURL',
  'VARIABLES_SET_INIT',
  'VARIABLES_SET_INIT_TOOLTIP',
  'VARIABLES_SET_INIT_HELPURL',
  'VARIABLES_DEFINE',
  'VARIABLES_CONST_WARNING',
  'VAR_TYPE_INT',
  'VAR_TYPE_FLOAT',
  'VAR_TYPE_BOOL',
  'VAR_TYPE_STRING',
  'VAR_TYPE_CHAR',
  
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
  
  // Arduino
  'ARDUINO_BASE_DEFINE_CONST_TOOLTIP',
  'ARDUINO_BASE_DEFINE_CONST_HELPURL',
  
  // Common
  '_AT',
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
 * Lit array_messages.ts et extrait les clés pour chaque langue
 */
function extractArrayMessagesKeys() {
  const content = fs.readFileSync(ARRAY_MESSAGES_FILE, 'utf8');
  const result = {};
  
  for (const lang of LANGUAGES) {
    result[lang] = new Set();
    // Recherche le bloc de langue: lang: { ... }
    const langRegex = new RegExp(`${lang}:\\s*\\{([^}]+)\\}`, 's');
    const langMatch = content.match(langRegex);
    if (langMatch) {
      const langContent = langMatch[1];
      const keyRegex = /(\w+):\s*["'`][^"'`]*["'`]/g;
      let match;
      while ((match = keyRegex.exec(langContent)) !== null) {
        result[lang].add(match[1]);
      }
    }
  }
  
  return result;
}

/**
 * Vérifie les traductions
 */
function checkTranslations() {
  console.log('🔍 Vérification des traductions...\n');
  
  const langKeys = {};
  const missingKeys = {};
  const arrayMessagesKeys = extractArrayMessagesKeys();
  
  // Charger les clés de chaque fichier de langue
  for (const lang of LANGUAGES) {
    const langFile = path.join(LANG_DIR, `${lang}.ts`);
    langKeys[lang] = extractKeysFromLangFile(langFile);
    missingKeys[lang] = {
      main: [],
      array: [],
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
  
  // Vérifier les clés d'array_messages
  console.log('📋 Vérification des clés array_messages...');
  for (const key of ARRAY_MESSAGES_KEYS) {
    for (const lang of LANGUAGES) {
      if (!arrayMessagesKeys[lang].has(key)) {
        missingKeys[lang].array.push(key);
      }
    }
  }
  
  // Afficher les résultats
  let hasErrors = false;
  for (const lang of LANGUAGES) {
    const mainMissing = missingKeys[lang].main.length;
    const arrayMissing = missingKeys[lang].array.length;
    
    if (mainMissing > 0 || arrayMissing > 0) {
      hasErrors = true;
      console.log(`\n❌ ${lang.toUpperCase()}:`);
      if (mainMissing > 0) {
        console.log(`   Clés principales manquantes (${mainMissing}):`);
        missingKeys[lang].main.forEach(key => {
          console.log(`     - ${key}`);
        });
      }
      if (arrayMissing > 0) {
        console.log(`   Clés array_messages manquantes (${arrayMissing}):`);
        missingKeys[lang].array.forEach(key => {
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
