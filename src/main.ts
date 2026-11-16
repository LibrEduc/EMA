import "./styles.css";

// Plus/minus mutators + recherche toolbox (comme l’embed µcBlockly).
import "../vendor/ucBlockly/src/block_plus_minus_init";
import "@blockly/toolbox-search";

import * as Blockly from "blockly";
import {
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

registerToolboxSearchI18n();
registerContinuousToolbox();

const workspaceRoot = document.getElementById("ema-workspace");
const codeRoot = document.getElementById("ema-code");

if (!workspaceRoot || !codeRoot) {
  throw new Error("EMA: #ema-workspace ou #ema-code manquant");
}

const language = "fr";
const toolbox = getToolboxWithoutBoardCategory(
  changeLanguageToolbox(language, basic_toolbox),
);

let codeTarget: CodeTarget = loadCodeTarget();

/**
 * Coquille EMA :
 * - thème Zelos + renderer Zelos (pas de menu)
 * - toolbox continue obligatoire (pas de case à cocher)
 * - cible code Arduino C / MicroPython commutables
 * - pas de surbrillance, pas d’éditeur Monaco, pas de debug
 */
const manager = new UcBlocklyWorkspaceManager({
  baseToolbox: toolbox,
  language,
  injectionDiv: workspaceRoot,
  workspaceOptions: {
    theme: "zelos",
    renderer: "zelos",
    media: "/media/",
    toolbox,
    plugins: { ...CONTINUOUS_WORKSPACE_PLUGINS },
  },
  enforcers: {
    strictTypes: true,
    programStructure: true,
  },
  plugins: {
    contentHighlight: false,
    backpack: true,
    minimap: true,
    workspaceSearch: true,
    zoomToFit: true,
    modal: true,
    shadowBlockConverter: true,
    crossTabCopyPaste: true,
    soundToggle: true,
  },
  deferMinimapInit: true,
});

manager.setupPlugins(false);
manager.restoreWorkspaceAfterInject();

const workspace = manager.workspace as Blockly.WorkspaceSvg;
seedProgramStructure(workspace);

const refreshCode = bindCodePanel(workspace, codeRoot, () => codeTarget);

const FLYOUT_OPEN_KEY = "ema.flyoutOpen";
const flyoutOpenToggle = document.getElementById(
  "ema-flyout-open",
) as HTMLInputElement | null;

const applyFlyoutOpen = (pinned: boolean): void => {
  manager.applyFlyoutPinnedOpen(pinned);
  try {
    window.localStorage.setItem(FLYOUT_OPEN_KEY, pinned ? "true" : "false");
  } catch {
    // stockage indisponible
  }
};

if (flyoutOpenToggle) {
  let saved = false;
  try {
    saved = window.localStorage.getItem(FLYOUT_OPEN_KEY) === "true";
  } catch {
    saved = false;
  }
  flyoutOpenToggle.checked = saved;
  applyFlyoutOpen(saved);
  flyoutOpenToggle.addEventListener("change", () => {
    applyFlyoutOpen(flyoutOpenToggle.checked);
  });
}

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
    const title = document.getElementById("ema-code-title");
    if (title) {
      title.textContent =
        codeTarget === "micropython" ? "MicroPython" : "C Arduino";
    }
    refreshCode();
  });
}

const codeTitle = document.getElementById("ema-code-title");
if (codeTitle) {
  codeTitle.textContent =
    codeTarget === "micropython" ? "MicroPython" : "C Arduino";
}

const onResize = (): void => {
  Blockly.svgResize(workspace);
};
window.addEventListener("resize", onResize);
onResize();
refreshCode();
