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

/** Parse `#rgb` / `#rrggbb` → [r,g,b] 0–255. */
function parseCssColour(input: string): [number, number, number] | null {
  const raw = input.trim();
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(raw);
  if (short) {
    return [
      Number.parseInt(short[1] + short[1], 16),
      Number.parseInt(short[2] + short[2], 16),
      Number.parseInt(short[3] + short[3], 16),
    ];
  }
  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(raw);
  if (full) {
    return [
      Number.parseInt(full[1], 16),
      Number.parseInt(full[2], 16),
      Number.parseInt(full[3], 16),
    ];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(raw);
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
    ];
  }
  return null;
}

/** Encre lisible sur fond catégorie (seuil luminance relative ~WCAG). */
function contrastingInk(background: string): string {
  const rgb = parseCssColour(background);
  if (!rgb) {
    return "#ffffff";
  }
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? "#1a2332" : "#ffffff";
}

/**
 * Flyout continu : sync scroll→sélection + badges de catégorie colorés.
 */
import { resolveFlyoutDefinition } from "./flyout_category_filter";
import { computeCategoryLabelWidth } from "./flyout_label_metrics";

const LABEL_STROKE_PX = 3;
const DEFAULT_SCROLLBAR_PX = 12;

/** Largeur réelle de la barre verticale du flyout (repli : 12 px). */
function flyoutScrollbarWidth(): number {
  const bar = document.querySelector(".blocklyFlyoutScrollbar");
  const width = Number.parseFloat(bar?.getAttribute("width") ?? "");
  return Number.isFinite(width) && width > 0 ? width : DEFAULT_SCROLLBAR_PX;
}

export class EmaContinuousFlyout extends ContinuousFlyout {
  constructor(workspaceOptions: Blockly.Options) {
    super(workspaceOptions);
  }

  /** Définition complète (toutes catégories), mémorisée pour re-filtrer au clic. */
  private fullDef_: Blockly.utils.toolbox.FlyoutDefinition | null = null;

  override scrollToCategory(category: Blockly.ISelectableToolboxItem): void {
    if (this.fullDef_) {
      // Le filtre lit la catégorie déjà sélectionnée par la toolbox.
      this.show(this.fullDef_);
    }
    super.scrollToCategory(category);
  }

  override show(
    flyoutDef: Blockly.utils.toolbox.FlyoutDefinition | string,
  ): void {
    let nextDef = flyoutDef;
    if (Array.isArray(flyoutDef)) {
      this.fullDef_ = flyoutDef;
      const toolbox = this.targetWorkspace?.getToolbox();
      const selected =
        toolbox && "getSelectedItem" in toolbox
          ? (toolbox as Blockly.Toolbox).getSelectedItem()
          : null;
      const categoryName =
        selected && typeof selected.getName === "function"
          ? selected.getName()
          : "";
      nextDef = resolveFlyoutDefinition(
        flyoutDef as unknown as readonly Record<string, unknown>[],
        categoryName,
      ) as unknown as Blockly.utils.toolbox.FlyoutDefinition;
    }
    super.show(nextDef);
    this.styleCategoryLabels_();
  }

