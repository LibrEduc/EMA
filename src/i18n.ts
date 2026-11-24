import { languagesMap } from "../vendor/ucBlockly/src/languages/languageMap";

export type UiLanguage = "fr" | "en" | "es" | "ar";

const LANG_KEY = "ema.uiLanguage";
const RTL = new Set<string>(["ar", "fa", "he", "lki"]);

export const UI_LANGUAGES: ReadonlyArray<{
  code: UiLanguage;
  label: string;
}> = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
];

export function isUiLanguage(value: string): value is UiLanguage {
  return UI_LANGUAGES.some((l) => l.code === value);
}

export function isRtlLanguage(language: string): boolean {
  return RTL.has(language);
}

export function loadUiLanguage(): UiLanguage {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved && isUiLanguage(saved) && languagesMap[saved]) {
      return saved;
    }
  } catch {
    // ignore
  }
  const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
  if (isUiLanguage(nav) && languagesMap[nav]) {
    return nav;
  }
  return "fr";
}

export function saveUiLanguage(language: UiLanguage): void {
  try {
    window.localStorage.setItem(LANG_KEY, language);
  } catch {
    // ignore
  }
}

export function applyDocumentDirection(language: string): void {
  const rtl = isRtlLanguage(language);
  document.documentElement.lang = language;
  document.documentElement.dir = rtl ? "rtl" : "ltr";
}

type ShellCopy = {
  title: string;
  help: string;
  undo: string;
  redo: string;
  restart: string;
  restartConfirm: string;
  flyoutOpen: string;
  flyoutHint: string;
  settings: string;
  codeArduino: string;
  codeMicroPython: string;
  codeTypeLegend: string;
  langLabel: string;
  skipTitle: string;
  codeSummaryShow: string;
  codeSummaryHide: string;
  codeTitle: string;
  actionsLabel: string;
  workspaceLabel: string;
  a11yLegend: string;
  textSizeLabel: string;
  fontLabel: string;
  fontSystem: string;
  fontAtkinson: string;
  fontLexend: string;
  fontOpenDyslexic: string;
  fontVerdana: string;
  highContrast: string;
  screenreader: string;
  keyboardTutorial: string;
  shortcutsHelp: string;
  toolboxCollapse: string;
  toolboxExpand: string;
  hubSlotLabel: string;
  hubDownload: string;
  hubErrorBlocks: string;
  hubErrorGeneric: string;
  hubErrorEmpty: string;
};

