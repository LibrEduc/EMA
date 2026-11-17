/**
 * Enregistrement permanent de la toolbox continue (@blockly/continuous-toolbox).
 * Variante EMA : sync scroll→sélection avec avance, icônes colorées explicites.
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

/** SVG 24×24 (viewBox) — icônes explicites, colorées via `currentColor`. */
const CATEGORY_ICON_SVG: Record<string, string> = {
  "fa-diagram-project":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4h4v4H6V4zm8 0h4v4h-4V4zM6 16h4v4H6v-4zm8 0h4v4h-4v-4zM9 9v2h2v2H9v2H7v-2H5v-2h2V9h2zm8 0v2h2v2h-2v2h-2v-2h-2v-2h2V9h2z"/></svg>',
  "fa-repeat":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 7h9V4l5 4-5 4v-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5zm10 10H8v3l-5-4 5-4v3h7a3 3 0 0 0 3-3v-2h2v2a5 5 0 0 1-5 5z"/></svg>',
  "fa-calculator":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 3v4h8V5H8zm0 6v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM8 15v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/></svg>',
  "fa-quote-left":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 6h5v5H9.5A2.5 2.5 0 0 0 7 13.5V18H4v-4.5A5.5 5.5 0 0 1 9.5 8H10V6H7zm10 0h5v5h-2.5A2.5 2.5 0 0 0 17 13.5V18h-3v-4.5A5.5 5.5 0 0 1 19.5 8H20V6h-3z"/></svg>',
  "fa-list":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6h2v2H4V6zm4 0h12v2H8V6zM4 11h2v2H4v-2zm4 0h12v2H8v-2zM4 16h2v2H4v-2zm4 0h12v2H8v-2z"/></svg>',
  "fa-palette":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0-1 17.95V18a2 2 0 0 1 2-2h.5a2.5 2.5 0 0 0 0-5H13a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.1A6.9 6.9 0 0 0 12 3zm-4.5 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 7.5 7zm0 5a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 7.5 12zM12 6.5A1.25 1.25 0 1 1 12 9a1.25 1.25 0 0 1 0-2.5zM16.5 8a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 16.5 8z"/></svg>',
  "fa-code":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.5 6 3 12l5.5 6 1.5-1.4L5.9 12 10 7.4 8.5 6zm7 0-1.5 1.4L18.1 12 14 16.6 15.5 18 21 12 15.5 6z"/></svg>',
  "fa-gears":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.5 3h2l.4 2.1a5.9 5.9 0 0 1 1.6.9L15.4 5l1.4 1.4-1 1.9c.3.5.6 1 .8 1.6L19 10.5v2l-2.1.4c-.2.6-.5 1.1-.8 1.6l1 1.9-1.4 1.4-1.9-1a5.9 5.9 0 0 1-1.6.8L11.5 19h-2l-.4-2.1a5.9 5.9 0 0 1-1.6-.8l-1.9 1-1.4-1.4 1-1.9a5.9 5.9 0 0 1-.8-1.6L2 12.5v-2l2.1-.4c.2-.6.5-1.1.8-1.6l-1-1.9L5.3 5l1.9 1c.5-.4 1-.6 1.6-.8L9.5 3zM10.5 9a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm6.2 5.2.3 1.6 1.5.6.9 1.3-1.1 1.3-1.5-.3-1.3.9-1.1-1.1.3-1.5-.9-1.2 1.1-1.1 1.3.3z"/></svg>',
  "fa-microchip":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 2h2v3h2V2h2v3h1a2 2 0 0 1 2 2v1h3v2h-3v2h3v2h-3v1a2 2 0 0 1-2 2h-1v3h-2v-3h-2v3H9v-3H8a2 2 0 0 1-2-2v-1H3v-2h3v-2H3V9h3V8a2 2 0 0 1 2-2h1V2zm1 6v8h4V8h-4z"/></svg>',
  "fa-puzzle-piece":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 3a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v2h1a2 2 0 1 1 0 4h-1v2a2 2 0 0 1-2 2h-2v1a2 2 0 1 1-4 0v-1H8a2 2 0 0 1-2-2v-3H5a2 2 0 1 1 0-4h1V8a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2z"/></svg>',
  "fa-magnifying-glass":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 3a7 7 0 1 1 4.9 11.9l4.1 4.1-1.4 1.4-4.1-4.1A7 7 0 0 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
};

const DEFAULT_ICON_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>';

