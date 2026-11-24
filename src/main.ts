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
  SHOW_BOARD_CATEGORY,
  installFixedBoardMenu,
} from "./board_config";

import {
  CONTINUOUS_WORKSPACE_PLUGINS,
  registerContinuousToolbox,
} from "./continuous_toolbox";
import {
  bindCodePanel,
  loadCodeTarget,
  tryGenerateCode,
  type GenerationResult,
  saveCodeTarget,
  seedProgramStructure,
  type CodeTarget,
} from "./codegen";
import {
  HUB_SLOT_MAX,
  HUB_SLOT_MIN,
  downloadHubProgram,
  formatHubIssueMessage,
  getHubExportIssue,
  type HubExportIssue,
  loadHubSlot,
  normalizeHubSlot,
  saveHubSlot,
} from "./hub_export";
import {
  clearOnBlockEdit,
  markUnsupportedBlocks,
} from "./hub_block_highlight";
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
import { resolveWorkspaceToolbarTheme } from "../vendor/ucBlockly/src/host/workspace_toolbar";
import {
  applyBlocklyTypography,
  applyShellTypography,
  isUiFontId,
  loadTextSizePercent,
  loadUiFont,
  TEXT_SIZE_DEFAULT,
  type UiFontId,
} from "./a11y_typography";
import {
  installToolboxIconRailToggle,
  setToolboxCollapseCopy,
} from "./toolbox_collapse";
import { installFlyoutSearchBar } from "./flyout_search";

registerToolboxSearchI18n();
registerContinuousToolbox();
registerShortcutsHelp();
registerKeyboardTutorial({ autoOpen: false });

// Carte unique (MAE) — `#boardMenu` caché pour µcBlockly ; voir `board_config.ts`.
installFixedBoardMenu();

const workspaceRoot = document.getElementById("ema-workspace");
const codeRoot = document.getElementById("ema-code");
const langSelect = document.getElementById("ema-lang") as HTMLSelectElement | null;
const undoBtn = document.getElementById("ema-undo");
const redoBtn = document.getElementById("ema-redo");
const restartBtn = document.getElementById("ema-restart");
const hubSlotSelect = document.getElementById(
  "ema-hub-slot",
) as HTMLSelectElement | null;
const hubDownloadBtn = document.getElementById("ema-hub-download");
const hubMessage = document.getElementById("ema-hub-message");
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

const buildToolbox = (language: string) => {
  const translated = changeLanguageToolbox(language, basic_toolbox);
  // Mono-carte : pas de catégorie « Carte : … ». Remettre SHOW_BOARD_CATEGORY pour la réactiver.
  return SHOW_BOARD_CATEGORY
    ? translated
    : getToolboxWithoutBoardCategory(translated);
};

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

const syncToolboxCollapseLabels = (): void => {
  const copy = getShellCopy(uiLanguage);
  setToolboxCollapseCopy({
    collapse: copy.toolboxCollapse,
    expand: copy.toolboxExpand,
  });
};

let clearHubHighlight: () => void = () => undefined;

function clearHubFeedback(): void {
  clearHubHighlight();
  clearHubHighlight = () => undefined;
  if (hubMessage) {
    hubMessage.textContent = "";
  }
}

const wireWorkspaceUi = (): void => {
  const workspace = manager.workspace as Blockly.WorkspaceSvg;
  seedProgramStructure(workspace);
  refreshCode = bindCodePanel(workspace, codeRoot, () => codeTarget);
  // Un changement de langue recrée le workspace : l'écouteur est reposé à chaque fois.
  clearOnBlockEdit(workspace, clearHubFeedback);
  applyFlyoutOpen(readFlyoutOpen());
  installToolboxIconRailToggle(workspace);
  installFlyoutSearchBar(workspace);
  syncToolboxCollapseLabels();
  resizeWorkspace();
  refreshCode();
};

manager.setupPlugins(false);
manager.restoreWorkspaceAfterInject();
wireWorkspaceUi();

registerBlocklyA11yExtensions(
  () => manager.workspace as Blockly.WorkspaceSvg,
);

