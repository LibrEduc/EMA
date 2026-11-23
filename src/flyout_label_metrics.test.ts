import { describe, expect, it } from "vitest";
import { computeCategoryLabelWidth } from "./flyout_label_metrics";

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
