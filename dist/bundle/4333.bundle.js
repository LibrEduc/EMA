"use strict";
(self["webpackChunk_cBlockly"] = self["webpackChunk_cBlockly"] || []).push([[4333],{

/***/ 44333
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CompletionAdapter: () => (/* reexport */ lspLanguageFeatures/* CompletionAdapter */.gg),
  DefinitionAdapter: () => (/* reexport */ lspLanguageFeatures/* DefinitionAdapter */.FX),
  DiagnosticsAdapter: () => (/* reexport */ lspLanguageFeatures/* DiagnosticsAdapter */.E6),
  DocumentColorAdapter: () => (/* reexport */ lspLanguageFeatures/* DocumentColorAdapter */.Qc),
  DocumentFormattingEditProvider: () => (/* reexport */ lspLanguageFeatures/* DocumentFormattingEditProvider */._x),
  DocumentHighlightAdapter: () => (/* reexport */ lspLanguageFeatures/* DocumentHighlightAdapter */.Ts),
  DocumentLinkAdapter: () => (/* reexport */ lspLanguageFeatures/* DocumentLinkAdapter */.Jf),
  DocumentRangeFormattingEditProvider: () => (/* reexport */ lspLanguageFeatures/* DocumentRangeFormattingEditProvider */.NJ),
  DocumentSymbolAdapter: () => (/* reexport */ lspLanguageFeatures/* DocumentSymbolAdapter */.xv),
  FoldingRangeAdapter: () => (/* reexport */ lspLanguageFeatures/* FoldingRangeAdapter */.Gn),
  HoverAdapter: () => (/* reexport */ lspLanguageFeatures/* HoverAdapter */.QV),
  ReferenceAdapter: () => (/* reexport */ lspLanguageFeatures/* ReferenceAdapter */.LH),
  RenameAdapter: () => (/* reexport */ lspLanguageFeatures/* RenameAdapter */.Y6),
  SelectionRangeAdapter: () => (/* reexport */ lspLanguageFeatures/* SelectionRangeAdapter */.xs),
  WorkerManager: () => (/* reexport */ WorkerManager),
  fromPosition: () => (/* reexport */ lspLanguageFeatures/* fromPosition */.K3),
  fromRange: () => (/* reexport */ lspLanguageFeatures/* fromRange */.yT),
  getWorker: () => (/* binding */ getWorker),
  setupMode: () => (/* binding */ setupMode),
  toRange: () => (/* reexport */ lspLanguageFeatures/* toRange */.Xp),
  toTextEdit: () => (/* reexport */ lspLanguageFeatures/* toTextEdit */.Fv)
});

// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/common/workers.js
var workers = __webpack_require__(95545);
;// ./node_modules/monaco-editor/esm/vs/language/json/workerManager.js


const STOP_WHEN_IDLE_FOR = 2 * 60 * 1e3;
class WorkerManager {
  constructor(defaults) {
    this._defaults = defaults;
    this._worker = null;
    this._client = null;
    this._idleCheckInterval = window.setInterval(() => this._checkIfIdle(), 30 * 1e3);
    this._lastUsedTime = 0;
    this._configChangeListener = this._defaults.onDidChange(() => this._stopWorker());
  }
  _stopWorker() {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  }
  dispose() {
    clearInterval(this._idleCheckInterval);
    this._configChangeListener.dispose();
    this._stopWorker();
  }
  _checkIfIdle() {
    if (!this._worker) {
      return;
    }
    let timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  }
  _getClient() {
    this._lastUsedTime = Date.now();
    if (!this._client) {
      this._worker = (0,workers/* createWebWorker */.V)({
        // module that exports the create() method and returns a `JSONWorker` instance
        moduleId: "vs/language/json/jsonWorker",
        createWorker: () => new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(2184), __webpack_require__.b), { type: undefined }),
        label: this._defaults.languageId,
        // passed in to the create() method
        createData: {
          languageSettings: this._defaults.diagnosticsOptions,
          languageId: this._defaults.languageId,
          enableSchemaRequest: this._defaults.diagnosticsOptions.enableSchemaRequest
        }
      });
      this._client = this._worker.getProxy();
    }
    return this._client;
  }
  getLanguageServiceWorker(...resources) {
    let _client;
    return this._getClient().then((client) => {
      _client = client;
    }).then((_) => {
      if (this._worker) {
        return this._worker.withSyncedResources(resources);
      }
    }).then((_) => _client);
  }
}



// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/language/common/lspLanguageFeatures.js + 1 modules
var lspLanguageFeatures = __webpack_require__(65926);
;// ./node_modules/monaco-editor/esm/external/jsonc-parser/lib/esm/impl/scanner.js
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
function scanner_createScanner(text, ignoreTrivia = false) {
    const len = text.length;
    let pos = 0, value = '', tokenOffset = 0, token = 16 /* SyntaxKind.Unknown */, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0 /* ScanError.None */;
    function scanHexDigits(count, exact) {
        let digits = 0;
        let value = 0;
        while (digits < count || false) {
            let ch = text.charCodeAt(pos);
            if (ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */) {
                value = value * 16 + ch - 48 /* CharacterCodes._0 */;
            }
            else if (ch >= 65 /* CharacterCodes.A */ && ch <= 70 /* CharacterCodes.F */) {
                value = value * 16 + ch - 65 /* CharacterCodes.A */ + 10;
            }
            else if (ch >= 97 /* CharacterCodes.a */ && ch <= 102 /* CharacterCodes.f */) {
                value = value * 16 + ch - 97 /* CharacterCodes.a */ + 10;
            }
            else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            value = -1;
        }
        return value;
    }
    function setPosition(newPosition) {
        pos = newPosition;
        value = '';
        tokenOffset = 0;
        token = 16 /* SyntaxKind.Unknown */;
        scanError = 0 /* ScanError.None */;
    }
    function scanNumber() {
        let start = pos;
        if (text.charCodeAt(pos) === 48 /* CharacterCodes._0 */) {
            pos++;
        }
        else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === 46 /* CharacterCodes.dot */) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            else {
                scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                return text.substring(start, pos);
            }
        }
        let end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === 69 /* CharacterCodes.E */ || text.charCodeAt(pos) === 101 /* CharacterCodes.e */)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === 43 /* CharacterCodes.plus */ || text.charCodeAt(pos) === 45 /* CharacterCodes.minus */) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            }
            else {
                scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        let result = '', start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = 2 /* ScanError.UnexpectedEndOfString */;
                break;
            }
            const ch = text.charCodeAt(pos);
            if (ch === 34 /* CharacterCodes.doubleQuote */) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === 92 /* CharacterCodes.backslash */) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = 2 /* ScanError.UnexpectedEndOfString */;
                    break;
                }
                const ch2 = text.charCodeAt(pos++);
                switch (ch2) {
                    case 34 /* CharacterCodes.doubleQuote */:
                        result += '\"';
                        break;
                    case 92 /* CharacterCodes.backslash */:
                        result += '\\';
                        break;
                    case 47 /* CharacterCodes.slash */:
                        result += '/';
                        break;
                    case 98 /* CharacterCodes.b */:
                        result += '\b';
                        break;
                    case 102 /* CharacterCodes.f */:
                        result += '\f';
                        break;
                    case 110 /* CharacterCodes.n */:
                        result += '\n';
                        break;
                    case 114 /* CharacterCodes.r */:
                        result += '\r';
                        break;
                    case 116 /* CharacterCodes.t */:
                        result += '\t';
                        break;
                    case 117 /* CharacterCodes.u */:
                        const ch3 = scanHexDigits(4);
                        if (ch3 >= 0) {
                            result += String.fromCharCode(ch3);
                        }
                        else {
                            scanError = 4 /* ScanError.InvalidUnicode */;
                        }
                        break;
                    default:
                        scanError = 5 /* ScanError.InvalidEscapeCharacter */;
                }
                start = pos;
                continue;
            }
            if (ch >= 0 && ch <= 0x1f) {
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    scanError = 2 /* ScanError.UnexpectedEndOfString */;
                    break;
                }
                else {
                    scanError = 6 /* ScanError.InvalidCharacter */;
                    // mark as error but continue with string
                }
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = '';
        scanError = 0 /* ScanError.None */;
        tokenOffset = pos;
        lineStartOffset = lineNumber;
        prevTokenLineStartOffset = tokenLineStartOffset;
        if (pos >= len) {
            // at the end
            tokenOffset = len;
            return token = 17 /* SyntaxKind.EOF */;
        }
        let code = text.charCodeAt(pos);
        // trivia: whitespace
        if (isWhiteSpace(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhiteSpace(code));
            return token = 15 /* SyntaxKind.Trivia */;
        }
        // trivia: newlines
        if (isLineBreak(code)) {
            pos++;
            value += String.fromCharCode(code);
            if (code === 13 /* CharacterCodes.carriageReturn */ && text.charCodeAt(pos) === 10 /* CharacterCodes.lineFeed */) {
                pos++;
                value += '\n';
            }
            lineNumber++;
            tokenLineStartOffset = pos;
            return token = 14 /* SyntaxKind.LineBreakTrivia */;
        }
        switch (code) {
            // tokens: []{}:,
            case 123 /* CharacterCodes.openBrace */:
                pos++;
                return token = 1 /* SyntaxKind.OpenBraceToken */;
            case 125 /* CharacterCodes.closeBrace */:
                pos++;
                return token = 2 /* SyntaxKind.CloseBraceToken */;
            case 91 /* CharacterCodes.openBracket */:
                pos++;
                return token = 3 /* SyntaxKind.OpenBracketToken */;
            case 93 /* CharacterCodes.closeBracket */:
                pos++;
                return token = 4 /* SyntaxKind.CloseBracketToken */;
            case 58 /* CharacterCodes.colon */:
                pos++;
                return token = 6 /* SyntaxKind.ColonToken */;
            case 44 /* CharacterCodes.comma */:
                pos++;
                return token = 5 /* SyntaxKind.CommaToken */;
            // strings
            case 34 /* CharacterCodes.doubleQuote */:
                pos++;
                value = scanString();
                return token = 10 /* SyntaxKind.StringLiteral */;
            // comments
            case 47 /* CharacterCodes.slash */:
                const start = pos - 1;
                // Single-line comment
                if (text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = 12 /* SyntaxKind.LineCommentTrivia */;
                }
                // Multi-line comment
                if (text.charCodeAt(pos + 1) === 42 /* CharacterCodes.asterisk */) {
                    pos += 2;
                    const safeLength = len - 1; // For lookahead.
                    let commentClosed = false;
                    while (pos < safeLength) {
                        const ch = text.charCodeAt(pos);
                        if (ch === 42 /* CharacterCodes.asterisk */ && text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                        if (isLineBreak(ch)) {
                            if (ch === 13 /* CharacterCodes.carriageReturn */ && text.charCodeAt(pos) === 10 /* CharacterCodes.lineFeed */) {
                                pos++;
                            }
                            lineNumber++;
                            tokenLineStartOffset = pos;
                        }
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = 1 /* ScanError.UnexpectedEndOfComment */;
                    }
                    value = text.substring(start, pos);
                    return token = 13 /* SyntaxKind.BlockCommentTrivia */;
                }
                // just a single slash
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* SyntaxKind.Unknown */;
            // numbers
            case 45 /* CharacterCodes.minus */:
                value += String.fromCharCode(code);
                pos++;
                if (pos === len || !isDigit(text.charCodeAt(pos))) {
                    return token = 16 /* SyntaxKind.Unknown */;
                }
            // found a minus, followed by a number so
            // we fall through to proceed with scanning
            // numbers
            case 48 /* CharacterCodes._0 */:
            case 49 /* CharacterCodes._1 */:
            case 50 /* CharacterCodes._2 */:
            case 51 /* CharacterCodes._3 */:
            case 52 /* CharacterCodes._4 */:
            case 53 /* CharacterCodes._5 */:
            case 54 /* CharacterCodes._6 */:
            case 55 /* CharacterCodes._7 */:
            case 56 /* CharacterCodes._8 */:
            case 57 /* CharacterCodes._9 */:
                value += scanNumber();
                return token = 11 /* SyntaxKind.NumericLiteral */;
            // literals and unknown symbols
            default:
                // is a literal? Read the full word.
                while (pos < len && isUnknownContentCharacter(code)) {
                    pos++;
                    code = text.charCodeAt(pos);
                }
                if (tokenOffset !== pos) {
                    value = text.substring(tokenOffset, pos);
                    // keywords: true, false, null
                    switch (value) {
                        case 'true': return token = 8 /* SyntaxKind.TrueKeyword */;
                        case 'false': return token = 9 /* SyntaxKind.FalseKeyword */;
                        case 'null': return token = 7 /* SyntaxKind.NullKeyword */;
                    }
                    return token = 16 /* SyntaxKind.Unknown */;
                }
                // some
                value += String.fromCharCode(code);
                pos++;
                return token = 16 /* SyntaxKind.Unknown */;
        }
    }
    function isUnknownContentCharacter(code) {
        if (isWhiteSpace(code) || isLineBreak(code)) {
            return false;
        }
        switch (code) {
            case 125 /* CharacterCodes.closeBrace */:
            case 93 /* CharacterCodes.closeBracket */:
            case 123 /* CharacterCodes.openBrace */:
            case 91 /* CharacterCodes.openBracket */:
            case 34 /* CharacterCodes.doubleQuote */:
            case 58 /* CharacterCodes.colon */:
            case 44 /* CharacterCodes.comma */:
            case 47 /* CharacterCodes.slash */:
                return false;
        }
        return true;
    }
    function scanNextNonTrivia() {
        let result;
        do {
            result = scanNext();
        } while (result >= 12 /* SyntaxKind.LineCommentTrivia */ && result <= 15 /* SyntaxKind.Trivia */);
        return result;
    }
    return {
        setPosition: setPosition,
        getPosition: () => pos,
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: () => token,
        getTokenValue: () => value,
        getTokenOffset: () => tokenOffset,
        getTokenLength: () => pos - tokenOffset,
        getTokenStartLine: () => lineStartOffset,
        getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
        getTokenError: () => scanError,
    };
}
function isWhiteSpace(ch) {
    return ch === 32 /* CharacterCodes.space */ || ch === 9 /* CharacterCodes.tab */;
}
function isLineBreak(ch) {
    return ch === 10 /* CharacterCodes.lineFeed */ || ch === 13 /* CharacterCodes.carriageReturn */;
}
function isDigit(ch) {
    return ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */;
}
var CharacterCodes;
(function (CharacterCodes) {
    CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
    CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
    CharacterCodes[CharacterCodes["space"] = 32] = "space";
    CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
    CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
    CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
    CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
    CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
    CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
    CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
    CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
    CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
    CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
    CharacterCodes[CharacterCodes["a"] = 97] = "a";
    CharacterCodes[CharacterCodes["b"] = 98] = "b";
    CharacterCodes[CharacterCodes["c"] = 99] = "c";
    CharacterCodes[CharacterCodes["d"] = 100] = "d";
    CharacterCodes[CharacterCodes["e"] = 101] = "e";
    CharacterCodes[CharacterCodes["f"] = 102] = "f";
    CharacterCodes[CharacterCodes["g"] = 103] = "g";
    CharacterCodes[CharacterCodes["h"] = 104] = "h";
    CharacterCodes[CharacterCodes["i"] = 105] = "i";
    CharacterCodes[CharacterCodes["j"] = 106] = "j";
    CharacterCodes[CharacterCodes["k"] = 107] = "k";
    CharacterCodes[CharacterCodes["l"] = 108] = "l";
    CharacterCodes[CharacterCodes["m"] = 109] = "m";
    CharacterCodes[CharacterCodes["n"] = 110] = "n";
    CharacterCodes[CharacterCodes["o"] = 111] = "o";
    CharacterCodes[CharacterCodes["p"] = 112] = "p";
    CharacterCodes[CharacterCodes["q"] = 113] = "q";
    CharacterCodes[CharacterCodes["r"] = 114] = "r";
    CharacterCodes[CharacterCodes["s"] = 115] = "s";
    CharacterCodes[CharacterCodes["t"] = 116] = "t";
    CharacterCodes[CharacterCodes["u"] = 117] = "u";
    CharacterCodes[CharacterCodes["v"] = 118] = "v";
    CharacterCodes[CharacterCodes["w"] = 119] = "w";
    CharacterCodes[CharacterCodes["x"] = 120] = "x";
    CharacterCodes[CharacterCodes["y"] = 121] = "y";
    CharacterCodes[CharacterCodes["z"] = 122] = "z";
    CharacterCodes[CharacterCodes["A"] = 65] = "A";
    CharacterCodes[CharacterCodes["B"] = 66] = "B";
    CharacterCodes[CharacterCodes["C"] = 67] = "C";
    CharacterCodes[CharacterCodes["D"] = 68] = "D";
    CharacterCodes[CharacterCodes["E"] = 69] = "E";
    CharacterCodes[CharacterCodes["F"] = 70] = "F";
    CharacterCodes[CharacterCodes["G"] = 71] = "G";
    CharacterCodes[CharacterCodes["H"] = 72] = "H";
    CharacterCodes[CharacterCodes["I"] = 73] = "I";
    CharacterCodes[CharacterCodes["J"] = 74] = "J";
    CharacterCodes[CharacterCodes["K"] = 75] = "K";
    CharacterCodes[CharacterCodes["L"] = 76] = "L";
    CharacterCodes[CharacterCodes["M"] = 77] = "M";
    CharacterCodes[CharacterCodes["N"] = 78] = "N";
    CharacterCodes[CharacterCodes["O"] = 79] = "O";
    CharacterCodes[CharacterCodes["P"] = 80] = "P";
    CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
    CharacterCodes[CharacterCodes["R"] = 82] = "R";
    CharacterCodes[CharacterCodes["S"] = 83] = "S";
    CharacterCodes[CharacterCodes["T"] = 84] = "T";
    CharacterCodes[CharacterCodes["U"] = 85] = "U";
    CharacterCodes[CharacterCodes["V"] = 86] = "V";
    CharacterCodes[CharacterCodes["W"] = 87] = "W";
    CharacterCodes[CharacterCodes["X"] = 88] = "X";
    CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
    CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
    CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
    CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
    CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
    CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
    CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
    CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
    CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
    CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
    CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
    CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
    CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
    CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
    CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
    CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
    CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));



