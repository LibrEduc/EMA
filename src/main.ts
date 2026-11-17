import "./styles.css";

import "../vendor/ucBlockly/src/block_plus_minus_init";
import "@blockly/toolbox-search";

import * as Blockly from "blockly";
import {
  applyUcBlocklyLocale,
  basic_toolbox,
  getToolboxWithoutBoardCategory,
  UcBlocklyWorkspaceManager,
} from "µcBlockly/core";
import { registerToolboxSearchI18n } from "../vendor/ucBlockly/src/toolbox_search_i18n";
import { changeLanguageToolbox } from "../vendor/ucBlockly/src/language";

import {
  CONTINUOUS_WORKSPACE_PLUGINS,
  registerContinuousToolbox,
} from "./continuous_toolbox";
import {
  bindCodePanel,
  loadCodeTarget,
  saveCodeTarget,
  seedProgramStructure,
  type CodeTarget,
} from "./codegen";
import {
  applyDocumentDirection,
  applyShellStrings,
  getShellCopy,
  isRtlLanguage,
  isUiLanguage,
  loadUiLanguage,
  saveUiLanguage,
  type UiLanguage,
} from "./i18n";
import {
  getScreenreaderModeEnabled,
  registerBlocklyA11yExtensions,
  refreshBlocklyA11yExtensions,
} from "../vendor/ucBlockly/src/blockly_a11y_extensions";
import { registerKeyboardTutorial } from "../vendor/ucBlockly/src/shell_keyboard_tutorial";
import { registerShortcutsHelp } from "../vendor/ucBlockly/src/shell_shortcuts_help";
import { resolveWorkspaceToolbarTheme } from "µcBlockly/host";

registerToolboxSearchI18n();
registerContinuousToolbox();
registerShortcutsHelp();
registerKeyboardTutorial({ autoOpen: false });

const workspaceRoot = document.getElementById("ema-workspace");
const codeRoot = document.getElementById("ema-code");
const langSelect = document.getElementById("ema-lang") as HTMLSelectElement | null;
const undoBtn = document.getElementById("ema-undo");
const restartBtn = document.getElementById("ema-restart");
const codeDrawer = document.querySelector(
  ".ema-code-drawer",
) as HTMLDetailsElement | null;

if (!workspaceRoot || !codeRoot) {
  throw new Error("EMA: #ema-workspace ou #ema-code manquant");
}

let uiLanguage: UiLanguage = loadUiLanguage();
let codeTarget: CodeTarget = loadCodeTarget();
let refreshCode: () => void = () => undefined;

applyDocumentDirection(uiLanguage);
applyUcBlocklyLocale(uiLanguage);
applyShellStrings(uiLanguage, codeTarget);

const buildToolbox = (language: string) =>
  getToolboxWithoutBoardCategory(
    changeLanguageToolbox(language, basic_toolbox),
  );

const toolbox = buildToolbox(uiLanguage);

/** Mode élève : pas de minimap / sac à dos (bruit). */
const STUDENT_PLUGINS = {
  contentHighlight: false,
  backpack: false,
  minimap: false,
  workspaceSearch: true,
  zoomToFit: true,
  modal: true,
  shadowBlockConverter: true,
  crossTabCopyPaste: true,
  soundToggle: true,
} as const;

const manager = new UcBlocklyWorkspaceManager({
  baseToolbox: toolbox,
  language: uiLanguage,
  injectionDiv: workspaceRoot,
  workspaceOptions: {
    theme: "zelos",
    renderer: "zelos",
    rtl: isRtlLanguage(uiLanguage),
    media: `${import.meta.env.BASE_URL}media/`,
    toolbox,
    plugins: { ...CONTINUOUS_WORKSPACE_PLUGINS },
  },
  enforcers: {
    strictTypes: true,
    programStructure: true,
  },
  plugins: { ...STUDENT_PLUGINS },
  deferMinimapInit: true,
});

const FLYOUT_OPEN_KEY = "ema.flyoutOpen";
const flyoutOpenToggle = document.getElementById(
  "ema-flyout-open",
) as HTMLInputElement | null;

/** Mode élève : flyout ouvert par défaut. */
const readFlyoutOpen = (): boolean => {
  try {
    const raw = window.localStorage.getItem(FLYOUT_OPEN_KEY);
    if (raw === null) {
      return true;
    }
    return raw === "true";
  } catch {
    return true;
  }
};

const applyFlyoutOpen = (pinned: boolean): void => {
  manager.applyFlyoutPinnedOpen(pinned);
  try {
    window.localStorage.setItem(FLYOUT_OPEN_KEY, pinned ? "true" : "false");
  } catch {
    // ignore
  }
};

const resizeWorkspace = (): void => {
  Blockly.svgResize(manager.workspace as Blockly.WorkspaceSvg);
};

const wireWorkspaceUi = (): void => {
  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  seedProgramStructure(workspace);
  refreshCode = bindCodePanel(workspace, codeRoot, () => codeTarget);
  applyFlyoutOpen(readFlyoutOpen());
  resizeWorkspace();
  refreshCode();
};

manager.setupPlugins(false);
manager.restoreWorkspaceAfterInject();
wireWorkspaceUi();

registerBlocklyA11yExtensions(
  () => manager.workspace as Blockly.WorkspaceSvg,
);

const TEXT_SCALE_KEY = "ema.textScale";
const HIGH_CONTRAST_KEY = "ema.highContrast";
const textScaleSelect = document.getElementById(
  "ema-text-scale",
) as HTMLSelectElement | null;
const highContrastToggle = document.getElementById(
  "ema-high-contrast",
) as HTMLInputElement | null;
const screenreaderToggle = document.getElementById(
  "ema-screenreader",
) as HTMLInputElement | null;

