/**
 * Enregistrement permanent de la toolbox continue (@blockly/continuous-toolbox).
 * Pas de bascule UI : toujours actif dans EMA.
 */

import * as Blockly from "blockly";
import {
  ContinuousCategory,
  ContinuousFlyout,
  ContinuousToolbox,
  RecyclableBlockFlyoutInflater,
} from "@blockly/continuous-toolbox";
import { ContinuousMetricsOverlayFlyout } from "../vendor/ucBlockly/src/continuous_metrics_overlay_flyout";

/** Inflater pour les séparateurs de catégories en mode continu. */
class CategoryFlyoutInflater implements Blockly.IFlyoutInflater {
  load(_state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    void _state;
    const axis = flyout.horizontalLayout
      ? ("x" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1])
      : ("y" as ConstructorParameters<typeof Blockly.FlyoutSeparator>[1]);
    return new Blockly.FlyoutItem(
      new Blockly.FlyoutSeparator(0, axis),
      this.getType(),
    );
  }

  gapForItem(_state: object, _defaultGap: number): number {
    void _state;
    void _defaultGap;
    return 0;
  }

  disposeItem(_item: Blockly.FlyoutItem): void {
    void _item;
  }

  getType(): string {
    return "category";
  }
}

let registered = false;

/** Enregistre les composants Blockly pour la toolbox continue (idempotent). */
export function registerContinuousToolbox(): void {
  if (registered) {
    return;
  }

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
  registered = true;
}

/** Plugins Blockly inject à utiliser avec la toolbox continue. */
export const CONTINUOUS_WORKSPACE_PLUGINS = {
  flyoutsVerticalToolbox: "ContinuousFlyout",
  metricsManager: "ContinuousMetrics",
  toolbox: "ContinuousToolbox",
} as const;
