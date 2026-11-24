/**
 * Champ de recherche en haut du flyout (saisie + blocs visibles ensemble).
 * Le `#toolbox-search-input` natif reste la source Blockly (catégorie search) mais est masqué dans le rail.
 */

import * as Blockly from "blockly";

const SOURCE_ID = "toolbox-search-input";
const BAR_ID = "ema-flyout-search";
const INPUT_ID = "ema-flyout-search-input";
const SEARCH_BAR_H = 48;

type FlyoutWithPosition = Blockly.IFlyout & {
  position: () => void;
  getWidth?: () => number;
  isVisible?: () => boolean;
  svgGroup_?: SVGGElement | null;
};

type ToolboxWithWidth = Blockly.IToolbox & {
  getWidth?: () => number;
  HtmlDiv?: HTMLElement | null;
};

let hookedFlyout: FlyoutWithPosition | null = null;
let originalPosition: (() => void) | null = null;

// Category selected when the search took over, to go back to it once the query is empty.
let categoryBeforeSearch: object | null = null;

// getElementById would find the plugin's category DIV that carries the same id.
function getSource(workspace: Blockly.WorkspaceSvg): HTMLInputElement | null {
  const category = workspace
    .getToolbox()
    ?.getToolboxItems()
    .find((item) => item.getId() === SOURCE_ID);
  return (
    (category as Blockly.ToolboxCategory | undefined)
      ?.getDiv()
      ?.querySelector("input") ?? null
  );
}

function getBar(): HTMLDivElement | null {
  return document.getElementById(BAR_ID) as HTMLDivElement | null;
}

function getFlyoutInput(): HTMLInputElement | null {
  return document.getElementById(INPUT_ID) as HTMLInputElement | null;
}