const readTextScale = (): string => {
  try {
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    if (raw === "1" || raw === "1.15" || raw === "1.35") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "1";
};

const applyTextScale = (scale: string): void => {
  document.documentElement.style.setProperty("--ema-text-scale", scale);
  try {
    window.localStorage.setItem(TEXT_SCALE_KEY, scale);
  } catch {
    // ignore
  }
};

const readHighContrast = (): boolean => {
  try {
    return window.localStorage.getItem(HIGH_CONTRAST_KEY) === "true";
  } catch {
    return false;
  }
};

const applyHighContrast = (enabled: boolean): void => {
  document.documentElement.classList.toggle("ema-high-contrast", enabled);
  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  const themeKey = enabled ? "high_contrast" : "zelos";
  workspace.setTheme(resolveWorkspaceToolbarTheme(themeKey));
  workspace.refreshTheme();
  try {
    window.localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? "true" : "false");
  } catch {
    // ignore
  }
};

const syncScreenreaderCheckbox = (): void => {
  if (screenreaderToggle) {
    screenreaderToggle.checked = getScreenreaderModeEnabled();
  }
};

const fireScreenreaderShortcut = (): void => {
  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  const event = new KeyboardEvent("keydown", {
    key: "a",
    code: "KeyA",
    keyCode: 65,
    which: 65,
    altKey: true,
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  Blockly.ShortcutRegistry.registry.onKeyDown(workspace, event);
  syncScreenreaderCheckbox();
};

applyTextScale(readTextScale());
if (textScaleSelect) {
  textScaleSelect.value = readTextScale();
  textScaleSelect.addEventListener("change", () => {
    applyTextScale(textScaleSelect.value);
  });
}

const highContrastOn = readHighContrast();
if (highContrastToggle) {
  highContrastToggle.checked = highContrastOn;
  highContrastToggle.addEventListener("change", () => {
    applyHighContrast(highContrastToggle.checked);
  });
}
if (highContrastOn) {
  applyHighContrast(true);
}

syncScreenreaderCheckbox();
screenreaderToggle?.addEventListener("change", () => {
  const want = Boolean(screenreaderToggle.checked);
  if (want !== getScreenreaderModeEnabled()) {
    fireScreenreaderShortcut();
  }
  syncScreenreaderCheckbox();
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.altKey && event.shiftKey && event.code === "KeyA") {
    requestAnimationFrame(syncScreenreaderCheckbox);
  }
});

if (flyoutOpenToggle) {
  flyoutOpenToggle.checked = readFlyoutOpen();
  flyoutOpenToggle.addEventListener("change", () => {
    applyFlyoutOpen(flyoutOpenToggle.checked);
  });
}

undoBtn?.addEventListener("click", () => {
  manager.workspace.undo(false);
  refreshCode();
});

restartBtn?.addEventListener("click", () => {
  const copy = getShellCopy(uiLanguage);
  if (!window.confirm(copy.restartConfirm)) {
    return;
  }
  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  workspace.clear();
  workspace.clearUndo();
  seedProgramStructure(workspace);
  applyFlyoutOpen(flyoutOpenToggle?.checked ?? true);
  refreshCode();
  resizeWorkspace();
});

const targetRadios = document.querySelectorAll<HTMLInputElement>(
  'input[name="ema-code-target"]',
);
for (const radio of targetRadios) {
  radio.checked = radio.value === codeTarget;
  radio.addEventListener("change", () => {
    if (!radio.checked) {
      return;
    }
    if (radio.value !== "arduino" && radio.value !== "micropython") {
      return;
    }
    codeTarget = radio.value;
    saveCodeTarget(codeTarget);
    applyShellStrings(uiLanguage, codeTarget);
    refreshCode();
  });
}

const applyLanguage = (language: UiLanguage): void => {
  const previous = manager.workspace as Blockly.WorkspaceSvg;
  const saved = Blockly.serialization.workspaces.save(previous);

  uiLanguage = language;
  saveUiLanguage(language);
  applyDocumentDirection(language);
  applyUcBlocklyLocale(language);
  applyShellStrings(language, codeTarget);

  const nextToolbox = buildToolbox(language);
  manager.setLanguage(language);
  manager.WORKSPACE_OPTIONS.toolbox = nextToolbox;
  manager.WORKSPACE_OPTIONS.rtl = isRtlLanguage(language);

  manager.reboot();
  manager.setupPlugins(false);
  manager.restoreWorkspaceAfterInject();
  refreshBlocklyA11yExtensions();

  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  try {
    Blockly.serialization.workspaces.load(saved, workspace);
  } catch (error) {
    console.warn("[EMA] restauration workspace après langue:", error);
  }

  wireWorkspaceUi();
  if (readHighContrast()) {
    applyHighContrast(true);
  }
  syncScreenreaderCheckbox();
};

if (langSelect) {
  langSelect.value = uiLanguage;
  langSelect.addEventListener("change", () => {
    const next = langSelect.value;
    if (!isUiLanguage(next) || next === uiLanguage) {
      return;
    }
    applyLanguage(next);
  });
}

const syncCodeDrawerLabel = (): void => {
  const summary = document.getElementById("ema-code-summary");
  if (!summary || !codeDrawer) {
    return;
  }
  const copy = getShellCopy(uiLanguage);
  summary.textContent = codeDrawer.open
    ? copy.codeSummaryHide
    : copy.codeSummaryShow;
};

codeDrawer?.addEventListener("toggle", () => {
  syncCodeDrawerLabel();
  requestAnimationFrame(() => {
    resizeWorkspace();
  });
});
syncCodeDrawerLabel();

window.addEventListener("resize", resizeWorkspace);
