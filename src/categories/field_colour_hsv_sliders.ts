import * as Blockly from "blockly";
import { FieldColourHsvSliders } from "@blockly/field-colour-hsv-sliders";
import { getBlocklyMsgOr } from "./blockly/shared";

const HSV_CSS_ID = "ucb-hsv-eyedropper-css";

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

export class LocalizedFieldColourHsvSliders extends FieldColourHsvSliders {
  protected override showEditor_(): void {
    ensureHsvCss();
    super.showEditor_();
    window.setTimeout(() => {
      localizeHsvDropdown();
    }, 0);
  }
}