const HIGH_CONTRAST_KEY = "ema.highContrast";
const textSizeSlider = document.getElementById(
  "ema-text-size",
) as HTMLInputElement | null;
const textSizeValue = document.getElementById(
  "ema-text-size-value",
) as HTMLOutputElement | null;
const fontSelect = document.getElementById(
  "ema-font",
) as HTMLSelectElement | null;
const highContrastToggle = document.getElementById(
  "ema-high-contrast",
) as HTMLInputElement | null;
const screenreaderToggle = document.getElementById(
  "ema-screenreader",
) as HTMLInputElement | null;

let textSizePercent = loadTextSizePercent();
let uiFont: UiFontId = loadUiFont();

const syncTextSizeUi = (percent: number): void => {
  if (textSizeSlider) {
    textSizeSlider.value = String(percent);
    textSizeSlider.style.setProperty("--attr-min", textSizeSlider.min || "100");
    textSizeSlider.style.setProperty("--attr-max", textSizeSlider.max || "200");
    textSizeSlider.style.setProperty("--control-value", String(percent));
    textSizeSlider.setAttribute("aria-valuenow", String(percent));
    textSizeSlider.setAttribute("aria-valuetext", `${percent} %`);
  }
  if (textSizeValue) {
    textSizeValue.value = `${percent} %`;
    textSizeValue.textContent = `${percent} %`;
  }
};

const applyTypography = (percent: number, fontId: UiFontId): void => {
  textSizePercent = percent;
  uiFont = fontId;
  applyShellTypography(percent, fontId);
  syncTextSizeUi(percent);
  applyBlocklyTypography(
    manager.workspace as Blockly.WorkspaceSvg,
    percent,
    fontId,
  );
  resizeWorkspace();
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
  applyBlocklyTypography(workspace, textSizePercent, uiFont);
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

applyTypography(textSizePercent, uiFont);
if (fontSelect) {
  fontSelect.value = uiFont;
  fontSelect.addEventListener("change", () => {
    const next = fontSelect.value;
    if (!isUiFontId(next)) {
      return;
    }
    applyTypography(textSizePercent, next);
  });
}
textSizeSlider?.addEventListener("input", () => {
  const next = Number(textSizeSlider.value) || TEXT_SIZE_DEFAULT;
  applyTypography(next, uiFont);
});

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

redoBtn?.addEventListener("click", () => {
  manager.workspace.undo(true);
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

let hubSlot = loadHubSlot();
if (hubSlotSelect) {
  for (let slot = HUB_SLOT_MIN; slot <= HUB_SLOT_MAX; slot += 1) {
    const option = document.createElement("option");
    option.value = String(slot);
    option.textContent = `prog_${slot}.py`;
    hubSlotSelect.appendChild(option);
  }
  hubSlotSelect.value = String(hubSlot);
  hubSlotSelect.addEventListener("change", () => {
    hubSlot = normalizeHubSlot(hubSlotSelect.value);
    saveHubSlot(hubSlot);
    clearHubFeedback();
  });
}

function showHubIssue(
  issue: HubExportIssue,
  result: GenerationResult,
): void {
  if (hubMessage) {
    hubMessage.textContent = formatHubIssueMessage(
      getShellCopy(uiLanguage),
      issue,
      result,
    );
  }
  if (!result.ok) {
    clearHubHighlight = markUnsupportedBlocks(
      manager.workspace as Blockly.WorkspaceSvg,
      result.unsupportedBlocks.map((block) => block.id),
    );
  }
}

hubDownloadBtn?.addEventListener("click", () => {
  clearHubFeedback();
  const slot = hubSlotSelect
    ? normalizeHubSlot(hubSlotSelect.value)
    : hubSlot;
  const result = tryGenerateCode(manager.workspace, "micropython");
  const issue = getHubExportIssue(result);
  if (issue === null && result.ok) {
    downloadHubProgram(result.code, slot);
    return;
  }
  showHubIssue(issue ?? "generationError", result);
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
  syncToolboxCollapseLabels();

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
  } else {
    applyTypography(textSizePercent, uiFont);
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
    clearHubFeedback();
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
