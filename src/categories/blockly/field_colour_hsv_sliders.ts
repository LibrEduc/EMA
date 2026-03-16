/**
 * @packageDocumentation
 * @module BlocklyFields.ColourHsvSliders
 * @description Localized HSV slider field wrapper.
 * @remarks
 * Adds translation support and CSS setup for HSV sliders.
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
import { FieldColourHsvSliders } from "@blockly/field-colour-hsv-sliders";
import { getBlocklyMsgOr } from "./shared";

const HSV_CSS_ID = "ucb-hsv-eyedropper-css";

/**
 * Injects CSS needed for localized HSV labels once.
 */
const ensureHsvCss = (): void => {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(HSV_CSS_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = HSV_CSS_ID;
  style.textContent = `
    .fieldColourEyedropper::before {
      content: attr(data-label);
    }
  `;
  document.head.appendChild(style);
};

/**
 * Applies localized labels to the HSV dropdown UI.
 */
const localizeHsvDropdown = (): void => {
  const contentDiv = Blockly.DropDownDiv.getContentDiv();
  const labelNodes = contentDiv.querySelectorAll(".fieldColourSliderLabel");
  const labels = [
    getBlocklyMsgOr("COLOUR_HSV_HUE_LABEL", "Hue"),
    getBlocklyMsgOr("COLOUR_HSV_SATURATION_LABEL", "Saturation"),
    getBlocklyMsgOr("COLOUR_HSV_BRIGHTNESS_LABEL", "Brightness"),
  ];
  labelNodes.forEach((labelNode, index) => {
    if (index >= labels.length) {
      return;
    }
    const labelSpan = labelNode.querySelector("span");
    if (labelSpan) {
      labelSpan.textContent = labels[index];
    }
  });
  const eyedropper = contentDiv.querySelector(".fieldColourEyedropper");
  if (eyedropper instanceof HTMLElement) {
    eyedropper.setAttribute(
      "data-label",
      getBlocklyMsgOr("COLOUR_HSV_EYEDROPPER_LABEL", "Eyedropper"),
    );
  }
};

/**
 * HSV sliders field with localized labels.
 */
export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders {
  /**
   * Shows the editor and applies localization after render.
   */
  protected override showEditor_(): void {
    ensureHsvCss();
    super.showEditor_();
    window.setTimeout(() => {
      localizeHsvDropdown();
    }, 0);
  }
}
