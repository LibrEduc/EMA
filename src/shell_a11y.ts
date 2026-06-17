/**
 * @packageDocumentation
 * @module ShellA11y
 * @description Accessibilité de la coque HTML (skip link, menu de zones, repères ARIA).
 */

import { getA11yLabel } from "./a11y_labels";

const AREA_MENU_TIMEOUT_MS = 5000;

let areaMenuAwaitingChoice = false;
let areaMenuTimeoutId: number | null = null;

const clearAreaMenuTimeout = (): void => {
  if (areaMenuTimeoutId !== null) {
    window.clearTimeout(areaMenuTimeoutId);
    areaMenuTimeoutId = null;
  }
};

const getShortcutsEl = (): HTMLElement | null =>
  document.getElementById("shortcuts");

const showAreaMenuMessage = (message: string): void => {
  const el = getShortcutsEl();
  if (!el) {
    return;
  }
  el.hidden = false;
  el.textContent = message;
};

const hideAreaMenuMessage = (): void => {
  const el = getShortcutsEl();
  if (!el) {
    return;
  }
  el.hidden = true;
  el.textContent = "";
};

const focusFirstIn = (root: ParentNode | null): boolean => {
  if (!root) {
    return false;
  }
  const focusable = root.querySelector<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusable) {
    focusable.focus({ preventScroll: true });
    return true;
  }
  if (root instanceof HTMLElement) {
    if (!root.hasAttribute("tabindex")) {
      root.setAttribute("tabindex", "-1");
    }
    root.focus({ preventScroll: true });
    return true;
  }
  return false;
};

const focusArea = (index: number): void => {
  switch (index) {
    case 1:
      focusFirstIn(document.getElementById("app_topbar"));
      break;
    case 2: {
      const toolbox =
        document.querySelector(".blocklyToolboxDiv") ??
        document.querySelector(".blocklyFlyout");
      if (!focusFirstIn(toolbox)) {
        focusFirstIn(document.getElementById("blockly-workspace-main"));
      }
      break;
    }
    case 3:
      focusFirstIn(document.getElementById("blockly-workspace-main"));
      break;
    case 4:
      focusFirstIn(document.getElementById("div_content_code"));
      break;
    case 5:
      focusFirstIn(document.getElementById("content_console"));
      break;
    default:
      break;
  }
};

const openAreaMenu = (): void => {
  areaMenuAwaitingChoice = true;
  clearAreaMenuTimeout();
  showAreaMenuMessage(getA11yLabel("A11Y_AREA_MENU_HINT"));
  areaMenuTimeoutId = window.setTimeout(() => {
    areaMenuAwaitingChoice = false;
    hideAreaMenuMessage();
    areaMenuTimeoutId = null;
  }, AREA_MENU_TIMEOUT_MS);
};

const onAreaMenuKeyDown = (event: KeyboardEvent): void => {
  const isMod = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (isMod && key === "b") {
    event.preventDefault();
    openAreaMenu();
    return;
  }

  if (!areaMenuAwaitingChoice) {
    return;
  }

  const areaIndex = Number(event.key);
  if (areaIndex >= 1 && areaIndex <= 5) {
    event.preventDefault();
    areaMenuAwaitingChoice = false;
    clearAreaMenuTimeout();
    hideAreaMenuMessage();
    focusArea(areaIndex);
  } else if (key === "escape") {
    event.preventDefault();
    areaMenuAwaitingChoice = false;
    clearAreaMenuTimeout();
    hideAreaMenuMessage();
  }
};

const initSkipLink = (): void => {
  const skipLink = document.getElementById("skip-to-workspace");
  const main = document.getElementById("blockly-workspace-main");
  if (!skipLink || !main) {
    return;
  }
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
  });
};

/**
 * Applique les repères ARIA et tabindex sur la coque (hors workspace Blockly).
 */
export const applyShellLandmarks = (): void => {
  const topbar = document.getElementById("app_topbar");
  if (topbar) {
    topbar.setAttribute("role", "banner");
  }

  const main = document.getElementById("blockly-workspace-main");
  if (main) {
    main.setAttribute("aria-label", getA11yLabel("A11Y_WORKSPACE_MAIN"));
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
  }

  const shortcuts = getShortcutsEl();
  if (shortcuts) {
    shortcuts.setAttribute("role", "status");
    shortcuts.setAttribute("aria-live", "polite");
    shortcuts.setAttribute("aria-atomic", "true");
  }

  const logo = document.querySelector<HTMLImageElement>(".app-title__logo");
  if (logo) {
    logo.setAttribute("aria-hidden", "true");
  }
};

/**
 * Enregistre le lien d'évitement et le menu de zones (Ctrl+B / Cmd+B puis 1–5).
 */
export const registerShellAreaNavigation = (): void => {
  initSkipLink();
  document.addEventListener("keydown", onAreaMenuKeyDown);
};
