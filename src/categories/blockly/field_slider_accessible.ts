/**
 * @packageDocumentation
 * @module BlocklyFields.SliderAccessible
 * @description FieldSlider plugin with Blockly v13 ARIA labels on the range editor.
 */

import * as Blockly from "blockly";
import { FieldSlider } from "@blockly/field-slider";
import { getBlocklyMsgOr } from "./shared";

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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
 * Registers (or overrides) `field_slider` with the ARIA wrapper.
 * Prefer override over unregister to avoid Blockly console warnings.
 */
export const registerAccessibleFieldSlider = (): void => {
  // fieldRegistry.register already allows overrides.
  Blockly.fieldRegistry.register("field_slider", AccessibleFieldSlider);
};
