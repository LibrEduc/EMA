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
 * @license GPL-3.0-or-later
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
