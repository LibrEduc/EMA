import { describe, expect, it } from "vitest";
import type { ToolboxConfiguration } from "../vendor/ucBlockly/src/toolbox_types";
import { withoutBoardCategory } from "./board_config";

function toolboxOf(...contents: ToolboxConfiguration["contents"]): ToolboxConfiguration {
  return { kind: "categoryToolbox", contents };
}

describe("withoutBoardCategory", () => {
  const libre = {
    kind: "category",
    name: "Libre",
    contents: [{ kind: "block", type: "a" }],
  };
  const separator = { kind: "sep" };
  const logique = { kind: "category", name: "Logique", contents: [] };
  // Translated name, only the style tells it is the board.
  const boardByStyle = {
    kind: "category",
    name: "Carte : arduino_uno",
    categorystyle: "board_category",
    contents: [{ kind: "block", type: "board_x" }],
  };
  // Untranslated key.
  const boardByName = {
    kind: "category",
    name: "CAT_BOARD",
    contents: [{ kind: "block", type: "board_y" }],
  };

  it("removes the board category recognised by its style", () => {
    const result = withoutBoardCategory(toolboxOf(libre, boardByStyle));
    expect(result.contents).toEqual([libre]);
  });

  it("removes the board category recognised by its untranslated name", () => {
    const result = withoutBoardCategory(toolboxOf(libre, boardByName));
    expect(result.contents).toEqual([libre]);
  });

  it("keeps the other categories and the separators, in order", () => {
    const result = withoutBoardCategory(
      toolboxOf(libre, separator, boardByStyle, logique),
    );
    expect(result.contents).toEqual([libre, separator, logique]);
  });

  it("does not modify the toolbox it receives", () => {
    const toolbox = toolboxOf(libre, separator, boardByStyle, logique);
    const before = structuredClone(toolbox);
    withoutBoardCategory(toolbox);
    expect(toolbox).toEqual(before);
  });
});
