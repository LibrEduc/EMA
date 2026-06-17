/**
 * @packageDocumentation
 * @module WorkspaceFlex
 * @description Flex layout resizers, panel toggles, and session persistence for the workspace UI.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getA11yLabel } from "./a11y_labels";
import {
  BOTTOM_PANEL_TOGGLE_BUTTON_ID,
  FLEX_BOTTOM_LAST_OPEN_KEY,
  FLEX_UP_RIGHT_LAST_OPEN_KEY,
  parsePositiveFlex,
  RIGHT_PANEL_TOGGLE_BUTTON_ID,
  snapNearZeroFlex,
} from "./workspace_layout_utils";
import { getWorkspaceSvgRef, µcB_workspaceOnResize } from "./workspace_resize";

/**
 * Persists layout flex grow values to session storage.
 */
export const saveLayoutToSessionStorage = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById(
      "flex_container_up",
    ) as HTMLElement,
    flexContainerUpLeft: document.getElementById(
      "flex_container_up_left",
    ) as HTMLElement,
    flexContainerUpRight: document.getElementById(
      "flex_container_up_right",
    ) as HTMLElement,
    flexContainerBottom: document.getElementById(
      "flex_container_bottom",
    ) as HTMLElement,
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (element && window.sessionStorage) {
      const flexGrowValue = element.style.flexGrow || "1";
      window.sessionStorage.setItem(key, flexGrowValue);
    }
  });

  const rightOpenFlex = parsePositiveFlex(
    layoutElements.flexContainerUpRight?.style.flexGrow,
  );
  if (rightOpenFlex > 0 && window.sessionStorage) {
    window.sessionStorage.setItem(FLEX_UP_RIGHT_LAST_OPEN_KEY, String(rightOpenFlex));
  }
  const bottomOpenFlex = parsePositiveFlex(
    layoutElements.flexContainerBottom?.style.flexGrow,
  );
  if (bottomOpenFlex > 0 && window.sessionStorage) {
    window.sessionStorage.setItem(FLEX_BOTTOM_LAST_OPEN_KEY, String(bottomOpenFlex));
  }
};

export const updateRightPanelToggleButton = (): void => {
  const button = document.getElementById(RIGHT_PANEL_TOGGLE_BUTTON_ID) as HTMLButtonElement | null;
  const rightPanel = document.getElementById("flex_container_up_right") as HTMLElement | null;
  if (!button || !rightPanel) {
    return;
  }
  const isOpen = parsePositiveFlex(rightPanel.style.flexGrow) > 0;
  button.textContent = isOpen ? ">" : "<";
  button.title = isOpen
    ? getA11yLabel("A11Y_COLLAPSE_CODE_PANEL")
    : getA11yLabel("A11Y_OPEN_CODE_PANEL");
  button.setAttribute(
    "aria-label",
    isOpen ? getA11yLabel("A11Y_COLLAPSE_CODE_PANEL") : getA11yLabel("A11Y_OPEN_CODE_PANEL"),
  );
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

export const updateBottomPanelToggleButton = (): void => {
  const button = document.getElementById(BOTTOM_PANEL_TOGGLE_BUTTON_ID) as HTMLButtonElement | null;
  const bottomPanel = document.getElementById("flex_container_bottom") as HTMLElement | null;
  if (!button || !bottomPanel) {
    return;
  }
  const isOpen = parsePositiveFlex(bottomPanel.style.flexGrow) > 0;
  button.textContent = isOpen ? "v" : "^";
  button.title = isOpen
    ? getA11yLabel("A11Y_COLLAPSE_CONSOLE_PANEL")
    : getA11yLabel("A11Y_OPEN_CONSOLE_PANEL");
  button.setAttribute(
    "aria-label",
    isOpen ? getA11yLabel("A11Y_COLLAPSE_CONSOLE_PANEL") : getA11yLabel("A11Y_OPEN_CONSOLE_PANEL"),
  );
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

const toggleRightPanel = (): void => {
  const leftPanel = document.getElementById("flex_container_up_left") as HTMLElement | null;
  const rightPanel = document.getElementById("flex_container_up_right") as HTMLElement | null;
  if (!leftPanel || !rightPanel) {
    return;
  }

  const leftGrow = parsePositiveFlex(leftPanel.style.flexGrow, 1);
  const rightGrow = parsePositiveFlex(rightPanel.style.flexGrow, 0);

  if (rightGrow > 0) {
    window.sessionStorage?.setItem(FLEX_UP_RIGHT_LAST_OPEN_KEY, String(rightGrow));
    leftPanel.style.flexGrow = String(leftGrow + rightGrow);
    rightPanel.style.flexGrow = "0";
  } else {
    const reopenGrow = parsePositiveFlex(
      window.sessionStorage?.getItem(FLEX_UP_RIGHT_LAST_OPEN_KEY),
      1,
    );
    const total = leftGrow + rightGrow;
    const nextRightGrow = reopenGrow;
    const nextLeftGrow = total > nextRightGrow ? total - nextRightGrow : 1;
    leftPanel.style.flexGrow = String(nextLeftGrow);
    rightPanel.style.flexGrow = String(nextRightGrow);
  }

  saveLayoutToSessionStorage();
  updateRightPanelToggleButton();
  µcB_workspaceOnResize();
};

const toggleBottomPanel = (): void => {
  const upPanel = document.getElementById("flex_container_up") as HTMLElement | null;
  const bottomPanel = document.getElementById("flex_container_bottom") as HTMLElement | null;
  if (!upPanel || !bottomPanel) {
    return;
  }

  const upGrow = parsePositiveFlex(upPanel.style.flexGrow, 1);
  const bottomGrow = parsePositiveFlex(bottomPanel.style.flexGrow, 0);

  if (bottomGrow > 0) {
    window.sessionStorage?.setItem(FLEX_BOTTOM_LAST_OPEN_KEY, String(bottomGrow));
    upPanel.style.flexGrow = String(upGrow + bottomGrow);
    bottomPanel.style.flexGrow = "0";
  } else {
    const reopenGrow = parsePositiveFlex(
      window.sessionStorage?.getItem(FLEX_BOTTOM_LAST_OPEN_KEY),
      1,
    );
    const total = upGrow + bottomGrow;
    const nextBottomGrow = reopenGrow;
    const nextUpGrow = total > nextBottomGrow ? total - nextBottomGrow : 1;
    upPanel.style.flexGrow = String(nextUpGrow);
    bottomPanel.style.flexGrow = String(nextBottomGrow);
  }

  saveLayoutToSessionStorage();
  updateBottomPanelToggleButton();
  µcB_workspaceOnResize();
};

export const initializeRightPanelToggleButton = (): void => {
  const horizontalResizer = document.querySelector(
    "#flex_container_up > flex-resizer",
  ) as HTMLElement | null;
  if (!horizontalResizer) {
    return;
  }
  if (document.getElementById(RIGHT_PANEL_TOGGLE_BUTTON_ID)) {
    updateRightPanelToggleButton();
    return;
  }

  const button = document.createElement("button");
  button.id = RIGHT_PANEL_TOGGLE_BUTTON_ID;
  button.type = "button";
  button.className = "flex-panel-toggle-button";
  button.textContent = ">";
  button.setAttribute("aria-controls", "flex_container_up_right");
  button.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleRightPanel();
  });
  horizontalResizer.appendChild(button);
  updateRightPanelToggleButton();
};