const SHELL: Record<UiLanguage, ShellCopy> = {
  fr: {
    title: "Programme ton robot MAE",
    help: "Glisse des blocs dans la boucle pour faire bouger le robot.",
    undo: "Annuler",
    redo: "Refaire",
    restart: "Recommencer",
    restartConfirm: "Effacer tous les blocs et recommencer ?",
    flyoutOpen: "Garder les blocs ouverts",
    flyoutHint: "Garde la liste des blocs toujours visible à l’écran.",
    settings: "Réglages",
    codeArduino: "Robot (C)",
    codeMicroPython: "Robot (Python)",
    codeTypeLegend: "Type de code",
    langLabel: "Langue",
    skipTitle: "Aller au titre",
    codeSummaryShow: "Voir le code",
    codeSummaryHide: "Cacher le code",
    codeTitle: "Code généré",
    actionsLabel: "Actions",
    workspaceLabel: "Zone des blocs",
    a11yLegend: "Accessibilité",
    textSizeLabel: "Taille du texte",
    fontLabel: "Police",
    fontSystem: "Système",
    fontAtkinson: "Atkinson Hyperlegible",
    fontLexend: "Lexend",
    fontOpenDyslexic: "OpenDyslexic",
    fontVerdana: "Verdana",
    highContrast: "Contraste élevé",
    screenreader: "Mode lecteur d’écran (Alt+Shift+A)",
    keyboardTutorial: "Tutoriel clavier",
    shortcutsHelp: "Raccourcis",
    toolboxCollapse: "Icônes seules",
    toolboxExpand: "Afficher les noms",
    hubSlotLabel: "Numéro du programme (0 à 19)",
    hubDownload: "Télécharger pour le Hub",
    hubErrorBlocks:
      "Impossible de télécharger. Blocs non pris en charge par le Hub : {blocks} (entourés en rouge). Retirez-les et réessayez.",
    hubErrorGeneric:
      "Impossible de télécharger : la génération du programme a échoué. Vérifiez les blocs et réessayez.",
    hubErrorEmpty:
      "Impossible de télécharger : le programme est vide. Ajoutez des blocs dans setup ou loop.",
  },
  en: {
    title: "Program your MAE robot",
    help: "Drag blocks into the loop to make the robot move.",
    undo: "Undo",
    redo: "Redo",
    restart: "Start over",
    restartConfirm: "Clear all blocks and start over?",
    flyoutOpen: "Keep blocks open",
    flyoutHint: "Keep the block list always visible on screen.",
    settings: "Settings",
    codeArduino: "Robot (C)",
    codeMicroPython: "Robot (Python)",
    codeTypeLegend: "Code type",
    langLabel: "Language",
    skipTitle: "Skip to title",
    codeSummaryShow: "Show code",
    codeSummaryHide: "Hide code",
    codeTitle: "Generated code",
    actionsLabel: "Actions",
    workspaceLabel: "Blocks area",
    a11yLegend: "Accessibility",
    textSizeLabel: "Text size",
    fontLabel: "Font",
    fontSystem: "System",
    fontAtkinson: "Atkinson Hyperlegible",
    fontLexend: "Lexend",
    fontOpenDyslexic: "OpenDyslexic",
    fontVerdana: "Verdana",
    highContrast: "High contrast",
    screenreader: "Screen reader mode (Alt+Shift+A)",
    keyboardTutorial: "Keyboard tutorial",
    shortcutsHelp: "Shortcuts",
    toolboxCollapse: "Icons only",
    toolboxExpand: "Show names",
    hubSlotLabel: "Program slot (0 to 19)",
    hubDownload: "Download for Hub",
    hubErrorBlocks:
      "Can't download. Blocks not supported by the Hub: {blocks} (outlined in red). Remove them and try again.",
    hubErrorGeneric:
      "Can't download: the program could not be generated. Check your blocks and try again.",
    hubErrorEmpty:
      "Can't download: the program is empty. Add blocks to setup or loop.",
  },
  es: {
    title: "Programa tu robot MAE",
    help: "Arrastra bloques al bucle para mover el robot.",
    undo: "Deshacer",
    redo: "Rehacer",
    restart: "Empezar de nuevo",
    restartConfirm: "¿Borrar todos los bloques y empezar de nuevo?",
    flyoutOpen: "Mantener bloques abiertos",
    flyoutHint: "Mantener la lista de bloques siempre visible.",
    settings: "Ajustes",
    codeArduino: "Robot (C)",
    codeMicroPython: "Robot (Python)",
    codeTypeLegend: "Tipo de código",
    langLabel: "Idioma",
    skipTitle: "Ir al título",
    codeSummaryShow: "Ver el código",
    codeSummaryHide: "Ocultar el código",
    codeTitle: "Código generado",
    actionsLabel: "Acciones",
    workspaceLabel: "Zona de bloques",
    a11yLegend: "Accesibilidad",
    textSizeLabel: "Tamaño del texto",
    fontLabel: "Fuente",
    fontSystem: "Sistema",
    fontAtkinson: "Atkinson Hyperlegible",
    fontLexend: "Lexend",
    fontOpenDyslexic: "OpenDyslexic",
    fontVerdana: "Verdana",
    highContrast: "Alto contraste",
    screenreader: "Modo lector de pantalla (Alt+Shift+A)",
    keyboardTutorial: "Tutorial de teclado",
    shortcutsHelp: "Atajos",
    toolboxCollapse: "Solo iconos",
    toolboxExpand: "Mostrar nombres",
    hubSlotLabel: "Número de programa (0 a 19)",
    hubDownload: "Descargar para el Hub",
    hubErrorBlocks:
      "No se puede descargar. Bloques no compatibles con el Hub: {blocks} (resaltados en rojo). Quítalos e inténtalo de nuevo.",
    hubErrorGeneric:
      "No se puede descargar: no se pudo generar el programa. Revisa los bloques e inténtalo de nuevo.",
    hubErrorEmpty:
      "No se puede descargar: el programa está vacío. Añade bloques en setup o loop.",
  },
  ar: {
    title: "برمِج روبوت MAE",
    help: "اسحب الكتل إلى الحلقة لتحريك الروبوت.",
    undo: "تراجع",
    redo: "إعادة",
    restart: "البداية من جديد",
    restartConfirm: "مسح كل الكتل والبدء من جديد؟",
    flyoutOpen: "إبقاء الكتل مفتوحة",
    flyoutHint: "إبقاء قائمة الكتل مرئية دائمًا.",
    settings: "الإعدادات",
    codeArduino: "روبوت (C)",
    codeMicroPython: "روبوت (Python)",
    codeTypeLegend: "نوع الرمز",
    langLabel: "اللغة",
    skipTitle: "الانتقال إلى العنوان",
    codeSummaryShow: "عرض الرمز",
    codeSummaryHide: "إخفاء الرمز",
    codeTitle: "الرمز المُنشأ",
    actionsLabel: "إجراءات",
    workspaceLabel: "منطقة الكتل",
    a11yLegend: "إمكانية الوصول",
    textSizeLabel: "حجم النص",
    fontLabel: "الخط",
    fontSystem: "النظام",
    fontAtkinson: "Atkinson Hyperlegible",
    fontLexend: "Lexend",
    fontOpenDyslexic: "OpenDyslexic",
    fontVerdana: "Verdana",
    highContrast: "تباين عالٍ",
    screenreader: "وضع قارئ الشاشة (Alt+Shift+A)",
    keyboardTutorial: "دليل لوحة المفاتيح",
    shortcutsHelp: "الاختصارات",
    toolboxCollapse: "أيقونات فقط",
    toolboxExpand: "إظهار الأسماء",
    hubSlotLabel: "رقم البرنامج (0 إلى 19)",
    hubDownload: "تنزيل إلى الموزع",
    hubErrorBlocks:
      "تعذّر التنزيل. كتل غير مدعومة في الموزع: {blocks} (محاطة بالأحمر). احذفها وأعد المحاولة.",
    hubErrorGeneric:
      "تعذّر التنزيل: فشل إنشاء البرنامج. تحقّق من الكتل وأعد المحاولة.",
    hubErrorEmpty:
      "تعذّر التنزيل: البرنامج فارغ. أضف كتلًا في setup أو loop.",
  },
};