;// ./node_modules/monaco-editor/esm/external/jsonc-parser/lib/esm/impl/string-intern.js
const string_intern_cachedSpaces = new Array(20).fill(0).map((_, index) => {
    return ' '.repeat(index);
});
const maxCachedValues = 200;
const string_intern_cachedBreakLinesWithSpaces = {
    ' ': {
        '\n': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\n' + ' '.repeat(index);
        }),
        '\r': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\r' + ' '.repeat(index);
        }),
        '\r\n': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\r\n' + ' '.repeat(index);
        }),
    },
    '\t': {
        '\n': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\n' + '\t'.repeat(index);
        }),
        '\r': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\r' + '\t'.repeat(index);
        }),
        '\r\n': new Array(maxCachedValues).fill(0).map((_, index) => {
            return '\r\n' + '\t'.repeat(index);
        }),
    }
};
const string_intern_supportedEols = (/* unused pure expression or super */ null && (['\n', '\r', '\r\n']));



;// ./node_modules/monaco-editor/esm/external/jsonc-parser/lib/esm/impl/format.js



/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function format(documentText, range, options) {
    let initialIndentLevel;
    let formatText;
    let formatTextStart;
    let rangeStart;
    let rangeEnd;
    if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
            formatTextStart--;
        }
        let endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
            endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
    }
    else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
    }
    const eol = getEOL(options, documentText);
    const eolFastPathSupported = supportedEols.includes(eol);
    let numberLineBreaks = 0;
    let indentLevel = 0;
    let indentValue;
    if (options.insertSpaces) {
        indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
    }
    else {
        indentValue = '\t';
    }
    const indentType = indentValue === '\t' ? '\t' : ' ';
    let scanner = createScanner(formatText, false);
    let hasError = false;
    function newLinesAndIndent() {
        if (numberLineBreaks > 1) {
            return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
        }
        const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
        if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
            return eol + repeat(indentValue, initialIndentLevel + indentLevel);
        }
        if (amountOfSpaces <= 0) {
            return eol;
        }
        return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
    }
    function scanNext() {
        let token = scanner.scan();
        numberLineBreaks = 0;
        while (token === 15 /* SyntaxKind.Trivia */ || token === 14 /* SyntaxKind.LineBreakTrivia */) {
            if (token === 14 /* SyntaxKind.LineBreakTrivia */ && options.keepLines) {
                numberLineBreaks += 1;
            }
            else if (token === 14 /* SyntaxKind.LineBreakTrivia */) {
                numberLineBreaks = 1;
            }
            token = scanner.scan();
        }
        hasError = token === 16 /* SyntaxKind.Unknown */ || scanner.getTokenError() !== 0 /* ScanError.None */;
        return token;
    }
    const editOperations = [];
    function addEdit(text, startOffset, endOffset) {
        if (!hasError && (!range || (startOffset < rangeEnd && endOffset > rangeStart)) && documentText.substring(startOffset, endOffset) !== text) {
            editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
        }
    }
    let firstToken = scanNext();
    if (options.keepLines && numberLineBreaks > 0) {
        addEdit(repeat(eol, numberLineBreaks), 0, 0);
    }
    if (firstToken !== 17 /* SyntaxKind.EOF */) {
        let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        let initialIndent = (indentValue.length * initialIndentLevel < 20) && options.insertSpaces
            ? cachedSpaces[indentValue.length * initialIndentLevel]
            : repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
    }
    while (firstToken !== 17 /* SyntaxKind.EOF */) {
        let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        let secondToken = scanNext();
        let replaceContent = '';
        let needsLineBreak = false;
        while (numberLineBreaks === 0 && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
            let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
            firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            needsLineBreak = secondToken === 12 /* SyntaxKind.LineCommentTrivia */;
            replaceContent = needsLineBreak ? newLinesAndIndent() : '';
            secondToken = scanNext();
        }
        if (secondToken === 2 /* SyntaxKind.CloseBraceToken */) {
            if (firstToken !== 1 /* SyntaxKind.OpenBraceToken */) {
                indentLevel--;
            }
            if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1 /* SyntaxKind.OpenBraceToken */) {
                replaceContent = newLinesAndIndent();
            }
            else if (options.keepLines) {
                replaceContent = cachedSpaces[1];
            }
        }
        else if (secondToken === 4 /* SyntaxKind.CloseBracketToken */) {
            if (firstToken !== 3 /* SyntaxKind.OpenBracketToken */) {
                indentLevel--;
            }
            if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3 /* SyntaxKind.OpenBracketToken */) {
                replaceContent = newLinesAndIndent();
            }
            else if (options.keepLines) {
                replaceContent = cachedSpaces[1];
            }
        }
        else {
            switch (firstToken) {
                case 3 /* SyntaxKind.OpenBracketToken */:
                case 1 /* SyntaxKind.OpenBraceToken */:
                    indentLevel++;
                    if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
                        replaceContent = newLinesAndIndent();
                    }
                    else {
                        replaceContent = cachedSpaces[1];
                    }
                    break;
                case 5 /* SyntaxKind.CommaToken */:
                    if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
                        replaceContent = newLinesAndIndent();
                    }
                    else {
                        replaceContent = cachedSpaces[1];
                    }
                    break;
                case 12 /* SyntaxKind.LineCommentTrivia */:
                    replaceContent = newLinesAndIndent();
                    break;
                case 13 /* SyntaxKind.BlockCommentTrivia */:
                    if (numberLineBreaks > 0) {
                        replaceContent = newLinesAndIndent();
                    }
                    else if (!needsLineBreak) {
                        replaceContent = cachedSpaces[1];
                    }
                    break;
                case 6 /* SyntaxKind.ColonToken */:
                    if (options.keepLines && numberLineBreaks > 0) {
                        replaceContent = newLinesAndIndent();
                    }
                    else if (!needsLineBreak) {
                        replaceContent = cachedSpaces[1];
                    }
                    break;
                case 10 /* SyntaxKind.StringLiteral */:
                    if (options.keepLines && numberLineBreaks > 0) {
                        replaceContent = newLinesAndIndent();
                    }
                    else if (secondToken === 6 /* SyntaxKind.ColonToken */ && !needsLineBreak) {
                        replaceContent = '';
                    }
                    break;
                case 7 /* SyntaxKind.NullKeyword */:
                case 8 /* SyntaxKind.TrueKeyword */:
                case 9 /* SyntaxKind.FalseKeyword */:
                case 11 /* SyntaxKind.NumericLiteral */:
                case 2 /* SyntaxKind.CloseBraceToken */:
                case 4 /* SyntaxKind.CloseBracketToken */:
                    if (options.keepLines && numberLineBreaks > 0) {
                        replaceContent = newLinesAndIndent();
                    }
                    else {
                        if ((secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */) && !needsLineBreak) {
                            replaceContent = cachedSpaces[1];
                        }
                        else if (secondToken !== 5 /* SyntaxKind.CommaToken */ && secondToken !== 17 /* SyntaxKind.EOF */) {
                            hasError = true;
                        }
                    }
                    break;
                case 16 /* SyntaxKind.Unknown */:
                    hasError = true;
                    break;
            }
            if (numberLineBreaks > 0 && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                replaceContent = newLinesAndIndent();
            }
        }
        if (secondToken === 17 /* SyntaxKind.EOF */) {
            if (options.keepLines && numberLineBreaks > 0) {
                replaceContent = newLinesAndIndent();
            }
            else {
                replaceContent = options.insertFinalNewline ? eol : '';
            }
        }
        const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
    }
    return editOperations;
}
function repeat(s, count) {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += s;
    }
    return result;
}
function computeIndentLevel(content, options) {
    let i = 0;
    let nChars = 0;
    const tabSize = options.tabSize || 4;
    while (i < content.length) {
        let ch = content.charAt(i);
        if (ch === cachedSpaces[1]) {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
    for (let i = 0; i < text.length; i++) {
        const ch = text.charAt(i);
        if (ch === '\r') {
            if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                return '\r\n';
            }
            return '\r';
        }
        else if (ch === '\n') {
            return '\n';
        }
    }
    return (options && options.eol) || '\n';
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}



;// ./node_modules/monaco-editor/esm/external/jsonc-parser/lib/esm/impl/parser.js


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var ParseOptions;
(function (ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: false
    };
})(ParseOptions || (ParseOptions = {}));
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore always check the errors list to find out if the input was valid.
 */
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    function onValue(value) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        }
        else if (currentProperty !== null) {
            currentParent[currentProperty] = value;
        }
    }
    const visitor = {
        onObjectBegin: () => {
            const object = {};
            onValue(object);
            previousParents.push(currentParent);
            currentParent = object;
            currentProperty = null;
        },
        onObjectProperty: (name) => {
            currentProperty = name;
        },
        onObjectEnd: () => {
            currentParent = previousParents.pop();
        },
        onArrayBegin: () => {
            const array = [];
            onValue(array);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: () => {
            currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: (error, offset, length) => {
            errors.push({ error, offset, length });
        }
    };
    visit(text, visitor, options);
    return currentParent[0];
}
/**
 * Gets the JSON path of the given JSON DOM node
 */
function getNodePath(node) {
    if (!node.parent || !node.parent.children) {
        return [];
    }
    const path = getNodePath(node.parent);
    if (node.parent.type === 'property') {
        const key = node.parent.children[0].value;
        path.push(key);
    }
    else if (node.parent.type === 'array') {
        const index = node.parent.children.indexOf(node);
        if (index !== -1) {
            path.push(index);
        }
    }
    return path;
}
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
function getNodeValue(node) {
    switch (node.type) {
        case 'array':
            return node.children.map(getNodeValue);
        case 'object':
            const obj = Object.create(null);
            for (let prop of node.children) {
                const valueNode = prop.children[1];
                if (valueNode) {
                    obj[prop.children[0].value] = getNodeValue(valueNode);
                }
            }
            return obj;
        case 'null':
        case 'string':
        case 'number':
        case 'boolean':
            return node.value;
        default:
            return undefined;
    }
}
function contains(node, offset, includeRightBound = false) {
    return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
}
/**
 * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
function findNodeAtOffset(node, offset, includeRightBound = false) {
    if (contains(node, offset, includeRightBound)) {
        const children = node.children;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                const item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
function visit(text, visitor, options = ParseOptions.DEFAULT) {
    const _scanner = createScanner(text, false);
    // Important: Only pass copies of this to visitor functions to prevent accidental modification, and
    // to not affect visitor functions which stored a reference to a previous JSONPath
    const _jsonPath = [];
    function toNoArgVisit(visitFunction) {
        return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
    }
    function toNoArgVisitWithPath(visitFunction) {
        return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
    }
    function toOneArgVisit(visitFunction) {
        return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
    }
    function toOneArgVisitWithPath(visitFunction) {
        return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
    }
    const onObjectBegin = toNoArgVisitWithPath(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisitWithPath(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
    const disallowComments = options && options.disallowComments;
    const allowTrailingComma = options && options.allowTrailingComma;
    function scanNext() {
        while (true) {
            const token = _scanner.scan();
            switch (_scanner.getTokenError()) {
                case 4 /* ScanError.InvalidUnicode */:
                    handleError(14 /* ParseErrorCode.InvalidUnicode */);
                    break;
                case 5 /* ScanError.InvalidEscapeCharacter */:
                    handleError(15 /* ParseErrorCode.InvalidEscapeCharacter */);
                    break;
                case 3 /* ScanError.UnexpectedEndOfNumber */:
                    handleError(13 /* ParseErrorCode.UnexpectedEndOfNumber */);
                    break;
                case 1 /* ScanError.UnexpectedEndOfComment */:
                    if (!disallowComments) {
                        handleError(11 /* ParseErrorCode.UnexpectedEndOfComment */);
                    }
                    break;
                case 2 /* ScanError.UnexpectedEndOfString */:
                    handleError(12 /* ParseErrorCode.UnexpectedEndOfString */);
                    break;
                case 6 /* ScanError.InvalidCharacter */:
                    handleError(16 /* ParseErrorCode.InvalidCharacter */);
                    break;
            }
            switch (token) {
                case 12 /* SyntaxKind.LineCommentTrivia */:
                case 13 /* SyntaxKind.BlockCommentTrivia */:
                    if (disallowComments) {
                        handleError(10 /* ParseErrorCode.InvalidCommentToken */);
                    }
                    else {
                        onComment();
                    }
                    break;
                case 16 /* SyntaxKind.Unknown */:
                    handleError(1 /* ParseErrorCode.InvalidSymbol */);
                    break;
                case 15 /* SyntaxKind.Trivia */:
                case 14 /* SyntaxKind.LineBreakTrivia */:
                    break;
                default:
                    return token;
            }
        }
    }
    function handleError(error, skipUntilAfter = [], skipUntil = []) {
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
            let token = _scanner.getToken();
            while (token !== 17 /* SyntaxKind.EOF */) {
                if (skipUntilAfter.indexOf(token) !== -1) {
                    scanNext();
                    break;
                }
                else if (skipUntil.indexOf(token) !== -1) {
                    break;
                }
                token = scanNext();
            }
        }
    }
    function parseString(isValue) {
        const value = _scanner.getTokenValue();
        if (isValue) {
            onLiteralValue(value);
        }
        else {
            onObjectProperty(value);
            // add property name afterwards
            _jsonPath.push(value);
        }
        scanNext();
        return true;
    }
    function parseLiteral() {
        switch (_scanner.getToken()) {
            case 11 /* SyntaxKind.NumericLiteral */:
                const tokenValue = _scanner.getTokenValue();
                let value = Number(tokenValue);
                if (isNaN(value)) {
                    handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                    value = 0;
                }
                onLiteralValue(value);
                break;
            case 7 /* SyntaxKind.NullKeyword */:
                onLiteralValue(null);
                break;
            case 8 /* SyntaxKind.TrueKeyword */:
                onLiteralValue(true);
                break;
            case 9 /* SyntaxKind.FalseKeyword */:
                onLiteralValue(false);
                break;
            default:
                return false;
        }
        scanNext();
        return true;
    }
    function parseProperty() {
        if (_scanner.getToken() !== 10 /* SyntaxKind.StringLiteral */) {
            handleError(3 /* ParseErrorCode.PropertyNameExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            return false;
        }
        parseString(false);
        if (_scanner.getToken() === 6 /* SyntaxKind.ColonToken */) {
            onSeparator(':');
            scanNext(); // consume colon
            if (!parseValue()) {
                handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            }
        }
        else {
            handleError(5 /* ParseErrorCode.ColonExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
        }
        _jsonPath.pop(); // remove processed property name
        return true;
    }
    function parseObject() {
        onObjectBegin();
        scanNext(); // consume open brace
        let needsComma = false;
        while (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
            if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 2 /* SyntaxKind.CloseBraceToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
            }
            if (!parseProperty()) {
                handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            }
            needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */) {
            handleError(7 /* ParseErrorCode.CloseBraceExpected */, [2 /* SyntaxKind.CloseBraceToken */], []);
        }
        else {
            scanNext(); // consume close brace
        }
        return true;
    }
    function parseArray() {
        onArrayBegin();
        scanNext(); // consume open bracket
        let isFirstElement = true;
        let needsComma = false;
        while (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
            if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                if (!needsComma) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                }
                onSeparator(',');
                scanNext(); // consume comma
                if (_scanner.getToken() === 4 /* SyntaxKind.CloseBracketToken */ && allowTrailingComma) {
                    break;
                }
            }
            else if (needsComma) {
                handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
            }
            if (isFirstElement) {
                _jsonPath.push(0);
                isFirstElement = false;
            }
            else {
                _jsonPath[_jsonPath.length - 1]++;
            }
            if (!parseValue()) {
                handleError(4 /* ParseErrorCode.ValueExpected */, [], [4 /* SyntaxKind.CloseBracketToken */, 5 /* SyntaxKind.CommaToken */]);
            }
            needsComma = true;
        }
        onArrayEnd();
        if (!isFirstElement) {
            _jsonPath.pop(); // remove array index
        }
        if (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */) {
            handleError(8 /* ParseErrorCode.CloseBracketExpected */, [4 /* SyntaxKind.CloseBracketToken */], []);
        }
        else {
            scanNext(); // consume close bracket
        }
        return true;
    }
    function parseValue() {
        switch (_scanner.getToken()) {
            case 3 /* SyntaxKind.OpenBracketToken */:
                return parseArray();
            case 1 /* SyntaxKind.OpenBraceToken */:
                return parseObject();
            case 10 /* SyntaxKind.StringLiteral */:
                return parseString(true);
            default:
                return parseLiteral();
        }
    }
    scanNext();
    if (_scanner.getToken() === 17 /* SyntaxKind.EOF */) {
        if (options.allowEmptyContent) {
            return true;
        }
        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
        return false;
    }
    if (!parseValue()) {
        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
        return false;
    }
    if (_scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
        handleError(9 /* ParseErrorCode.EndOfFileExpected */, [], []);
    }
    return true;
}



