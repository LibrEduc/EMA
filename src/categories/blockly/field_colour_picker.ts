/**
 * @packageDocumentation
 * @module BlocklyFields.ColourPicker
 * @description Custom iro.js-based color picker field for Blockly.
 * @remarks
 * Provides dropdown UI and value handling for color selection.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

import * as Blockly from "blockly";
import * as iro from "@jaames/iro";

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
  selector: string,
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
    selector: string,
    options: { width: number; height: number; color: string },
  ) => IroColorPicker;
};

/**
 * Custom Blockly field that renders an iro.js color picker.
 */
export class FieldColorPicker extends Blockly.FieldTextInput {
  static readonly DEFAULT_VALUE = "#FF00FF";

  protected textEditEnabled_ = false;

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
    const editor = document.createElement("div");
    editor.id = "color-picker";
    editor.setAttribute("spellcheck", "false");
    const contentDiv = Blockly.DropDownDiv.getContentDiv();
    const markIgnoreHideChaff = () => {
      ignoreHideChaffUntil = Date.now() + 250;
    };
    const keepIgnoreHideChaff = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if (typeof pointerEvent.buttons === "number" && pointerEvent.buttons === 0) {
        return;
      }
      markIgnoreHideChaff();
    };
    editor.addEventListener("pointerdown", markIgnoreHideChaff, { capture: true });
    editor.addEventListener("mousedown", markIgnoreHideChaff, { capture: true });
    editor.addEventListener("touchstart", markIgnoreHideChaff, { capture: true });
    editor.addEventListener("pointermove", keepIgnoreHideChaff, { capture: true });
    contentDiv.appendChild(editor);
    let attempts = 0;
    const tryShow = () => {
      const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg | null;
      if (!sourceBlock || !sourceBlock.getSvgRoot()) {
        return false;
      }
      try {
        Blockly.DropDownDiv.showPositionedByBlock(this, sourceBlock, () => editor.remove());
        return true;
      } catch {
        return false;
      }
    };
    const showWithRetry = () => {
      attempts += 1;
      if (tryShow()) {
        return;
      }
      if (attempts < 3) {
        window.setTimeout(showWithRetry, 0);
        return;
      }
      editor.remove();
      super.showEditor_();
    };
    showWithRetry();
    const colorPicker = new Picker("#color-picker", {
      width: 150,
      height: 150,
      color: this.getValue() || FieldColorPicker.DEFAULT_VALUE,
    });
    const observer = new MutationObserver(() => {
      markInputTargets(editor);
    });
    observer.observe(editor, { childList: true, subtree: true });
    markInputTargets(editor);
    window.setTimeout(() => markInputTargets(editor), 0);
    colorPicker.on("color:change", (color) => {
      this.setEditorValue_(color.hexString);
    });
  }

  /**
   * Applies the new color to the field UI.
   * @param newValue - New color value.
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
}

Blockly.fieldRegistry.register("field_color_picker", FieldColorPicker);
