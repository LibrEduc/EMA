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

import { ContinuousMetrics } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";

const ToolboxPosition = Blockly.utils.toolbox.Position;

/**
 * Like {@link ContinuousMetrics}, but the flyout does not shrink the workspace area: it
 * overlays it (behaviour close to the classic category toolbox).
 */
export class ContinuousMetricsOverlayFlyout extends ContinuousMetrics {
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