  /**
   * Badges flyout : couleur catégorie, padding confortable, largeur = flyout.
   * (Les labels Blockly n’appliquent pas TEXT_MARGIN — on agrandit après layout.)
   * À n’appeler qu’après un `show()` frais (sinon le décalage Y se cumule).
   */
  private styleCategoryLabels_(): void {
    const toolbox = this.targetWorkspace.getToolbox();
    if (!(toolbox instanceof ContinuousToolbox)) {
      return;
    }

    const viewWidth = this.getWorkspace().getMetrics().viewWidth;
    const sideMargin = 10;
    const radius = 10;
    const rootPx = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    // Padding vertical ≈ 0.45rem de chaque côté (cohérent avec la police unique).
    const padY = Number.isFinite(rootPx) ? rootPx * 0.45 : 8;
    const contents = this.getContents();
    let yShift = 0;

    for (const item of contents) {
      const element = item.getElement();
      if (yShift !== 0 && "moveBy" in element) {
        (element as Blockly.IBoundedElement & { moveBy: (dx: number, dy: number) => void }).moveBy(
          0,
          yShift,
        );
      }

      if (
        !(element instanceof Blockly.FlyoutButton) ||
        !element.isLabel()
      ) {
        continue;
      }

      const name = element.getButtonText();
      const category = toolbox.getCategoryByName(name) as
        | Blockly.ToolboxCategory
        | null
        | undefined;
      const colour = category?.getColour?.() || "#0b6e4f";
      const ink = contrastingInk(colour);
      const root = element.getSvgRoot();
      root.style.setProperty("--ema-flyout-label-bg", colour);
      root.style.setProperty("--ema-flyout-label-fg", ink);
      root.classList.add("emaFlyoutCategoryLabel");

      const oldHeight = element.height;
      const pos = element.getPosition();
      const fullWidth = computeCategoryLabelWidth({
        viewWidth,
        sideMargin,
        scrollbarWidth: flyoutScrollbarWidth(),
        stroke: LABEL_STROKE_PX,
        textWidth: element.width,
      });
      // Hauteur ≈ ligne de texte (--ema-blockly-font) + padding, pas un bandeau XXL.
      const linePx = Number.isFinite(rootPx) ? rootPx * 0.875 : 14;
      const fullHeight = Math.max(oldHeight + padY * 2, linePx + padY * 2, 28);
      const bgX = sideMargin - pos.x;

      const bg = root.querySelector(".blocklyFlyoutLabelBackground");
      const text = root.querySelector(".blocklyFlyoutLabelText");
      if (bg instanceof SVGElement) {
        bg.setAttribute("x", String(bgX));
        bg.setAttribute("y", "0");
        bg.setAttribute("width", String(fullWidth));
        bg.setAttribute("height", String(fullHeight));
        bg.setAttribute("rx", String(radius));
        bg.setAttribute("ry", String(radius));
        bg.style.setProperty("fill", colour, "important");
        bg.style.setProperty("stroke", "#1a2332", "important");
        bg.style.setProperty("stroke-width", `${LABEL_STROKE_PX}px`, "important");
        bg.style.setProperty("opacity", "1", "important");
      }
      if (text instanceof SVGTextElement) {
        text.style.setProperty("fill", ink, "important");
        text.style.setProperty("stroke", "none", "important");
        text.style.setProperty("stroke-width", "0", "important");
        text.removeAttribute("stroke");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("x", String(bgX + fullWidth / 2));
        text.setAttribute("y", String(fullHeight / 2));
      }

      element.width = fullWidth;
      element.height = fullHeight;
      yShift += fullHeight - oldHeight;
    }

    // Recalcule les ancres de scroll après le décalage vertical.
    const internals = this as unknown as FlyoutInternals & {
      recordScrollPositions?: () => void;
    };
    internals.recordScrollPositions?.();
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
  private hoverBound_ = false;

  override init(): void {
    super.init();
    this.clearBlocklyColourBorder_();
    this.applyCategoryColourVar_();
    this.bindHoverHandlers_();
  }

  /**
   * Blockly ajoute une barre `border-left: 8px` (pastille).
   * On utilise des icônes SVG : la barre décale le centrage — on la retire.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  override addColourBorder_(): void {
    this.clearBlocklyColourBorder_();
  }

  private clearBlocklyColourBorder_(): void {
    if (!this.rowDiv_) {
      return;
    }
    this.rowDiv_.style.borderLeft = "";
    this.rowDiv_.style.borderRight = "";
  }

  /** Couleur de catégorie en CSS var (hover + barre de sélection). */
  private applyCategoryColourVar_(): void {
    const colour = this.colour_ || "#5c6b7a";
    this.rowDiv_?.style.setProperty("--ema-cat-colour", colour);
    this.htmlDiv_?.style.setProperty("--ema-cat-colour", colour);
  }

  /**
   * Hover via classe JS : plus fiable que :hover seul (Blockly / overlay).
   */
  private bindHoverHandlers_(): void {
    if (this.hoverBound_ || !this.htmlDiv_) {
      return;
    }
    this.hoverBound_ = true;
    const root = this.htmlDiv_;
    const row = this.rowDiv_;
    const setHover = (on: boolean): void => {
      root.classList.toggle("emaCategory--hover", on);
      row?.classList.toggle("emaCategory--hover", on);
    };
    // Un seul écouteur sur le conteneur (évite le flicker row↔label).
    root.addEventListener("pointerenter", () => setHover(true));
    root.addEventListener("pointerleave", () => setHover(false));
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  override createLabelDom_(name: string): Element {
    const label = document.createElement("div");
    label.setAttribute("id", `${this.getId()}.label`);
    label.textContent = name;
    label.classList.add(this.cssConfig_["label"] ?? "");
    label.classList.add("emaCategoryLabel");
    // Infobulle quand la toolbox est en mode icônes seules.
    this.rowDiv_?.setAttribute("title", name);
    this.htmlDiv_?.setAttribute("title", name);
    return label;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  override createIconDom_(): Element {
    const colour = this.colour_ || "#5c6b7a";
    const icon = document.createElement("div");
    icon.classList.add("emaCategoryIcon");
    icon.style.color = colour;
    this.applyCategoryColourVar_();

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
    this.applyCategoryColourVar_();
    this.clearBlocklyColourBorder_();

    const selectedClass = this.cssConfig_["selected"] ?? "";
    // Évite le fond « gray » inline de ContinuousCategory.
    this.rowDiv_.style.backgroundColor = "";
    this.rowDiv_.style.boxShadow = "";
    this.htmlDiv_.style.backgroundColor = "";

    if (isSelected) {
      Blockly.utils.dom.addClass(this.rowDiv_, selectedClass);
      Blockly.utils.dom.addClass(this.rowDiv_, "emaCategory--selected");
      Blockly.utils.dom.addClass(this.htmlDiv_, "emaCategory--selected");
      const tint = `color-mix(in srgb, ${this.colour_ || "#5c6b7a"} 22%, #ffffff)`;
      this.rowDiv_.style.setProperty("background-color", tint, "important");
      this.htmlDiv_.style.setProperty("background-color", tint, "important");
    } else {
      Blockly.utils.dom.removeClass(this.rowDiv_, selectedClass);
      Blockly.utils.dom.removeClass(this.rowDiv_, "emaCategory--selected");
      Blockly.utils.dom.removeClass(this.htmlDiv_, "emaCategory--selected");
      this.rowDiv_.style.removeProperty("background-color");
      this.htmlDiv_.style.removeProperty("background-color");
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

  // Les labels n’utilisent pas ces marges, mais les boutons du flyout oui.
  Blockly.FlyoutButton.TEXT_MARGIN_X = 16;
  Blockly.FlyoutButton.TEXT_MARGIN_Y = 10;
  Blockly.FlyoutButton.BORDER_RADIUS = 12;

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    EmaContinuousCategory,
    true,
  );
  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    Blockly.MetricsManager,
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
      margin: 0 auto 0.3rem;
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 0.55rem;
      background: color-mix(in srgb, var(--ema-cat-colour, #5c6b7a) 16%, #fff);
      flex-shrink: 0;
      transition:
        transform 160ms ease,
        background-color 160ms ease,
        box-shadow 160ms ease;
    }
    .emaCategoryIcon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .blocklyToolboxDiv {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch;
      block-size: 100% !important;
      background:
        linear-gradient(180deg, #edf2f7 0%, #d9e2ec 100%) !important;
      border-inline-end: 1px solid #b7c4d2;
      box-sizing: border-box;
      overflow: hidden !important;
    }
    .blocklyToolboxContents {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
      min-block-size: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .blocklyToolboxCategory,
    .blocklyTreeRow {
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: initial;
      min-block-size: 2.75rem;
      margin: 0.28rem auto;
      padding: 0.5rem 0.4rem;
      border-radius: 0.7rem;
      /* Annule la barre couleur 8px de Blockly (inline) — centrage icône/texte */
      border: 2px solid transparent !important;
      border-left: 2px solid transparent !important;
      border-right: 2px solid transparent !important;
      background: rgb(255 255 255 / 72%);
      cursor: pointer;
      box-sizing: border-box;
      inline-size: calc(100% - 0.6rem);
      max-inline-size: 100%;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease;
    }
    .blocklyToolboxCategoryContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      inline-size: 100%;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      flex: 1 1 auto;
      text-align: center;
      gap: 0.2rem;
    }
    .emaCategoryIcon {
      margin-inline: auto;
      margin-block-end: 0.3rem;
    }
    .blocklyTreeLabel,
    .blocklyToolboxCategoryLabel,
    .emaCategoryLabel {
      display: block;
      margin: 0 auto;
      padding-inline: 0.2rem;
      inline-size: 100%;
      max-inline-size: 100%;
      box-sizing: border-box;
      text-align: center !important;
      font-size: var(--ema-blockly-font, 0.875rem);
      line-height: 1.2;
      font-weight: 800;
      color: #1a2332;
      overflow-wrap: anywhere;
      word-break: break-word;
      hyphens: auto;
      white-space: normal;
    }

    /* Pied : poussé en bas de la colonne flex, bouton centré horizontalement */
    .emaToolboxRailFooter {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-block-start: auto;
      padding: 0.25rem 0.35rem 0.35rem;
      inline-size: 100%;
      box-sizing: border-box;
      background: linear-gradient(
        180deg,
        rgb(237 242 247 / 0%) 0%,
        rgb(237 242 247 / 95%) 35%,
        #edf2f7 100%
      );
      z-index: 3;
    }
    .emaToolboxRailToggle {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      margin: 0;
      min-block-size: 2.75rem;
      padding: 0.35rem 0.65rem;
      border: 2px solid #1a2332;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #1a2332;
      font: inherit;
      font-size: var(--ema-blockly-font, 0.875rem);
      font-weight: 800;
      cursor: pointer;
      inline-size: max-content;
      max-inline-size: 100%;
      box-shadow: 0 2px 8px rgb(26 35 50 / 12%);
    }
    .emaToolboxRailToggle:focus-visible {
      outline: 3px solid #0b6e4f;
      outline-offset: 2px;
    }
    .emaToolboxRailToggle-icon {
      display: inline-flex;
      inline-size: 1.25rem;
      block-size: 1.25rem;
    }
    .emaToolboxRailToggle-icon svg {
      inline-size: 100%;
      block-size: 100%;
    }
    html.ema-toolbox-icons-only .emaToolboxRailToggle-label {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    html.ema-toolbox-icons-only .blocklyToolboxCategoryLabel,
    html.ema-toolbox-icons-only .blocklyTreeLabel,
    html.ema-toolbox-icons-only .emaCategoryLabel {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    /* Mode icônes : rail serré ≈ taille du bouton chevron */
    html.ema-toolbox-icons-only {
      --ema-toolbox-icon-rail: 2.6rem;
    }
    html.ema-toolbox-icons-only .emaCategoryIcon {
      margin: 0 !important;
      width: 1.45rem;
      height: 1.45rem;
    }
    html.ema-toolbox-icons-only .blocklyToolboxCategory,
    html.ema-toolbox-icons-only .blocklyTreeRow {
      inline-size: var(--ema-toolbox-icon-rail) !important;
      min-inline-size: var(--ema-toolbox-icon-rail) !important;
      max-inline-size: var(--ema-toolbox-icon-rail) !important;
      block-size: var(--ema-toolbox-icon-rail) !important;
      min-block-size: var(--ema-toolbox-icon-rail) !important;
      max-block-size: var(--ema-toolbox-icon-rail) !important;
      padding: 0.3rem !important;
      margin: 0.2rem auto !important;
    }
    html.ema-toolbox-icons-only .blocklyToolboxDiv {
      width: calc(var(--ema-toolbox-icon-rail) + 0.55rem) !important;
      min-width: calc(var(--ema-toolbox-icon-rail) + 0.55rem) !important;
      max-width: calc(var(--ema-toolbox-icon-rail) + 0.55rem) !important;
    }
    html.ema-toolbox-icons-only .emaToolboxRailFooter {
      padding-inline: 0.2rem;
    }
    html.ema-toolbox-icons-only .emaToolboxRailToggle {
      inline-size: var(--ema-toolbox-icon-rail) !important;
      min-inline-size: var(--ema-toolbox-icon-rail) !important;
      max-inline-size: var(--ema-toolbox-icon-rail) !important;
      block-size: var(--ema-toolbox-icon-rail) !important;
      min-block-size: var(--ema-toolbox-icon-rail) !important;
      margin: 0 !important;
      padding: 0.3rem !important;
      gap: 0;
    }
    html.ema-toolbox-icons-only .emaCategory--hover:not(.emaCategory--selected),
    html.ema-toolbox-icons-only .blocklyToolboxCategory:hover:not(.emaCategory--selected),
    html.ema-toolbox-icons-only .blocklyTreeRow:hover:not(.emaCategory--selected) {
      transform: none;
    }

    /*
     * Recherche : champ unique en tête du flyout.
     * Catégorie search du rail masquée (évite la pastille écrasée).
     */
    html.ema-flyout-search .blocklyToolboxCategoryContainer:has(#toolbox-search-input),
    html.ema-flyout-search .blocklyToolboxCategory:has(#toolbox-search-input) {
      position: absolute !important;
      inline-size: 1px !important;
      block-size: 1px !important;
      margin: -1px !important;
      padding: 0 !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      border: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    .emaFlyoutSearch {
      position: absolute;
      z-index: 30;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      margin: 0;
      padding: 0.35rem 0.45rem;
      overflow: hidden;
      background: #edf2f7;
      border-inline-end: 1px solid #b7c4d2;
      border-block-end: 1px solid #b7c4d2;
      pointer-events: auto;
    }
    .emaFlyoutSearch-input {
      inline-size: 100%;
      min-block-size: 2.35rem;
      margin: 0;
      padding: 0.4rem 0.65rem;
      border: 2px solid #1a2332;
      border-radius: 0.55rem;
      background: #ffffff;
      color: #1a2332;
      font: inherit;
      font-size: var(--ema-blockly-font, 0.875rem);
      font-weight: 600;
      box-sizing: border-box;
    }
    .emaFlyoutSearch-input:focus {
      outline: 3px solid #0b6e4f;
      outline-offset: 2px;
    }

    /* Hover = teinte de la catégorie (lisible) + bordure pleine + ombre */
    .emaCategory--hover:not(.emaCategory--selected),
    .blocklyToolboxCategory:hover:not(.emaCategory--selected),
    .blocklyTreeRow:hover:not(.emaCategory--selected) {
      background: color-mix(
        in srgb,
        var(--ema-cat-colour, #5c6b7a) 46%,
        #ffffff
      ) !important;
      border-color: var(--ema-cat-colour, #1a2332) !important;
      box-shadow: 0 4px 12px rgb(26 35 50 / 16%);
    }
    .emaCategory--hover:not(.emaCategory--selected) .emaCategoryIcon,
    .blocklyToolboxCategory:hover:not(.emaCategory--selected) .emaCategoryIcon,
    .blocklyTreeRow:hover:not(.emaCategory--selected) .emaCategoryIcon {
      background: #ffffff;
      box-shadow: 0 0 0 2px var(--ema-cat-colour, #1a2332);
    }
    @media (prefers-reduced-motion: no-preference) {
      /* Pas de translateX : sortait du rail toolbox à droite */
      .emaCategory--hover:not(.emaCategory--selected) .emaCategoryIcon,
      .blocklyToolboxCategory:hover:not(.emaCategory--selected) .emaCategoryIcon,
      .blocklyTreeRow:hover:not(.emaCategory--selected) .emaCategoryIcon {
        transform: scale(1.08);
      }
      .blocklyToolboxCategory:active:not(.emaCategory--selected),
      .blocklyTreeRow:active:not(.emaCategory--selected) {
        transform: scale(0.97);
      }
    }

    /* Focus clavier : anneau sombre (contraste 3:1, indépendant de la teinte) */
    .blocklyToolboxCategory:focus-visible,
    .blocklyTreeRow:focus-visible,
    .blocklyToolboxCategory:focus-within:not(.emaCategory--selected) {
      outline: 3px solid #1a2332;
      outline-offset: 2px;
    }

    /* Sélection : teinte + bordure (symétrique — plus de barre inset à gauche) */
    .emaCategory--selected.blocklyToolboxCategory,
    .emaCategory--selected.blocklyTreeRow,
    .blocklyToolboxCategory.emaCategory--selected,
    .blocklyTreeRow.emaCategory--selected,
    .blocklyTreeSelected {
      background: color-mix(
        in srgb,
        var(--ema-cat-colour, #5c6b7a) 22%,
        #ffffff
      ) !important;
      border-color: var(--ema-cat-colour, #1a2332) !important;
      box-shadow: 0 6px 14px rgb(26 35 50 / 16%) !important;
      transform: none;
    }
    .emaCategory--selected .emaCategoryIcon {
      background: #ffffff;
      box-shadow: 0 0 0 2px var(--ema-cat-colour, #1a2332);
    }
    .emaCategory--selected .blocklyToolboxCategoryLabel,
    .emaCategory--selected .blocklyTreeLabel {
      font-weight: 800;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 0.18em;
    }

    /* Flyout : même taille que toolbox + blocs (--ema-blockly-font) */
    .blocklyFlyoutLabelText,
    .emaFlyoutCategoryLabel .blocklyFlyoutLabelText {
      fill: var(--ema-flyout-label-fg, #ffffff) !important;
      stroke: none !important;
      stroke-width: 0 !important;
      font-size: var(--ema-blockly-font, 0.875rem) !important;
      font-weight: 800 !important;
      letter-spacing: 0.02em;
      paint-order: fill;
    }
    .blocklyFlyoutLabelBackground,
    .emaFlyoutCategoryLabel .blocklyFlyoutLabelBackground {
      fill: var(--ema-flyout-label-bg, #1a2332) !important;
      stroke: #1a2332 !important;
      stroke-width: 3px !important;
      opacity: 1 !important;
    }

    @media (forced-colors: active) {
      .blocklyToolboxCategory,
      .blocklyTreeRow {
        border: 2px solid ButtonText;
        background: Canvas;
        forced-color-adjust: none;
      }
      .emaCategory--hover:not(.emaCategory--selected),
      .blocklyToolboxCategory:hover:not(.emaCategory--selected) {
        outline: 3px solid Highlight;
        background: Canvas;
      }
      .emaCategory--selected,
      .blocklyTreeSelected {
        outline: 3px solid Highlight;
        border-color: Highlight;
        background: Canvas;
      }
      .blocklyFlyoutLabelText { fill: Canvas !important; }
      .blocklyFlyoutLabelBackground {
        fill: Highlight !important;
        stroke: CanvasText !important;
      }
    }

    @media (prefers-contrast: more) {
      .blocklyToolboxCategory,
      .blocklyTreeRow {
        border-color: #1a2332;
        background: #ffffff;
      }
      .emaCategory--hover:not(.emaCategory--selected),
      .blocklyToolboxCategory:hover:not(.emaCategory--selected) {
        background: #b8ebd6 !important;
        border-width: 3px;
      }
      .emaCategory--selected {
        background: #ffffff !important;
        border-width: 3px;
        box-shadow: inset 8px 0 0 #000000, 0 0 0 2px #000000 !important;
      }
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
