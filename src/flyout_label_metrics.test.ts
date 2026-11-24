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
  const textWidth = 140;
  const sideMargin = 10;
  const scrollbarWidth = 12;
  const stroke = 3;

  it("fits the badge text, its padding, both margins and the scrollbar", () => {
    // 140 text + 32 padding + 2 * 10 margin + 12 scrollbar
    expect(
      computeFlyoutWidthForLabel({ textWidth, sideMargin, scrollbarWidth }),
    ).toBe(204);
  });

  it("keeps the badge left of the scrollbar", () => {
    const flyoutWidth = computeFlyoutWidthForLabel({
      textWidth,
      sideMargin,
      scrollbarWidth,
    });
    const badgeWidth = computeCategoryLabelWidth({
      viewWidth: flyoutWidth,
      sideMargin,
      scrollbarWidth,
      stroke,
      textWidth,
    });

    // Half the stroke is drawn outside the badge edge.
    const badgeRightEdge = sideMargin + badgeWidth + stroke / 2;
    const scrollbarLeftEdge = flyoutWidth - scrollbarWidth;
    expect(badgeRightEdge).toBeLessThanOrEqual(scrollbarLeftEdge);
  });
});
