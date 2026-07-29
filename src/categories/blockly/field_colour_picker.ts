/**
 * @packageDocumentation
 * @module BlocklyFields.ColourPicker
 * @description Custom iro.js-based color picker field for Blockly.
 * @remarks
 * Provides dropdown UI, value handling, and Blockly v13 ARIA helpers.
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
import * as iro from "@jaames/iro";
import {
  formatColourAriaValue,
  getColourAriaTypeName,
  getColourPickerEditorLabel,
} from "./field_colour_a11y";

type IroColor = { hexString: string };
type IroColorPicker = {
  on: (eventName: string, handler: (color: IroColor) => void) => void;
};

let isTargetInputPatched = false;
let isHideChaffPatched = false;
let ignoreHideChaffUntil = 0;

/**
 * Patches Blockly.browserEvents.isTargetInput for custom picker elements.
 */
const ensureIsTargetInputPatch = (): void => {
  if (isTargetInputPatched) {
    return;
  }
  const browserEvents = Blockly.browserEvents as unknown as {
    isTargetInput: (event: Event) => boolean;
  };
  const originalIsTargetInput = browserEvents.isTargetInput;
  browserEvents.isTargetInput = (event: Event): boolean => {
    if (originalIsTargetInput(event)) {
      return true;
    }
    const target = event.target;
    if (target instanceof Element) {
      if (target.closest('[data-is-text-input="true"]')) {
        return true;
      }
    }
    const path = (event as Event & { composedPath?: () => EventTarget[] }).composedPath?.() ?? [];
    for (const item of path) {
      if (item instanceof Element && item.getAttribute("data-is-text-input") === "true") {
        return true;
      }
    }
    return false;
  };
  isTargetInputPatched = true;
};

/**
 * Patches WorkspaceSvg.hideChaff to keep the picker open during drag.
 */
const ensureHideChaffPatch = (): void => {
  if (isHideChaffPatched) {
    return;
  }
  const workspaceProto = (Blockly.WorkspaceSvg as unknown as {
    prototype: { hideChaff: (opt?: boolean) => void };
  }).prototype;
  const originalHideChaff = workspaceProto.hideChaff;
  workspaceProto.hideChaff = function (opt?: boolean): void {
    if (ignoreHideChaffUntil > Date.now()) {
      return;
    }
    return originalHideChaff.call(this, opt);
  };
  isHideChaffPatched = true;
};

/**
 * Marks picker DOM nodes as valid input targets.
 * @param root - Root picker element to tag.
 */
const markInputTargets = (root: HTMLElement): void => {
  root.setAttribute("data-is-text-input", "true");
  const descendants = root.querySelectorAll<HTMLElement>("*");
  for (const node of descendants) {
    node.setAttribute("data-is-text-input", "true");
  }
};

/**
 * Resolves the iro.js ColorPicker constructor.
 * @returns Constructor function or null if not available.
 */
const getIroPicker = (): (new (
  parent: string | HTMLElement,
  options: { width: number; height: number; color: string },
) => IroColorPicker) | null => {
  const maybeIro = iro as unknown as {
    ColorPicker?: unknown;
    default?: { ColorPicker?: unknown };
  };
  const picker = maybeIro.ColorPicker ?? maybeIro.default?.ColorPicker;
  if (typeof picker !== "function") {
    return null;
  }
  return picker as new (
    parent: string | HTMLElement,
    options: { width: number; height: number; color: string },
  ) => IroColorPicker;
};

const hideColourPickerDropdown = (): void => {
  const dropDownDiv = Blockly.DropDownDiv as unknown as { hide?: () => void };
  if (typeof dropDownDiv.hide === "function") {
    dropDownDiv.hide();
  }
};

/**
 * Custom Blockly field that renders an iro.js color picker.
 */
export class FieldColorPicker extends Blockly.FieldTextInput {
  static readonly DEFAULT_VALUE = "#FF00FF";