function readTranslate(svg: SVGElement): { x: number; y: number } | null {
  const css = svg.style.transform || "";
  const attr = svg.getAttribute("transform") || "";
  const raw = css || attr;
  const match =
    /translate3d\(\s*([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?/i.exec(raw) ||
    /translate\(\s*([-\d.]+)(?:px)?\s*(?:,|\s)\s*([-\d.]+)(?:px)?/i.exec(raw);
  if (!match) {
    return null;
  }
  return { x: Number(match[1]), y: Number(match[2]) };
}

function writeTranslate(svg: SVGElement, x: number, y: number): void {
  if (svg.style.transform) {
    svg.style.transform = `translate(${x}px, ${y}px)`;
    return;
  }
  svg.setAttribute("transform", `translate(${x}, ${y})`);
}

type SearchableToolbox = {
  getToolboxItems?: () => Array<{
    getId?: () => string;
    isSelectable?: () => boolean;
  }>;
  setSelectedItem?: (item: unknown) => void;
  getSelectedItem?: () => { getId?: () => string } | null;
};

function selectSearchCategory(workspace: Blockly.WorkspaceSvg): void {
  const toolbox = workspace.getToolbox() as SearchableToolbox | null;
  if (!toolbox?.getToolboxItems || !toolbox.setSelectedItem) {
    return;
  }
  const selected = toolbox.getSelectedItem?.();
  if (selected?.getId?.() === SOURCE_ID) {
    return;
  }
  for (const item of toolbox.getToolboxItems()) {
    if (item.getId?.() === SOURCE_ID) {
      categoryBeforeSearch = selected ?? null;
      toolbox.setSelectedItem(item);
      return;
    }
  }
}

// Leaves the search category once the query is empty, back to where the user was.
function restoreCategoryBeforeSearch(workspace: Blockly.WorkspaceSvg): void {
  const toolbox = workspace.getToolbox() as SearchableToolbox | null;
  if (!toolbox?.getToolboxItems || !toolbox.setSelectedItem) {
    return;
  }
  if (toolbox.getSelectedItem?.()?.getId?.() !== SOURCE_ID) {
    return;
  }
  const items = toolbox.getToolboxItems();
  const previous = items.find((item) => item === categoryBeforeSearch);
  const firstCategory = items.find(
    (item) => item.getId?.() !== SOURCE_ID && item.isSelectable?.(),
  );
  // Fallback when nothing was selected before the search, or that category is gone.
  const target = previous ?? firstCategory;
  if (target) {
    toolbox.setSelectedItem(target);
  }
}

function syncSourceFromFlyout(
  workspace: Blockly.WorkspaceSvg,
  value: string,
): void {
  const source = getSource(workspace);
  if (!source) {
    return;
  }
  // The plugin refreshes the flyout only while its search category is selected: select it
  // before a query, and leave it only after an empty one (the plugin resets to the hint first).
  const isEmpty = value.trim() === "";
  if (!isEmpty) {
    selectSearchCategory(workspace);
  }
  if (source.value !== value) {
    source.value = value;
  }
  source.dispatchEvent(new Event("input", { bubbles: true }));
  if (isEmpty) {
    restoreCategoryBeforeSearch(workspace);
  }
}

function ensureBar(workspace: Blockly.WorkspaceSvg): HTMLDivElement | null {
  let bar = getBar();
  if (bar) {
    return bar;
  }

  const injection =
    workspace.getInjectionDiv?.() ??
    (document.querySelector(".injectionDiv") as HTMLElement | null);
  if (!injection) {
    return null;
  }

  if (getComputedStyle(injection).position === "static") {
    injection.style.position = "relative";
  }

  bar = document.createElement("div");
  bar.id = BAR_ID;
  bar.className = "emaFlyoutSearch";
  bar.innerHTML =
    '<label class="emaFlyoutSearch-label visually-hidden" for="' +
    INPUT_ID +
    '">Rechercher</label>' +
    '<input type="search" id="' +
    INPUT_ID +
    '" class="emaFlyoutSearch-input" autocomplete="off" />';

  const input = bar.querySelector("input") as HTMLInputElement;
  input.addEventListener("focus", () => {
    selectSearchCategory(workspace);
    const source = getSource(workspace);
    if (source) {
      input.placeholder = source.placeholder || "Rechercher";
      if (!input.value && source.value) {
        input.value = source.value;
      }
    }
  });
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      restoreCategoryBeforeSearch(workspace);
    }
  });
  input.addEventListener("input", () => {
    syncSourceFromFlyout(workspace, input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      syncSourceFromFlyout(workspace, "");
      event.stopPropagation();
    }
  });

  injection.appendChild(bar);
  return bar;
}

function layoutBar(workspace: Blockly.WorkspaceSvg): void {
  const bar = getBar();
  const flyout = workspace.getFlyout() as FlyoutWithPosition | null;
  if (!bar || !flyout) {
    return;
  }

  const visible = flyout.isVisible?.() ?? true;
  bar.hidden = !visible;
  if (!visible) {
    return;
  }

  const injection = workspace.getInjectionDiv?.();
  if (!injection) {
    return;
  }

  const svg =
    (flyout.svgGroup_ as SVGElement | null | undefined) ??
    (injection.querySelector(".blocklyFlyout") as SVGElement | null);
  if (!svg) {
    return;
  }

  const toolbox = workspace.getToolbox() as ToolboxWithWidth | null;
  const toolboxWidth =
    toolbox?.getWidth?.() ??
    toolbox?.HtmlDiv?.getBoundingClientRect().width ??
    0;

  // Après originalPosition() : coords Blockly brutes (y ≈ 0).
  const translated = readTranslate(svg);
  const x = Math.round(translated?.x ?? toolboxWidth);
  const measuredWidth = svg.getBoundingClientRect().width;
  const width = Math.round(
    Math.max(160, flyout.getWidth?.() || measuredWidth || 220),
  );

  bar.style.left = `${x}px`;
  bar.style.top = "0px";
  bar.style.width = `${width}px`;
  bar.style.height = `${SEARCH_BAR_H}px`;

  writeTranslate(svg, x, SEARCH_BAR_H);

  const source = getSource(workspace);
  const input = getFlyoutInput();
  if (source && input && document.activeElement !== input) {
    input.placeholder = source.placeholder || "Rechercher";
  }
}

function hookFlyoutPosition(workspace: Blockly.WorkspaceSvg): void {
  const flyout = workspace.getFlyout() as FlyoutWithPosition | null;
  if (!flyout || typeof flyout.position !== "function") {
    return;
  }
  if (hookedFlyout === flyout) {
    return;
  }
  if (hookedFlyout && originalPosition) {
    hookedFlyout.position = originalPosition;
  }
  hookedFlyout = flyout;
  originalPosition = flyout.position.bind(flyout);
  flyout.position = () => {
    originalPosition?.();
    layoutBar(workspace);
  };
}

/**
 * Installe (idempotent) la barre de recherche en tête du flyout.
 */
export function installFlyoutSearchBar(workspace: Blockly.WorkspaceSvg): void {
  categoryBeforeSearch = null;
  if (!ensureBar(workspace)) {
    return;
  }
  document.documentElement.classList.add("ema-flyout-search");
  hookFlyoutPosition(workspace);
  requestAnimationFrame(() => {
    workspace.getFlyout()?.position?.();
    layoutBar(workspace);
  });
}
