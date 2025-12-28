"use strict";
(self["webpackChunk_cBlockly"] = self["webpackChunk_cBlockly"] || []).push([[5550,6830],{

/***/ 65550
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   conf: () => (/* binding */ conf),
/* harmony export */   language: () => (/* binding */ language)
/* harmony export */ });
/* harmony import */ var _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(86830);


const conf = _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.conf;
const language = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: "invalid",
  tokenPostfix: ".js",
  keywords: [
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "const",
    "constructor",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "get",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "null",
    "return",
    "set",
    "static",
    "super",
    "switch",
    "symbol",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "undefined",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "async",
    "await",
    "of"
  ],
  typeKeywords: [],
  operators: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.operators,
  symbols: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.symbols,
  escapes: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.escapes,
  digits: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.digits,
  octaldigits: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.octaldigits,
  binarydigits: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.binarydigits,
  hexdigits: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.hexdigits,
  regexpctl: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.regexpctl,
  regexpesc: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.regexpesc,
  tokenizer: _typescript_typescript_js__WEBPACK_IMPORTED_MODULE_0__.language.tokenizer
};




/***/ },

/***/ 86830
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   conf: () => (/* binding */ conf),
/* harmony export */   language: () => (/* binding */ language)
/* harmony export */ });
/* harmony import */ var _editor_browser_coreCommands_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(72521);
/* harmony import */ var _editor_browser_widget_codeEditor_codeEditorWidget_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(83683);
/* harmony import */ var _editor_browser_widget_diffEditor_diffEditor_contribution_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35143);
/* harmony import */ var _editor_contrib_anchorSelect_browser_anchorSelect_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(99594);
/* harmony import */ var _editor_contrib_bracketMatching_browser_bracketMatching_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(21283);
/* harmony import */ var _editor_contrib_caretOperations_browser_caretOperations_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(22498);
/* harmony import */ var _editor_contrib_caretOperations_browser_transpose_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(86302);
/* harmony import */ var _editor_contrib_clipboard_browser_clipboard_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(15611);
/* harmony import */ var _editor_contrib_codeAction_browser_codeActionContributions_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(70446);
/* harmony import */ var _editor_contrib_codelens_browser_codelensController_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(62828);
/* harmony import */ var _editor_contrib_colorPicker_browser_colorPickerContribution_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(43067);
/* harmony import */ var _editor_contrib_comment_browser_comment_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(72106);
/* harmony import */ var _editor_contrib_contextmenu_browser_contextmenu_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(75368);
/* harmony import */ var _editor_contrib_cursorUndo_browser_cursorUndo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(23676);
/* harmony import */ var _editor_contrib_dnd_browser_dnd_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(23542);
/* harmony import */ var _editor_contrib_dropOrPasteInto_browser_copyPasteContribution_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(52387);
/* harmony import */ var _editor_contrib_dropOrPasteInto_browser_dropIntoEditorContribution_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(47738);
/* harmony import */ var _editor_contrib_find_browser_findController_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(65789);
/* harmony import */ var _editor_contrib_folding_browser_folding_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(97157);
/* harmony import */ var _editor_contrib_fontZoom_browser_fontZoom_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(55600);
/* harmony import */ var _editor_contrib_format_browser_formatActions_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(36847);
/* harmony import */ var _editor_contrib_documentSymbols_browser_documentSymbols_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(56096);
/* harmony import */ var _editor_contrib_inlineCompletions_browser_inlineCompletions_contribution_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(31270);
/* harmony import */ var _editor_contrib_inlineProgress_browser_inlineProgress_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(21095);
/* harmony import */ var _editor_contrib_gotoSymbol_browser_goToCommands_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(95976);
/* harmony import */ var _editor_contrib_gotoSymbol_browser_link_goToDefinitionAtPosition_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(68128);
/* harmony import */ var _editor_contrib_gotoError_browser_gotoError_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(39954);
/* harmony import */ var _editor_contrib_gpu_browser_gpuActions_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(22217);
/* harmony import */ var _editor_contrib_hover_browser_hoverContribution_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(32263);
/* harmony import */ var _editor_contrib_indentation_browser_indentation_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(88407);
/* harmony import */ var _editor_contrib_inlayHints_browser_inlayHintsContribution_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(14544);
/* harmony import */ var _editor_contrib_inPlaceReplace_browser_inPlaceReplace_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(71278);
/* harmony import */ var _editor_contrib_insertFinalNewLine_browser_insertFinalNewLine_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(90540);
/* harmony import */ var _editor_contrib_lineSelection_browser_lineSelection_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(91064);
/* harmony import */ var _editor_contrib_linesOperations_browser_linesOperations_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(43634);
/* harmony import */ var _editor_contrib_linkedEditing_browser_linkedEditing_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(66473);
/* harmony import */ var _editor_contrib_links_browser_links_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(60746);
/* harmony import */ var _editor_contrib_longLinesHelper_browser_longLinesHelper_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(55992);
/* harmony import */ var _editor_contrib_middleScroll_browser_middleScroll_contribution_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(19479);
/* harmony import */ var _editor_contrib_multicursor_browser_multicursor_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(74984);
/* harmony import */ var _editor_contrib_parameterHints_browser_parameterHints_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(32029);
/* harmony import */ var _editor_contrib_placeholderText_browser_placeholderText_contribution_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(14807);
/* harmony import */ var _editor_contrib_rename_browser_rename_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(16426);
/* harmony import */ var _editor_contrib_sectionHeaders_browser_sectionHeaders_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(56446);
/* harmony import */ var _editor_contrib_semanticTokens_browser_documentSemanticTokens_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(64302);
/* harmony import */ var _editor_contrib_semanticTokens_browser_viewportSemanticTokens_js__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(25110);
/* harmony import */ var _editor_contrib_smartSelect_browser_smartSelect_js__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(33432);
/* harmony import */ var _editor_contrib_snippet_browser_snippetController2_js__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(50960);
/* harmony import */ var _editor_contrib_stickyScroll_browser_stickyScrollContribution_js__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(43117);
/* harmony import */ var _editor_contrib_suggest_browser_suggestController_js__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(59198);
/* harmony import */ var _editor_contrib_suggest_browser_suggestInlineCompletions_js__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(1302);
/* harmony import */ var _editor_contrib_tokenization_browser_tokenization_js__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(32526);
/* harmony import */ var _editor_contrib_toggleTabFocusMode_browser_toggleTabFocusMode_js__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(1184);
/* harmony import */ var _editor_contrib_unicodeHighlighter_browser_unicodeHighlighter_js__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(80654);
/* harmony import */ var _editor_contrib_unusualLineTerminators_browser_unusualLineTerminators_js__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(98690);
/* harmony import */ var _editor_contrib_wordHighlighter_browser_wordHighlighter_js__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(36887);
/* harmony import */ var _editor_contrib_wordOperations_browser_wordOperations_js__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(21600);
/* harmony import */ var _editor_contrib_wordPartOperations_browser_wordPartOperations_js__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(51302);
/* harmony import */ var _editor_contrib_readOnlyMessage_browser_contribution_js__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(36651);
/* harmony import */ var _editor_contrib_diffEditorBreadcrumbs_browser_contribution_js__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(94184);
/* harmony import */ var _editor_contrib_floatingMenu_browser_floatingMenu_contribution_js__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(58526);
/* harmony import */ var _editor_common_standaloneStrings_js__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(45933);
/* harmony import */ var _base_browser_ui_codicons_codicon_codicon_css__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(63470);
/* harmony import */ var _base_browser_ui_codicons_codicon_codicon_modifiers_css__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(74639);
/* harmony import */ var _editor_standalone_browser_iPadShowKeyboard_iPadShowKeyboard_js__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(24185);
/* harmony import */ var _editor_standalone_browser_inspectTokens_inspectTokens_js__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(21845);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneHelpQuickAccess_js__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(84253);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneGotoLineQuickAccess_js__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(94806);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneGotoSymbolQuickAccess_js__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(1722);
/* harmony import */ var _editor_standalone_browser_quickAccess_standaloneCommandsQuickAccess_js__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(85222);
/* harmony import */ var _editor_standalone_browser_referenceSearch_standaloneReferenceSearch_js__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(73817);
/* harmony import */ var _editor_standalone_browser_toggleHighContrast_toggleHighContrast_js__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(16706);
/* harmony import */ var _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(34819);










































































const conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  onEnterRules: [
    {
      // e.g. /** | */
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      afterText: /^\s*\*\/$/,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.IndentOutdent,
        appendText: " * "
      }
    },
    {
      // e.g. /** ...|
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.None,
        appendText: " * "
      }
    },
    {
      // e.g.  * ...|
      beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.None,
        appendText: "* "
      }
    },
    {
      // e.g.  */|
      beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.None,
        removeText: 1
      }
    }
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"', notIn: ["string"] },
    { open: "'", close: "'", notIn: ["string", "comment"] },
    { open: "`", close: "`", notIn: ["string", "comment"] },
    { open: "/**", close: " */", notIn: ["string"] }
  ],
  folding: {
    markers: {
      start: new RegExp("^\\s*//\\s*#?region\\b"),
      end: new RegExp("^\\s*//\\s*#?endregion\\b")
    }
  }
};
const language = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: "invalid",
  tokenPostfix: ".ts",
  keywords: [
    // Should match the keys of textToKeywordObj in
    // https://github.com/microsoft/TypeScript/blob/master/src/compiler/scanner.ts
    "abstract",
    "any",
    "as",
    "asserts",
    "bigint",
    "boolean",
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "const",
    "constructor",
    "debugger",
    "declare",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "get",
    "if",
    "implements",
    "import",
    "in",
    "infer",
    "instanceof",
    "interface",
    "is",
    "keyof",
    "let",
    "module",
    "namespace",
    "never",
    "new",
    "null",
    "number",
    "object",
    "out",
    "package",
    "private",
    "protected",
    "public",
    "override",
    "readonly",
    "require",
    "global",
    "return",
    "satisfies",
    "set",
    "static",
    "string",
    "super",
    "switch",
    "symbol",
    "this",
    "throw",
    "true",
    "try",
    "type",
    "typeof",
    "undefined",
    "unique",
    "unknown",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "async",
    "await",
    "of"
  ],
  operators: [
    "<=",
    ">=",
    "==",
    "!=",
    "===",
    "!==",
    "=>",
    "+",
    "-",
    "**",
    "*",
    "/",
    "%",
    "++",
    "--",
    "<<",
    "</",
    ">>",
    ">>>",
    "&",
    "|",
    "^",
    "!",
    "~",
    "&&",
    "||",
    "??",
    "?",
    ":",
    "=",
    "+=",
    "-=",
    "*=",
    "**=",
    "/=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "|=",
    "^=",
    "@"
  ],
  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[0-1]+(_+[0-1]+)*/,
  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
  regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
  regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [[/[{}]/, "delimiter.bracket"], { include: "common" }],
    common: [
      // identifiers and keywords
      [
        /#?[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier"
          }
        }
      ],
      [/[A-Z][\w\$]*/, "type.identifier"],
      // to show class names nicely
      // [/[A-Z][\w\$]*/, 'identifier'],
      // whitespace
      { include: "@whitespace" },
      // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
      [
        /\/(?=([^\\\/]|\\.)+\/([dgimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
        { token: "regexp", bracket: "@open", next: "@regexp" }
      ],
      // delimiters and operators
      [/[()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/!(?=([^=]|$))/, "delimiter"],
      [
        /@symbols/,
        {
          cases: {
            "@operators": "delimiter",
            "@default": ""
          }
        }
      ],
      // numbers
      [/(@digits)[eE]([\-+]?(@digits))?/, "number.float"],
      [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, "number.float"],
      [/0[xX](@hexdigits)n?/, "number.hex"],
      [/0[oO]?(@octaldigits)n?/, "number.octal"],
      [/0[bB](@binarydigits)n?/, "number.binary"],
      [/(@digits)n?/, "number"],
      // delimiter: after number because of .\d floats
      [/[;,.]/, "delimiter"],
      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      // non-teminated string
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      // non-teminated string
      [/"/, "string", "@string_double"],
      [/'/, "string", "@string_single"],
      [/`/, "string", "@string_backtick"]
    ],
    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"]
    ],
    comment: [
      [/[^\/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[\/*]/, "comment"]
    ],
    jsdoc: [
      [/[^\/*]+/, "comment.doc"],
      [/\*\//, "comment.doc", "@pop"],
      [/[\/*]/, "comment.doc"]
    ],
    // We match regular expression quite precisely
    regexp: [
      [
        /(\{)(\d+(?:,\d*)?)(\})/,
        ["regexp.escape.control", "regexp.escape.control", "regexp.escape.control"]
      ],
      [
        /(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,
        ["regexp.escape.control", { token: "regexp.escape.control", next: "@regexrange" }]
      ],
      [/(\()(\?:|\?=|\?!)/, ["regexp.escape.control", "regexp.escape.control"]],
      [/[()]/, "regexp.escape.control"],
      [/@regexpctl/, "regexp.escape.control"],
      [/[^\\\/]/, "regexp"],
      [/@regexpesc/, "regexp.escape"],
      [/\\\./, "regexp.invalid"],
      [/(\/)([dgimsuy]*)/, [{ token: "regexp", bracket: "@close", next: "@pop" }, "keyword.other"]]
    ],
    regexrange: [
      [/-/, "regexp.escape.control"],
      [/\^/, "regexp.invalid"],
      [/@regexpesc/, "regexp.escape"],
      [/[^\]]/, "regexp"],
      [
        /\]/,
        {
          token: "regexp.escape.control",
          next: "@pop",
          bracket: "@close"
        }
      ]
    ],
    string_double: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"]
    ],
    string_single: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, "string", "@pop"]
    ],
    string_backtick: [
      [/\$\{/, { token: "delimiter.bracket", next: "@bracketCounting" }],
      [/[^\\`$]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/`/, "string", "@pop"]
    ],
    bracketCounting: [
      [/\{/, "delimiter.bracket", "@bracketCounting"],
      [/\}/, "delimiter.bracket", "@pop"],
      { include: "common" }
    ]
  }
};




/***/ }

}]);