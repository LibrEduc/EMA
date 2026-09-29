/**
 * @packageDocumentation
 * @module Demo.ContinuousToolbox
 * @description Register / unregister @blockly/continuous-toolbox for the demo.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";
import { ContinuousMetricsOverlayFlyout } from "../continuous_metrics_overlay_flyout";

/**
 * Custom flyout inflater for category placeholders.
 */
class CategoryFlyoutInflater implements Blockly.IFlyoutInflater {
  /**
   * Creates a flyout item for category separators.
   * @param _state - Unused state data.
   * @param flyout - The flyout instance requesting items.
   */
  load(_state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    void _state;
    const axis = flyout.horizontalLayout
      ? ("x" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1])
      : ("y" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1]);
    const separator = new Blockly.FlyoutSeparator(0, axis);
    return new Blockly.FlyoutItem(separator, this.getType());
  }

  /**
   * Returns the gap after this item.
   * @param _state - Unused state data.
   * @param _defaultGap - Default gap size.
   */
  gapForItem(_state: object, _defaultGap: number): number {
    void _state;
    void _defaultGap;
    return 0;
  }

  /**
   * Disposes a flyout item.
   * @param _item - Item to dispose.
   */
  disposeItem(_item: Blockly.FlyoutItem): void {
    void _item;
  }

  /**
   * Returns the registered type string.
   */
  getType(): string {
    return "category";
  }
}

/**
 * Registers components needed for the continuous toolbox.
 */
export const registerContinuousToolboxComponents = (): void => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    ContinuousCategory,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    ContinuousMetricsOverlayFlyout,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout",
    ContinuousFlyout,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    "ContinuousToolbox",
    ContinuousToolbox,
    true,
  );

  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    RecyclableBlockFlyoutInflater,
    true,
  );
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "category",
    CategoryFlyoutInflater,
    true,
  );

  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 auto 0.125rem;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }
    .blocklyToolboxCategory {
      height: initial;
      padding: 3px 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
    }
    .blocklyTreeLabel {
      margin: auto;
    }
    .blocklyToolboxCategoryLabel {
      text-align: center;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Unregisters continuous toolbox components and restores defaults.
 */
export const unregisterContinuousToolboxComponents = (): void => {
  const customStyles = document.querySelectorAll("style");
  customStyles.forEach((style) => {
    if (style.textContent?.includes(".categoryBubble")) {
      style.remove();
    }
  });
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    Blockly.ToolboxCategory,
    true,
  );
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "block",
    Blockly.BlockFlyoutInflater,
    true,
  );
  try {
    Blockly.registry.unregister(
      Blockly.registry.Type.FLYOUT_INFLATER,
      "category",
    );
  } catch {
    // Ignore if already unregistered
  }
  const style = document.createElement("style");
  style.textContent = `
    .categoryBubble {
      margin: 0 0.5rem 0 0;
      border-radius: 0%;
      width: 8px;
      height: 16px;
      min-height: 16px;
      flex-shrink: 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .blocklyToolboxCategoryLabel {
      vertical-align: middle;
    }
  `;
  document.head.appendChild(style);
};