const STYLE_TO_FA: Record<string, string> = {
  logic_category: "fa-diagram-project",
  loop_category: "fa-repeat",
  math_category: "fa-calculator",
  text_category: "fa-quote-left",
  list_category: "fa-list",
  colour_category: "fa-palette",
  variable_category: "fa-code",
  procedure_category: "fa-gears",
};

type FlyoutInternals = {
  scrollTarget?: number;
  scrollPositions: Map<string, number>;
};

/**
 * Flyout continu : la sélection toolbox avance dès qu’une catégorie occupe
 * le haut du viewport (évite Tableaux sélectionné alors que Couleur est visible).
 */
export class EmaContinuousFlyout extends ContinuousFlyout {
  constructor(workspaceOptions: Blockly.Options) {
    super(workspaceOptions);
    this.getWorkspace().addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
        this.selectCategoryWithLead(-this.getWorkspace().scrollY);
      }
    });
  }

  /** Sélection avec avance (~40 % de la hauteur visible). */
  private selectCategoryWithLead(position: number): void {
    const internals = this as unknown as FlyoutInternals;
    if (internals.scrollTarget !== undefined) {
      return;
    }
    if (internals.scrollPositions.size === 0) {
      return;
    }

    const workspace = this.getWorkspace();
    const viewHeight = workspace.getMetrics().viewHeight;
    const lead = Math.max(72, viewHeight * 0.4);
    const scaledPosition = Math.round((position + lead) / workspace.scale);

    const toolbox = this.targetWorkspace.getToolbox();
    if (!(toolbox instanceof ContinuousToolbox)) {
      return;
    }

    for (const [name, categoryTop] of [
      ...internals.scrollPositions.entries(),
    ].reverse()) {
      if (scaledPosition >= categoryTop) {
        toolbox.selectCategoryByName(name);
        return;
      }
    }
  }
}

/** Catégorie continue avec icône SVG colorée (à la place de la pastille). */
export class EmaContinuousCategory extends ContinuousCategory {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  override createIconDom_(): Element {
    const icon = document.createElement("div");
    icon.classList.add("emaCategoryIcon");
    icon.style.color = this.colour_ || "#5c6b7a";

    const cssIcon = (this.cssConfig_?.icon ?? "").toString();
    const fromCss = cssIcon.match(/fa-[\w-]+/)?.[0];
    const def = (
      this as unknown as {
        toolboxItemDef_?: { categorystyle?: string };
      }
    ).toolboxItemDef_;
    const fromStyle = STYLE_TO_FA[def?.categorystyle ?? ""];
    const key = fromCss || fromStyle || "";
    icon.innerHTML = CATEGORY_ICON_SVG[key] ?? DEFAULT_ICON_SVG;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  override setSelected(isSelected: boolean): void {
    if (!this.rowDiv_ || !this.htmlDiv_) {
      return;
    }
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = "#d7dee6";
      this.rowDiv_.style.boxShadow = `inset 3px 0 0 ${this.colour_ || "#1a2332"}`;
      Blockly.utils.dom.addClass(
        this.rowDiv_,
        this.cssConfig_["selected"] ?? "",
      );
    } else {
      this.rowDiv_.style.backgroundColor = "";
      this.rowDiv_.style.boxShadow = "";
      Blockly.utils.dom.removeClass(
        this.rowDiv_,
        this.cssConfig_["selected"] ?? "",
      );
    }
    Blockly.utils.aria.setState(
      this.htmlDiv_,
      Blockly.utils.aria.State.SELECTED,
      isSelected,
    );
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
    EmaContinuousCategory,
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
    EmaContinuousFlyout,
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
    .emaCategoryIcon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.25rem;
      width: 1.85rem;
      height: 1.85rem;
    }
    .emaCategoryIcon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .blocklyToolboxCategory {
      height: initial;
      padding: 0.45rem 0.2rem;
      border-radius: 0.35rem;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .blocklyTreeLabel {
      margin: auto;
      font-weight: 800;
      color: #1a2332;
    }
    .blocklyToolboxCategoryLabel {
      text-align: center;
      font-size: calc(0.95rem * var(--ema-text-scale, 1));
      line-height: 1.15;
      font-weight: 800;
      color: #1a2332;
      max-inline-size: 5.5rem;
      overflow-wrap: anywhere;
    }
    .blocklyFlyoutLabelText {
      fill: #0b6e4f !important;
      font-size: calc(20px * var(--ema-text-scale, 1)) !important;
      font-weight: 800 !important;
    }
    .blocklyFlyoutLabelBackground {
      fill: #ffffff !important;
      stroke: #0b6e4f !important;
      stroke-width: 2px !important;
      opacity: 1 !important;
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