  protected textEditEnabled_ = false;

  private editorDispose_: (() => void) | null = null;

  /**
   * Creates the field with a default value and optional validator.
   * @param opt_value - Optional initial color value.
   * @param opt_validator - Optional validator callback.
   */
  constructor(
    opt_value?: string,
    opt_validator?: Blockly.FieldValidator,
  ) {
    super(opt_value ?? FieldColorPicker.DEFAULT_VALUE, opt_validator);
  }

  /**
   * ARIA type for Blockly v13 keyboard / screen reader navigation.
   */
  getAriaTypeName(): string {
    return getColourAriaTypeName();
  }

  /**
   * Spoken colour value (hex + RGB).
   */
  getAriaValue(): string {
    return formatColourAriaValue(this.getValue());
  }

  /** {@inheritdoc} */
  override getText(): string {
    return formatColourAriaValue(this.getValue());
  }

  /**
   * Initializes the field view and click target.
   */
  public override initView(): void {
    const constants = this.getConstants();
    if (!constants) {
      return;
    }
    const self = this as unknown as {
      size_?: Blockly.utils.Size;
      createBorderRect_?: () => void;
      borderRect_?: SVGRectElement;
      clickTarget_?: SVGElement;
      sourceBlock_?: Blockly.BlockSvg;
      fieldGroup_?: SVGGElement;
    };
    self.size_ = new Blockly.utils.Size(
      constants.FIELD_COLOUR_DEFAULT_WIDTH,
      constants.FIELD_COLOUR_DEFAULT_HEIGHT,
    );
    if (!constants.FIELD_COLOUR_FULL_BLOCK) {
      self.createBorderRect_?.();
      if (self.borderRect_) {
        self.borderRect_.style.fillOpacity = "1";
      }
    } else if (self.sourceBlock_) {
      self.clickTarget_ = self.sourceBlock_.getSvgRoot();
    }
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      clickTarget.setAttribute("role", "button");
      clickTarget.setAttribute(
        "aria-label",
        `${getColourAriaTypeName()}: ${formatColourAriaValue(this.getValue())}`,
      );
    }
  }

  /**
   * Updates the on-block ARIA label when the colour changes.
   */
  protected override doValueUpdate_(newValue: string): void {
    const self = this as unknown as {
      value_?: string;
      borderRect_?: SVGRectElement;
      sourceBlock_?: Blockly.BlockSvg;
    };
    self.value_ = newValue;
    if (self.borderRect_) {
      self.borderRect_.style.fill = newValue;
    } else if (self.sourceBlock_?.rendered) {
      const pathObject = self.sourceBlock_.pathObject;
      pathObject?.svgPath?.setAttribute("fill", newValue);
      pathObject?.svgPath?.setAttribute("stroke", "#fff");
    }
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      clickTarget.setAttribute(
        "aria-label",
        `${getColourAriaTypeName()}: ${formatColourAriaValue(newValue)}`,
      );
    }
  }

  /**
   * Shows the dropdown color picker editor.
   */
  protected override showEditor_(): void {
    const Picker = getIroPicker();
    if (!Picker) {
      super.showEditor_();
      return;
    }
    ensureIsTargetInputPatch();
    ensureHideChaffPatch();

    const editorRoot = document.createElement("div");
    editorRoot.className = "ucb-colour-picker-editor";
    editorRoot.setAttribute("role", "group");
    editorRoot.setAttribute("aria-label", getColourPickerEditorLabel());
    editorRoot.setAttribute("tabindex", "-1");

    const mount = document.createElement("div");
    mount.className = "ucb-colour-picker-mount";
    mount.setAttribute("aria-hidden", "true");
    editorRoot.appendChild(mount);

    const contentDiv = Blockly.DropDownDiv.getContentDiv();
    const boundEvents: Blockly.browserEvents.Data[] = [];
    let observer: MutationObserver | null = null;

    const disposeEditor = (): void => {
      // DropDownDiv may already have cleared contentDiv before calling this.
      if (this.editorDispose_ !== disposeEditor) {
        return;
      }
      this.editorDispose_ = null;
      for (const binding of boundEvents) {
        Blockly.browserEvents.unbind(binding);
      }
      boundEvents.length = 0;
      observer?.disconnect();
      observer = null;
      if (editorRoot.isConnected) {
        editorRoot.remove();
      }
    };
    this.editorDispose_ = disposeEditor;

    const markIgnoreHideChaff = (): void => {
      ignoreHideChaffUntil = Date.now() + 250;
    };
    const keepIgnoreHideChaff = (event: Event): void => {
      const pointerEvent = event as PointerEvent;
      if (typeof pointerEvent.buttons === "number" && pointerEvent.buttons === 0) {
        return;
      }
      markIgnoreHideChaff();
    };
    editorRoot.addEventListener("pointerdown", markIgnoreHideChaff, { capture: true });
    editorRoot.addEventListener("mousedown", markIgnoreHideChaff, { capture: true });
    editorRoot.addEventListener("touchstart", markIgnoreHideChaff, { capture: true });
    editorRoot.addEventListener("pointermove", keepIgnoreHideChaff, { capture: true });

    boundEvents.push(
      Blockly.browserEvents.conditionalBind(document, "keydown", this, (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === "Escape") {
          keyboardEvent.preventDefault();
          hideColourPickerDropdown();
        }
      }),
    );

    contentDiv.appendChild(editorRoot);

    let attempts = 0;
    const tryShow = (): boolean => {
      const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg | null;
      if (!sourceBlock || !sourceBlock.getSvgRoot()) {
        return false;
      }
      try {
        Blockly.DropDownDiv.showPositionedByBlock(this, sourceBlock, disposeEditor);
        return true;
      } catch {
        return false;
      }
    };
    const showWithRetry = (): void => {
      attempts += 1;
      if (tryShow()) {
        editorRoot.focus({ preventScroll: true });
        return;
      }
      if (attempts < 3) {
        window.setTimeout(showWithRetry, 0);
        return;
      }
      disposeEditor();
      super.showEditor_();
    };
    showWithRetry();

    // Pass the element: Blockly genUid() can produce IDs invalid as CSS selectors.
    const colorPicker = new Picker(mount, {
      width: 150,
      height: 150,
      color: this.getValue() || FieldColorPicker.DEFAULT_VALUE,
    });
    observer = new MutationObserver(() => {
      markInputTargets(mount);
    });
    observer.observe(mount, { childList: true, subtree: true });
    markInputTargets(mount);
    window.setTimeout(() => markInputTargets(mount), 0);
    colorPicker.on("color:change", (color) => {
      this.setEditorValue_(color.hexString);
    });
  }

  public override applyColour(): void {
    const self = this as unknown as {
      borderRect_?: SVGRectElement;
      sourceBlock_?: Blockly.BlockSvg;
    };
    const constants = this.getConstants();
    if (!constants) {
      return;
    }
    const value = this.getValue() || FieldColorPicker.DEFAULT_VALUE;
    if (!constants.FIELD_COLOUR_FULL_BLOCK) {
      if (self.borderRect_) {
        self.borderRect_.style.fill = value;
      }
    } else if (self.sourceBlock_) {
      const pathObject = self.sourceBlock_.pathObject;
      pathObject?.svgPath?.setAttribute("fill", value);
      pathObject?.svgPath?.setAttribute("stroke", "#fff");
    }
  }

  protected override setEditorValue_(newValue: string): void {
    this.setValue(newValue);
  }

  /** {@inheritdoc} */
  override dispose(): void {
    this.editorDispose_?.();
    super.dispose();
  }
}

Blockly.fieldRegistry.register("field_color_picker", FieldColorPicker);