export function getShellCopy(language: UiLanguage): ShellCopy {
  return SHELL[language];
}

export function applyShellStrings(
  language: UiLanguage,
  codeTarget: "arduino" | "micropython",
): void {
  const t = SHELL[language];

  const setText = (selector: string, text: string): void => {
    const el = document.querySelector(selector);
    if (el) {
      el.textContent = text;
    }
  };

  setText(".ema-tagline", t.title);
  setText("#ema-help", t.help);
  setText("#ema-undo", t.undo);
  setText("#ema-redo", t.redo);
  setText("#ema-restart", t.restart);
  setText("#ema-hub-slot-label", t.hubSlotLabel);
  setText("#ema-hub-download", t.hubDownload);
  setText(".ema-flyout-toggle > span:last-child", t.flyoutOpen);
  setText("#ema-flyout-open-hint", t.flyoutHint);
  setText(".ema-settings > summary", t.settings);
  setText('label[for="ema-lang"]', t.langLabel);
  setText(".ema-target legend", t.codeTypeLegend);
  setText(".skip-link", t.skipTitle);
  const codeDrawer = document.querySelector(
    ".ema-code-drawer",
  ) as HTMLDetailsElement | null;
  setText(
    "#ema-code-summary",
    codeDrawer?.open ? t.codeSummaryHide : t.codeSummaryShow,
  );
  setText("#ema-code-title", t.codeTitle);

  const flyoutToggle = document.getElementById("ema-flyout-open");
  flyoutToggle?.setAttribute("title", t.flyoutHint);

  const arduinoSpan = document.querySelector(
    'input[name="ema-code-target"][value="arduino"] + span',
  );
  if (arduinoSpan) {
    arduinoSpan.textContent = t.codeArduino;
  }
  const mpSpan = document.querySelector(
    'input[name="ema-code-target"][value="micropython"] + span',
  );
  if (mpSpan) {
    mpSpan.textContent = t.codeMicroPython;
  }

  const toolbar = document.querySelector(".ema-actions");
  toolbar?.setAttribute("aria-label", t.actionsLabel);

  const workspace = document.getElementById("ema-workspace");
  workspace?.setAttribute("aria-label", t.workspaceLabel);

  setText("#ema-a11y-legend", t.a11yLegend);
  setText("#ema-text-size-label", t.textSizeLabel);
  setText("#ema-font-label", t.fontLabel);
  setText("#ema-high-contrast-label", t.highContrast);
  setText("#ema-screenreader-label", t.screenreader);
  setText("#keyboardTutorialButton", t.keyboardTutorial);
  setText("#shortcutsHelpButton", t.shortcutsHelp);

  const fontSelect = document.getElementById(
    "ema-font",
  ) as HTMLSelectElement | null;
  if (fontSelect) {
    const fontLabels: Record<string, string> = {
      system: t.fontSystem,
      atkinson: t.fontAtkinson,
      lexend: t.fontLexend,
      opendyslexic: t.fontOpenDyslexic,
      verdana: t.fontVerdana,
    };
    for (const option of Array.from(fontSelect.options)) {
      const label = fontLabels[option.value];
      if (label) {
        option.textContent = label;
      }
    }
  }

  document.title = `EMA — ${t.title}`;

  void codeTarget;
}
