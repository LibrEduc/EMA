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
  textScaleLabel: string;
  textScaleNormal: string;
  textScaleLarge: string;
  textScaleXLarge: string;
  highContrast: string;
  screenreader: string;
  keyboardTutorial: string;
  shortcutsHelp: string;
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
    textScaleLabel: "Taille du texte",
    textScaleNormal: "Normale",
    textScaleLarge: "Grande",
    textScaleXLarge: "Très grande",
    highContrast: "Contraste élevé",
    screenreader: "Mode lecteur d’écran (Alt+Shift+A)",
    keyboardTutorial: "Tutoriel clavier",
    shortcutsHelp: "Raccourcis",
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
    textScaleLabel: "Text size",
    textScaleNormal: "Normal",
    textScaleLarge: "Large",
    textScaleXLarge: "Extra large",
    highContrast: "High contrast",
    screenreader: "Screen reader mode (Alt+Shift+A)",
    keyboardTutorial: "Keyboard tutorial",
    shortcutsHelp: "Shortcuts",
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
    textScaleLabel: "Tamaño del texto",
    textScaleNormal: "Normal",
    textScaleLarge: "Grande",
    textScaleXLarge: "Muy grande",
    highContrast: "Alto contraste",
    screenreader: "Modo lector de pantalla (Alt+Shift+A)",
    keyboardTutorial: "Tutorial de teclado",
    shortcutsHelp: "Atajos",
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
    textScaleLabel: "حجم النص",
    textScaleNormal: "عادي",
    textScaleLarge: "كبير",
    textScaleXLarge: "كبير جدًا",
    highContrast: "تباين عالٍ",
    screenreader: "وضع قارئ الشاشة (Alt+Shift+A)",
    keyboardTutorial: "دليل لوحة المفاتيح",
    shortcutsHelp: "الاختصارات",
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
  setText("#ema-text-scale-label", t.textScaleLabel);
  setText("#ema-high-contrast-label", t.highContrast);
  setText("#ema-screenreader-label", t.screenreader);
  setText("#keyboardTutorialButton", t.keyboardTutorial);
  setText("#shortcutsHelpButton", t.shortcutsHelp);

  const textScale = document.getElementById(
    "ema-text-scale",
  ) as HTMLSelectElement | null;
  if (textScale) {
    const labels = [
      t.textScaleNormal,
      t.textScaleLarge,
      t.textScaleXLarge,
    ] as const;
    for (let i = 0; i < textScale.options.length && i < labels.length; i++) {
      textScale.options[i].textContent = labels[i];
    }
  }

  document.title = `EMA — ${t.title}`;

  void codeTarget;
}
