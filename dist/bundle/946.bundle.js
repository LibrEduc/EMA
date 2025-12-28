"use strict";
(self["webpackChunk_cBlockly"] = self["webpackChunk_cBlockly"] || []).push([[946],{

/***/ 80946
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










































































const EMPTY_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
const conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
  comments: {
    blockComment: ["<!--", "-->"]
  },
  brackets: [
    ["<!--", "-->"],
    ["<", ">"],
    ["{", "}"],
    ["(", ")"]
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "<", close: ">" }
  ],
  onEnterRules: [
    {
      beforeText: new RegExp(
        `<(?!(?:${EMPTY_ELEMENTS.join("|")}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
        "i"
      ),
      afterText: /^<\/(\w[\w\d]*)\s*>$/i,
      action: {
        indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.IndentOutdent
      }
    },
    {
      beforeText: new RegExp(
        `<(?!(?:${EMPTY_ELEMENTS.join("|")}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
        "i"
      ),
      action: { indentAction: _editor_editor_api2_js__WEBPACK_IMPORTED_MODULE_72__.languages.IndentAction.Indent }
    }
  ]
};
const language = {
  defaultToken: "",
  tokenPostfix: "",
  // ignoreCase: true,
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      [/@@@@/],
      // text
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.root" }],
      [/<!DOCTYPE/, "metatag.html", "@doctype"],
      [/<!--/, "comment.html", "@comment"],
      [/(<)([\w\-]+)(\/>)/, ["delimiter.html", "tag.html", "delimiter.html"]],
      [/(<)(script)/, ["delimiter.html", { token: "tag.html", next: "@script" }]],
      [/(<)(style)/, ["delimiter.html", { token: "tag.html", next: "@style" }]],
      [/(<)([:\w\-]+)/, ["delimiter.html", { token: "tag.html", next: "@otherTag" }]],
      [/(<\/)([\w\-]+)/, ["delimiter.html", { token: "tag.html", next: "@otherTag" }]],
      [/</, "delimiter.html"],
      [/[ \t\r\n]+/],
      // whitespace
      [/[^<@]+/]
      // text
    ],
    doctype: [
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.comment" }],
      [/[^>]+/, "metatag.content.html"],
      [/>/, "metatag.html", "@pop"]
    ],
    comment: [
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.comment" }],
      [/-->/, "comment.html", "@pop"],
      [/[^-]+/, "comment.content.html"],
      [/./, "comment.content.html"]
    ],
    otherTag: [
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.otherTag" }],
      [/\/?>/, "delimiter.html", "@pop"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w\-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/]
      // whitespace
    ],
    // -- BEGIN <script> tags handling
    // After <script
    script: [
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.script" }],
      [/type/, "attribute.name", "@scriptAfterType"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w\-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@scriptEmbedded.text/javascript",
          nextEmbedded: "text/javascript"
        }
      ],
      [/[ \t\r\n]+/],
      // whitespace
      [
        /(<\/)(script\s*)(>)/,
        ["delimiter.html", "tag.html", { token: "delimiter.html", next: "@pop" }]
      ]
    ],
    // After <script ... type
    scriptAfterType: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.scriptAfterType"
        }
      ],
      [/=/, "delimiter", "@scriptAfterTypeEquals"],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@scriptEmbedded.text/javascript",
          nextEmbedded: "text/javascript"
        }
      ],
      // cover invalid e.g. <script type>
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    // After <script ... type =
    scriptAfterTypeEquals: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.scriptAfterTypeEquals"
        }
      ],
      [
        /"([^"]*)"/,
        {
          token: "attribute.value",
          switchTo: "@scriptWithCustomType.$1"
        }
      ],
      [
        /'([^']*)'/,
        {
          token: "attribute.value",
          switchTo: "@scriptWithCustomType.$1"
        }
      ],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@scriptEmbedded.text/javascript",
          nextEmbedded: "text/javascript"
        }
      ],
      // cover invalid e.g. <script type=>
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    // After <script ... type = $S2
    scriptWithCustomType: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.scriptWithCustomType.$S2"
        }
      ],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@scriptEmbedded.$S2",
          nextEmbedded: "$S2"
        }
      ],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w\-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    scriptEmbedded: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInEmbeddedState.scriptEmbedded.$S2",
          nextEmbedded: "@pop"
        }
      ],
      [/<\/script/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }]
    ],
    // -- END <script> tags handling
    // -- BEGIN <style> tags handling
    // After <style
    style: [
      [/@[^@]/, { token: "@rematch", switchTo: "@razorInSimpleState.style" }],
      [/type/, "attribute.name", "@styleAfterType"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w\-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@styleEmbedded.text/css",
          nextEmbedded: "text/css"
        }
      ],
      [/[ \t\r\n]+/],
      // whitespace
      [
        /(<\/)(style\s*)(>)/,
        ["delimiter.html", "tag.html", { token: "delimiter.html", next: "@pop" }]
      ]
    ],
    // After <style ... type
    styleAfterType: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.styleAfterType"
        }
      ],
      [/=/, "delimiter", "@styleAfterTypeEquals"],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@styleEmbedded.text/css",
          nextEmbedded: "text/css"
        }
      ],
      // cover invalid e.g. <style type>
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    // After <style ... type =
    styleAfterTypeEquals: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.styleAfterTypeEquals"
        }
      ],
      [
        /"([^"]*)"/,
        {
          token: "attribute.value",
          switchTo: "@styleWithCustomType.$1"
        }
      ],
      [
        /'([^']*)'/,
        {
          token: "attribute.value",
          switchTo: "@styleWithCustomType.$1"
        }
      ],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@styleEmbedded.text/css",
          nextEmbedded: "text/css"
        }
      ],
      // cover invalid e.g. <style type=>
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    // After <style ... type = $S2
    styleWithCustomType: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInSimpleState.styleWithCustomType.$S2"
        }
      ],
      [
        />/,
        {
          token: "delimiter.html",
          next: "@styleEmbedded.$S2",
          nextEmbedded: "$S2"
        }
      ],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w\-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/],
      // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],
    styleEmbedded: [
      [
        /@[^@]/,
        {
          token: "@rematch",
          switchTo: "@razorInEmbeddedState.styleEmbedded.$S2",
          nextEmbedded: "@pop"
        }
      ],
      [/<\/style/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }]
    ],
    // -- END <style> tags handling
    razorInSimpleState: [
      [/@\*/, "comment.cs", "@razorBlockCommentTopLevel"],
      [/@[{(]/, "metatag.cs", "@razorRootTopLevel"],
      [/(@)(\s*[\w]+)/, ["metatag.cs", { token: "identifier.cs", switchTo: "@$S2.$S3" }]],
      [/[})]/, { token: "metatag.cs", switchTo: "@$S2.$S3" }],
      [/\*@/, { token: "comment.cs", switchTo: "@$S2.$S3" }]
    ],
    razorInEmbeddedState: [
      [/@\*/, "comment.cs", "@razorBlockCommentTopLevel"],
      [/@[{(]/, "metatag.cs", "@razorRootTopLevel"],
      [
        /(@)(\s*[\w]+)/,
        [
          "metatag.cs",
          {
            token: "identifier.cs",
            switchTo: "@$S2.$S3",
            nextEmbedded: "$S3"
          }
        ]
      ],
      [
        /[})]/,
        {
          token: "metatag.cs",
          switchTo: "@$S2.$S3",
          nextEmbedded: "$S3"
        }
      ],
      [
        /\*@/,
        {
          token: "comment.cs",
          switchTo: "@$S2.$S3",
          nextEmbedded: "$S3"
        }
      ]
    ],
    razorBlockCommentTopLevel: [
      [/\*@/, "@rematch", "@pop"],
      [/[^*]+/, "comment.cs"],
      [/./, "comment.cs"]
    ],
    razorBlockComment: [
      [/\*@/, "comment.cs", "@pop"],
      [/[^*]+/, "comment.cs"],
      [/./, "comment.cs"]
    ],
    razorRootTopLevel: [
      [/\{/, "delimiter.bracket.cs", "@razorRoot"],
      [/\(/, "delimiter.parenthesis.cs", "@razorRoot"],
      [/[})]/, "@rematch", "@pop"],
      { include: "razorCommon" }
    ],
    razorRoot: [
      [/\{/, "delimiter.bracket.cs", "@razorRoot"],
      [/\(/, "delimiter.parenthesis.cs", "@razorRoot"],
      [/\}/, "delimiter.bracket.cs", "@pop"],
      [/\)/, "delimiter.parenthesis.cs", "@pop"],
      { include: "razorCommon" }
    ],
    razorCommon: [
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@razorKeywords": { token: "keyword.cs" },
            "@default": "identifier.cs"
          }
        }
      ],
      // brackets
      [/[\[\]]/, "delimiter.array.cs"],
      // whitespace
      [/[ \t\r\n]+/],
      // comments
      [/\/\/.*$/, "comment.cs"],
      [/@\*/, "comment.cs", "@razorBlockComment"],
      // strings
      [/"([^"]*)"/, "string.cs"],
      [/'([^']*)'/, "string.cs"],
      // simple html
      [/(<)([\w\-]+)(\/>)/, ["delimiter.html", "tag.html", "delimiter.html"]],
      [/(<)([\w\-]+)(>)/, ["delimiter.html", "tag.html", "delimiter.html"]],
      [/(<\/)([\w\-]+)(>)/, ["delimiter.html", "tag.html", "delimiter.html"]],
      // delimiters
      [/[\+\-\*\%\&\|\^\~\!\=\<\>\/\?\;\:\.\,]/, "delimiter.cs"],
      // numbers
      [/\d*\d+[eE]([\-+]?\d+)?/, "number.float.cs"],
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float.cs"],
      [/0[xX][0-9a-fA-F']*[0-9a-fA-F]/, "number.hex.cs"],
      [/0[0-7']*[0-7]/, "number.octal.cs"],
      [/0[bB][0-1']*[0-1]/, "number.binary.cs"],
      [/\d[\d']*/, "number.cs"],
      [/\d/, "number.cs"]
    ]
  },
  razorKeywords: [
    "abstract",
    "as",
    "async",
    "await",
    "base",
    "bool",
    "break",
    "by",
    "byte",
    "case",
    "catch",
    "char",
    "checked",
    "class",
    "const",
    "continue",
    "decimal",
    "default",
    "delegate",
    "do",
    "double",
    "descending",
    "explicit",
    "event",
    "extern",
    "else",
    "enum",
    "false",
    "finally",
    "fixed",
    "float",
    "for",
    "foreach",
    "from",
    "goto",
    "group",
    "if",
    "implicit",
    "in",
    "int",
    "interface",
    "internal",
    "into",
    "is",
    "lock",
    "long",
    "nameof",
    "new",
    "null",
    "namespace",
    "object",
    "operator",
    "out",
    "override",
    "orderby",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "ref",
    "return",
    "switch",
    "struct",
    "sbyte",
    "sealed",
    "short",
    "sizeof",
    "stackalloc",
    "static",
    "string",
    "select",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "uint",
    "ulong",
    "unchecked",
    "unsafe",
    "ushort",
    "using",
    "var",
    "virtual",
    "volatile",
    "void",
    "when",
    "while",
    "where",
    "yield",
    "model",
    "inject"
    // Razor specific
  ],
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/
};




/***/ }

}]);