export const initializeBottomPanelToggleButton = (): void => {
  const verticalResizer = document.querySelector(
    "#container_page > flex-resizer",
  ) as HTMLElement | null;
  if (!verticalResizer) {
    return;
  }
  if (document.getElementById(BOTTOM_PANEL_TOGGLE_BUTTON_ID)) {
    updateBottomPanelToggleButton();
    return;
  }

  const button = document.createElement("button");
  button.id = BOTTOM_PANEL_TOGGLE_BUTTON_ID;
  button.type = "button";
  button.className = "flex-panel-toggle-button flex-panel-toggle-button--horizontal";
  button.textContent = "v";
  button.setAttribute("aria-controls", "flex_container_bottom");
  button.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleBottomPanel();
  });
  verticalResizer.appendChild(button);
  updateBottomPanelToggleButton();
};

export const updateResizerAriaValue = (resizer: HTMLElement): void => {
  const previous = resizer.previousElementSibling as HTMLElement | null;
  const next = resizer.nextElementSibling as HTMLElement | null;
  if (!previous || !next) return;
  const prevGrow = parsePositiveFlex(previous.style.flexGrow, 1);
  const nextGrow = parsePositiveFlex(next.style.flexGrow, 1);
  const total = prevGrow + nextGrow;
  const percentage = total > 0 ? Math.round((prevGrow / total) * 100) : 50;
  resizer.setAttribute("aria-valuemin", "0");
  resizer.setAttribute("aria-valuemax", "100");
  resizer.setAttribute("aria-valuenow", String(percentage));
};

/**
 * Handles flex resizing via mouse drag.
 */
