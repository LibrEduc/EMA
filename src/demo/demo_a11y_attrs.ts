/**
 * @packageDocumentation
 * @module Demo.A11yAttrs
 * @description Apply ARIA attributes to demo code/console/resizer regions.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getA11yLabel } from "../a11y_labels";
import {
  applyShellLandmarks,
  applyToolbarA11y,
} from "../shell_a11y";
import {
  updateBottomPanelToggleButton,
  updateResizerAriaValue,
  updateRightPanelToggleButton,
} from "../workspace_flex";
import type { DemoShellDom } from "./demo_dom";

/**
 * Applies accessibility attributes to code, console, and panel resizers.
 * @param elements - Demo shell hosts.
 */
export const applyA11yAttributes = (elements: DemoShellDom): void => {
  if (elements.contentCode) {
    elements.contentCode.setAttribute("role", "region");
    elements.contentCode.setAttribute(
      "aria-label",
      getA11yLabel("A11Y_GENERATED_CODE_REGION"),
    );
    elements.contentCode.setAttribute("tabindex", "0");
  }
  const consoleElement = document.getElementById(
    "content_console",
  ) as HTMLElement | null;
  if (consoleElement) {
    consoleElement.setAttribute("role", "log");
    consoleElement.setAttribute("aria-live", "polite");
    consoleElement.setAttribute("aria-relevant", "additions text");
    consoleElement.setAttribute(
      "aria-label",
      getA11yLabel("A11Y_CONSOLE_REGION"),
    );
    consoleElement.setAttribute("tabindex", "0");
  }
  const horizontalResizer = document.querySelector(
    "#flex_container_up > flex-resizer",
  ) as HTMLElement | null;
  const verticalResizer = document.querySelector(
    "#container_page > flex-resizer",
  ) as HTMLElement | null;
  if (horizontalResizer) {
    horizontalResizer.setAttribute("role", "separator");
    horizontalResizer.setAttribute("aria-orientation", "vertical");
    horizontalResizer.setAttribute(
      "aria-label",
      getA11yLabel("A11Y_HORIZONTAL_RESIZER"),
    );
    horizontalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(horizontalResizer);
  }
  if (verticalResizer) {
    verticalResizer.setAttribute("role", "separator");
    verticalResizer.setAttribute("aria-orientation", "horizontal");
    verticalResizer.setAttribute(
      "aria-label",
      getA11yLabel("A11Y_VERTICAL_RESIZER"),
    );
    verticalResizer.setAttribute("tabindex", "0");
    updateResizerAriaValue(verticalResizer);
  }
  updateRightPanelToggleButton();
  updateBottomPanelToggleButton();
  applyShellLandmarks();
  applyToolbarA11y();
};
