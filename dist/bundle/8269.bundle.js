"use strict";
(self["webpackChunk_cBlockly"] = self["webpackChunk_cBlockly"] || []).push([[8269],{

/***/ 8269
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
  setupMode: () => (/* binding */ setupMode),
  setupMode1: () => (/* binding */ setupMode1),
  toRange: () => (/* reexport */ lspLanguageFeatures/* toRange */.Xp),
  toTextEdit: () => (/* reexport */ lspLanguageFeatures/* toTextEdit */.Fv)
});

// EXTERNAL MODULE: ./node_modules/monaco-editor/esm/vs/common/workers.js
var workers = __webpack_require__(95545);
;// ./node_modules/monaco-editor/esm/vs/language/html/workerManager.js


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
        // module that exports the create() method and returns a `HTMLWorker` instance
        moduleId: "vs/language/html/htmlWorker",
        createWorker: () => new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(4421), __webpack_require__.b), { type: undefined }),
        // passed in to the create() method
        createData: {
          languageSettings: this._defaults.options,
          languageId: this._defaults.languageId
        },
        label: this._defaults.languageId
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
;// ./node_modules/monaco-editor/esm/vs/language/html/htmlMode.js













































































class HTMLCompletionAdapter extends lspLanguageFeatures/* CompletionAdapter */.gg {
  constructor(worker) {
    super(worker, [".", ":", "<", '"', "=", "/"]);
  }
}
function setupMode1(defaults) {
  const client = new WorkerManager(defaults);
  const worker = (...uris) => {
    return client.getLanguageServiceWorker(...uris);
  };
  let languageId = defaults.languageId;
  editor_api2.languages.registerCompletionItemProvider(languageId, new HTMLCompletionAdapter(worker));
  editor_api2.languages.registerHoverProvider(languageId, new lspLanguageFeatures/* HoverAdapter */.QV(worker));
  editor_api2.languages.registerDocumentHighlightProvider(
    languageId,
    new lspLanguageFeatures/* DocumentHighlightAdapter */.Ts(worker)
  );
  editor_api2.languages.registerLinkProvider(languageId, new lspLanguageFeatures/* DocumentLinkAdapter */.Jf(worker));
  editor_api2.languages.registerFoldingRangeProvider(
    languageId,
    new lspLanguageFeatures/* FoldingRangeAdapter */.Gn(worker)
  );
  editor_api2.languages.registerDocumentSymbolProvider(
    languageId,
    new lspLanguageFeatures/* DocumentSymbolAdapter */.xv(worker)
  );
  editor_api2.languages.registerSelectionRangeProvider(
    languageId,
    new lspLanguageFeatures/* SelectionRangeAdapter */.xs(worker)
  );
  editor_api2.languages.registerRenameProvider(languageId, new lspLanguageFeatures/* RenameAdapter */.Y6(worker));
  if (languageId === "html") {
    editor_api2.languages.registerDocumentFormattingEditProvider(
      languageId,
      new lspLanguageFeatures/* DocumentFormattingEditProvider */._x(worker)
    );
    editor_api2.languages.registerDocumentRangeFormattingEditProvider(
      languageId,
      new lspLanguageFeatures/* DocumentRangeFormattingEditProvider */.NJ(worker)
    );
  }
}
function setupMode(defaults) {
  const disposables = [];
  const providers = [];
  const client = new WorkerManager(defaults);
  disposables.push(client);
  const worker = (...uris) => {
    return client.getLanguageServiceWorker(...uris);
  };
  function registerProviders() {
    const { languageId, modeConfiguration } = defaults;
    disposeAll(providers);
    if (modeConfiguration.completionItems) {
      providers.push(
        editor_api2.languages.registerCompletionItemProvider(languageId, new HTMLCompletionAdapter(worker))
      );
    }
    if (modeConfiguration.hovers) {
      providers.push(
        editor_api2.languages.registerHoverProvider(languageId, new lspLanguageFeatures/* HoverAdapter */.QV(worker))
      );
    }
    if (modeConfiguration.documentHighlights) {
      providers.push(
        editor_api2.languages.registerDocumentHighlightProvider(
          languageId,
          new lspLanguageFeatures/* DocumentHighlightAdapter */.Ts(worker)
        )
      );
    }
    if (modeConfiguration.links) {
      providers.push(
        editor_api2.languages.registerLinkProvider(languageId, new lspLanguageFeatures/* DocumentLinkAdapter */.Jf(worker))
      );
    }
    if (modeConfiguration.documentSymbols) {
      providers.push(
        editor_api2.languages.registerDocumentSymbolProvider(
          languageId,
          new lspLanguageFeatures/* DocumentSymbolAdapter */.xv(worker)
        )
      );
    }
    if (modeConfiguration.rename) {
      providers.push(
        editor_api2.languages.registerRenameProvider(languageId, new lspLanguageFeatures/* RenameAdapter */.Y6(worker))
      );
    }
    if (modeConfiguration.foldingRanges) {
      providers.push(
        editor_api2.languages.registerFoldingRangeProvider(
          languageId,
          new lspLanguageFeatures/* FoldingRangeAdapter */.Gn(worker)
        )
      );
    }
    if (modeConfiguration.selectionRanges) {
      providers.push(
        editor_api2.languages.registerSelectionRangeProvider(
          languageId,
          new lspLanguageFeatures/* SelectionRangeAdapter */.xs(worker)
        )
      );
    }
    if (modeConfiguration.documentFormattingEdits) {
      providers.push(
        editor_api2.languages.registerDocumentFormattingEditProvider(
          languageId,
          new lspLanguageFeatures/* DocumentFormattingEditProvider */._x(worker)
        )
      );
    }
    if (modeConfiguration.documentRangeFormattingEdits) {
      providers.push(
        editor_api2.languages.registerDocumentRangeFormattingEditProvider(
          languageId,
          new lspLanguageFeatures/* DocumentRangeFormattingEditProvider */.NJ(worker)
        )
      );
    }
  }
  registerProviders();
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




/***/ }

}]);