const µcB_workspaceManageResize = (
  mouseDown: Event,
  sizeProp: string,
  posProp: string,
): void => {
  const recall: HTMLElement = mouseDown.target as HTMLElement;
  const prev = recall?.previousElementSibling as HTMLInputElement | null;
  const next = recall?.nextElementSibling as HTMLInputElement | null;
  if (!prev || !next) {
    return;
  }
  mouseDown.preventDefault();
  interface IElement {
    [key: string]: string;
  }
  let prevSize: number = Number((prev as unknown as IElement)[sizeProp]);
  let nextSize: number = Number((next as unknown as IElement)[sizeProp]);
  const sumSize: number = prevSize + nextSize;
  const prevGrowParsed: number = Number(prev.style.flexGrow);
  const nextGrowParsed: number = Number(next.style.flexGrow);
  const prevGrow: number = Number.isFinite(prevGrowParsed) && prevGrowParsed > 0
    ? prevGrowParsed
    : 1;
  const nextGrow: number = Number.isFinite(nextGrowParsed) && nextGrowParsed > 0
    ? nextGrowParsed
    : 1;
  const sumGrow: number = prevGrow + nextGrow;
  if (!Number.isFinite(sumSize) || sumSize <= 0) {
    return;
  }
  let lastPos: number = Number((mouseDown as unknown as IElement)[posProp]);

  const onMouseMove = (mouseMove: Event): void => {
    let pos: number = Number((mouseMove as unknown as IElement)[posProp]);
    const difference: number = pos - lastPos;
    prevSize += difference;
    nextSize -= difference;
    if (prevSize < 0) {
      nextSize += prevSize;
      pos -= prevSize;
      prevSize = 0;
    }
    if (nextSize < 0) {
      prevSize += nextSize;
      pos += nextSize;
      nextSize = 0;
    }
    const prevGrowNew: number = sumGrow * (prevSize / sumSize);
    const nextGrowNew: number = sumGrow * (nextSize / sumSize);
    if (!Number.isFinite(prevGrowNew) || !Number.isFinite(nextGrowNew)) {
      return;
    }
    prev.style.flexGrow = String(prevGrowNew);
    next.style.flexGrow = String(nextGrowNew);
    lastPos = pos;
    µcB_workspaceOnResize();
  };

  const onMouseUp = (): void => {
    const html = document.querySelector("html") as HTMLElement;
    html.style.cursor = "default";
    if (String(posProp) === "pageX") {
      recall.style.cursor = "ew-resize";
    } else {
      recall.style.cursor = "ns-resize";
    }
    snapNearZeroFlex(prev, next);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    saveLayoutToSessionStorage();
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

/**
 * Attaches mouse handlers to flex resizer elements.
 */
export const µcB_addFlexResizerEvents = (): void => {
  document.body.addEventListener("mousedown", function (mouseDown: Event) {
    const html = document.querySelector("html") as HTMLElement;
    const mouseTarget = mouseDown.target as HTMLElement;
    if (mouseTarget.nodeType !== 1 || mouseTarget.tagName !== "FLEX-RESIZER") {
      return;
    }
    const parentNode = mouseTarget.parentNode as HTMLElement;
    const resizeHorizontal: boolean =
      parentNode.classList.contains("wrapper_element");
    const resizeVertical: boolean =
      parentNode.classList.contains("wrapper_global");
    if (resizeHorizontal && resizeVertical) {
      return;
    } else if (resizeHorizontal) {
      mouseTarget.style.cursor = "col-resize";
      html.style.cursor = "col-resize";
      µcB_workspaceManageResize(mouseDown, "offsetWidth", "pageX");
    } else if (resizeVertical) {
      mouseTarget.style.cursor = "row-resize";
      html.style.cursor = "row-resize";
      µcB_workspaceManageResize(mouseDown, "offsetHeight", "pageY");
    }
    const ws = getWorkspaceSvgRef();
    if (ws) {
      Blockly.svgResize(ws);
    }
  });
  document.body.addEventListener("mouseup", () => {
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
    const resizers = document.querySelectorAll("flex-resizer");
    resizers.forEach((resizer) => updateResizerAriaValue(resizer as HTMLElement));
  });
  document.body.addEventListener("keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName !== "FLEX-RESIZER") return;
    const previous = target.previousElementSibling as HTMLElement | null;
    const next = target.nextElementSibling as HTMLElement | null;
    if (!previous || !next) return;

    const parentNode = target.parentNode as HTMLElement;
    const isHorizontal = parentNode.classList.contains("wrapper_element");
    const isVertical = parentNode.classList.contains("wrapper_global");
    const step = event.shiftKey ? 0.2 : 0.1;

    let delta = 0;
    if (isHorizontal) {
      if (event.key === "ArrowLeft") delta = -step;
      else if (event.key === "ArrowRight") delta = step;
      else if (event.key === "Home") delta = -999;
      else if (event.key === "End") delta = 999;
    } else if (isVertical) {
      if (event.key === "ArrowUp") delta = -step;
      else if (event.key === "ArrowDown") delta = step;
      else if (event.key === "Home") delta = -999;
      else if (event.key === "End") delta = 999;
    }
    if (delta === 0) return;

    event.preventDefault();
    const prevGrow = parsePositiveFlex(previous.style.flexGrow, 1);
    const nextGrow = parsePositiveFlex(next.style.flexGrow, 1);
    const total = prevGrow + nextGrow;
    if (total <= 0) return;

    let nextPrevGrow = prevGrow + delta;
    if (delta <= -999) nextPrevGrow = 0;
    if (delta >= 999) nextPrevGrow = total;
    nextPrevGrow = Math.max(0, Math.min(total, nextPrevGrow));
    const nextNextGrow = Math.max(0, total - nextPrevGrow);
    previous.style.flexGrow = String(nextPrevGrow);
    next.style.flexGrow = String(nextNextGrow);
    saveLayoutToSessionStorage();
    updateRightPanelToggleButton();
    updateBottomPanelToggleButton();
    updateResizerAriaValue(target);
    µcB_workspaceOnResize();
  });
};
