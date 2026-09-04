/**
 * @packageDocumentation
 * @module BlocklyFields.ColourHsvSliders
 * @description Localized HSV slider field wrapper.
 * @remarks
 * Adds translation support, CSS setup, and Blockly v13 ARIA helpers for HSV sliders.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
import * as FieldColourHsvSlidersNS from "@blockly/field-colour-hsv-sliders";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import { getBlocklyMsgOr } from "./shared";
import {
  formatColourAriaValue,
  getColourAriaTypeName,
  getColourHsvEditorLabel,
} from "./field_colour_a11y";

const FieldColourHsvSliders = namedExportFromCjsPlugin<
  typeof import("@blockly/field-colour-hsv-sliders").FieldColourHsvSliders
>(FieldColourHsvSlidersNS, "FieldColourHsvSliders");

const HSV_CSS_ID = "ucb-hsv-eyedropper-css";

const HSV_SLIDER_LABEL_KEYS = [
  "COLOUR_HSV_HUE_LABEL",
  "COLOUR_HSV_SATURATION_LABEL",
  "COLOUR_HSV_BRIGHTNESS_LABEL",
] as const;

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
 * Applies localized labels and ARIA attributes to the HSV dropdown UI.
 */
const localizeHsvDropdown = (): void => {
  const contentDiv = Blockly.DropDownDiv.getContentDiv();
  const container = contentDiv.querySelector(".fieldColourSliderContainer");
  if (container instanceof HTMLElement) {
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", getColourHsvEditorLabel());
  }

  const labelNodes = contentDiv.querySelectorAll(".fieldColourSliderLabel");
  const sliders = contentDiv.querySelectorAll<HTMLInputElement>(".fieldColourSlider");
  const labels = HSV_SLIDER_LABEL_KEYS.map((key, index) =>
    getBlocklyMsgOr(key, ["Hue", "Saturation", "Brightness"][index] ?? key),
  );

  labelNodes.forEach((labelNode, index) => {
    if (index >= labels.length) {
      return;
    }
    const labelSpan = labelNode.querySelector("span");
    if (labelSpan) {
      labelSpan.textContent = labels[index];
    }
  });

  sliders.forEach((slider, index) => {
    if (index >= labels.length) {
      return;
    }
    slider.setAttribute("aria-label", labels[index]);
    slider.setAttribute("aria-valuemin", slider.min);
    slider.setAttribute("aria-valuemax", slider.max);
    slider.setAttribute("aria-valuenow", slider.value);
  });

  const eyedropper = contentDiv.querySelector(".fieldColourEyedropper");
  if (eyedropper instanceof HTMLElement) {
    const eyedropperLabel = getBlocklyMsgOr("COLOUR_HSV_EYEDROPPER_LABEL", "Eyedropper");
    eyedropper.setAttribute("data-label", eyedropperLabel);
    eyedropper.setAttribute("aria-label", eyedropperLabel);
    eyedropper.setAttribute("type", "button");
  }
};

/**
 * HSV sliders field with localized labels and screen-reader-friendly values.
 */
export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders {
  /**
   * ARIA type for Blockly v13 keyboard / screen reader navigation.
   */
  getAriaTypeName(): string {
    return getColourAriaTypeName();
  }

  /**
   * Spoken colour value (hex + RGB), not only the raw hex string.
   */
  getAriaValue(): string {
    return formatColourAriaValue(this.getValue());
  }

  /** {@inheritdoc} */
  override getText(): string {
    return formatColourAriaValue(this.getValue());
  }

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
