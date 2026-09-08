/**
 * @packageDocumentation
 * @module Demo.Layout
 * @description Session layout restore and workspace host sizing before inject.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { DemoShellDom } from "./demo_dom";

/**
 * Restores panel layout from session storage.
 * Falls back to sane defaults when nothing is stored yet.
 */
export const restoreLayoutFromSessionStorage = (): void => {
  const layoutElements = {
    flexContainerUp: document.getElementById("flex_container_up") as HTMLElement,
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

  const defaults: Record<string, string> = {
    flexContainerUp: "1",
    flexContainerUpLeft: "1",
    flexContainerUpRight: "0",
    flexContainerBottom: "0",
  };

  Object.entries(layoutElements).forEach(([key, element]) => {
    if (!element) return;
    const savedValue = window.sessionStorage.getItem(key);
    const parsed = savedValue !== null ? Number(savedValue) : NaN;
    const safeValue =
      Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : defaults[key];
    element.style.flexGrow = safeValue;
  });
};

/**
 * Ensures Blockly host div has valid dimensions before first inject.
 * @param elements - Resolved demo shell hosts.
 */
export const primeWorkspaceContainerDimensions = (
  elements: DemoShellDom,
): void => {
  if (!elements.workspaceContentArea || !elements.workspaceContentBlockly) {
    return;
  }
  let x = Number(elements.workspaceContentArea.offsetLeft) || 0;
  let y = Number(elements.workspaceContentArea.offsetTop) || 0;
  let element: HTMLElement = elements.workspaceContentArea;
  while (element.offsetParent) {
    element = element.offsetParent as HTMLElement;
    x += Number(element.offsetLeft) || 0;
    y += Number(element.offsetTop) || 0;
  }
  const rawWidth = Number(elements.workspaceContentArea.offsetWidth);
  const rawHeight = Number(elements.workspaceContentArea.offsetHeight);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 1;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 1;
  Object.assign(elements.workspaceContentBlockly.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Number.isFinite(x) ? x : 0}px`,
    top: `${Number.isFinite(y) ? y : 0}px`,
  });
};
