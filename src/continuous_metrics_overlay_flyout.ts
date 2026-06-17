/**
 * @packageDocumentation
 * @module ContinuousMetricsOverlayFlyout
 * @description Métriques « toolbox continue » avec flyout en superposition (comme la toolbox classique).
 * @remarks
 * Le {@link ContinuousMetrics} du plugin soustrait **toolbox + flyout** de la zone de vue, ce qui
 * réduit le workspace et décale les ascenseurs quand le flyout s’ouvre. En mode classique, le
 * flyout **recouvre** la zone de blocs sans changer la taille du viewport : on reproduit ce
 * comportement en ne réservant que la **toolbox** dans {@link getViewMetrics} et
 * {@link getAbsoluteMetrics}.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
 * Comme {@link ContinuousMetrics}, mais le flyout ne réduit pas la zone du workspace : il se
 * superpose (comportement proche de la toolbox à catégories classique).
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
