/**
 * @packageDocumentation
 * @module UcBlocklyCore.SoundToggleControl
 * @description Workspace control (bottom-right) to mute / unmute Blockly sounds.
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

const STORAGE_KEY = "ucbBlocklySoundsMuted";

const readStoredMuted = (): boolean => {
  try {
    return window.localStorage?.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const persistMuted = (muted: boolean): void => {
  try {
    if (muted) {
      window.localStorage?.setItem(STORAGE_KEY, "1");
    } else {
      window.localStorage?.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
};

/** Material-style speaker icons (same fill tone as zoom-to-fit). */
const SPEAKER_ON_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#546E7A"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  );

const SPEAKER_OFF_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#546E7A"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  );

/**
 * Bottom-right speaker button that toggles Blockly workspace audio.
 */
export class SoundToggleControl
  implements Blockly.IComponent, Blockly.IPositionable, Blockly.IFocusableNode
{
  id = "ucbSoundToggle";

  private svgGroup: SVGElement | null = null;
  private iconImage: SVGImageElement | null = null;
  private left = 0;
  private top = 0;
  private readonly width = 32;
  private readonly height = 32;
  private readonly marginVertical = 20;
  private readonly marginHorizontal = 20;
  private initialized = false;
  private onClickWrapper: Blockly.browserEvents.Data | null = null;
  private muted = false;

  constructor(protected workspace: Blockly.WorkspaceSvg) {}

  init(): void {
    this.muted = readStoredMuted();
    this.workspace.getAudioManager().setMuted(this.muted);

    this.workspace.getComponentManager().addComponent({
      component: this,
      // After zoom-to-fit (weight 2) so collision bump places this above it.
      weight: 2.5,
      capabilities: [
        Blockly.ComponentManager.Capability.POSITIONABLE,
        Blockly.ComponentManager.Capability.FOCUSABLE,
      ],
    });
    this.createDom();
    this.initialized = true;
    this.workspace.resize();
  }

  dispose(): void {
    if (this.svgGroup) {
      Blockly.utils.dom.removeNode(this.svgGroup);
      this.svgGroup = null;
    }
    if (this.onClickWrapper) {
      Blockly.browserEvents.unbind(this.onClickWrapper);
      this.onClickWrapper = null;
    }
    this.iconImage = null;
    this.initialized = false;
  }

  private createDom(): void {
    this.svgGroup = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {
      height: `${this.height}px`,
      width: `${this.width}px`,
      class: "ucbSoundToggle",
      id: Blockly.utils.idGenerator.getNextUniqueId(),
      tabindex: "0",
    });
    Blockly.utils.aria.setRole(this.svgGroup, Blockly.utils.aria.Role.BUTTON);
    this.updateAriaLabel();

    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        width: 40,
        height: 40,
        x: -4,
        y: -4,
        rx: 2,
        ry: 2,
        fill: "none",
        class: "blocklyFocusRing",
      },
      this.svgGroup,
    );

    this.iconImage = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        height: `${this.height}px`,
        width: `${this.width}px`,
        class: "ucbSoundToggleIcon",
      },
      this.svgGroup,
    ) as SVGImageElement;

    this.updateIcon();

    Blockly.utils.dom.insertAfter(
      this.svgGroup,
      this.workspace.getBubbleCanvas(),
    );

    this.onClickWrapper = Blockly.browserEvents.conditionalBind(
      this.svgGroup,
      "pointerdown",
      null,
      this.onClick.bind(this),
    );
  }

  private msg(key: string, fallback: string): string {
    const value = (Blockly.Msg as Record<string, string>)[key];
    return value || fallback;
  }

  private updateAriaLabel(): void {
    if (!this.svgGroup) {
      return;
    }
    const label = this.muted
      ? this.msg("SOUND_TOGGLE_UNMUTE_ARIA", "Unmute Blockly sounds")
      : this.msg("SOUND_TOGGLE_MUTE_ARIA", "Mute Blockly sounds");
    Blockly.utils.aria.setState(
      this.svgGroup,
      Blockly.utils.aria.State.LABEL,
      label,
    );
    this.svgGroup.setAttribute("aria-pressed", this.muted ? "true" : "false");
  }

  private updateIcon(): void {
    if (!this.iconImage) {
      return;
    }
    this.iconImage.setAttributeNS(
      Blockly.utils.dom.XLINK_NS,
      "xlink:href",
      this.muted ? SPEAKER_OFF_URI : SPEAKER_ON_URI,
    );
    if (this.muted) {
      this.svgGroup?.classList.add("ucbSoundToggle--muted");
    } else {
      this.svgGroup?.classList.remove("ucbSoundToggle--muted");
    }
  }

  private onClick(e?: Event): void {
    this.muted = !this.muted;
    this.workspace.getAudioManager().setMuted(this.muted);
    persistMuted(this.muted);
    this.updateIcon();
    this.updateAriaLabel();

    const uiEvent = new (Blockly.Events.get(Blockly.Events.CLICK))(
      null,
      this.workspace.id,
      "ucb_sound_toggle",
    );
    Blockly.Events.fire(uiEvent);
    e?.stopPropagation();
    e?.preventDefault();
  }

  getBoundingRectangle(): Blockly.utils.Rect {
    return new Blockly.utils.Rect(
      this.top,
      this.top + this.height,
      this.left,
      this.left + this.width,
    );
  }

  position(
    metrics: Blockly.MetricsManager.UiMetrics,
    savedPositions: Blockly.utils.Rect[],
  ): void {
    if (!this.initialized) {
      return;
    }
    const hasVerticalScrollbars =
      this.workspace.scrollbar &&
      this.workspace.scrollbar.canScrollHorizontally();
    const hasHorizontalScrollbars =
      this.workspace.scrollbar &&
      this.workspace.scrollbar.canScrollVertically();

    if (
      metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
      (this.workspace.horizontalLayout && !this.workspace.RTL)
    ) {
      this.left =
        metrics.absoluteMetrics.left +
        metrics.viewMetrics.width -
        this.width -
        this.marginHorizontal;
      if (hasVerticalScrollbars && !this.workspace.RTL) {
        this.left -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      this.left = this.marginHorizontal;
      if (hasVerticalScrollbars && this.workspace.RTL) {
        this.left += Blockly.Scrollbar.scrollbarThickness;
      }
    }

    const startAtBottom =
      metrics.toolboxMetrics.position !== Blockly.TOOLBOX_AT_BOTTOM;
    if (startAtBottom) {
      this.top =
        metrics.absoluteMetrics.top +
        metrics.viewMetrics.height -
        this.height -
        this.marginVertical;
      if (hasHorizontalScrollbars) {
        this.top -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      this.top = metrics.absoluteMetrics.top + this.marginVertical;
    }

    let boundingRect = this.getBoundingRectangle();
    for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
      if (boundingRect.intersects(otherEl)) {
        if (startAtBottom) {
          this.top = otherEl.top - this.height - this.marginVertical;
        } else {
          this.top = otherEl.bottom + this.marginVertical;
        }
        boundingRect = this.getBoundingRectangle();
        i = -1;
      }
    }

    this.svgGroup?.setAttribute(
      "transform",
      `translate(${this.left}, ${this.top})`,
    );
  }

  getFocusableElement(): HTMLElement | SVGElement {
    if (!this.svgGroup) {
      throw new Error("Tried to focus an uninitialized sound toggle control");
    }
    return this.svgGroup;
  }

  getFocusableTree(): Blockly.IFocusableTree {
    return this.workspace;
  }

  onNodeFocus(): void {}

  onNodeBlur(): void {}

  canBeFocused(): boolean {
    return true;
  }

  performAction(e?: Event): void {
    this.onClick(e);
  }
}

Blockly.Css.register(`
.ucbSoundToggleIcon {
  opacity: 0.4;
}
.ucbSoundToggleIcon:hover, .ucbSoundToggle:focus .ucbSoundToggleIcon {
  opacity: 0.6;
}
.ucbSoundToggleIcon:active {
  opacity: 0.8;
}
.ucbSoundToggle--muted .ucbSoundToggleIcon {
  opacity: 0.35;
}
`);
