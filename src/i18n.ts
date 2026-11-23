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
  const requested = new URL(window.location.href).searchParams
    .get("lang")
    ?.trim()
    .toLowerCase();
  if (requested && isUiLanguage(requested) && languagesMap[requested]) {
    return requested;
  }
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

// µcBlockly dialogs (keyboard tutorial, shortcuts, a11y labels) read the language from `?lang=`.
export function shareLanguageWithUcBlockly(language: UiLanguage): void {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState(window.history.state, "", url.href);
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
};

const SHELL: Record<UiLanguage, ShellCopy> = {
  fr: {
    title: "Programme ton robot MAE",
    help: "Glisse des blocs dans la boucle pour faire bouger le robot.",
    undo: "Annuler",
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
  },
  en: {
    title: "Program your MAE robot",
    help: "Drag blocks into the loop to make the robot move.",
    undo: "Undo",
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
  },
  es: {
    title: "Programa tu robot MAE",
    help: "Arrastra bloques al bucle para mover el robot.",
    undo: "Deshacer",
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
  },
  ar: {
    title: "برمِج روبوت MAE",
    help: "اسحب الكتل إلى الحلقة لتحريك الروبوت.",
    undo: "تراجع",
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
  setText("#ema-restart", t.restart);
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
