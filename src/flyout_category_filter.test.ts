import { describe, expect, it } from "vitest";
import {
  resolveFlyoutDefinition,
  sliceFlyoutContentsForCategory,
} from "./flyout_category_filter";

describe("sliceFlyoutContentsForCategory", () => {
  const sampleContents = [
    { kind: "label", text: "Actions" },
    { kind: "block", type: "ema_move" },
    { kind: "block", type: "ema_turn" },
    { kind: "label", text: "Capteurs" },
    { kind: "block", type: "ema_sensor_distance" },
    { kind: "label", text: "Logique" },
    { kind: "block", type: "controls_if" },
    { kind: "block", type: "logic_compare" },
  ];

  it("returns only the label and blocks belonging to the requested category", () => {
    const result = sliceFlyoutContentsForCategory(sampleContents, "Capteurs");
    expect(result).toEqual([
      { kind: "label", text: "Capteurs" },
      { kind: "block", type: "ema_sensor_distance" },
    ]);
  });

  it("returns the last category up to the end of contents", () => {
    const result = sliceFlyoutContentsForCategory(sampleContents, "Logique");
    expect(result).toEqual([
      { kind: "label", text: "Logique" },
      { kind: "block", type: "controls_if" },
      { kind: "block", type: "logic_compare" },
    ]);
  });

  it("matches category name case-insensitively and trims whitespace", () => {
    const result = sliceFlyoutContentsForCategory(sampleContents, "  actions ");
    expect(result).toEqual([
      { kind: "label", text: "Actions" },
      { kind: "block", type: "ema_move" },
      { kind: "block", type: "ema_turn" },
    ]);
  });

  it("handles uppercase LABEL kind from Blockly flyout definitions", () => {
    const upperContents = [
      { kind: "LABEL", text: "Actions" },
      { kind: "BLOCK", type: "ema_move" },
      { kind: "LABEL", text: "Capteurs" },
      { kind: "BLOCK", type: "ema_sensor_distance" },
    ];
    expect(sliceFlyoutContentsForCategory(upperContents, "Actions")).toEqual([
      { kind: "LABEL", text: "Actions" },
      { kind: "BLOCK", type: "ema_move" },
    ]);
  });

  it("returns empty array when category is not found or empty", () => {
    expect(sliceFlyoutContentsForCategory(sampleContents, "Inexistant")).toEqual([]);
    expect(sliceFlyoutContentsForCategory(sampleContents, "")).toEqual([]);
    expect(sliceFlyoutContentsForCategory([], "Actions")).toEqual([]);
  });
});

describe("resolveFlyoutDefinition", () => {
  const full = [
    { kind: "LABEL", text: "Recherche" },
    { kind: "LABEL", text: "Libre" },
    { kind: "block", type: "free_1" },
    { kind: "block", type: "free_2" },
    { kind: "LABEL", text: "Logique" },
    { kind: "block", type: "controls_if" },
  ];

  it("returns only the selected category (uppercase LABEL kind)", () => {
    expect(resolveFlyoutDefinition(full, "Logique")).toEqual([
      { kind: "LABEL", text: "Logique" },
      { kind: "block", type: "controls_if" },
    ]);
  });

  it("falls back to the first category with blocks when the selected one has none (init on Recherche)", () => {
    expect(resolveFlyoutDefinition(full, "Recherche")).toEqual([
      { kind: "LABEL", text: "Libre" },
      { kind: "block", type: "free_1" },
      { kind: "block", type: "free_2" },
    ]);
  });

  it("falls back to the first category with blocks when the name is unknown or empty", () => {
    const expected = [
      { kind: "LABEL", text: "Libre" },
      { kind: "block", type: "free_1" },
      { kind: "block", type: "free_2" },
    ];
    expect(resolveFlyoutDefinition(full, "Inconnue")).toEqual(expected);
    expect(resolveFlyoutDefinition(full, "")).toEqual(expected);
  });

  it("returns the full definition when no category has blocks", () => {
    const onlyLabels = [{ kind: "LABEL", text: "A" }];
    expect(resolveFlyoutDefinition(onlyLabels, "A")).toEqual(onlyLabels);
  });

  describe("with category names (search section)", () => {
    const names = ["Recherche", "Libre", "Logique"];

    it("keeps the no-result message under the search header", () => {
      const noResult = [
        { kind: "LABEL", text: "Recherche" },
        { kind: "LABEL", text: "Aucun résultat" },
        { kind: "LABEL", text: "Libre" },
        { kind: "block", type: "free_1" },
        { kind: "block", type: "free_2" },
      ];
      expect(resolveFlyoutDefinition(noResult, "Recherche", names)).toEqual([
        { kind: "LABEL", text: "Recherche" },
        { kind: "LABEL", text: "Aucun résultat" },
      ]);
    });

    it("keeps the typing hint under the search header when the query is empty", () => {
      const hint = [
        { kind: "LABEL", text: "Recherche" },
        { kind: "LABEL", text: "Tapez pour chercher" },
        { kind: "LABEL", text: "Libre" },
        { kind: "block", type: "free_1" },
      ];
      expect(resolveFlyoutDefinition(hint, "Recherche", names)).toEqual([
        { kind: "LABEL", text: "Recherche" },
        { kind: "LABEL", text: "Tapez pour chercher" },
      ]);
    });

    const searchWithHintThenEmptyCategory = [
      { kind: "LABEL", text: "Recherche" },
      { kind: "LABEL", text: "Taper pour rechercher des blocs" },
      { kind: "LABEL", text: "Catégorie sans bloc" },
      { kind: "LABEL", text: "Libre" },
      { kind: "block", type: "free_1" },
      { kind: "LABEL", text: "Logique" },
      { kind: "block", type: "controls_if" },
    ];
    const categoryNamesWithEmpty = [
      "Recherche",
      "Catégorie sans bloc",
      "Libre",
      "Logique",
    ];
    const firstCategoryWithBlocks = [
      { kind: "LABEL", text: "Libre" },
      { kind: "block", type: "free_1" },
    ];

    it("an empty category falls back to the first category with blocks, not to the search hint", () => {
      expect(
        resolveFlyoutDefinition(
          searchWithHintThenEmptyCategory,
          "Catégorie sans bloc",
          categoryNamesWithEmpty,
        ),
      ).toEqual(firstCategoryWithBlocks);
    });

    it("no selected category falls back to the first category with blocks, not to the search hint", () => {
      expect(
        resolveFlyoutDefinition(
          searchWithHintThenEmptyCategory,
          "",
          categoryNamesWithEmpty,
        ),
      ).toEqual(firstCategoryWithBlocks);
    });

    it("still falls back to the first category with blocks when search has no item (init)", () => {
      expect(resolveFlyoutDefinition(full, "Recherche", names)).toEqual([
        { kind: "LABEL", text: "Libre" },
        { kind: "block", type: "free_1" },
        { kind: "block", type: "free_2" },
      ]);
    });
  });
});
