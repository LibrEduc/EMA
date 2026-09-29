/**
 * @packageDocumentation
 * @module ContinuousMetricsOverlayFlyout
 * @description Continuous toolbox metrics with overlay flyout (like the classic toolbox).
 * @remarks
 * The plugin's {@link ContinuousMetrics} subtracts **toolbox + flyout** from the view area,
 * which shrinks the workspace and shifts scrollbars when the flyout opens. In classic mode,
 * the flyout **overlays** the blocks area without changing the viewport size: this class
 * reproduces that behaviour by reserving only the **toolbox** in {@link getViewMetrics} and
 * {@link getAbsoluteMetrics}.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ContinuousMetrics } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";
import { getLiveContentMetrics } from "./core/live_content_metrics";

const ToolboxPosition = Blockly.utils.toolbox.Position;

/**
 * Like {@link ContinuousMetrics}, but the flyout does not shrink the workspace area: it
 * overlays it (behaviour close to the classic category toolbox).
 */
export class ContinuousMetricsOverlayFlyout extends ContinuousMetrics {
  /**
   * Content metrics excluding disposing / insertion-marker elements (trash drag).
   */
  getContentMetrics(
    getWorkspaceCoordinates?: boolean,
  ): Blockly.MetricsManager.ContainerRegion {
    return getLiveContentMetrics(
      this.workspace_,
      Boolean(getWorkspaceCoordinates),
    );
  }

  getViewMetrics(
    getWorkspaceCoordinates?: boolean,
  ): Blockly.MetricsManager.ContainerRegion {
    const scale = getWorkspaceCoordinates ? this.workspace_.scale : 1;
    const svg = this.getSvgMetrics();
    let width = svg.width;
    let height = svg.height;
    const toolbox = this.getToolboxMetrics();
    const position = toolbox.position;

    if (this.workspace_.getToolbox()) {
      if (position === ToolboxPosition.TOP || position === ToolboxPosition.BOTTOM) {
        height -= toolbox.height;
      } else if (position === ToolboxPosition.LEFT || position === ToolboxPosition.RIGHT) {
        width -= toolbox.width;
      }
    }

    return {
      height: height / scale,
      width: width / scale,
      top: -this.workspace_.scrollY / scale,
      left: -this.workspace_.scrollX / scale,
    };
  }

  getAbsoluteMetrics(): Blockly.MetricsManager.AbsoluteMetrics {
    const toolbox = this.getToolboxMetrics();
    const position = toolbox.position;
    let left = 0;
    let top = 0;

    if (this.workspace_.getToolbox() && position === ToolboxPosition.LEFT) {
      left = toolbox.width;
    }
    if (this.workspace_.getToolbox() && position === ToolboxPosition.TOP) {
      top = toolbox.height;
    }

    return { left, top };
  }
}
