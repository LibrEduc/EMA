import { describe, expect, it } from "vitest";
import {
  computeCategoryLabelWidth,
  computeFlyoutWidthForLabel,
} from "./flyout_label_metrics";

describe("computeCategoryLabelWidth", () => {
  it("laisse la barre de défilement et le contour hors du badge", () => {
    const viewWidth = 192;
    const sideMargin = 10;
    const scrollbarWidth = 12;
    const stroke = 3;

    const width = computeCategoryLabelWidth({
      viewWidth,
      sideMargin,
      scrollbarWidth,
      stroke,
      textWidth: 36,
    });

    // bord droit du badge + demi-contour doit rester à gauche de la barre
    const right = sideMargin + width + stroke / 2;
    expect(right).toBeLessThanOrEqual(viewWidth - scrollbarWidth);
  });

  it("ne descend jamais sous la largeur du texte + 32", () => {
    const width = computeCategoryLabelWidth({
      viewWidth: 60,
      sideMargin: 10,
      scrollbarWidth: 12,
      stroke: 3,
      textWidth: 100,
    });
    expect(width).toBe(132);
  });
});

describe("computeFlyoutWidthForLabel", () => {
  it("a flyout sized for its widest label keeps the badge left of the scrollbar", () => {
    const sideMargin = 10;
    const scrollbarWidth = 12;
    const stroke = 3;
    const textWidth = 140;

    const flyoutWidth = computeFlyoutWidthForLabel({
      textWidth,
      sideMargin,
      scrollbarWidth,
    });
    const badge = computeCategoryLabelWidth({
      viewWidth: flyoutWidth,
      sideMargin,
      scrollbarWidth,
      stroke,
      textWidth,
    });

    expect(flyoutWidth).toBe(textWidth + 32 + 2 * sideMargin + scrollbarWidth);
    expect(sideMargin + badge + stroke / 2).toBeLessThanOrEqual(
      flyoutWidth - scrollbarWidth,
    );
  });
});
