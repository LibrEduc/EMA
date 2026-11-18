/**
 * Bouton en bas de la toolbox : bascule labels ↔ icônes seules.
 */

import * as Blockly from "blockly";

const STORAGE_KEY = "ema.toolboxIconsOnly";
const TOGGLE_ID = "ema-toolbox-rail-toggle";
const FOOTER_CLASS = "emaToolboxRailFooter";

export type ToolboxCollapseCopy = {
  collapse: string;
  expand: string;
};

const DEFAULT_COPY: ToolboxCollapseCopy = {
  collapse: "Icônes seules",
  expand: "Afficher les noms",
};

let currentCopy: ToolboxCollapseCopy = { ...DEFAULT_COPY };

const CHEVRON_COLLAPSE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>';
const CHEVRON_EXPAND =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z"/></svg>';

export function readToolboxIconsOnly(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persist(iconsOnly: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, iconsOnly ? "true" : "false");
  } catch {
    // ignore
  }
}

function syncToggleButton(button: HTMLButtonElement, iconsOnly: boolean): void {
  const label = button.querySelector(".emaToolboxRailToggle-label");
  const icon = button.querySelector(".emaToolboxRailToggle-icon");
  const text = iconsOnly ? currentCopy.expand : currentCopy.collapse;
  if (label) {
    label.textContent = text;
  }
  if (icon) {
    icon.innerHTML = iconsOnly ? CHEVRON_EXPAND : CHEVRON_COLLAPSE;
  }
  button.setAttribute("aria-expanded", iconsOnly ? "false" : "true");
  button.setAttribute("aria-label", text);
  button.title = text;
}

export function setToolboxCollapseCopy(copy: ToolboxCollapseCopy): void {
  currentCopy = copy;
  const button = document.getElementById(TOGGLE_ID) as HTMLButtonElement | null;
  if (button) {
    syncToggleButton(
      button,
      document.documentElement.classList.contains("ema-toolbox-icons-only"),
    );
  }
}

export function applyToolboxIconsOnly(
  workspace: Blockly.WorkspaceSvg,
  iconsOnly: boolean,
): void {
  document.documentElement.classList.toggle("ema-toolbox-icons-only", iconsOnly);
  persist(iconsOnly);
  const button = document.getElementById(TOGGLE_ID) as HTMLButtonElement | null;
  if (button) {
    syncToggleButton(button, iconsOnly);
  }
  requestAnimationFrame(() => {
    Blockly.svgResize(workspace);
    workspace.resize();
    workspace.getFlyout()?.position?.();
  });
}

/** Installe (idempotent) le bouton en bas de `.blocklyToolboxDiv`. */
export function installToolboxIconRailToggle(
  workspace: Blockly.WorkspaceSvg,
): void {
  const toolbox = workspace.getToolbox() as {
    HtmlDiv?: HTMLDivElement | null;
  } | null;
  const toolboxDiv =
    toolbox?.HtmlDiv ??
    (document.querySelector(".blocklyToolboxDiv") as HTMLDivElement | null);

  if (!toolboxDiv) {
    return;
  }

  let footer = toolboxDiv.querySelector(
    `.${FOOTER_CLASS}`,
  ) as HTMLDivElement | null;
  if (!footer) {
    footer = document.createElement("div");
    footer.className = FOOTER_CLASS;
  }

  let button = document.getElementById(TOGGLE_ID) as HTMLButtonElement | null;
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.id = TOGGLE_ID;
    button.className = "emaToolboxRailToggle";
    button.innerHTML =
      '<span class="emaToolboxRailToggle-icon" aria-hidden="true"></span>' +
      '<span class="emaToolboxRailToggle-label"></span>';
    button.addEventListener("click", () => {
      const next = !document.documentElement.classList.contains(
        "ema-toolbox-icons-only",
      );
      applyToolboxIconsOnly(workspace, next);
    });
  }

  footer.appendChild(button);
  toolboxDiv.appendChild(footer);

  applyToolboxIconsOnly(workspace, readToolboxIconsOnly());
}