;// ./node_modules/monaco-editor/esm/external/jsonc-parser/lib/esm/main.js




/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Creates a JSON scanner on the given text.
 * If ignoreTrivia is set, whitespaces or comments are ignored.
 */
const main_createScanner = scanner_createScanner;
var ScanError;
(function (ScanError) {
    ScanError[ScanError["None"] = 0] = "None";
    ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
    ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
    ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
    ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
    ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
    ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function (SyntaxKind) {
    SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
    SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
    SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
    SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
    SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
    SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
    SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
    SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
    SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
    SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
    SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
    SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
    SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
    SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
    SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
    SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
    SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore, always check the errors list to find out if the input was valid.
 */
const main_parse = (/* unused pure expression or super */ null && (parse$1));
/**
 * Finds the innermost node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
 */
const main_findNodeAtOffset = (/* unused pure expression or super */ null && (findNodeAtOffset$1));
/**
 * Gets the JSON path of the given JSON DOM node
 */
const main_getNodePath = (/* unused pure expression or super */ null && (getNodePath$1));
/**
 * Evaluates the JavaScript object of the given JSON DOM node
 */
const main_getNodeValue = (/* unused pure expression or super */ null && (getNodeValue$1));
var ParseErrorCode;
(function (ParseErrorCode) {
    ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
    ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
    ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
    ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
    ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
    ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
    ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
    ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
    ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
    ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
    ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
    ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
    ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
    ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
/**
 * Computes the edit operations needed to format a JSON document.
 *
 * @param documentText The input text
 * @param range The range to format or `undefined` to format the full content
 * @param options The formatting options
 * @returns The edit operations describing the formatting changes to the original document following the format described in {@linkcode EditResult}.
 * To apply the edit operations to the input, use {@linkcode applyEdits}.
 */
function main_format(documentText, range, options) {
    return format$1(documentText, range, options);
}



;// ./node_modules/monaco-editor/esm/vs/language/json/tokenization.js


function createTokenizationSupport(supportComments) {
  return {
    getInitialState: () => new JSONState(null, null, false, null),
    tokenize: (line, state) => tokenize(supportComments, line, state)
  };
}
const TOKEN_DELIM_OBJECT = "delimiter.bracket.json";
const TOKEN_DELIM_ARRAY = "delimiter.array.json";
const TOKEN_DELIM_COLON = "delimiter.colon.json";
const TOKEN_DELIM_COMMA = "delimiter.comma.json";
const TOKEN_VALUE_BOOLEAN = "keyword.json";
const TOKEN_VALUE_NULL = "keyword.json";
const TOKEN_VALUE_STRING = "string.value.json";
const TOKEN_VALUE_NUMBER = "number.json";
const TOKEN_PROPERTY_NAME = "string.key.json";
const TOKEN_COMMENT_BLOCK = "comment.block.json";
const TOKEN_COMMENT_LINE = "comment.line.json";
class ParentsStack {
  constructor(parent, type) {
    this.parent = parent;
    this.type = type;
  }
  static pop(parents) {
    if (parents) {
      return parents.parent;
    }
    return null;
  }
  static push(parents, type) {
    return new ParentsStack(parents, type);
  }
  static equals(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    while (a && b) {
      if (a === b) {
        return true;
      }
      if (a.type !== b.type) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    }
    return true;
  }
}
class JSONState {
  constructor(state, scanError, lastWasColon, parents) {
    this._state = state;
    this.scanError = scanError;
    this.lastWasColon = lastWasColon;
    this.parents = parents;
  }
  clone() {
    return new JSONState(this._state, this.scanError, this.lastWasColon, this.parents);
  }
  equals(other) {
    if (other === this) {
      return true;
    }
    if (!other || !(other instanceof JSONState)) {
      return false;
    }
    return this.scanError === other.scanError && this.lastWasColon === other.lastWasColon && ParentsStack.equals(this.parents, other.parents);
  }
  getStateData() {
    return this._state;
  }
  setStateData(state) {
    this._state = state;
  }
}
function tokenize(comments, line, state, offsetDelta = 0) {
  let numberOfInsertedCharacters = 0;
  let adjustOffset = false;
  switch (state.scanError) {
    case 2 /* UnexpectedEndOfString */:
      line = '"' + line;
      numberOfInsertedCharacters = 1;
      break;
    case 1 /* UnexpectedEndOfComment */:
      line = "/*" + line;
      numberOfInsertedCharacters = 2;
      break;
  }
  const scanner = main_createScanner(line);
  let lastWasColon = state.lastWasColon;
  let parents = state.parents;
  const ret = {
    tokens: [],
    endState: state.clone()
  };
  while (true) {
    let offset = offsetDelta + scanner.getPosition();
    let type = "";
    const kind = scanner.scan();
    if (kind === 17 /* EOF */) {
      break;
    }
    if (offset === offsetDelta + scanner.getPosition()) {
      throw new Error(
        "Scanner did not advance, next 3 characters are: " + line.substr(scanner.getPosition(), 3)
      );
    }
    if (adjustOffset) {
      offset -= numberOfInsertedCharacters;
    }
    adjustOffset = numberOfInsertedCharacters > 0;
    switch (kind) {
      case 1 /* OpenBraceToken */:
        parents = ParentsStack.push(parents, 0 /* Object */);
        type = TOKEN_DELIM_OBJECT;
        lastWasColon = false;
        break;
      case 2 /* CloseBraceToken */:
        parents = ParentsStack.pop(parents);
        type = TOKEN_DELIM_OBJECT;
        lastWasColon = false;
        break;
      case 3 /* OpenBracketToken */:
        parents = ParentsStack.push(parents, 1 /* Array */);
        type = TOKEN_DELIM_ARRAY;
        lastWasColon = false;
        break;
      case 4 /* CloseBracketToken */:
        parents = ParentsStack.pop(parents);
        type = TOKEN_DELIM_ARRAY;
        lastWasColon = false;
        break;
      case 6 /* ColonToken */:
        type = TOKEN_DELIM_COLON;
        lastWasColon = true;
        break;
      case 5 /* CommaToken */:
        type = TOKEN_DELIM_COMMA;
        lastWasColon = false;
        break;
      case 8 /* TrueKeyword */:
      case 9 /* FalseKeyword */:
        type = TOKEN_VALUE_BOOLEAN;
        lastWasColon = false;
        break;
      case 7 /* NullKeyword */:
        type = TOKEN_VALUE_NULL;
        lastWasColon = false;
        break;
      case 10 /* StringLiteral */:
        const currentParent = parents ? parents.type : 0 /* Object */;
        const inArray = currentParent === 1 /* Array */;
        type = lastWasColon || inArray ? TOKEN_VALUE_STRING : TOKEN_PROPERTY_NAME;
        lastWasColon = false;
        break;
      case 11 /* NumericLiteral */:
        type = TOKEN_VALUE_NUMBER;
        lastWasColon = false;
        break;
    }
    {
      switch (kind) {
        case 12 /* LineCommentTrivia */:
          type = TOKEN_COMMENT_LINE;
          break;
        case 13 /* BlockCommentTrivia */:
          type = TOKEN_COMMENT_BLOCK;
          break;
      }
    }
    ret.endState = new JSONState(
      state.getStateData(),
      scanner.getTokenError(),
      lastWasColon,
      parents
    );
    ret.tokens.push({
      startIndex: offset,
      scopes: type
    });
  }
  return ret;
}



// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/browser/coreCommands.js + 1 modules
var coreCommands = __webpack_require__(72521);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/browser/widget/codeEditor/codeEditorWidget.js + 111 modules
var codeEditorWidget = __webpack_require__(83683);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/browser/widget/diffEditor/diffEditor.contribution.js + 1 modules
var diffEditor_contribution = __webpack_require__(35143);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/anchorSelect/browser/anchorSelect.js + 1 modules
var anchorSelect = __webpack_require__(99594);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js + 1 modules
var bracketMatching = __webpack_require__(21283);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js + 1 modules
var caretOperations = __webpack_require__(22498);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/caretOperations/browser/transpose.js
var transpose = __webpack_require__(86302);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js + 1 modules
var clipboard = __webpack_require__(15611);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/codeAction/browser/codeActionContributions.js + 1 modules
var codeActionContributions = __webpack_require__(70446);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/codelens/browser/codelensController.js + 4 modules
var codelensController = __webpack_require__(62828);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/colorPicker/browser/colorPickerContribution.js + 5 modules
var colorPickerContribution = __webpack_require__(43067);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js + 2 modules
var comment = __webpack_require__(72106);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js
var contextmenu = __webpack_require__(75368);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js
var cursorUndo = __webpack_require__(23676);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js + 2 modules
var dnd = __webpack_require__(23542);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js
var copyPasteContribution = __webpack_require__(52387);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js + 3 modules
var dropIntoEditorContribution = __webpack_require__(47738);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/find/browser/findController.js + 5 modules
var findController = __webpack_require__(65789);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js + 2 modules
var folding = __webpack_require__(97157);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/fontZoom/browser/fontZoom.js
var fontZoom = __webpack_require__(55600);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js
var formatActions = __webpack_require__(36847);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/documentSymbols.js
var documentSymbols = __webpack_require__(56096);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js + 53 modules
var inlineCompletions_contribution = __webpack_require__(31270);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/inlineProgress/browser/inlineProgress.js + 1 modules
var inlineProgress = __webpack_require__(21095);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/goToCommands.js + 1 modules
var goToCommands = __webpack_require__(95976);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js + 1 modules
var goToDefinitionAtPosition = __webpack_require__(68128);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/gotoError/browser/gotoError.js + 5 modules
var gotoError = __webpack_require__(39954);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/gpu/browser/gpuActions.js
var gpuActions = __webpack_require__(22217);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution.js + 5 modules
var hoverContribution = __webpack_require__(32263);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js + 1 modules
var indentation = __webpack_require__(88407);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js
var inlayHintsContribution = __webpack_require__(14544);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js + 2 modules
var inPlaceReplace = __webpack_require__(71278);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/insertFinalNewLine/browser/insertFinalNewLine.js + 1 modules
var insertFinalNewLine = __webpack_require__(90540);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/lineSelection/browser/lineSelection.js
var lineSelection = __webpack_require__(91064);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js + 4 modules
var linesOperations = __webpack_require__(43634);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/linkedEditing/browser/linkedEditing.js + 1 modules
var linkedEditing = __webpack_require__(66473);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/links/browser/links.js + 2 modules
var links = __webpack_require__(60746);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.js
var longLinesHelper = __webpack_require__(55992);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/middleScroll/browser/middleScroll.contribution.js + 2 modules
var middleScroll_contribution = __webpack_require__(19479);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js
var multicursor = __webpack_require__(74984);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js + 4 modules
var parameterHints = __webpack_require__(32029);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.js + 3 modules
var placeholderText_contribution = __webpack_require__(14807);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/rename/browser/rename.js + 2 modules
var rename = __webpack_require__(16426);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.js
var sectionHeaders = __webpack_require__(56446);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.js
var documentSemanticTokens = __webpack_require__(64302);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.js
var viewportSemanticTokens = __webpack_require__(25110);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/smartSelect/browser/smartSelect.js + 1 modules
var smartSelect = __webpack_require__(33432);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2.js
var snippetController2 = __webpack_require__(50960);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.js + 1 modules
var stickyScrollContribution = __webpack_require__(43117);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js + 10 modules
var suggestController = __webpack_require__(59198);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestInlineCompletions.js
var suggestInlineCompletions = __webpack_require__(1302);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js
var tokenization = __webpack_require__(32526);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js
var toggleTabFocusMode = __webpack_require__(1184);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.js + 5 modules
var unicodeHighlighter = __webpack_require__(80654);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js
var unusualLineTerminators = __webpack_require__(98690);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js + 1 modules
var wordHighlighter = __webpack_require__(36887);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js
var wordOperations = __webpack_require__(21600);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.js
var wordPartOperations = __webpack_require__(51302);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/readOnlyMessage/browser/contribution.js
var contribution = __webpack_require__(36651);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.js
var browser_contribution = __webpack_require__(94184);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/contrib/floatingMenu/browser/floatingMenu.contribution.js + 2 modules
var floatingMenu_contribution = __webpack_require__(58526);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/common/standaloneStrings.js
var standaloneStrings = __webpack_require__(45933);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css
var codicon = __webpack_require__(63470);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon-modifiers.css
var codicon_modifiers = __webpack_require__(74639);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js + 1 modules
var iPadShowKeyboard = __webpack_require__(24185);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js + 1 modules
var inspectTokens = __webpack_require__(21845);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js + 1 modules
var standaloneHelpQuickAccess = __webpack_require__(84253);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js + 1 modules
var standaloneGotoLineQuickAccess = __webpack_require__(94806);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js + 2 modules
var standaloneGotoSymbolQuickAccess = __webpack_require__(1722);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js + 5 modules
var standaloneCommandsQuickAccess = __webpack_require__(85222);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js
var standaloneReferenceSearch = __webpack_require__(73817);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js
var toggleHighContrast = __webpack_require__(16706);
// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/editor/editor.api2.js + 93 modules
var editor_api2 = __webpack_require__(34819);
;// ./node_modules/monaco-editor/esm/vs/language/json/jsonMode.js














































































let worker;
function getWorker() {
  return new Promise((resolve, reject) => {
    if (!worker) {
      return reject("JSON not registered!");
    }
    resolve(worker);
  });
}
class JSONDiagnosticsAdapter extends lspLanguageFeatures/* DiagnosticsAdapter */.E6 {
  constructor(languageId, worker2, defaults) {
    super(languageId, worker2, defaults.onDidChange);
    this._disposables.push(
      editor_api2.editor.onWillDisposeModel((model) => {
        this._resetSchema(model.uri);
      })
    );
    this._disposables.push(
      editor_api2.editor.onDidChangeModelLanguage((event) => {
        this._resetSchema(event.model.uri);
      })
    );
  }
  _resetSchema(resource) {
    this._worker().then((worker2) => {
      worker2.resetSchema(resource.toString());
    });
  }
}
function setupMode(defaults) {
  const disposables = [];
  const providers = [];
  const client = new WorkerManager(defaults);
  disposables.push(client);
  worker = (...uris) => {
    return client.getLanguageServiceWorker(...uris);
  };
  function registerProviders() {
    const { languageId, modeConfiguration: modeConfiguration2 } = defaults;
    disposeAll(providers);
    if (modeConfiguration2.documentFormattingEdits) {
      providers.push(
        editor_api2.languages.registerDocumentFormattingEditProvider(
          languageId,
          new lspLanguageFeatures/* DocumentFormattingEditProvider */._x(worker)
        )
      );
    }
    if (modeConfiguration2.documentRangeFormattingEdits) {
      providers.push(
        editor_api2.languages.registerDocumentRangeFormattingEditProvider(
          languageId,
          new lspLanguageFeatures/* DocumentRangeFormattingEditProvider */.NJ(worker)
        )
      );
    }
    if (modeConfiguration2.completionItems) {
      providers.push(
        editor_api2.languages.registerCompletionItemProvider(
          languageId,
          new lspLanguageFeatures/* CompletionAdapter */.gg(worker, [" ", ":", '"'])
        )
      );
    }
    if (modeConfiguration2.hovers) {
      providers.push(
        editor_api2.languages.registerHoverProvider(languageId, new lspLanguageFeatures/* HoverAdapter */.QV(worker))
      );
    }
    if (modeConfiguration2.documentSymbols) {
      providers.push(
        editor_api2.languages.registerDocumentSymbolProvider(
          languageId,
          new lspLanguageFeatures/* DocumentSymbolAdapter */.xv(worker)
        )
      );
    }
    if (modeConfiguration2.tokens) {
      providers.push(editor_api2.languages.setTokensProvider(languageId, createTokenizationSupport(true)));
    }
    if (modeConfiguration2.colors) {
      providers.push(
        editor_api2.languages.registerColorProvider(
          languageId,
          new lspLanguageFeatures/* DocumentColorAdapter */.Qc(worker)
        )
      );
    }
    if (modeConfiguration2.foldingRanges) {
      providers.push(
        editor_api2.languages.registerFoldingRangeProvider(
          languageId,
          new lspLanguageFeatures/* FoldingRangeAdapter */.Gn(worker)
        )
      );
    }
    if (modeConfiguration2.diagnostics) {
      providers.push(new JSONDiagnosticsAdapter(languageId, worker, defaults));
    }
    if (modeConfiguration2.selectionRanges) {
      providers.push(
        editor_api2.languages.registerSelectionRangeProvider(
          languageId,
          new lspLanguageFeatures/* SelectionRangeAdapter */.xs(worker)
        )
      );
    }
  }
  registerProviders();
  disposables.push(editor_api2.languages.setLanguageConfiguration(defaults.languageId, richEditConfiguration));
  let modeConfiguration = defaults.modeConfiguration;
  defaults.onDidChange((newDefaults) => {
    if (newDefaults.modeConfiguration !== modeConfiguration) {
      modeConfiguration = newDefaults.modeConfiguration;
      registerProviders();
    }
  });
  disposables.push(asDisposable(providers));
  return asDisposable(disposables);
}
function asDisposable(disposables) {
  return { dispose: () => disposeAll(disposables) };
}
function disposeAll(disposables) {
  while (disposables.length) {
    disposables.pop().dispose();
  }
}
const richEditConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [
    ["{", "}"],
    ["[", "]"]
  ],
  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string"] },
    { open: "[", close: "]", notIn: ["string"] },
    { open: '"', close: '"', notIn: ["string"] }
  ]
};




/***/ }

}]);