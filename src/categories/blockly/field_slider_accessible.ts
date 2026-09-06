/**
 * @packageDocumentation
 * @module BlocklyFields.SliderAccessible
 * @description FieldSlider plugin with Blockly v13 ARIA labels on the range editor.
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
import * as FieldSliderNS from "@blockly/field-slider";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";
import { getBlocklyMsgOr } from "./shared";

type FieldSliderCtor = typeof import("@blockly/field-slider").FieldSlider;

const FieldSlider = namedExportFromCjsPlugin<FieldSliderCtor>(
  FieldSliderNS,
  "FieldSlider",
);

const getSliderAriaTypeName = (): string =>
  getBlocklyMsgOr("FIELD_SLIDER_ARIA_TYPE", "slider");

const getSliderEditorLabel = (): string =>
  getBlocklyMsgOr("FIELD_SLIDER_EDITOR_LABEL", "Value slider");

/**
 * Number slider with accessible on-block type and editor ARIA attributes.
 */
export class AccessibleFieldSlider extends FieldSlider {
  /** ARIA type for Blockly v13 keyboard / screen reader navigation. */
  override getAriaTypeName(): string {
    return getSliderAriaTypeName();
  }

  /**
   * Shows the slider editor and annotates the range input for assistive tech.
   */
  protected override showEditor_(e?: Event, quietInput?: boolean): void {
    super.showEditor_(e, quietInput);
    window.setTimeout(() => {
      this.applySliderEditorA11y();
    }, 0);
  }

  private applySliderEditorA11y(): void {
    const contentDiv = Blockly.DropDownDiv.getContentDiv();
    const container = contentDiv.querySelector(".fieldSliderContainer");
    if (container instanceof HTMLElement) {
      container.setAttribute("role", "group");
      container.setAttribute("aria-label", getSliderEditorLabel());
    }

    const slider = contentDiv.querySelector(".fieldSlider");
    if (!(slider instanceof HTMLInputElement)) {
      return;
    }

    const label = getSliderEditorLabel();
    slider.setAttribute("aria-label", label);
    slider.setAttribute("aria-valuemin", slider.min);
    slider.setAttribute("aria-valuemax", slider.max);
    slider.setAttribute("aria-valuenow", slider.value);

    if (!slider.dataset.ucbA11yBound) {
      slider.dataset.ucbA11yBound = "1";
      slider.addEventListener("input", () => {
        slider.setAttribute("aria-valuenow", slider.value);
      });
    }
  }
}

/**
 * Registers (or overrides) `field_slider` with the ARIA wrapper. Prefer override over unregister to avoid Blockly console warnings.
 */
export const registerAccessibleFieldSlider = (): void => {
  // fieldRegistry.register already allows overrides.
  Blockly.fieldRegistry.register("field_slider", AccessibleFieldSlider);
};
